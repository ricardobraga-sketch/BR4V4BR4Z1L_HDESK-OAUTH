/* ================================================================
   auth.js — Login, cadastro e validação por token (integração via API)
================================================================ */

const AUTH_STORAGE_KEY = 'helpdesk_auth_session';
const AUTH_PENDING_KEY = 'helpdesk_auth_pending_email';
const AUTH_API_BASE = window.AUTH_API_BASE || '/api/auth';

let authAppStarted = false;

function getSession(){
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(err){
    console.warn('[Auth] Erro ao ler sessão:', err);
    return null;
  }
}

function saveSession(session){
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
    token: session.token || session.sessionToken || '',
    user: {
      name: session.user?.name || 'Usuário',
      role: session.user?.role || 'Acesso autenticado',
      email: session.user?.email || ''
    }
  }));
}

function clearSession(){
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function getPendingEmail(){
  return sessionStorage.getItem(AUTH_PENDING_KEY) || '';
}

function setPendingEmail(email){
  sessionStorage.setItem(AUTH_PENDING_KEY, email || '');
}

function clearPendingEmail(){
  sessionStorage.removeItem(AUTH_PENDING_KEY);
}

function getInitials(name){
  const parts = String(name || 'Usuário').trim().split(/\s+/).slice(0,2);
  return parts.map(p => p[0]?.toUpperCase() || '').join('') || 'US';
}

function getAuthHeaders(){
  const session = getSession();
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

async function authRequest(path, payload){
  const res = await fetch(`${AUTH_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload || {})
  });

  let data = {};
  try {
    data = await res.json();
  } catch(err){
    data = {};
  }

  if(!res.ok){
    throw new Error(data.message || 'Não foi possível concluir a operação de autenticação.');
  }

  return data;
}

function setAuthLoading(formId, isLoading){
  const form = document.getElementById(formId);
  if(!form) return;
  form.querySelectorAll('button, input').forEach(el => el.disabled = isLoading);
}

function renderAuthScreen(mode = 'login'){
  const root = document.getElementById('auth-screen');
  if(!root) return;

  const pendingEmail = getPendingEmail();

  root.innerHTML = `
    <section class="auth-shell">
      <div class="auth-hero">
        <div class="auth-brand-badge">Brava Wine • HelpDesk Pro</div>
        <h1>Controle de chamados com acesso protegido</h1>
        <p>
          Faça login para acessar o painel ou crie seu primeiro acesso.
          No cadastro, um token será enviado para o e-mail informado para validar a conta.
        </p>
        <div class="auth-hero-cards">
          <div class="auth-info-card">
            <i class="fa-solid fa-shield-halved"></i>
            <div>
              <strong>Validação por e-mail</strong>
              <span>Cadastro liberado somente após confirmação do token.</span>
            </div>
          </div>
          <div class="auth-info-card">
            <i class="fa-solid fa-user-lock"></i>
            <div>
              <strong>Acesso individual</strong>
              <span>Cada usuário entra com e-mail e senha próprios.</span>
            </div>
          </div>
          <div class="auth-info-card">
            <i class="fa-solid fa-chart-line"></i>
            <div>
              <strong>Painel protegido</strong>
              <span>Dashboard e chamados ficam ocultos até autenticação.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-card">
        <div class="auth-tabs">
          <button class="auth-tab ${mode === 'login' ? 'active' : ''}" onclick="renderAuthScreen('login')">Entrar</button>
          <button class="auth-tab ${mode === 'register' ? 'active' : ''}" onclick="renderAuthScreen('register')">Cadastrar</button>
          <button class="auth-tab ${mode === 'verify' ? 'active' : ''}" onclick="renderAuthScreen('verify')">Validar token</button>
        </div>

        <div class="auth-panel ${mode === 'login' ? 'active' : ''}">
          <div class="auth-panel-head">
            <h2>Login</h2>
            <p>Entre com seu e-mail e senha para acessar o sistema.</p>
          </div>
          <form id="login-form" class="auth-form" onsubmit="submitLogin(event)">
            <div class="form-group">
              <label class="form-label">E-mail corporativo</label>
              <input id="login-email" class="form-control" type="email" placeholder="voce@empresa.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Senha</label>
              <input id="login-password" class="form-control" type="password" placeholder="Digite sua senha" required />
            </div>
            <button class="btn btn-primary auth-submit" type="submit">
              <i class="fa-solid fa-right-to-bracket"></i> Entrar no sistema
            </button>
          </form>
        </div>

        <div class="auth-panel ${mode === 'register' ? 'active' : ''}">
          <div class="auth-panel-head">
            <h2>Primeiro acesso</h2>
            <p>Cadastre o usuário e confirme o token enviado ao e-mail informado.</p>
          </div>
          <form id="register-form" class="auth-form" onsubmit="submitRegister(event)">
            <div class="auth-grid">
              <div class="form-group">
                <label class="form-label">Nome completo</label>
                <input id="register-name" class="form-control" type="text" placeholder="Ex: Ricardo Souza" required />
              </div>
              <div class="form-group">
                <label class="form-label">Perfil / cargo</label>
                <input id="register-role" class="form-control" type="text" placeholder="Ex: Supervisor TI" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input id="register-email" class="form-control" type="email" placeholder="voce@empresa.com" required />
            </div>
            <div class="auth-grid">
              <div class="form-group">
                <label class="form-label">Senha</label>
                <input id="register-password" class="form-control" type="password" placeholder="Mínimo 6 caracteres" minlength="6" required />
              </div>
              <div class="form-group">
                <label class="form-label">Confirmar senha</label>
                <input id="register-password-confirm" class="form-control" type="password" placeholder="Repita a senha" minlength="6" required />
              </div>
            </div>
            <button class="btn btn-primary auth-submit" type="submit">
              <i class="fa-solid fa-envelope-circle-check"></i> Cadastrar e enviar token
            </button>
          </form>
        </div>

        <div class="auth-panel ${mode === 'verify' ? 'active' : ''}">
          <div class="auth-panel-head">
            <h2>Validar cadastro</h2>
            <p>Informe o e-mail e o token recebido para liberar o primeiro acesso.</p>
          </div>
          <form id="verify-form" class="auth-form" onsubmit="submitVerification(event)">
            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input id="verify-email" class="form-control" type="email" value="${pendingEmail}" placeholder="voce@empresa.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Token de verificação</label>
              <input id="verify-token" class="form-control auth-token-input" type="text" placeholder="Ex: 123456" maxlength="8" required />
            </div>
            <button class="btn btn-primary auth-submit" type="submit">
              <i class="fa-solid fa-badge-check"></i> Validar token
            </button>
            <button class="btn btn-outline auth-submit" type="button" onclick="resendVerificationToken()">
              <i class="fa-solid fa-paper-plane"></i> Reenviar token
            </button>
          </form>
        </div>
      </div>
    </section>
  `;
}

function applyAuthUserUI(){
  const session = getSession();
  const avatar = document.getElementById('auth-user-avatar');
  const nameEl = document.getElementById('auth-user-name');
  const roleEl = document.getElementById('auth-user-role');
  const logoutBtn = document.getElementById('logout-btn');

  if(avatar) avatar.textContent = getInitials(session?.user?.name || 'Admin Sistema');
  if(nameEl) nameEl.textContent = session?.user?.name || 'Admin Sistema';
  if(roleEl) roleEl.textContent = session?.user?.role || session?.user?.email || 'Supervisor TI';
  if(logoutBtn) logoutBtn.style.display = session ? 'inline-flex' : 'none';
}

function showAuthenticatedApp(){
  document.body.classList.remove('auth-only');
  applyAuthUserUI();

  if(!authAppStarted && typeof initializeApp === 'function'){
    authAppStarted = true;
    initializeApp();
  }
}

function showAuthOnly(mode = 'login'){
  document.body.classList.add('auth-only');
  renderAuthScreen(mode);
}

function bootAuth(){
  const session = getSession();
  if(session?.token){
    showAuthenticatedApp();
    return;
  }
  showAuthOnly(getPendingEmail() ? 'verify' : 'login');
}

async function submitRegister(event){
  event.preventDefault();

  const name = document.getElementById('register-name').value.trim();
  const role = document.getElementById('register-role').value.trim();
  const email = document.getElementById('register-email').value.trim().toLowerCase();
  const password = document.getElementById('register-password').value;
  const passwordConfirm = document.getElementById('register-password-confirm').value;

  if(password !== passwordConfirm){
    toast('As senhas não conferem.', 'error');
    return;
  }

  setAuthLoading('register-form', true);
  try {
    const data = await authRequest('/register', { name, role, email, password });
    setPendingEmail(email);
    renderAuthScreen('verify');
    const verifyInput = document.getElementById('verify-email');
    if(verifyInput) verifyInput.value = email;
    toast(data.message || 'Cadastro iniciado. Verifique o token no seu e-mail.', 'success');
  } catch(err){
    toast(err.message || 'Não foi possível iniciar o cadastro.', 'error');
  } finally {
    setAuthLoading('register-form', false);
  }
}

async function submitVerification(event){
  event.preventDefault();

  const email = document.getElementById('verify-email').value.trim().toLowerCase();
  const token = document.getElementById('verify-token').value.trim();

  setAuthLoading('verify-form', true);
  try {
    const data = await authRequest('/verify-email', { email, token });
    saveSession(data);
    clearPendingEmail();
    toast(data.message || 'Cadastro validado com sucesso!', 'success');
    showAuthenticatedApp();
  } catch(err){
    toast(err.message || 'Token inválido ou expirado.', 'error');
  } finally {
    setAuthLoading('verify-form', false);
  }
}

async function resendVerificationToken(){
  const email = document.getElementById('verify-email')?.value.trim().toLowerCase() || getPendingEmail();
  if(!email){
    toast('Informe o e-mail para reenviar o token.', 'error');
    return;
  }

  setAuthLoading('verify-form', true);
  try {
    const data = await authRequest('/resend-token', { email });
    setPendingEmail(email);
    toast(data.message || 'Token reenviado com sucesso.', 'success');
  } catch(err){
    toast(err.message || 'Não foi possível reenviar o token.', 'error');
  } finally {
    setAuthLoading('verify-form', false);
  }
}

async function submitLogin(event){
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  setAuthLoading('login-form', true);
  try {
    const data = await authRequest('/login', { email, password });
    saveSession(data);
    clearPendingEmail();
    toast(data.message || 'Login realizado com sucesso!', 'success');
    showAuthenticatedApp();
  } catch(err){
    toast(err.message || 'E-mail ou senha inválidos.', 'error');
  } finally {
    setAuthLoading('login-form', false);
  }
}

function logout(){
  clearSession();
  showAuthOnly('login');
  toast('Sessão encerrada com sucesso.', 'warn');
}
