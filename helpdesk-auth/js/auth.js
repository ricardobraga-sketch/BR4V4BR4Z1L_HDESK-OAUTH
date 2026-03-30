const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const TOKEN_TTL_MINUTES = 15;

function generateToken() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function buildSession(user) {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  return {
    message: 'Autenticação concluída com sucesso.',
    token,
    user: {
      name: user.name,
      role: user.role,
      email: user.email
    }
  };
}

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP não configurado. Preencha SMTP_HOST, SMTP_USER e SMTP_PASS.');
  }

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

async function sendVerificationEmail(email, name, token) {
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

router.post('/register', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, role, email, password } = req.body || {};

    if (!name || !role || !email || !password) {
      return res.status(400).json({ message: 'Preencha todos os campos.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (existingUser) {
      return res.status(409).json({ message: 'Usuário já existe.' });
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.run(
      `INSERT INTO users (name, role, email, password_hash)
       VALUES (?, ?, ?, ?)`,
      [name, role, normalizedEmail, passwordHash]
    );

    const user = await db.get(
      'SELECT * FROM users WHERE id = ?',
      [result.lastID]
    );

    // 🔥 já retorna login automático
    return res.json(buildSession(user));

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro no cadastro.' });
  }
});



router.post('/login', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    const user = await db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    }

    return res.json(buildSession(user));
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ message: 'Erro ao realizar login.' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await db.get('SELECT id, name, role, email, is_active FROM users WHERE id = ?', [req.user.id]);
    if (!user || !user.is_active) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.json({ user: { name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ message: 'Erro ao carregar usuário.' });
  }
});

module.exports = router;
