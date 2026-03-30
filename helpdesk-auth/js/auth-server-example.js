/* ================================================================
   auth-server-example.js — Exemplo backend para login/cadastro
   Rotas esperadas pelo frontend:
   POST /api/auth/register
   POST /api/auth/resend-token
   POST /api/auth/verify-email
   POST /api/auth/login
================================================================ */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'troque-esta-chave-em-producao';
const TOKEN_TTL_MINUTES = 15;

const dataDir = path.join(__dirname, 'auth-data');
const usersFile = path.join(dataDir, 'users.json');
const pendingFile = path.join(dataDir, 'pending-users.json');

app.use(cors());
app.use(express.json());

ensureStorage();

function ensureStorage(){
  if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if(!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]');
  if(!fs.existsSync(pendingFile)) fs.writeFileSync(pendingFile, '[]');
}

function readJson(file){
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch(err){
    return [];
  }
}

function writeJson(file, data){
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function generateToken(){
  return String(Math.floor(100000 + Math.random() * 900000));
}

function expiresAt(){
  return Date.now() + TOKEN_TTL_MINUTES * 60 * 1000;
}

function buildUserResponse(user){
  return {
    name: user.name,
    role: user.role,
    email: user.email
  };
}

function buildSession(user){
  const token = jwt.sign(
    {
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  return {
    message: 'Autenticação concluída com sucesso.',
    token,
    user: buildUserResponse(user)
  };
}

function createTransporter(){
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendVerificationEmail(email, name, token){
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'HelpDesk Brava Wine • Token de validação',
    html: `
      <div style="font-family:Arial,sans-serif;background:#0b1120;padding:32px;color:#f1f5f9">
        <div style="max-width:560px;margin:0 auto;background:#0f172a;border:1px solid #1e3a5f;border-radius:16px;padding:28px">
          <h2 style="margin-top:0">Olá, ${name}!</h2>
          <p>Seu cadastro no <strong>HelpDesk Brava Wine</strong> foi iniciado.</p>
          <p>Use o token abaixo para validar o primeiro acesso:</p>
          <div style="font-size:32px;font-weight:800;letter-spacing:8px;text-align:center;background:#1a2540;border-radius:12px;padding:18px;margin:24px 0;color:#67e8f9">
            ${token}
          </div>
          <p>Esse token expira em ${TOKEN_TTL_MINUTES} minutos.</p>
        </div>
      </div>
    `
  });
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, role, email, password } = req.body || {};
    if(!name || !role || !email || !password){
      return res.status(400).json({ message: 'Preencha nome, perfil, e-mail e senha.' });
    }

    const users = readJson(usersFile);
    const pending = readJson(pendingFile);
    const normalizedEmail = String(email).trim().toLowerCase();

    if(users.some(user => user.email === normalizedEmail)){
      return res.status(409).json({ message: 'Já existe um usuário cadastrado com esse e-mail.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = generateToken();

    const nextPending = pending.filter(user => user.email !== normalizedEmail);
    nextPending.push({
      name,
      role,
      email: normalizedEmail,
      passwordHash,
      verificationToken,
      verificationExpiresAt: expiresAt(),
      createdAt: Date.now()
    });
    writeJson(pendingFile, nextPending);

    await sendVerificationEmail(normalizedEmail, name, verificationToken);

    return res.json({
      message: 'Cadastro iniciado. Enviamos um token para o seu e-mail.'
    });
  } catch(err){
    console.error('[register]', err);
    return res.status(500).json({ message: 'Erro ao iniciar o cadastro.' });
  }
});

app.post('/api/auth/resend-token', async (req, res) => {
  try {
    const { email } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const pending = readJson(pendingFile);
    const entry = pending.find(user => user.email === normalizedEmail);

    if(!entry){
      return res.status(404).json({ message: 'Cadastro pendente não encontrado para esse e-mail.' });
    }

    entry.verificationToken = generateToken();
    entry.verificationExpiresAt = expiresAt();
    writeJson(pendingFile, pending);

    await sendVerificationEmail(entry.email, entry.name, entry.verificationToken);

    return res.json({ message: 'Token reenviado com sucesso.' });
  } catch(err){
    console.error('[resend-token]', err);
    return res.status(500).json({ message: 'Erro ao reenviar o token.' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, token } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const users = readJson(usersFile);
    const pending = readJson(pendingFile);
    const index = pending.findIndex(user => user.email === normalizedEmail);

    if(index === -1){
      return res.status(404).json({ message: 'Cadastro pendente não encontrado.' });
    }

    const entry = pending[index];

    if(Date.now() > Number(entry.verificationExpiresAt || 0)){
      return res.status(400).json({ message: 'Token expirado. Solicite um novo envio.' });
    }

    if(String(entry.verificationToken) !== String(token).trim()){
      return res.status(400).json({ message: 'Token inválido.' });
    }

    const newUser = {
      id: `USR-${Date.now()}`,
      name: entry.name,
      role: entry.role,
      email: entry.email,
      passwordHash: entry.passwordHash,
      verifiedAt: Date.now(),
      createdAt: entry.createdAt || Date.now()
    };

    users.push(newUser);
    pending.splice(index, 1);

    writeJson(usersFile, users);
    writeJson(pendingFile, pending);

    return res.json({
      message: 'Cadastro validado com sucesso.',
      ...buildSession(newUser)
    });
  } catch(err){
    console.error('[verify-email]', err);
    return res.status(500).json({ message: 'Erro ao validar o token.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const users = readJson(usersFile);
    const user = users.find(item => item.email === normalizedEmail);

    if(!user){
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    const passwordMatches = await bcrypt.compare(String(password || ''), user.passwordHash || '');
    if(!passwordMatches){
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    return res.json({
      message: 'Login realizado com sucesso.',
      ...buildSession(user)
    });
  } catch(err){
    console.error('[login]', err);
    return res.status(500).json({ message: 'Erro ao efetuar login.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de autenticação rodando na porta ${PORT}`);
});
