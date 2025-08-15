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

const DB = {
  state: {
    tickets: [],
    projects: [],
    archivedTickets: [],
    finishedTickets: [],
    archivedProjects: [],
    finishedProjects: [],
    materialsByProject: {},
    rdosByProject: {},
    rdosByTicket: {},
    historyByTicket: {},
    users: {},
  },
  async load(rawData){
    const data = rawData || await (await fetch('/api/db')).json();
    // tickets e projects vêm como objetos chaveados pelo ID
    this.state.tickets = Object.entries(data.tickets || {}).map(([id, t])=>({id, ...t}));
    this.state.projects = Object.entries(data.projects || {}).map(([id, p])=>({id, ...p}));
    this.state.archivedTickets = Object.entries(data.archivedTickets || {}).map(([id, t])=>({id, ...t}));
    this.state.finishedTickets = Object.entries(data.finishedTickets || {}).map(([id, t])=>({id, ...t}));
    this.state.archivedProjects = Object.entries(data.archivedProjects || {}).map(([id, p])=>({id, ...p}));
    this.state.finishedProjects = Object.entries(data.finishedProjects || {}).map(([id, p])=>({id, ...p}));
    this.state.materialsByProject = data.materialsByProject || {};
    this.state.rdosByProject = data.rdosByProject || {};
    this.state.rdosByTicket = data.rdosByTicket || {};
    this.state.users = data.users || {};
    this.state.historyByTicket = {};
    this.state.tickets.forEach(t=>{
      this.state.historyByTicket[t.id] = genHistory(t.concl);
    });
  },
  async persist(patch){
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(patch)
      });
    }catch(e){
      console.warn('Não foi possível persistir alteração', e);
    }
  },
  genTicketId(){
    const allIds = [...this.state.tickets, ...this.state.archivedTickets, ...this.state.finishedTickets]
      .map(t => parseInt(String(t.id).match(/\d+/)?.[0] || '0', 10));
    const max = allIds.length ? Math.max(...allIds) : 1000;
    return `CH-${max+1}`;
  },
  async addTicket(t){
    const {id, ...data} = t;
    this.state.tickets.push({id, ...data});
    this.state.historyByTicket[id] = genHistory(data.concl || 0);
    await this.persist({tickets:{[id]: data}});
  },
  async updateTicket(id, data){
    const {id: _id, ...payload} = data;
    const idx = this.state.tickets.findIndex(t=>t.id===id);
    if(idx>=0) this.state.tickets[idx] = {id, ...payload};
    await this.persist({tickets:{[id]: payload}});
  },
  async finishTicket(t){
    const idx = this.state.tickets.findIndex(x=>x.id===t.id);
    if(idx>=0) this.state.tickets.splice(idx,1);
    this.state.finishedTickets.push(t);
    const {id, ...data} = t;
    await this.persist({tickets:{[id]: null}, finishedTickets:{[id]: data}});
  },
  async archiveTicket(t){
    const idx = this.state.tickets.findIndex(x=>x.id===t.id);
    if(idx>=0) this.state.tickets.splice(idx,1);
    this.state.archivedTickets.push(t);
    const {id, ...data} = t;
    await this.persist({tickets:{[id]: null}, archivedTickets:{[id]: data}});
  },
  async restoreTicket(t, from){
    const src = from==='archived' ? this.state.archivedTickets : this.state.finishedTickets;
    const idx = src.findIndex(x=>x.id===t.id);
    if(idx>=0) src.splice(idx,1);
    this.state.tickets.push(t);
    const {id, ...data} = t;
    const patch = {[id]: data};
    if(from==='archived') await this.persist({archivedTickets:{[id]: null}, tickets: patch});
    else await this.persist({finishedTickets:{[id]: null}, tickets: patch});
  },
  async deleteTicketPermanent(t, from){
    const src = from==='archived' ? this.state.archivedTickets : this.state.finishedTickets;
    const idx = src.findIndex(x=>x.id===t.id);
    if(idx>=0) src.splice(idx,1);
    const key = from==='archived' ? 'archivedTickets' : 'finishedTickets';
    await this.persist({[key]:{[t.id]: null}});
  }
};

window.CURRENT_USER = CURRENT_USER;
window.CURRENT_ROLE = CURRENT_ROLE;
window.TICKET_FIELD_LABELS = TICKET_FIELD_LABELS;
window.TICKET_FIELDS = TICKET_FIELDS;
window.DB = DB;
