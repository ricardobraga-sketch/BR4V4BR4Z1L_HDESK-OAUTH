/* ================================================================
   stores.js — Módulo da aba Lojas / Unidades
================================================================ */

function renderStoresPage(){
  return `
  <div class="stores-row" style="grid-template-columns:repeat(auto-fill, minmax(280px, 1fr))">
    ${STORES.map(st => {
      const stTickets = tickets.filter(t => t.store === st);
      const stOpen  = stTickets.filter(t => t.status === 'open').length;
      const stCrit  = stTickets.filter(t => t.priority === 'critical' && t.status !== 'resolved').length;
      const stDone  = stTickets.filter(t => t.status === 'resolved').length;
      const stProg  = stTickets.filter(t => t.status === 'in_progress').length;
      const stPaused = stTickets.filter(t => t.status === 'paused').length;
      const stSla   = stTickets.filter(t => isSLAOver(t)).length;
      const total   = stTickets.length;

      return `
      <div class="store-card" style="padding:20px;cursor:default">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div style="font-size:.9rem;font-weight:700">
            <i class="fa-solid fa-store" style="color:var(--cyan);margin-right:8px"></i>${st}
          </div>
          ${stCrit>0 ? `<span class="badge pri-critical"><i class="fa-solid fa-triangle-exclamation"></i> ${stCrit} crít.</span>` : ''}
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center;margin-bottom:12px">
          <div style="background:var(--bg-card2);border-radius:8px;padding:10px">
            <div style="font-size:1.3rem;font-weight:700;color:var(--cyan)">${stOpen}</div>
            <div style="font-size:.68rem;color:var(--text-muted)">Abertos</div>
          </div>
          <div style="background:var(--bg-card2);border-radius:8px;padding:10px">
            <div style="font-size:1.3rem;font-weight:700;color:var(--yellow)">${stProg}</div>
            <div style="font-size:.68rem;color:var(--text-muted)">Em And.</div>
          </div>
          <div style="background:var(--bg-card2);border-radius:8px;padding:10px">
            <div style="font-size:1.3rem;font-weight:700;color:var(--green)">${stDone}</div>
            <div style="font-size:.68rem;color:var(--text-muted)">Resolvidos</div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;font-size:.72rem;color:var(--text-muted);margin-bottom:10px;padding:0 2px">
          <span>Total: <strong style="color:var(--text-primary)">${total}</strong></span>
          <span>Pausados: <strong style="color:var(--yellow)">${stPaused}</strong></span>
          <span>Taxa res.: <strong style="color:var(--green)">${total?Math.round(stDone/total*100):0}%</strong></span>
        </div>

        ${stSla > 0 ? `
        <div style="margin-bottom:10px;padding:7px 10px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);border-radius:6px;font-size:.72rem;color:var(--red);font-weight:600;display:flex;align-items:center;gap:6px;animation:sla-blink 1.5s infinite">
          <i class="fa-solid fa-clock"></i> ${stSla} chamado(s) com SLA estourado!
        </div>` : ''}

        <button class="btn btn-outline btn-sm"
          style="width:100%;justify-content:center"
          onclick="filterAndGoToTickets('${st}')">
          <i class="fa-solid fa-ticket"></i> Ver Chamados
        </button>
      </div>`;
    }).join('')}
  </div>`;
}
