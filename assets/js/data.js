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
    materialsByProject: {},
    rdosByProject: {},
    rdosByTicket: {},
    historyByTicket: {},
    users: {},
  },
  async load(rawData){
    const data = rawData || await (await fetch('db.json')).json();
    // tickets e projects vêm como objetos chaveados pelo ID
    this.state.tickets = Object.entries(data.tickets || {}).map(([id, t])=>({id, ...t}));
    this.state.projects = Object.entries(data.projects || {}).map(([id, p])=>({id, ...p}));
    this.state.materialsByProject = data.materialsByProject || {};
    this.state.rdosByProject = data.rdosByProject || {};
    this.state.rdosByTicket = data.rdosByTicket || {};
    this.state.users = data.users || {};
    this.state.historyByTicket = {};
    this.state.tickets.forEach(t=>{
      this.state.historyByTicket[t.id] = genHistory(t.concl);
    });
  },
  async addTicket(t){
    const {id, ...data} = t;
    this.state.tickets.push({id, ...data});
    this.state.historyByTicket[id] = genHistory(data.concl || 0);
    try{
      await fetch('db.json', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({tickets:{[id]: data}})
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
