/* ================================================================
   charts.js — Módulo de Gráficos (Chart.js)
================================================================ */

function initCharts(){
  setTimeout(() => {
    const s = getStats();

    // ---- PIE: Status ----
    const pieCv = document.getElementById('chart-pie');
    if(pieCv){
      if(chartPie) chartPie.destroy();
      const prog   = tickets.filter(t => t.status === 'in_progress').length;
      const paused = tickets.filter(t => t.status === 'paused').length;
      chartPie = new Chart(pieCv, {
        type: 'doughnut',
        data: {
          labels: ['Abertos','Em Andamento','Resolvidos','Pausados'],
          datasets:[{
            data: [s.open, prog, s.resolved, paused],
            backgroundColor: ['#2563eb','#06b6d4','#10b981','#f59e0b'],
            borderWidth: 2, borderColor: '#1a2540', hoverOffset: 6
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position:'bottom', labels:{ color:'#94a3b8', font:{size:11}, boxWidth:10, padding:12 }},
            tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw} (${s.total>0?Math.round(c.raw/s.total*100):0}%)` }}
          }
        }
      });
    }

    // ---- BAR: Prioridade ----
    const barCv = document.getElementById('chart-bar');
    if(barCv){
      if(chartBar) chartBar.destroy();
      const counts = ['critical','high','medium','low']
        .map(p => tickets.filter(t => t.priority === p && t.status !== 'resolved').length);
      chartBar = new Chart(barCv, {
        type: 'bar',
        data: {
          labels: ['Crítico','Alta','Média','Baixa'],
          datasets:[{
            label: 'Ativos',
            data: counts,
            backgroundColor: [
              'rgba(239,68,68,.7)','rgba(245,158,11,.7)',
              'rgba(6,182,212,.7)','rgba(16,185,129,.7)'
            ],
            borderRadius: 6, borderSkipped: false
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display:false }},
          scales: {
            x: { grid:{ color:'rgba(255,255,255,.04)' }, ticks:{ color:'#94a3b8', font:{size:11} }},
            y: { grid:{ color:'rgba(255,255,255,.04)' }, ticks:{ color:'#94a3b8', font:{size:11}, stepSize:1 }, beginAtZero:true }
          }
        }
      });
    }

    // ---- LINE: Tendência 7 dias ----
    const lineCv = document.getElementById('chart-line');
    if(lineCv){
      if(chartLine) chartLine.destroy();
      const days = Array.from({length:7}, (_,i) => {
        const d = new Date(); d.setDate(d.getDate() - 6 + i);
        return d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'});
      });
      const opened   = [3,5,2,7,4,6, tickets.filter(t => t.status !== 'resolved').length];
      const resolved = [2,4,1,5,3,5, tickets.filter(t => t.status === 'resolved').length];
      chartLine = new Chart(lineCv, {
        type: 'line',
        data: {
          labels: days,
          datasets: [
            { label:'Abertos',   data: opened,   borderColor:'#2563eb', backgroundColor:'rgba(37,99,235,.12)', fill:true, tension:.4, pointRadius:4, pointBackgroundColor:'#2563eb' },
            { label:'Resolvidos',data: resolved,  borderColor:'#10b981', backgroundColor:'rgba(16,185,129,.08)', fill:true, tension:.4, pointRadius:4, pointBackgroundColor:'#10b981' }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend:{ position:'bottom', labels:{ color:'#94a3b8', font:{size:11}, boxWidth:10 }}},
          scales: {
            x: { grid:{ color:'rgba(255,255,255,.04)' }, ticks:{ color:'#94a3b8', font:{size:11} }},
            y: { grid:{ color:'rgba(255,255,255,.04)' }, ticks:{ color:'#94a3b8', font:{size:11} }, beginAtZero:true }
          }
        }
      });
    }

    // ---- CAT: Categorias (só na aba Relatórios) ----
    const catCv = document.getElementById('chart-cat');
    if(catCv){
      const catData = CATEGORIES.map(c => tickets.filter(t => t.category === c).length);
      new Chart(catCv, {
        type: 'bar',
        data: {
          labels: CATEGORIES,
          datasets:[{
            label: 'Chamados',
            data: catData,
            backgroundColor: 'rgba(139,92,246,.7)',
            borderRadius: 6, borderSkipped: false
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          plugins: { legend:{ display:false }},
          scales: {
            x: { grid:{ color:'rgba(255,255,255,.04)' }, ticks:{ color:'#94a3b8', font:{size:11} }, beginAtZero:true },
            y: { grid:{ color:'rgba(255,255,255,.04)' }, ticks:{ color:'#94a3b8', font:{size:11} }}
          }
        }
      });
    }
  }, 80);
}
