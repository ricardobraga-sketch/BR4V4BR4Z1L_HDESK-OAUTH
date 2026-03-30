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
    owner: 'Carlos Mendes',
    requester: 'Ana Lima',
    status: 'open',
    desc: 'Venda registrada no sistema de pedidos dos garçons, porém não aparece no Varejo Fácil.',
    history: [],
    createdAt: Date.now() - 2*3600*1000 + 20*60*1000
  },
  {
    id: 'T-002',
    title: 'Criar Usuario VAREJO FACIL',
    priority: 'high',
    store: 'Brava - Terrazo',
    category: 'Sistemas',
    owner: 'Daniele Xavier',
    requester: 'Ricardo',
    status: 'open',
    desc: 'Usuária estava utilizando login de Ian Cavalcante.',
    history: [],
    createdAt: Date.now() - 3*3600*1000
  },
  {
    id: 'T-003',
    title: 'Corrigir Cadastro Usuario',
    priority: 'medium',
    store: 'Brava - Terrazo',
    category: 'Sistemas',
    owner: 'Daniele Xavier',
    requester: 'Ricardo',
    status: 'in_progress',
    desc: 'Corrigir sobrenome para Xavier no campo FUNCIONÁRIO.',
    history: [],
    createdAt: Date.now() - 5*3600*1000
  },
  {
    id: 'T-004',
    title: 'Lentidão VAREJO FACIL ao gerar relatorio',
    priority: 'low',
    store: 'Brava - Terrazo',
    category: 'Sistemas',
    owner: 'Daniele Xavier',
    requester: 'Ricardo',
    status: 'resolved',
    desc: 'Sistema apresenta lentidão na geração de relatórios.',
    history: [],
    createdAt: Date.now() - 26*3600*1000
  },
  {
    id: 'T-005',
    title: 'Configuração TS',
    priority: 'low',
    store: 'Brava - Matriz',
    category: 'Rede / Conectividade',
    owner: 'Lavinia',
    requester: 'Ricardo',
    status: 'in_progress',
    desc: 'Configuração realizada para login automático no Terminal Services.',
    history: [],
    createdAt: Date.now() - 1*3600*1000 - 30*60*1000
  },
  {
    id: 'T-006',
    title: 'Configuração notebook',
    priority: 'medium',
    store: 'Brava - Matriz',
    category: 'Equipamentos',
    owner: 'Francisvan Noronha',
    requester: 'Ricardo',
    status: 'open',
    desc: 'Configurar novo Notebook para uso da nova Gestão.',
    history: [],
    createdAt: Date.now() - 6*3600*1000
  },
  {
    id: 'T-007',
    title: 'Permissao a rotina Whinthor',
    priority: 'high',
    store: 'Brava - Matriz',
    category: 'Sistemas',
    owner: 'Luann Melo',
    requester: 'Ricardo',
    status: 'open',
    desc: 'Dar permissao a rotina 512 dentro do whinthor para o usuario Luann Melo.',
    history: [],
    createdAt: Date.now() - 2.5*3600*1000
  },
  {
    id: 'T-008',
    title: 'Permissao a rotina whinthor',
    priority: 'high',
    store: 'Brava - Matriz',
    category: 'Sistemas',
    owner: 'Luann Melo',
    requester: 'Ricardo',
    status: 'paused',
    desc: 'Permissao a rotina 8029 whinthor ao usuario Luann Melo.',
    history: [],
    createdAt: Date.now() - 4*3600*1000
  },
  {
    id: 'T-009',
    title: 'Impressora sem comunicação PDV',
    priority: 'high',
    store: 'Brava - Aldeota',
    category: 'Equipamentos',
    owner: 'Carlos Mendes',
    requester: 'Fernanda',
    status: 'open',
    desc: 'Impressora fiscal não responde ao PDV da loja Aldeota. Verificar cabo e driver.',
    history: [],
    createdAt: Date.now() - 1*3600*1000
  },
  {
    id: 'T-010',
    title: 'Internet instável - Caixa 2',
    priority: 'critical',
    store: 'Brava - Aldeota',
    category: 'Rede / Conectividade',
    owner: 'Lavinia',
    requester: 'Marcos',
    status: 'in_progress',
    desc: 'Queda intermitente na conexão do caixa 2. Afeta vendas.',
    history: [
      { date: Date.now() - 30*60*1000, text: 'Técnico verificou roteador. Reset realizado. Aguardando estabilização.' }
    ],
    createdAt: Date.now() - 2*3600*1000
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
