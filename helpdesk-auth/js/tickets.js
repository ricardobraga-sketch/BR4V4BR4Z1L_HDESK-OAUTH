/* ================================================================
   tickets.js — Módulo da aba Chamados
             (tabela, filtros, modal novo, modal editar, modal visualizar)
================================================================ */

/* -------- RENDER PAGE -------- */
function renderTicketsPage(){
  const filtered = applyFilters();
  return `
  <div class="filters-bar">
    <input class="filter-input" type="text" id="search-input"
      placeholder="🔍  Buscar por título, loja ou responsável..."
      value="${filterSearch}" oninput="onSearch(this.value)"/>
    <select class="filter-select" onchange="onFilter('status',this.value)">
      <option value="all">Todos os Status</option>
      <option value="open"        ${filterStatus==='open'       ?'selected':''}>Aberto</option>
      <option value="in_progress" ${filterStatus==='in_progress'?'selected':''}>Em Andamento</option>
      <option value="resolved"    ${filterStatus==='resolved'   ?'selected':''}>Resolvido</option>
      <option value="paused"      ${filterStatus==='paused'     ?'selected':''}>Pausado</option>
      <option value="canceled"    ${filterStatus==='canceled'   ?'selected':''}>Cancelado</option>
    </select>
    <select class="filter-select" onchange="onFilter('priority',this.value)">
      <option value="all">Todas Prioridades</option>
      <option value="critical" ${filterPriority==='critical'?'selected':''}>Crítico</option>
      <option value="high"     ${filterPriority==='high'    ?'selected':''}>Alta</option>
      <option value="medium"   ${filterPriority==='medium'  ?'selected':''}>Média</option>
      <option value="low"      ${filterPriority==='low'     ?'selected':''}>Baixa</option>
    </select>
    <select class="filter-select" id="store-filter" onchange="onFilter('store',this.value)">
      <option value="all">Todas as Lojas</option>
      ${STORES.map(s=>`<option value="${s}" ${filterStore===s?'selected':''}>${s}</option>`).join('')}
    </select>
    <button class="btn btn-outline btn-sm" onclick="clearFilters()">
      <i class="fa-solid fa-filter-circle-xmark"></i> Limpar
    </button>
  </div>
  ${renderTicketsTable(filtered)}`;
}

/* -------- FILTERS -------- */
function applyFilters(){
  return tickets.filter(t => {
    if(filterStatus   !== 'all' && t.status   !== filterStatus)   return false;
    if(filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if(filterStore    !== 'all' && t.store    !== filterStore)     return false;
    if(filterSearch){
      const q = filterSearch.toLowerCase();
      const inTitle = t.title.toLowerCase().includes(q);
      const inStore = t.store.toLowerCase().includes(q);
      const inOwner = (t.owner||'').toLowerCase().includes(q);
      const inDesc  = (t.desc||'').toLowerCase().includes(q);
      if(!inTitle && !inStore && !inOwner && !inDesc) return false;
    }
    return true;
  });
}
function onFilter(type, val){
  if(type==='status')   filterStatus   = val;
  if(type==='priority') filterPriority = val;
  if(type==='store')    filterStore    = val;
  renderContent();
}
function onSearch(val){ filterSearch = val; renderContent(); }
function clearFilters(){
  filterStatus='all'; filterPriority='all'; filterStore='all'; filterSearch='';
  renderContent();
}
function filterByStore(store){
  filterStore = store;
  setNav(document.querySelectorAll('.nav-item')[1], 'tickets');
}
function filterAndGoToTickets(store){
  filterStore = store;
  setNav(document.querySelectorAll('.nav-item')[1], 'tickets');
}

/* -------- TABLE -------- */
function renderTicketsTable(list){
  if(!list.length) return `
    <div style="padding:48px;text-align:center;color:var(--text-muted);background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius)">
      <i class="fa-solid fa-inbox" style="font-size:2.5rem;margin-bottom:12px;display:block;opacity:.4"></i>
      Nenhum chamado encontrado
    </div>`;
  return `
  <div class="table-card">
    <div class="table-header">
      <div>
        <span class="table-title">Chamados</span>
        <span class="table-count">${list.length} registro(s)</span>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Título</th><th>Descrição</th><th>Prioridade</th>
            <th>Loja</th><th>Categoria</th><th>Responsável</th>
            <th>Status</th><th>SLA</th><th>Aberto em</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(t => renderTicketRow(t)).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function renderTicketRow(t){
  const rem = getSLARemaining(t);
  const pct = getSLAPercent(t);
  const sc  = (t.status==='resolved'||t.status==='canceled') ? 'ok' : slaClass(rem, pct);
  const over = isSLAOver(t);

  return `
  <tr id="row-${t.id}">
    <td style="color:var(--cyan);font-weight:700;font-size:.75rem">
      ${t.id}${over ? '<span class="sla-over-chip">SLA!</span>' : ''}
    </td>
    <td class="bold" style="max-width:180px;white-space:normal;font-size:.78rem">${t.title}</td>
    <td style="max-width:260px;white-space:normal;font-size:.76rem;line-height:1.45;color:var(--text-secondary)">
      ${t.desc ? t.desc.substring(0,90) + (t.desc.length>90?'…':'') : '—'}
    </td>
    <td><span class="badge ${priColors[t.priority]||'pri-medium'}">${priorityLabel(t.priority)}</span></td>
    <td style="font-size:.75rem">${t.store}</td>
    <td style="font-size:.75rem;color:var(--text-muted)">${t.category}</td>
    <td style="font-size:.75rem">${t.owner||'—'}</td>
    <td>
      <select class="status-select badge ${statusColors[t.status]}" onchange="changeStatus('${t.id}',this.value)">
        <option value="open"        ${t.status==='open'       ?'selected':''}>Aberto</option>
        <option value="in_progress" ${t.status==='in_progress'?'selected':''}>Em Andamento</option>
        <option value="resolved"    ${t.status==='resolved'   ?'selected':''}>Resolvido</option>
        <option value="paused"      ${t.status==='paused'     ?'selected':''}>Pausado</option>
        <option value="canceled"    ${t.status==='canceled'   ?'selected':''}>Cancelado</option>
      </select>
    </td>
    <td>
      ${(t.status==='resolved'||t.status==='canceled')
        ? `<span style="color:var(--green);font-size:.7rem"><i class="fa-solid fa-check"></i> OK</span>`
        : `<div class="sla-wrap">
            <div class="sla-bar-track"><div class="sla-bar-fill ${sc}" style="width:${pct}%"></div></div>
            <span class="sla-time ${sc}">${formatTime(rem)}</span>
           </div>`}
    </td>
    <td style="font-size:.72rem;color:var(--text-muted)">${formatDate(t.createdAt)}</td>
    <td>
      <div style="display:flex;gap:4px">
        <button class="btn btn-outline btn-sm" onclick="openViewModal('${t.id}')" title="Visualizar">
          <i class="fa-solid fa-eye"></i>
        </button>
        <button class="btn btn-warning btn-sm" onclick="openEditModal('${t.id}')" title="Editar">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteTicket('${t.id}')" title="Excluir">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </td>
  </tr>`;
}

/* -------- TICKET ACTIONS -------- */
function changeStatus(id, newStatus){
  const t = tickets.find(t => t.id === id);
  if(!t) return;
  const oldStatus = t.status;
  t.status = newStatus;
  updateNavBadges();
  renderContent();
  toast(`${id} → ${statusLabel(newStatus)}`, newStatus==='resolved'?'success':'warn');
  /* ── SNAPSHOT ── */
  saveSnapshot(`Status: ${id} ${statusLabel(oldStatus)} → ${statusLabel(newStatus)}`);
}

function deleteTicket(id){
  if(!confirm(`Excluir chamado ${id}?`)) return;
  /* Salva snapshot ANTES de excluir */
  saveSnapshot(`Antes de excluir: ${id}`);
  tickets = tickets.filter(t => t.id !== id);
  renderContent();
  toast(`Chamado ${id} excluído`, 'warn');
  /* Snapshot após excluir */
  saveSnapshot(`Excluído: ${id}`);
}

/* ================================================================
   MODAL — NOVO CHAMADO
================================================================ */
function openModal(){
  document.getElementById('modal-overlay').classList.add('open');
  currentPriority = 'medium';
  document.querySelectorAll('#modal-overlay .priority-opt').forEach(el => {
    el.classList.toggle('selected', el.dataset.p === 'medium');
  });
  ['f-title','f-store','f-category','f-owner','f-requester','f-desc'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
}
function closeModal(){ document.getElementById('modal-overlay').classList.remove('open'); }
function closeModalOutside(e){ if(e.target.id==='modal-overlay') closeModal(); }

function selectPriority(p){
  currentPriority = p;
  document.querySelectorAll('#modal-overlay .priority-opt').forEach(el => {
    el.classList.toggle('selected', el.dataset.p === p);
  });
}

function submitTicket(){
  const title = document.getElementById('f-title').value.trim();
  const store = document.getElementById('f-store').value;
  const cat   = document.getElementById('f-category').value;
  if(!title){ toast('Informe o título do chamado!','error'); return; }
  if(!store){ toast('Selecione a loja/unidade!','error'); return; }
  if(!cat)  { toast('Selecione a categoria!','error'); return; }

  const newTicket = {
    id:        genId(),
    title,
    priority:  currentPriority,
    store,
    category:  cat,
    owner:     document.getElementById('f-owner').value.trim() || '—',
    requester: document.getElementById('f-requester').value.trim() || 'Anônimo',
    status:    'open',
    desc:      document.getElementById('f-desc').value.trim(),
    history:   [],
    createdAt: Date.now()
  };
  tickets.unshift(newTicket);
  closeModal();
  renderContent();
  toast(`Chamado ${newTicket.id} criado com sucesso!`, 'success');
  /* ── SNAPSHOT ── */
  saveSnapshot(`Novo chamado: ${newTicket.id} — ${newTicket.title.substring(0,40)}`);
}

/* ================================================================
   MODAL — EDITAR CHAMADO (com campo Histórico)
================================================================ */
function openEditModal(id){
  const t = tickets.find(t => t.id === id);
  if(!t) return;

  document.getElementById('edit-id').value        = t.id;
  document.getElementById('edit-title').value     = t.title;
  document.getElementById('edit-store').value     = t.store;
  document.getElementById('edit-category').value  = t.category;
  document.getElementById('edit-owner').value     = t.owner || '';
  document.getElementById('edit-requester').value = t.requester || '';
  document.getElementById('edit-status').value    = t.status;
  document.getElementById('edit-desc').value      = t.desc || '';
  document.getElementById('edit-history-input').value = '';

  // Prioridade
  const editPriority = t.priority;
  document.querySelectorAll('#edit-overlay .priority-opt').forEach(el => {
    el.classList.toggle('selected', el.dataset.p === editPriority);
  });
  document.getElementById('edit-overlay').dataset.priority = editPriority;

  // Renderiza histórico existente
  renderHistoryList(t, 'edit-history-list');

  document.getElementById('edit-overlay').classList.add('open');
}
function closeEditModal(){ document.getElementById('edit-overlay').classList.remove('open'); }
function closeEditOutside(e){ if(e.target.id==='edit-overlay') closeEditModal(); }

function selectEditPriority(p){
  document.getElementById('edit-overlay').dataset.priority = p;
  document.querySelectorAll('#edit-overlay .priority-opt').forEach(el => {
    el.classList.toggle('selected', el.dataset.p === p);
  });
}

function saveEditTicket(){
  const id    = document.getElementById('edit-id').value;
  const t     = tickets.find(t => t.id === id);
  if(!t){ toast('Chamado não encontrado!','error'); return; }

  const title = document.getElementById('edit-title').value.trim();
  const store = document.getElementById('edit-store').value;
  const cat   = document.getElementById('edit-category').value;
  if(!title){ toast('Informe o título!','error'); return; }
  if(!store){ toast('Selecione a loja!','error'); return; }
  if(!cat)  { toast('Selecione a categoria!','error'); return; }

  const histInput = document.getElementById('edit-history-input').value.trim();
  if(histInput){
    if(!t.history) t.history = [];
    t.history.unshift({ date: Date.now(), text: histInput });
  }

  t.title     = title;
  t.store     = store;
  t.category  = cat;
  t.owner     = document.getElementById('edit-owner').value.trim() || '—';
  t.requester = document.getElementById('edit-requester').value.trim() || 'Anônimo';
  t.status    = document.getElementById('edit-status').value;
  t.desc      = document.getElementById('edit-desc').value.trim();
  t.priority  = document.getElementById('edit-overlay').dataset.priority || t.priority;

  closeEditModal();
  renderContent();
  toast(`Chamado ${id} atualizado com sucesso!`, 'success');
  /* ── SNAPSHOT ── */
  saveSnapshot(`Editado: ${id} — ${title.substring(0,40)}`);
}

/* ================================================================
   MODAL — VISUALIZAR CHAMADO
================================================================ */
function openViewModal(id){
  const t = tickets.find(t => t.id === id);
  if(!t) return;

  const rem = getSLARemaining(t);
  const pct = getSLAPercent(t);
  const sc  = (t.status==='resolved'||t.status==='canceled') ? 'ok' : slaClass(rem, pct);

  document.getElementById('view-body').innerHTML = `
    <div style="background:var(--bg-card2);border-radius:10px;padding:16px;margin-bottom:16px">
      <div style="font-size:.95rem;font-weight:700;margin-bottom:4px">${t.title}</div>
      <div style="font-size:.75rem;color:var(--text-muted)">${t.id} · Aberto em ${formatDate(t.createdAt)}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div class="detail-row"><span class="detail-label">Prioridade</span><span class="badge ${priColors[t.priority]||'pri-medium'}">${priorityLabel(t.priority)}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="badge ${statusColors[t.status]}">${statusLabel(t.status)}</span></div>
      <div class="detail-row"><span class="detail-label">Loja</span><span class="detail-val">${t.store}</span></div>
      <div class="detail-row"><span class="detail-label">Categoria</span><span class="detail-val">${t.category}</span></div>
      <div class="detail-row"><span class="detail-label">Responsável</span><span class="detail-val">${t.owner||'—'}</span></div>
      <div class="detail-row"><span class="detail-label">Solicitante</span><span class="detail-val">${t.requester||'—'}</span></div>
    </div>
    <div class="detail-row" style="margin-bottom:14px">
      <span class="detail-label">SLA</span>
      <div class="sla-wrap" style="flex:1">
        <div class="sla-bar-track">
          <div class="sla-bar-fill ${sc}" style="width:${pct}%"></div>
        </div>
        <span class="sla-time ${sc}">
          ${(t.status==='resolved'||t.status==='canceled') ? 'OK' : formatTime(rem)}
        </span>
      </div>
    </div>
    ${t.desc ? `
    <div style="margin-bottom:16px">
      <div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;margin-bottom:6px">Descrição</div>
      <div style="background:var(--bg-card2);border-radius:8px;padding:12px;font-size:.8rem;color:var(--text-secondary);line-height:1.6">${t.desc}</div>
    </div>` : ''}
    <div style="margin-bottom:6px">
      <div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;margin-bottom:8px">
        <i class="fa-solid fa-clock-rotate-left" style="color:var(--cyan)"></i> Histórico
      </div>
      <div id="view-history-list"></div>
    </div>
  `;

  renderHistoryList(t, 'view-history-list');

  const resolveBtn = document.getElementById('view-resolve-btn');
  resolveBtn.style.display = (t.status==='resolved') ? 'none' : 'inline-flex';
  resolveBtn.onclick = () => { changeStatus(t.id,'resolved'); closeViewModal(); };

  const editFromViewBtn = document.getElementById('view-edit-btn');
  editFromViewBtn.onclick = () => { closeViewModal(); openEditModal(t.id); };

  document.getElementById('view-overlay').classList.add('open');
}
function closeViewModal(){ document.getElementById('view-overlay').classList.remove('open'); }
function closeViewOutside(e){ if(e.target.id==='view-overlay') closeViewModal(); }

/* -------- HISTORY HELPER -------- */
function renderHistoryList(t, containerId){
  const container = document.getElementById(containerId);
  if(!container) return;
  if(!t.history || t.history.length === 0){
    container.innerHTML = `<div class="history-empty"><i class="fa-solid fa-inbox"></i> Nenhum registro no histórico</div>`;
    return;
  }
  container.innerHTML = `
    <div class="history-timeline">
      ${t.history.map(h => `
      <div class="history-entry">
        <div class="h-meta">
          <i class="fa-solid fa-clock-rotate-left"></i>
          ${formatDate(h.date)}
        </div>
        <div class="h-text">${h.text}</div>
      </div>`).join('')}
    </div>`;
}
