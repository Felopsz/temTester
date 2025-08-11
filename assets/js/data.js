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
    archivedTickets: [],
    finishedTickets: [],
    projects: [],
    archivedProjects: [],
    finishedProjects: [],
    materialsByProject: {},
    rdosByProject: {},
    rdosByTicket: {},
    notesByProject: {},
    obsByProject: {},
    notesByTicket: {},
    obsByTicket: {},
    historyByTicket: {},
    users: {},
  },
  async load(rawData){
    const data = rawData || await (await fetch('/api/db')).json();
    // tickets e projects vêm como objetos chaveados pelo ID
    this.state.tickets = Object
      .entries(data.tickets || {})
      .filter(([,t]) => t && typeof t === 'object')
      .map(([id, t]) => ({ id, ...t }))
      .sort((a, b) => {
        const da = parseDateLocal(a.dueDate);
        const db = parseDateLocal(b.dueDate);
        if (isNaN(da)) return 1;
        if (isNaN(db)) return -1;
        return da - db;
      });
    this.state.archivedTickets = Object
      .entries(data.archivedTickets || {})
      .filter(([,t]) => t && typeof t === 'object')
      .map(([id, t]) => ({ id, ...t }))
      .sort((a, b) => {
        const da = parseDateLocal(a.dueDate);
        const db = parseDateLocal(b.dueDate);
        if (isNaN(da)) return 1;
        if (isNaN(db)) return -1;
        return da - db;
      });
    this.state.finishedTickets = Object
      .entries(data.finishedTickets || {})
      .filter(([,t]) => t && typeof t === 'object')
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
      .filter(([,p]) => p && typeof p === 'object')
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => parseDateLocal(a.prazo) - parseDateLocal(b.prazo));
    this.state.archivedProjects = Object
      .entries(data.archivedProjects || {})
      .filter(([,p]) => p && typeof p === 'object')
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => parseDateLocal(a.prazo) - parseDateLocal(b.prazo));
    this.state.finishedProjects = Object
      .entries(data.finishedProjects || {})
      .filter(([,p]) => p && typeof p === 'object')
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => parseDateLocal(a.prazo) - parseDateLocal(b.prazo));
    this.state.materialsByProject = data.materialsByProject || {};
    this.state.rdosByProject = data.rdosByProject || {};
    this.state.rdosByTicket = data.rdosByTicket || {};
    this.state.notesByProject = data.notesByProject || {};
    this.state.obsByProject = data.obsByProject || {};
    this.state.notesByTicket = data.notesByTicket || {};
    this.state.obsByTicket = data.obsByTicket || {};
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
  genProjectId(){
    const nums = this.state.projects
      .map(p => parseInt(String(p.id).replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `PR-${String(next).padStart(4, '0')}`;
  },
  async addTicket(t){
    let id = (t.id || '').trim();
    if (!id) {
      id = this.genTicketId();
    } else if (this.state.tickets.some(x => x.id === id)) {
      throw new Error('Defina um ID único para o chamado.');
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
    this.state.notesByTicket[id] = this.state.notesByTicket[id] || [];
    this.state.obsByTicket[id] = this.state.obsByTicket[id] || {};
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({tickets:{[id]: data}})
      });
      await this.log('addTicket', {id});
    }catch(e){
      console.warn('Não foi possível persistir ticket', e);
    }
    return id;
  },
  async addProject(p){
    let id = (p.id || '').trim();
    if (!id) {
      id = this.genProjectId();
    } else if (this.state.projects.some(x => x.id === id)) {
      throw new Error('ID de projeto já existe.');
    }
    const data = { ...p };
    delete data.id;
    this.state.projects.push({ id, ...data });
    this.state.projects.sort((a, b) => parseDateLocal(a.prazo) - parseDateLocal(b.prazo));
    this.state.materialsByProject[id] = this.state.materialsByProject[id] || [];
    this.state.rdosByProject[id] = this.state.rdosByProject[id] || [];
    this.state.notesByProject[id] = this.state.notesByProject[id] || [];
    this.state.obsByProject[id] = this.state.obsByProject[id] || {};
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({projects:{[id]: data}})
      });
      await this.log('addProject', {id});
    }catch(e){
      console.warn('Não foi possível persistir projeto', e);
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
      await this.log('updateTicket', {id});
    }catch(e){
      console.warn('Não foi possível persistir ticket', e);
    }
  },
  async updateProject(id, data){
    if (!id) return;
    const copy = { ...data };
    delete copy.id;
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({projects:{[id]: copy}})
      });
      await this.log('updateProject', {id});
    }catch(e){
      console.warn('Não foi possível persistir projeto', e);
    }
  },
  async addTicketNote(id, text, user){
    const arr = this.state.notesByTicket[id] || (this.state.notesByTicket[id] = []);
    arr.push({text, user});
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({notesByTicket:{[id]: arr}})
      });
      await this.log('addTicketNote', {id});
    }catch(e){
      console.warn('Não foi possível salvar anotação', e);
    }
  },
  async setTicketObs(id, text, user){
    this.state.obsByTicket[id] = {text, user};
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({obsByTicket:{[id]: this.state.obsByTicket[id]}})
      });
      await this.log('setTicketObs', {id});
    }catch(e){
      console.warn('Não foi possível salvar observação', e);
    }
  },
  async addProjectNote(id, text, user){
    const arr = this.state.notesByProject[id] || (this.state.notesByProject[id] = []);
    arr.push({text, user});
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({notesByProject:{[id]: arr}})
      });
      await this.log('addProjectNote', {id});
    }catch(e){
      console.warn('Não foi possível salvar anotação', e);
    }
  },
  async setProjectObs(id, text, user){
    this.state.obsByProject[id] = {text, user};
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({obsByProject:{[id]: this.state.obsByProject[id]}})
      });
      await this.log('setProjectObs', {id});
    }catch(e){
      console.warn('Não foi possível salvar observação', e);
    }
  },
  async archiveTicket(t){
    if(!t) return;
    this.state.tickets = this.state.tickets.filter(x=>x!==t);
    this.state.archivedTickets.push(t);
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({tickets:{[t.id]: null}, archivedTickets:{[t.id]: {...t}}})
      });
      await this.log('archiveTicket', {id:t.id});
    }catch(e){ console.warn('Não foi possível arquivar ticket', e); }
  },
  async finishTicket(t){
    if(!t) return;
    this.state.tickets = this.state.tickets.filter(x=>x!==t);
    this.state.finishedTickets.push(t);
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({tickets:{[t.id]: null}, finishedTickets:{[t.id]: {...t}}})
      });
      await this.log('finishTicket', {id:t.id});
    }catch(e){ console.warn('Não foi possível finalizar ticket', e); }
  },
  async restoreTicket(t, from){
    if(!t) return;
    const list = from==='archived'?this.state.archivedTickets:this.state.finishedTickets;
    const key = from==='archived'?'archivedTickets':'finishedTickets';
    this.state.tickets.push(t);
    this.state.tickets.sort((a,b)=>{
      const da=parseDateLocal(a.dueDate); const db=parseDateLocal(b.dueDate);
      if(isNaN(da)) return 1; if(isNaN(db)) return -1; return da-db;
    });
    const idx=list.indexOf(t); if(idx>-1) list.splice(idx,1);
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({[key]:{[t.id]: null}, tickets:{[t.id]: {...t}}})
      });
      await this.log('restoreTicket', {id:t.id, from});
    }catch(e){ console.warn('Não foi possível restaurar ticket', e); }
  },
  async deleteTicketPermanent(t, from){
    if(!t) return;
    const list = from==='archived'?this.state.archivedTickets:this.state.finishedTickets;
    const key = from==='archived'?'archivedTickets':'finishedTickets';
    const idx=list.indexOf(t); if(idx>-1) list.splice(idx,1);
    delete this.state.rdosByTicket[t.id];
    delete this.state.historyByTicket[t.id];
    delete this.state.notesByTicket[t.id];
    delete this.state.obsByTicket[t.id];
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({[key]:{[t.id]: null}, rdosByTicket:{[t.id]: null}, notesByTicket:{[t.id]: null}, obsByTicket:{[t.id]: null}})
      });
      await this.log('deleteTicketPermanent', {id:t.id, from});
    }catch(e){ console.warn('Não foi possível excluir ticket', e); }
  },
  async archiveProject(p){
    if(!p) return;
    this.state.projects = this.state.projects.filter(x=>x!==p);
    this.state.archivedProjects.push(p);
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({projects:{[p.id]: null}, archivedProjects:{[p.id]: {...p}}})
      });
      await this.log('archiveProject', {id:p.id});
    }catch(e){ console.warn('Não foi possível arquivar projeto', e); }
  },
  async finishProject(p){
    if(!p) return;
    this.state.projects = this.state.projects.filter(x=>x!==p);
    this.state.finishedProjects.push(p);
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({projects:{[p.id]: null}, finishedProjects:{[p.id]: {...p}}})
      });
      await this.log('finishProject', {id:p.id});
    }catch(e){ console.warn('Não foi possível finalizar projeto', e); }
  },
  async restoreProject(p, from){
    if(!p) return;
    const list = from==='archived'?this.state.archivedProjects:this.state.finishedProjects;
    const key = from==='archived'?'archivedProjects':'finishedProjects';
    this.state.projects.push(p);
    this.state.projects.sort((a,b)=>parseDateLocal(a.prazo)-parseDateLocal(b.prazo));
    const idx=list.indexOf(p); if(idx>-1) list.splice(idx,1);
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({[key]:{[p.id]: null}, projects:{[p.id]: {...p}}})
      });
      await this.log('restoreProject', {id:p.id, from});
    }catch(e){ console.warn('Não foi possível restaurar projeto', e); }
  },
  async deleteProjectPermanent(p, from){
    if(!p) return;
    const list = from==='archived'?this.state.archivedProjects:this.state.finishedProjects;
    const key = from==='archived'?'archivedProjects':'finishedProjects';
    const idx=list.indexOf(p); if(idx>-1) list.splice(idx,1);
    delete this.state.materialsByProject[p.id];
    if (this.state.rdosByProject[p.id]) delete this.state.rdosByProject[p.id];
    delete this.state.notesByProject[p.id];
    delete this.state.obsByProject[p.id];
    try{
      await fetch('/api/db', {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({[key]:{[p.id]: null}, materialsByProject:{[p.id]: null}, rdosByProject:{[p.id]: null}, notesByProject:{[p.id]: null}, obsByProject:{[p.id]: null}})
      });
      await this.log('deleteProjectPermanent', {id:p.id, from});
    }catch(e){ console.warn('Não foi possível excluir projeto', e); }
  }
};

DB.log = async function(action, payload){
  try{
    await fetch('/api/logs', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        ts: new Date().toISOString(),
        user: CURRENT_USER,
        action,
        payload
      })
    });
  }catch(e){
    console.warn('Não foi possível registrar log', e);
  }
};

window.CURRENT_USER = CURRENT_USER;
window.CURRENT_ROLE = CURRENT_ROLE;
window.TICKET_FIELD_LABELS = TICKET_FIELD_LABELS;
window.TICKET_FIELDS = TICKET_FIELDS;
window.DB = DB;
