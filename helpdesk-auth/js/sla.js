/* ================================================================
   sla.js — Módulo da aba Monitor SLA
================================================================ */

function renderSLAPage(){
  const active = tickets.filter(t => t.status !== 'resolved' && t.status !== 'canceled');
  const over   = active.filter(t => isSLAOver(t));
  const danger = active.filter(t => !isSLAOver(t) && getSLAPercent(t) >= 80);
  const warn   = active.filter(t => !isSLAOver(t) && getSLAPercent(t) >= 50 && getSLAPercent(t) < 80);
  const ok     = active.filter(t => getSLAPercent(t) < 50);

  const groups = [
    { label:'🔴 SLA Estourado',          list: over,   color: 'var(--red)'    },
    { label:'🟠 SLA Crítico (>80%)',      list: danger, color: 'var(--yellow)' },
    { label:'🟡 SLA em Alerta (50–80%)', list: warn,   color: '#f97316'       },
    { label:'🟢 SLA OK (<50%)',           list: ok,     color: 'var(--green)'  },
  ];

  return `
  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px">
    <div class="kpi-card red ${over.length>0?'sla-alert':''}">
      <div class="kpi-label">SLA Estourado</div>
      <div class="kpi-value">${over.length}</div>
      <i class="fa-solid fa-hourglass-end kpi-icon"></i>
    </div>
    <div class="kpi-card yellow">
      <div class="kpi-label">SLA Crítico</div>
      <div class="kpi-value">${danger.length}</div>
      <i class="fa-solid fa-triangle-exclamation kpi-icon"></i>
    </div>
    <div class="kpi-card blue">
      <div class="kpi-label">SLA em Alerta</div>
      <div class="kpi-value">${warn.length}</div>
      <i class="fa-solid fa-bell kpi-icon"></i>
    </div>
    <div class="kpi-card green">
      <div class="kpi-label">SLA OK</div>
      <div class="kpi-value">${ok.length}</div>
      <i class="fa-solid fa-shield-halved kpi-icon"></i>
    </div>
  </div>

  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:24px">
    <div style="font-size:.8rem;font-weight:700;margin-bottom:12px">⚙️ Definições de SLA por Prioridade</div>
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      ${Object.entries(SLA_HOURS).map(([p,h])=>`
      <div style="background:var(--bg-card2);border:1px solid var(--border);border-radius:8px;padding:10px 18px;text-align:center">
        <div class="badge ${p==='critical'?'pri-critical':p==='high'?'pri-high':p==='medium'?'pri-medium':'pri-low'}"
             style="margin-bottom:6px;display:inline-flex">${priorityLabel(p)}</div>
        <div style="font-size:1.4rem;font-weight:800;color:var(--text-primary)">${h}h</div>
        <div style="font-size:.68rem;color:var(--text-muted)">${h*60} minutos</div>
      </div>`).join('')}
    </div>
  </div>

  ${groups.map(g => g.list.length ? `
  <div class="section-header">
    <span class="section-title" style="color:${g.color}">${g.label}</span>
    <div class="section-line"></div>
  </div>
  <div class="table-card" style="margin-bottom:20px">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Título</th><th>Prioridade</th><th>Loja</th>
            <th>Responsável</th><th>Status</th><th>SLA Restante</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${g.list.map(t => {
            const rem = getSLARemaining(t);
            const pct = getSLAPercent(t);
            const sc  = slaClass(rem, pct);
            return `<tr>
              <td style="color:var(--cyan);font-weight:700">${t.id}</td>
              <td class="bold">${t.title}</td>
              <td><span class="badge ${priColors[t.priority]||'pri-medium'}">${priorityLabel(t.priority)}</span></td>
              <td>${t.store}</td>
              <td>${t.owner||'—'}</td>
              <td><span class="badge ${statusColors[t.status]}">${statusLabel(t.status)}</span></td>
              <td>
                <div class="sla-wrap">
                  <div class="sla-bar-track">
                    <div class="sla-bar-fill ${sc}" style="width:${pct}%"></div>
                  </div>
                  <span class="sla-time ${sc}">${formatTime(rem)}</span>
                </div>
              </td>
              <td>
                <div style="display:flex;gap:4px">
                  <button class="btn btn-outline btn-sm" onclick="openViewModal('${t.id}')" title="Ver">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  <button class="btn btn-success btn-sm" onclick="changeStatus('${t.id}','resolved')">
                    <i class="fa-solid fa-check"></i> Resolver
                  </button>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>` : '').join('')}
  `;
}
