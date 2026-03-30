/* ================================================================
   snapshot.js — Sistema de Snapshot Automático Versionado
   Salva estado completo a cada mudança, limita versões e permite restaurar
================================================================ */

const SNAPSHOT_KEY    = 'helpdesk_snapshots';
const MAX_SNAPSHOTS   = 30;

/* -------- GET ALL SNAPSHOTS -------- */
function getSnapshots(){
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){
    console.warn('[Snapshot] Erro ao ler snapshots:', e);
    return [];
  }
}

/* -------- SAVE SNAPSHOT -------- */
function saveSnapshot(label){
  try {
    const snaps = getSnapshots();

    /* Número de versão sequencial */
    const lastVer = snaps.length > 0 ? snaps[snaps.length - 1].version : 0;
    const newVer  = lastVer + 1;

    /* Clona profundo de tickets para não compartilhar referências */
    const ticketsCopy = JSON.parse(JSON.stringify(tickets));
    const slaCopy     = JSON.parse(JSON.stringify(SLA_HOURS));

    const snap = {
      version:   newVer,
      timestamp: Date.now(),
      label:     label || _snapshotLabel(),
      tickets:   ticketsCopy,
      slaHours:  slaCopy
    };

    snaps.push(snap);

    /* Limita ao máximo de versões (remove as mais antigas) */
    if(snaps.length > MAX_SNAPSHOTS){
      snaps.splice(0, snaps.length - MAX_SNAPSHOTS);
    }

    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snaps));
    _updateSnapshotBadge();
    return snap;
  } catch(e){
    console.warn('[Snapshot] Erro ao salvar snapshot:', e);
    return null;
  }
}

/* -------- LOAD LATEST SNAPSHOT (retorna objeto ou null) -------- */
function loadLatestSnapshot(){
  const snaps = getSnapshots();
  return snaps.length > 0 ? snaps[snaps.length - 1] : null;
}

/* -------- RESTORE SNAPSHOT BY INDEX (índice no array) -------- */
function restoreSnapshot(index){
  const snaps = getSnapshots();
  if(index < 0 || index >= snaps.length){
    toast('Snapshot inválido!', 'error');
    return;
  }
  const snap = snaps[index];
  if(!confirm(`Restaurar snapshot v${snap.version}?\n${new Date(snap.timestamp).toLocaleString('pt-BR')}\n\nO estado atual será salvo antes da restauração.`)) return;

  /* Salva estado atual antes de restaurar */
  saveSnapshot('Antes de restaurar v' + snap.version);

  /* Restaura */
  tickets = JSON.parse(JSON.stringify(snap.tickets));
  Object.keys(SLA_HOURS).forEach(k => delete SLA_HOURS[k]);
  Object.assign(SLA_HOURS, snap.slaHours || { critical:2, high:4, medium:8, low:24 });

  renderContent();
  toast(`Snapshot v${snap.version} restaurado com sucesso!`, 'success');
}

/* -------- DELETE ALL SNAPSHOTS -------- */
function clearAllSnapshots(){
  if(!confirm('Apagar TODO o histórico de snapshots? Esta ação não pode ser desfeita.')) return;
  localStorage.removeItem(SNAPSHOT_KEY);
  _updateSnapshotBadge();
  renderContent();
  toast('Histórico de snapshots apagado.', 'warn');
}

/* -------- EXPORT SNAPSHOT AS JSON -------- */
function exportSnapshot(){
  const snaps = getSnapshots();
  if(!snaps.length){ toast('Nenhum snapshot para exportar!', 'warn'); return; }
  const blob = new Blob([JSON.stringify(snaps, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `helpdesk_snapshots_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Snapshots exportados!', 'success');
}

/* -------- IMPORT SNAPSHOT FROM JSON -------- */
function importSnapshot(){
  const input = document.createElement('input');
  input.type  = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        if(!Array.isArray(imported)) throw new Error('Formato inválido');
        if(!confirm(`Importar ${imported.length} snapshot(s)? Isso vai SUBSTITUIR o histórico atual.`)) return;
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(imported.slice(-MAX_SNAPSHOTS)));
        _updateSnapshotBadge();
        renderContent();
        toast(`${imported.length} snapshot(s) importados!`, 'success');
      } catch(err){
        toast('Arquivo inválido!', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* -------- RENDER SNAPSHOT PANEL (usado em renderSettingsPage) -------- */
function renderSnapshotPanel(){
  const snaps   = getSnapshots();
  const total   = snaps.length;
  const latest  = total > 0 ? snaps[total - 1] : null;
  const oldest  = total > 0 ? snaps[0] : null;

  /* Calcula tamanho aproximado em KB */
  let sizeKB = 0;
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY) || '';
    sizeKB = (raw.length * 2 / 1024).toFixed(1);
  } catch(e){}

  return `
  <div class="table-card" style="padding:24px;margin-top:20px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px">
      <div>
        <div style="font-size:.9rem;font-weight:700">
          <i class="fa-solid fa-camera" style="color:var(--cyan);margin-right:6px"></i>
          Histórico de Snapshots
          <span id="snap-badge" style="
            display:inline-flex;align-items:center;justify-content:center;
            background:var(--cyan);color:#0f172a;font-size:.65rem;font-weight:800;
            border-radius:999px;padding:1px 7px;margin-left:6px;
          ">${total}</span>
        </div>
        <div style="font-size:.72rem;color:var(--text-muted);margin-top:3px">
          Salvo automaticamente a cada alteração · Máx. ${MAX_SNAPSHOTS} versões · ${sizeKB} KB usados
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" onclick="exportSnapshot()" title="Exportar JSON">
          <i class="fa-solid fa-file-export"></i> Exportar
        </button>
        <button class="btn btn-outline btn-sm" onclick="importSnapshot()" title="Importar JSON">
          <i class="fa-solid fa-file-import"></i> Importar
        </button>
        <button class="btn btn-danger btn-sm" onclick="clearAllSnapshots()" title="Apagar histórico">
          <i class="fa-solid fa-trash"></i> Limpar Histórico
        </button>
      </div>
    </div>

    ${total === 0 ? `
      <div style="text-align:center;padding:32px;color:var(--text-muted)">
        <i class="fa-solid fa-camera" style="font-size:2rem;opacity:.3;display:block;margin-bottom:8px"></i>
        Nenhum snapshot salvo ainda.<br>
        <span style="font-size:.75rem">Os snapshots serão criados automaticamente ao alterar chamados.</span>
      </div>
    ` : `
      <!-- Resumo -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px">
        <div style="background:var(--bg-card2);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:1.4rem;font-weight:800;color:var(--cyan)">${total}</div>
          <div style="font-size:.68rem;color:var(--text-muted)">Versões Salvas</div>
        </div>
        <div style="background:var(--bg-card2);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:.78rem;font-weight:700;color:var(--green)">${latest ? new Date(latest.timestamp).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—'}</div>
          <div style="font-size:.68rem;color:var(--text-muted)">Último Snapshot</div>
        </div>
        <div style="background:var(--bg-card2);border-radius:8px;padding:12px;text-align:center">
          <div style="font-size:.78rem;font-weight:700;color:var(--text-muted)">${oldest ? new Date(oldest.timestamp).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—'}</div>
          <div style="font-size:.68rem;color:var(--text-muted)">Mais Antigo</div>
        </div>
      </div>

      <!-- Lista de snapshots (mais recentes primeiro) -->
      <div style="max-height:340px;overflow-y:auto;border:1px solid var(--border);border-radius:8px">
        ${[...snaps].reverse().map((s, ri) => {
          const idx = total - 1 - ri; /* índice real no array */
          const isLatest = ri === 0;
          return `
          <div style="
            display:flex;align-items:center;justify-content:space-between;
            padding:10px 14px;border-bottom:1px solid var(--border);
            background:${isLatest ? 'rgba(6,182,212,.06)' : 'transparent'};
            transition:background .2s;
          " onmouseover="this.style.background='rgba(255,255,255,.04)'"
             onmouseout="this.style.background='${isLatest ? 'rgba(6,182,212,.06)' : 'transparent'}'">
            <div style="display:flex;align-items:center;gap:10px;min-width:0">
              <div style="
                background:${isLatest ? 'var(--cyan)' : 'var(--border)'};
                color:${isLatest ? '#0f172a' : 'var(--text-muted)'};
                border-radius:5px;padding:2px 7px;font-size:.65rem;font-weight:800;white-space:nowrap
              ">v${s.version}</div>
              <div style="min-width:0">
                <div style="font-size:.78rem;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px">
                  ${s.label}
                  ${isLatest ? '<span style="font-size:.62rem;color:var(--cyan);margin-left:4px">● atual</span>' : ''}
                </div>
                <div style="font-size:.68rem;color:var(--text-muted)">
                  ${new Date(s.timestamp).toLocaleString('pt-BR')}
                  · ${s.tickets ? s.tickets.length : 0} chamado(s)
                </div>
              </div>
            </div>
            ${!isLatest ? `
            <button class="btn btn-outline btn-sm" onclick="restoreSnapshot(${idx})"
              title="Restaurar este snapshot" style="white-space:nowrap;flex-shrink:0">
              <i class="fa-solid fa-rotate-left"></i> Restaurar
            </button>` : `
            <span style="font-size:.7rem;color:var(--text-muted);font-style:italic;flex-shrink:0">Estado atual</span>
            `}
          </div>`;
        }).join('')}
      </div>
    `}
  </div>`;
}

/* -------- INTERNAL HELPERS -------- */
function _snapshotLabel(){
  /* Tenta detectar o contexto pela call stack — fallback simples */
  return 'Alteração automática';
}

function _updateSnapshotBadge(){
  const el = document.getElementById('snap-badge');
  if(el){
    const total = getSnapshots().length;
    el.textContent = total;
  }
}

/* -------- INIT: carrega último snapshot ao inicializar -------- */
function initSnapshots(){
  const snap = loadLatestSnapshot();
  if(snap && snap.tickets){
    tickets = JSON.parse(JSON.stringify(snap.tickets));
    if(snap.slaHours){
      Object.keys(SLA_HOURS).forEach(k => delete SLA_HOURS[k]);
      Object.assign(SLA_HOURS, snap.slaHours);
    }
    console.log(`[Snapshot] Estado restaurado: v${snap.version} · ${snap.tickets.length} chamados`);
    return true;
  }
  return false;
}
