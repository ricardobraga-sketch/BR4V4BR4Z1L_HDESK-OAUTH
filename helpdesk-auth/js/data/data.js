/* ================================================================
   data.js — Dados compartilhados, constantes, helpers de estado
================================================================ */

const SLA_HOURS = { critical: 2, high: 4, medium: 8, low: 24 };

// Nomes de lojas PADRONIZADOS (com " - ") — usados em TODOS os lugares
const STORES = [
  'Brava - Matriz',
  'Brava - Terrazo',
  'Brava - Iguatemi',
  'Brava - Aldeota'
];

const CATEGORIES = ['TI','Infraestrutura','Sistemas','Equipamentos','Rede / Conectividade','Outros'];
const STATUS_LIST = ['open','in_progress','resolved','paused','canceled'];

let tickets = [
  {
    id: 'T-001',
    title: 'VAEJOFACIL/RETAGUARDA: Divergencia Produto',
    priority: 'critical',
    store: 'Brava - Terrazo',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T06:58:00').getTime()
  },
  {
    id: 'T-002',
    title: 'Criar Usuario VAREJO FACIL',
    priority: 'medium',
    store: 'Brava - Terrazo',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T05:38:00').getTime()
  },
  {
    id: 'T-003',
    title: 'Corrigir Cadastro Usuario',
    priority: 'medium',
    store: 'Brava - Terrazo',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T03:38:00').getTime()
  },
  {
    id: 'T-004',
    title: 'Lentidão VAREJO FACIL ao gerar relatorio',
    priority: 'low',
    store: 'Brava - Terrazo',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'open',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-23T06:38:00').getTime()
  },
  {
    id: 'T-005',
    title: 'Configuração TS',
    priority: 'low',
    store: 'Brava - Matriz',
    category: 'Rede / Conectividade',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T07:08:00').getTime()
  },
  {
    id: 'T-006',
    title: 'Configuração notebook',
    priority: 'medium',
    store: 'Brava - Matriz',
    category: 'Equipamentos',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T02:38:00').getTime()
  },
  {
    id: 'T-007',
    title: 'Permissao a rotina Whinthor',
    priority: 'high',
    store: 'Brava - Matriz',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T06:08:00').getTime()
  },
  {
    id: 'T-008',
    title: 'Permissao a rotina whinthor',
    priority: 'high',
    store: 'Brava - Matriz',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T04:38:00').getTime()
  },
  {
    id: 'T-009',
    title: 'Impressora sem comunicação PDV',
    priority: 'high',
    store: 'Brava - Aldeota',
    category: 'Equipamentos',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T07:38:00').getTime()
  },
  {
    id: 'T-010',
    title: 'SYSPDV Offline',
    priority: 'critical',
    store: 'Brava - Aldeota',
    category: 'Rede / Conectividade',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T06:38:00').getTime()
  },
  {
    id: 'T-011',
    title: 'Linhas telefonicas - TIM',
    priority: 'high',
    store: 'Brava - Matriz',
    category: 'Equipamentos',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T08:40:00').getTime()
  },
  {
    id: 'T-012',
    title: 'TS Travado',
    priority: 'high',
    store: 'Brava - Matriz',
    category: 'Rede / Conectividade',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T08:45:00').getTime()
  },
  {
    id: 'T-013',
    title: 'Permissao Rotina WinThor - 572',
    priority: 'high',
    store: 'Brava - Matriz',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T08:47:00').getTime()
  },
  {
    id: 'T-014',
    title: 'Criação de usuário',
    priority: 'medium',
    store: 'Brava - Iguatemi',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T08:47:00').getTime()
  },
  {
    id: 'T-015',
    title: 'Incosistencia VAREJO - LOja ALDEOTA',
    priority: 'high',
    store: 'Brava - Aldeota',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T08:52:00').getTime()
  },
  {
    id: 'T-016',
    title: 'Configurar envio de DANFE por e-mail WINTHOR',
    priority: 'low',
    store: 'Brava - Matriz',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'in_progress',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T12:00:00').getTime()
  },
  {
    id: 'T-017',
    title: 'Corrigir calculo rotina 8029 Winthor',
    priority: 'low',
    store: 'Brava - Matriz',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'open',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T13:15:00').getTime()
  },
  {
    id: 'T-018',
    title: 'Operadora foi cadastrada no EasyAssist e nao no Varejo',
    priority: 'medium',
    store: 'Brava - Terrazo',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T13:19:00').getTime()
  },
  {
    id: 'T-019',
    title: 'Troca de local relogio de ponto',
    priority: 'low',
    store: 'Brava - Matriz',
    category: 'Equipamentos',
    owner: 'Ricardo',
    requester: '',
    status: 'in_progress',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T16:21:00').getTime()
  },
  {
    id: 'T-020',
    title: 'Rotina 750 nao aparece para o usuario Samuel',
    priority: 'medium',
    store: 'Brava - Matriz',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-24T17:05:00').getTime()
  },
  {
    id: 'T-021',
    title: 'Novas inconsistencias no cadastro de produto varejo facil',
    priority: 'medium',
    store: 'Brava - Terrazo',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'in_progress',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-26T09:06:00').getTime()
  },
  {
    id: 'T-022',
    title: 'Acesso LinkedIn da BRAVA',
    priority: 'low',
    store: 'Brava - Matriz',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'in_progress',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-26T09:26:00').getTime()
  },
  {
    id: 'T-023',
    title: 'Criar duas formas de pagamentos no Varejo facil',
    priority: 'medium',
    store: 'Brava - Matriz',
    category: 'Sistemas',
    owner: 'Ricardo',
    requester: '',
    status: 'resolved',
    desc: '',
    history: [],
    createdAt: new Date('2026-03-26T17:08:00').getTime()
  },
];

/* Estado da aplicação */
let currentPriority = 'medium';
let filterStatus    = 'all';
let filterPriority  = 'all';
let filterStore     = 'all';
let filterSearch    = '';
let currentView     = 'dashboard';
let chartPie, chartBar, chartLine;

/* ================================================================
   HELPERS
================================================================ */
function getSLAHours(priority){ return SLA_HOURS[priority] || 8; }

function getSLARemaining(ticket){
  const elapsed = (Date.now() - ticket.createdAt) / 3600000;
  return getSLAHours(ticket.priority) - elapsed;
}

function getSLAPercent(ticket){
  const elapsed = (Date.now() - ticket.createdAt) / 3600000;
  return Math.min((elapsed / getSLAHours(ticket.priority)) * 100, 100);
}

function isSLAOver(ticket){
  if(ticket.status === 'resolved' || ticket.status === 'canceled') return false;
  return getSLARemaining(ticket) <= 0;
}

function formatTime(hours){
  if(hours <= 0) return 'Expirado';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDate(ts){
  return new Date(ts).toLocaleString('pt-BR',{
    day:'2-digit', month:'2-digit', year:'2-digit',
    hour:'2-digit', minute:'2-digit'
  });
}

function priorityLabel(p){
  return { critical:'Crítico', high:'Alta', medium:'Média', low:'Baixa' }[p] || p;
}

function statusLabel(s){
  return {
    open:'Aberto', in_progress:'Em Andamento',
    resolved:'Resolvido', paused:'Pausado', canceled:'Cancelado'
  }[s] || s;
}

function slaClass(rem, pct){
  if(rem <= 0) return 'over';
  if(pct >= 80) return 'danger';
  if(pct >= 50) return 'warn';
  return 'ok';
}

function genId(){
  const max = Math.max(...tickets.map(t => parseInt(t.id.replace('T-',''))), 0);
  return 'T-' + String(max + 1).padStart(3,'0');
}

function getStats(){
  const active = tickets.filter(t => t.status !== 'resolved' && t.status !== 'canceled');
  return {
    total:      tickets.length,
    open:       tickets.filter(t => t.status === 'open').length,
    resolved:   tickets.filter(t => t.status === 'resolved').length,
    critical:   tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    slaOver:    active.filter(t => isSLAOver(t)).length,
  };
}

const priColors    = { critical:'pri-critical', high:'pri-high', medium:'pri-medium', low:'pri-low' };
const statusColors = { open:'badge-open', in_progress:'badge-prog', resolved:'badge-resolved', paused:'badge-paused', canceled:'badge-canceled' };
