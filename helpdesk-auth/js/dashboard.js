/* ================================================================
   dashboard.js — Módulo da aba Dashboard
================================================================ */

function renderDashboard(){
  const s = getStats();
  return `
  ${renderKPICards(s)}
  <div class="section-header">
    <span class="section-title">Lojas / Unidades</span>
    <div class="section-line"></div>
  </div>
  ${renderStoreCardsMini()}
  <div class="section-header">
    <span class="section-title">Análise Visual</span>
    <div class="section-line"></div>
  </div>
  <div class="charts-row">
    <div class="chart-card">
      <div class="chart-card-header">
        <div><div class="chart-title">Status dos Chamados</div><div class="chart-sub">Distribuição atual</div></div>
      </div>
      <div class="chart-wrap"><canvas id="chart-pie"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header">
        <div><div class="chart-title">Chamados por Prioridade</div><div class="chart-sub">Volume por nível</div></div>
      </div>
      <div class="chart-wrap"><canvas id="chart-bar"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header">
        <div><div class="chart-title">Tendência (7 dias)</div><div class="chart-sub">Abertos vs Resolvidos</div></div>
      </div>
      <div class="chart-wrap"><canvas id="chart-line"></canvas></div>
    </div>
  </div>
  <div class="section-header">
    <span class="section-title">Chamados Recentes</span>
    <div class="section-line"></div>
  </div>
  ${renderTicketsTable(tickets.slice().sort((a,b) => b.createdAt - a.createdAt).slice(0,8))}
  `;
}

function renderKPICards(s){
  const resolvedPct = s.total > 0 ? Math.round(s.resolved / s.total * 100) : 0;
  return `
  <div class="kpi-grid">
    <div class="kpi-card blue">
      <div class="kpi-label">Total de Chamados</div>
      <div class="kpi-value">${s.total}</div>
      <div class="kpi-change up"><i class="fa-solid fa-arrow-trend-up"></i> +${tickets.filter(t => (Date.now()-t.createdAt) < 86400000).length} hoje</div>
      <i class="fa-solid fa-ticket kpi-icon"></i>
    </div>
    <div class="kpi-card cyan">
      <div class="kpi-label">Abertos</div>
      <div class="kpi-value">${s.open}</div>
      <div class="kpi-change" style="color:var(--text-muted)">Aguardando atendimento</div>
      <i class="fa-solid fa-folder-open kpi-icon"></i>
    </div>
    <div class="kpi-card green">
      <div class="kpi-label">Resolvidos</div>
      <div class="kpi-value">${s.resolved}</div>
      <div class="kpi-change up"><i class="fa-solid fa-check"></i> ${resolvedPct}% resol.</div>
      <i class="fa-solid fa-circle-check kpi-icon"></i>
    </div>
    <div class="kpi-card red ${s.critical > 0 ? 'sla-alert':''}">
      <div class="kpi-label">Críticos Ativos</div>
      <div class="kpi-value">${s.critical}</div>
      <div class="kpi-change down"><i class="fa-solid fa-triangle-exclamation"></i> Atenção imediata</div>
      <i class="fa-solid fa-circle-exclamation kpi-icon"></i>
    </div>
    <div class="kpi-card yellow">
      <div class="kpi-label">Em Andamento</div>
      <div class="kpi-value">${s.inProgress}</div>
      <div class="kpi-change" style="color:var(--text-muted)">Em tratamento</div>
      <i class="fa-solid fa-spinner kpi-icon"></i>
    </div>
    <div class="kpi-card purple ${s.slaOver > 0 ? 'sla-alert':''}">
      <div class="kpi-label">SLA Estourado</div>
      <div class="kpi-value">${s.slaOver}</div>
      <div class="kpi-change down"><i class="fa-solid fa-clock"></i> Prazo excedido</div>
      <i class="fa-solid fa-hourglass-end kpi-icon"></i>
    </div>
  </div>`;
}

function renderStoreCardsMini(){
  const storeData = STORES.map(st => ({
    name: st,
    open: tickets.filter(t => t.store === st && t.status === 'open').length,
    crit: tickets.filter(t => t.store === st && t.priority === 'critical' && t.status !== 'resolved').length,
    done: tickets.filter(t => t.store === st && t.status === 'resolved').length,
  }));
  return `
  <div class="stores-row">
    ${storeData.map(s => `
    <div class="store-card" onclick="filterByStore('${s.name}')">
      <div class="store-name"><i class="fa-solid fa-store" style="color:var(--cyan);margin-right:6px"></i>${s.name}</div>
      <div class="store-stats">
        <div class="store-stat open"><span class="val">${s.open}</span><span class="lbl">Abertos</span></div>
        <div class="store-stat crit"><span class="val">${s.crit}</span><span class="lbl">Críticos</span></div>
        <div class="store-stat done"><span class="val">${s.done}</span><span class="lbl">Resolvidos</span></div>
      </div>
    </div>`).join('')}
  </div>`;
}
