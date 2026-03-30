/* ================================================================
   app.js — Núcleo: navegação, settings, toast, relógio, init
================================================================ */

/* ================================================================
   NAVIGATION
================================================================ */
function setNav(el, view){
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if(el) el.classList.add('active');
  currentView = view;
  renderContent();
  updatePageTitle(view);
  // Fecha sidebar no mobile ao navegar
  if(window.innerWidth <= 900){
    document.getElementById('sidebar').classList.remove('open');
  }
}

function updatePageTitle(view){
  const titles = {
    dashboard: '📊 Dashboard',
    tickets:   '🎫 Chamados',
    sla:       '⏱️ Monitor SLA',
    stores:    '🏪 Lojas / Unidades',
    reports:   '📈 Relatórios',
    settings:  '⚙️ Configurações',
  };
  document.getElementById('page-title').textContent = titles[view] || view;
}

function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
}

/* ================================================================
   RENDER CONTENT (ROUTER)
================================================================ */
function renderContent(){
  const el = document.getElementById('content');
  if(!el) return;

  if(currentView === 'dashboard')  el.innerHTML = renderDashboard();
  else if(currentView === 'tickets')  el.innerHTML = renderTicketsPage();
  else if(currentView === 'sla')      el.innerHTML = renderSLAPage();
  else if(currentView === 'stores')   el.innerHTML = renderStoresPage();
  else if(currentView === 'reports')  el.innerHTML = renderReportsPage();
  else if(currentView === 'settings') el.innerHTML = renderSettingsPage();
  else el.innerHTML = `<p style="color:var(--text-muted);padding:32px">Em construção...</p>`;

  if(currentView === 'dashboard' || currentView === 'reports') initCharts();
  updateNavBadges();
}

/* ================================================================
   SETTINGS PAGE
================================================================ */
function renderSettingsPage(){
  return `
  <div style="max-width:720px">

    <!-- SLA Config -->
    <div class="table-card" style="padding:24px;margin-bottom:20px">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:18px">⚙️ Configurações de SLA</div>
      ${Object.entries(SLA_HOURS).map(([p,h])=>`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
        <span class="badge ${p==='critical'?'pri-critical':p==='high'?'pri-high':p==='medium'?'pri-medium':'pri-low'}">${priorityLabel(p)}</span>
        <div style="display:flex;align-items:center;gap:10px">
          <input type="number" class="form-control" style="width:80px;padding:6px 8px"
            value="${h}" min="1"
            onchange="SLA_HOURS['${p}']=parseInt(this.value)||${h}; saveSnapshot('SLA ${priorityLabel(p)} → '+this.value+'h'); toast('SLA ${priorityLabel(p)} atualizado!','success')"/>
          <span style="font-size:.75rem;color:var(--text-muted)">horas</span>
        </div>
      </div>`).join('')}
    </div>

    <!-- Dados do Sistema -->
    <div class="table-card" style="padding:24px;margin-bottom:0">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:18px">📋 Dados do Sistema</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" onclick="exportCSV()">
          <i class="fa-solid fa-file-csv"></i> Exportar CSV
        </button>
        <button class="btn btn-danger btn-sm"
          onclick="if(confirm('Apagar TODOS os chamados? O estado atual será salvo no histórico de snapshots.')){saveSnapshot('Antes de limpar todos os dados'); tickets=[];renderContent();saveSnapshot('Dados limpos');toast('Dados apagados','warn')}">
          <i class="fa-solid fa-trash"></i> Limpar Dados
        </button>
      </div>
    </div>

    <!-- Painel de Snapshots -->
    ${renderSnapshotPanel()}

  </div>`;
}

/* ================================================================
   TOAST
================================================================ */
function toast(msg, type='success'){
  const icons = { success:'fa-circle-check', error:'fa-circle-xmark', warn:'fa-triangle-exclamation' };
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fa-solid ${icons[type]||'fa-info'}"></i><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(20px)';
    t.style.transition = 'all .3s';
    setTimeout(() => t.remove(), 300);
  }, 3200);
}

/* ================================================================
   BADGE COUNTS
================================================================ */
function updateNavBadges(){
  const openCount = tickets.filter(t => t.status === 'open').length;
  const slaCount  = tickets.filter(t => t.status !== 'resolved' && t.status !== 'canceled' && isSLAOver(t)).length;
  const el1 = document.getElementById('nav-open-count');
  const el2 = document.getElementById('nav-sla-count');
  if(el1) el1.textContent = openCount;
  if(el2) el2.textContent = slaCount;
}

/* ================================================================
   DATETIME CLOCK
================================================================ */
function updateClock(){
  const el = document.getElementById('current-datetime');
  if(el) el.textContent = new Date().toLocaleString('pt-BR',{
    weekday:'short', day:'2-digit', month:'2-digit', year:'numeric',
    hour:'2-digit', minute:'2-digit', second:'2-digit'
  });
}

/* ================================================================
   REFRESH
================================================================ */
function refreshDashboard(){
  renderContent();
  toast('Dashboard atualizado!', 'success');
}

/* ================================================================
   RESPONSIVE MENU
================================================================ */
function checkResponsive(){
  const btn = document.getElementById('menu-btn');
  if(!btn) return;
  if(window.innerWidth <= 900){
    btn.style.display = 'flex';
  } else {
    btn.style.display = 'none';
    document.getElementById('sidebar').classList.remove('open');
  }
}

/* ================================================================
   INIT
================================================================ */
let appInitialized = false;

function initializeApp(){
  if(appInitialized) return;
  appInitialized = true;

  window.addEventListener('resize', checkResponsive);
  checkResponsive();
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(() => {
    if(currentView === 'dashboard' || currentView === 'sla') renderContent();
    updateNavBadges();
  }, 30000);

  /* Carrega estado do último snapshot ao inicializar */
  (function(){
    const loaded = initSnapshots();
    if(loaded){
      const snap = loadLatestSnapshot();
      if(snap){
        /* Mostra toast discreto após 800ms */
        setTimeout(() => {
          toast(`📦 Estado restaurado (v${snap.version} · ${snap.tickets.length} chamado(s))`, 'success');
        }, 800);
      }
    }
  })();

  renderContent();
}

if(typeof bootAuth === 'function') bootAuth();
else initializeApp();
