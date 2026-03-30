/* ================================================================
   reports.js — Módulo da aba Relatórios
================================================================ */

function renderReportsPage(){
  const byStore = STORES.map(st => ({
    name:     st,
    total:    tickets.filter(t => t.store === st).length,
    open:     tickets.filter(t => t.store === st && t.status === 'open').length,
    resolved: tickets.filter(t => t.store === st && t.status === 'resolved').length,
  }));

  const byCat = CATEGORIES.map(c => ({
    name:  c,
    count: tickets.filter(t => t.category === c).length
  })).filter(c => c.count > 0).sort((a,b) => b.count - a.count);

  return `
  <div class="charts-row" style="grid-template-columns:1fr 1fr">
    <div class="chart-card">
      <div class="chart-card-header"><div class="chart-title">Status dos Chamados</div></div>
      <div class="chart-wrap"><canvas id="chart-pie"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header"><div class="chart-title">Chamados por Prioridade</div></div>
      <div class="chart-wrap"><canvas id="chart-bar"></canvas></div>
    </div>
  </div>
  <div class="charts-row" style="grid-template-columns:1.5fr 1fr">
    <div class="chart-card">
      <div class="chart-card-header"><div class="chart-title">Tendência Semanal</div></div>
      <div class="chart-wrap"><canvas id="chart-line"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header"><div class="chart-title">Chamados por Categoria</div></div>
      <div class="chart-wrap"><canvas id="chart-cat"></canvas></div>
    </div>
  </div>

  <div class="section-header">
    <span class="section-title">Desempenho por Loja</span>
    <div class="section-line"></div>
  </div>
  <div class="table-card">
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Loja</th><th>Total</th><th>Abertos</th><th>Resolvidos</th><th>Taxa Resolução</th><th>SLA OK</th></tr>
        </thead>
        <tbody>
          ${byStore.map(s => {
            const slaOk = s.total ? Math.max(0, 100 - Math.round(
              tickets.filter(t => t.store === s.name && isSLAOver(t)).length / Math.max(s.total,1) * 100
            )) : 100;
            const resPct = s.total ? Math.round(s.resolved / s.total * 100) : 0;
            return `
            <tr>
              <td class="bold"><i class="fa-solid fa-store" style="color:var(--cyan);margin-right:6px"></i>${s.name}</td>
              <td>${s.total}</td>
              <td style="color:var(--cyan)">${s.open}</td>
              <td style="color:var(--green)">${s.resolved}</td>
              <td>
                <div class="sla-wrap">
                  <div class="sla-bar-track"><div class="sla-bar-fill ok" style="width:${resPct}%"></div></div>
                  <span style="font-size:.7rem;color:var(--green)">${resPct}%</span>
                </div>
              </td>
              <td style="color:var(--green)">
                <i class="fa-solid fa-shield-halved"></i> ${slaOk}%
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

/* -------- CSV EXPORT -------- */
function exportCSV(){
  const headers = ['ID','Título','Prioridade','Loja','Categoria','Responsável','Status','Aberto em'];
  const rows = tickets.map(t => [
    t.id,
    `"${t.title}"`,
    priorityLabel(t.priority),
    t.store,
    t.category,
    t.owner||'',
    statusLabel(t.status),
    formatDate(t.createdAt)
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'chamados_helpdesk.csv';
  a.click();
  toast('CSV exportado com sucesso!', 'success');
}
