// Dados e carregamento do banco
let CURRENT_USER = 'admin';
const TICKET_FIELD_LABELS = {
  id:'ID',
  createdAt:'Data de criação',
  solicitante:'Aberto por',
  telefone:'Contato',
  meetPoint:'Ponto de encontro',
  dupla:'Dupla',
  concl:'% de conclusão',
  prazo:'% de prazo',
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
    rdosByTicket: {},
    historyByTicket: {},
  },
  async load(){
    const res = await fetch('db.json');
    const data = await res.json();
    Object.assign(this.state, data);
    this.state.historyByTicket = {};
    this.state.tickets.forEach(t=>{
      this.state.historyByTicket[t.id] = genHistory(t.concl);
    });
  }
};

window.CURRENT_USER = CURRENT_USER;
window.TICKET_FIELD_LABELS = TICKET_FIELD_LABELS;
window.TICKET_FIELDS = TICKET_FIELDS;
window.DB = DB;
