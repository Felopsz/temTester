// Dados e carregamento do banco
let CURRENT_USER = 'admin';
let CURRENT_ROLE = 'admin';
const TICKET_FIELD_LABELS = {
  id:'ID',
  createdAt:'Data de criação',
  solicitante:'Aberto por',
  telefone:'Contato',
  meetPoint:'Ponto de encontro',
  dupla:'Dupla',
  concl:'% de conclusão',
  dueDate:'Prazo (data final)',
  resumo:'Resumo',
  descricao:'Descrição'
};
const TICKET_FIELDS = Object.keys(TICKET_FIELD_LABELS);

function genHistory(finalPct){
  const pts = []; let v = Math.max(5, Math.min(90, finalPct - 20));
  for(let i=0;i<8;i++){ v = Math.min(100, Math.max(0, v + (Math.random()*18-5))); pts.push(Math.round(v)); }
  pts[7] = finalPct;
  return pts;
}

function parseDateLocal(str){
  if (!str) return new Date(NaN);
  if (typeof str === 'string' && str.length <= 10){
    const [y,m,d] = str.split('-').map(Number);
    return new Date(y, m-1, d, 23, 59, 59);
  }
  return new Date(str);
}

const DB = {
  state: {
    tickets: [],
    projects: [],
    materialsByProject: {},
    rdosByTicket: {},
    historyByTicket: {},
    users: {},
  },
  async load(rawData){
    const data = rawData || await (await fetch('/api/db')).json();
    // tickets e projects vêm como objetos chaveados pelo ID
    this.state.tickets = Object
      .entries(data.tickets || {})
      .map(([id, t]) => ({ id, ...t }))
      .sort((a, b) => {
        const da = parseDateLocal(a.dueDate);
        const db = parseDateLocal(b.dueDate);
        if (isNaN(da)) return 1;
        if (isNaN(db)) return -1;
        return da - db;
      });
    this.state.projects = Object
      .entries(data.projects || {})
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => parseDateLocal(a.prazo) - parseDateLocal(b.prazo));
    this.state.materialsByProject = data.materialsByProject || {};
    this.state.rdosByTicket = data.rdosByTicket || {};
    this.state.users = data.users || {};
    this.state.historyByTicket = {};
    this.state.tickets.forEach(t=>{
      this.state.historyByTicket[t.id] = genHistory(t.concl);
    });
  },
  genTicketId(){
    const nums = this.state.tickets
      .map(t => parseInt(String(t.id).replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `CH-${String(next).padStart(4, '0')}`;
  },
  async addTicket(t){
    let id = t.id;
    if (!id || this.state.tickets.some(x => x.id === id)) {
      id = this.genTicketId();
    }
    const data = { ...t };
    delete data.id;
    this.state.tickets.push({ id, ...data });
    this.state.tickets.sort((a, b) => {
      const da = parseDateLocal(a.dueDate);
      const db = parseDateLocal(b.dueDate);
      if (isNaN(da)) return 1;
      if (isNaN(db)) return -1;
      return da - db;
    });
    this.state.historyByTicket[id] = genHistory(data.concl || 0);
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({tickets:{[id]: data}})
      });
    }catch(e){
      console.warn('Não foi possível persistir ticket', e);
    }
    return id;
  },
  async updateTicket(id, data){
    if (!id) return;
    const copy = { ...data };
    delete copy.id;
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({tickets:{[id]: copy}})
      });
    }catch(e){
      console.warn('Não foi possível persistir ticket', e);
    }
  }
};

window.CURRENT_USER = CURRENT_USER;
window.CURRENT_ROLE = CURRENT_ROLE;
window.TICKET_FIELD_LABELS = TICKET_FIELD_LABELS;
window.TICKET_FIELDS = TICKET_FIELDS;
window.DB = DB;
