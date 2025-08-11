(function(){
  // App principal: fluxo de login, carregamento de dados e dashboard
  // ========== BOOT ==========
  document.addEventListener('DOMContentLoaded', () => {
    const loginView = qs('#view-login');
    const dashView = qs('#view-dashboard');

    // Sempre injeta os templates para garantir a árvore esperada
    if (loginView) loginView.innerHTML = tpl.login();
    if (dashView) {
      dashView.style.display = 'none';
      dashView.innerHTML = tpl.dashboard(); // <— força injeção
    }

    bindLogin();
  });

  // ========== LOGIN ==========
  // Valida usuário contra dados em db.json
  function bindLogin(){
    const viewLogin = qs('#view-login');
    const viewDash = qs('#view-dashboard');
    const btnLogin = qs('#btnLogin');
    const btnCreate = qs('#btnCreate');
    const actions = qs('#actions');
    const form = qs('#loginForm');
    const user = qs('#user');
    const pass = qs('#pass');
    const btnContinue = qs('#btnContinue');
    const topBar = qs('#topBar');
    const btnBack = qs('#btnBack');

    const enableContinueIfFilled = () => {
      const ok = user.value.trim().length > 0 && pass.value.length > 0;
      btnContinue.disabled = !ok;
      btnContinue.classList.toggle('enabled', ok);
    };
    const goHome = () => {
      form.classList.remove('visible');
      topBar.classList.remove('visible');
      setTimeout(()=>{
        actions.classList.remove('hidden');
        btnCreate.classList.remove('fade-out');
        btnLogin.classList.remove('fade-out');
        user.value=''; pass.value=''; enableContinueIfFilled();
      }, 200);
    };
    const goToDashboard = () => {
      viewLogin.style.display = 'none';
      viewDash.style.display = 'block';
      initDashboard();
    };

    btnLogin.addEventListener('click', () => {
      btnCreate.classList.add('fade-out');
      btnLogin.classList.add('fade-out');
      setTimeout(() => {
        actions.classList.add('hidden');
        topBar.classList.add('visible');
        form.classList.add('visible');
        user.focus();
      }, 240);
    });
    btnBack.addEventListener('click', goHome);
    user.addEventListener('input', enableContinueIfFilled);
    pass.addEventListener('input', enableContinueIfFilled);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (btnContinue.disabled) return;
      const u = user.value.trim();
      const p = pass.value;
      const res = await fetch('/api/db');
      const data = await res.json();
      const account = data.users?.[u];
      if (account && account.password === p) {
        CURRENT_USER = u;
        CURRENT_ROLE = account.role;
        await DB.load(data);
        goToDashboard();
      } else {
        alert('Usuário ou senha inválidos.');
        pass.select();
      }
    });
  }

  // ========== helpers ==========
  function clearTicketDetail(els){
    if (!els.ticketDetail) return;
    if (els.tdDesc) els.tdDesc.innerHTML = '';
    if (els.tdRDOList) els.tdRDOList.innerHTML = '';
    if (els.tdMeta) els.tdMeta.innerHTML = '';
    if (els.tdEditForm) els.tdEditForm.innerHTML = '';
  }

  // Converte datas "YYYY-MM-DD" para o fim do dia local
  function parseDateLocal(str){
    if (!str) return new Date(NaN);
    if (typeof str === 'string' && str.length <= 10){
      const [y,m,d] = str.split('-').map(Number);
      return new Date(y, m-1, d, 23, 59, 59);
    }
    return new Date(str);
  }

  // Calcula % de prazo consumido com base em createdAt e dueDate
  function computePrazoPct(createdAt, dueDate, now = new Date()){
    const end = parseDateLocal(dueDate);
    if (isNaN(end)) return 0;
    let start = parseDateLocal(createdAt);
    if (isNaN(start)) start = now;
    const total = end - start;
    if (total <= 0) return 0;
    const elapsed = now - start;
    return Math.max(0, Math.round((elapsed / total) * 100));
  }

  // ========== DASHBOARD ==========
  function initDashboard(){
    const els = {
      sectionPill: qs('#sectionPill'),
      greet: qs('#greet'),
      clock: qs('#clock'),
      tabOverview: qs('#tabOverview'),
      tabTickets: qs('#tabTickets'),
      tabProjects: qs('#tabProjects'),
      tabConfig: qs('#tabConfig'),
      ticketsTableBody: qs('#ticketsTable tbody'),
      chartProgress: qs('#chartProgress'),
      chartSLA: qs('#chartSLA'),
      projectsCarousel: qs('#projectsCarousel'),
      caroPrev: qs('#caroPrev'),
      caroNext: qs('#caroNext'),
      projDetailsInline: qs('#projectDetailsInline'),
      ticketDetail: qs('#ticketDetail'),
      tdTitle: qs('#tdTitle'),
      tdPct: qs('#tdPct'),
      tdMeta: qs('#tdMeta'),
      tdDesc: qs('#tdDesc'),
      tdRDOList: qs('#tdRDOList'),
      tdEditForm: qs('#tdEditForm'),
      btnLogout: qs('#btnLogout'),
      btnHamb: qs('#btnHamb'),
      btnTV: qs('#btnTV'),
      sidebar: qs('#sidebar'),
      tabAdmin: qs('#tabAdmin'),
      adminMenu: qs('#adminMenu'),
      btnAdminCreateTicket: qs('#btnAdminCreateTicket'),
      btnAdminCreateProject: qs('#btnAdminCreateProject'),
      btnAdminChanges: qs('#btnAdminChanges'),
      btnAdminArchivedTickets: qs('#btnAdminArchivedTickets'),
      btnAdminFinishedTickets: qs('#btnAdminFinishedTickets'),
      btnAdminArchivedProjects: qs('#btnAdminArchivedProjects'),
      btnAdminFinishedProjects: qs('#btnAdminFinishedProjects'),
      sectionCreateTicket: qs('#sectionCreateTicket'),
      sectionCreateProject: qs('#sectionCreateProject'),
      sectionAdminChanges: qs('#sectionAdminChanges'),
      sectionArchivedTickets: qs('#sectionArchivedTickets'),
      sectionFinishedTickets: qs('#sectionFinishedTickets'),
      sectionArchivedProjects: qs('#sectionArchivedProjects'),
      sectionFinishedProjects: qs('#sectionFinishedProjects'),
      archivedTicketsBody: qs('#archivedTicketsTable tbody'),
      finishedTicketsBody: qs('#finishedTicketsTable tbody'),
      archivedProjectsBody: qs('#archivedProjectsTable tbody'),
      finishedProjectsBody: qs('#finishedProjectsTable tbody'),
      logFilterDate: qs('#logFilterDate'),
      logsList: qs('#logsList'),
      _subtabsBound: false,
    };

    // Oculta itens de admin para usuários comuns
    if (CURRENT_ROLE !== 'admin') {
      if (els.tabConfig) els.tabConfig.style.display = 'none';
      if (els.tabAdmin) els.tabAdmin.style.display = 'none';
      if (els.adminMenu) els.adminMenu.style.display = 'none';
    }

    // Header: saudação + relógio
    updateGreeting();
    updateClock();
    clearInterval(window.__clockInt);
    window.__clockInt = setInterval(updateClock, 1000);

    function updateGreeting(){
      const h = new Date().getHours();
      const hello = h < 12 ? 'Bom dia' : (h < 18 ? 'Boa tarde' : 'Boa noite');
      if (els.greet) els.greet.textContent = `${hello}, ${CURRENT_USER}`;
    }
    function updateClock(){
      const d = new Date();
      const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
      if (els.clock) els.clock.textContent = `${dias[d.getDay()]} • ${d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}`;
    }

    const UI = {
      setActiveTab(which){
        [els.tabOverview, els.tabTickets, els.tabProjects].forEach(b=> b?.classList.remove('active'));
        hide('#sectionCreateTicket');
        hide('#sectionCreateProject');
        hide('#sectionAdminChanges');
        hide('#sectionArchivedTickets');
        hide('#sectionFinishedTickets');
        hide('#sectionArchivedProjects');
        hide('#sectionFinishedProjects');

        document.body.classList.remove('projects-page','tickets-page');
        if (which === 'projects') document.body.classList.add('projects-page');
        if (which === 'tickets')  document.body.classList.add('tickets-page');

        if(which !== 'projects' && els.projDetailsInline){
          els.projDetailsInline.innerHTML = '';
        }

        if (which === 'overview') {
          els.tabOverview?.classList.add('active');
          if (els.sectionPill) els.sectionPill.textContent = 'Dashboard';
          show('#sectionTickets'); 
          show('#sectionCharts'); 
          show('#sectionProjects');

          clearTicketDetail(els);
          return this._renderOverview();
        }

        if (which === 'tickets') {
          els.tabTickets?.classList.add('active');
          if (els.sectionPill) els.sectionPill.textContent = 'Chamados';
          show('#sectionTickets'); 
          hide('#sectionCharts'); 
          hide('#sectionProjects');
          return;
        }

        if (which === 'projects') {
          els.tabProjects?.classList.add('active');
          if (els.sectionPill) els.sectionPill.textContent = 'Projetos';
          hide('#sectionTickets'); 
          hide('#sectionCharts'); 
          show('#sectionProjects');
          clearTicketDetail(els);
          return;
        }
      },

      _renderOverview(){
        const t = this._selected || DB.state.tickets[0];
        this.renderProgressChart(DB.state.historyByTicket[t.id], 'chartProgress');
        const p = computePrazoPct(t.createdAt, t.dueDate);
        this.renderSLAChart(t.concl, Math.min(p,100), 'chartSLA');
      },

      renderAll(){
        this.renderTickets();
        this.renderProjects();
        this.renderArchivedTickets();
        this.renderFinishedTickets();
        this.renderArchivedProjects();
        this.renderFinishedProjects();
        this.updateProjectArrows();
        if(!document.body.classList.contains('tickets-page') && !document.body.classList.contains('projects-page')){
          this._renderOverview();
        }
      },

      renderTickets(){
        els.ticketsTableBody.innerHTML = '';

        // Cabeçalho dinâmico (Resumo só no modo TV)
        const thead = document.querySelector('#ticketsTable thead tr');
        if (thead) {
          thead.innerHTML = `
            <th>ID do chamado</th>
            <th>Data de criação</th>
            <th>Ponto de encontro</th>
            <th>Dupla</th>
            ${isTV() ? '<th class="col-resumo">Resumo</th>' : ''}
            <th>% de conclusão</th>
            <th>% de prazo</th>
          `;
        }

        [...DB.state.tickets]
          .sort((a, b) => {
            const da = parseDateLocal(a.dueDate);
            const db = parseDateLocal(b.dueDate);
            if (isNaN(da)) return 1;
            if (isNaN(db)) return -1;
            return da - db;
          })
          .forEach(t => {
          const tr = document.createElement('tr');
          const prazoPct = computePrazoPct(t.createdAt, t.dueDate);
          const overdue = parseDateLocal(t.dueDate) < new Date();
          const prazoClass = overdue ? 'overdue' : '';
          tr.innerHTML = `
            <td data-label="ID do chamado"><button class="linklike" data-id="${t.id}">${t.id}</button></td>
            <td data-label="Data de criação">${fmtDate(t.createdAt)}</td>
            <td data-label="Ponto de encontro">${t.meetPoint}</td>
            <td data-label="Dupla">${t.dupla}</td>
            ${isTV() ? `<td class="col-resumo" data-label="Resumo" title="${t.resumo}">${t.resumo}</td>` : ''}
            <td data-label="% de conclusão">
              <div class="prog">
                <div class="nums"><span>Concl.: <b>${t.concl}%</b></span></div>
                <div class="progress"><i style="width:${t.concl}%"></i></div>
              </div>
            </td>
            <td data-label="% de prazo">
              <div class="prog ${prazoClass}">
                <div class="nums"><span>Prazo: <b>${prazoPct}%</b></span></div>
                <div class="progress"><i style="width:${Math.min(prazoPct,100)}%"></i></div>
              </div>
            </td>
          `;
          tr.addEventListener('click', (e)=>{
            const btn = e.target.closest('button.linklike');
            if(btn){
              e.stopPropagation();
              UI.openTicketDetail(t, tr);
            }else{
              UI.selectTicket(t, tr);
            }
          });
          els.ticketsTableBody.appendChild(tr);
        });
      },

      renderProjects(){
        if (!els.projectsCarousel) return;
        els.projectsCarousel.innerHTML = '';

        [...DB.state.projects]
          .sort((a, b) => parseDateLocal(a.prazo) - parseDateLocal(b.prazo))
          .forEach(p => {
          const daysLeft = Math.max(0, Math.ceil((parseDateLocal(p.prazo) - new Date())/86400000));
          const el = document.createElement('article');
          el.className = 'project';

          el.innerHTML = `
            <header style="display:flex; justify-content:space-between; align-items:center">
              <strong>${p.name}</strong>
              <span class="badge">${p.pct}%</span>
            </header>
            <p class="proj-desc" style="color:#cbd5e1; font-size:13px">${p.desc}</p>
            <div class="meta">
              <span>Prazo: <b>${parseDateLocal(p.prazo).toLocaleDateString('pt-BR')}</b></span>
              <span>Dias (estimado): <b>${p.dias}</b></span>
              <span>Pessoas: <b>${p.pessoas}</b></span>
              <span>Dias trabalhados: <b>${p.diasTrab}</b></span>
              <span>Faltam: <b>${daysLeft} dias</b></span>
            </div>
            <div class="pbar" aria-label="% de conclusão"><i style="width:${p.pct}%"></i></div>

            ${isTV() ? `
              <div class="proj-extra">
                <div><b>Situação:</b> ${p.pct < 50 ? 'Em andamento' : 'Avançado'}</div>
                <div><b>Próximo marco:</b> Revisão semanal</div>
                <div><b>Risco:</b> ${p.pct < 30 ? 'Médio' : 'Baixo'}</div>
              </div>
            ` : ''}
          `;

          el.addEventListener('click', ()=> UI.openProjectDetailInline(p));
        els.projectsCarousel.appendChild(el);
      });
      },

      renderArchivedTickets(){
        if(!els.archivedTicketsBody) return;
        els.archivedTicketsBody.innerHTML='';
        DB.state.archivedTickets.forEach(t=>{
          const tr=document.createElement('tr');
          const prazoPct=computePrazoPct(t.createdAt,t.dueDate);
          const overdue=parseDateLocal(t.dueDate)<new Date();
          const prazoClass=overdue?'overdue':'';
          tr.innerHTML=`
            <td data-label="ID do chamado">${t.id}</td>
            <td data-label="Data de criação">${fmtDate(t.createdAt)}</td>
            <td data-label="Ponto de encontro">${t.meetPoint}</td>
            <td data-label="Dupla">${t.dupla}</td>
            <td data-label="% de conclusão">
              <div class="prog"><div class="nums"><span>Concl.: <b>${t.concl}%</b></span></div><div class="progress"><i style="width:${t.concl}%"></i></div></div>
            </td>
            <td data-label="% de prazo">
              <div class="prog ${prazoClass}"><div class="nums"><span>Prazo: <b>${prazoPct}%</b></span></div><div class="progress"><i style="width:${Math.min(prazoPct,100)}%"></i></div></div>
            </td>
            <td data-label="Ações"><button class="restore" data-id="${t.id}">Desarquivar</button> <button class="delete" data-id="${t.id}">Excluir</button></td>
          `;
          els.archivedTicketsBody.appendChild(tr);
        });
        els.archivedTicketsBody.querySelectorAll('button.restore').forEach(btn=>{
          const t=DB.state.archivedTickets.find(x=>x.id===btn.dataset.id);
          btn.addEventListener('click',()=>UI.restoreTicket(t,'archived'));
        });
        els.archivedTicketsBody.querySelectorAll('button.delete').forEach(btn=>{
          const t=DB.state.archivedTickets.find(x=>x.id===btn.dataset.id);
          btn.addEventListener('click',()=>UI.deleteTicketPermanent(t,'archived'));
        });
      },

      renderFinishedTickets(){
        if(!els.finishedTicketsBody) return;
        els.finishedTicketsBody.innerHTML='';
        DB.state.finishedTickets.forEach(t=>{
          const tr=document.createElement('tr');
          const prazoPct=computePrazoPct(t.createdAt,t.dueDate);
          const overdue=parseDateLocal(t.dueDate)<new Date();
          const prazoClass=overdue?'overdue':'';
          tr.innerHTML=`
            <td data-label="ID do chamado">${t.id}</td>
            <td data-label="Data de criação">${fmtDate(t.createdAt)}</td>
            <td data-label="Ponto de encontro">${t.meetPoint}</td>
            <td data-label="Dupla">${t.dupla}</td>
            <td data-label="% de conclusão">
              <div class="prog"><div class="nums"><span>Concl.: <b>${t.concl}%</b></span></div><div class="progress"><i style="width:${t.concl}%"></i></div></div>
            </td>
            <td data-label="% de prazo">
              <div class="prog ${prazoClass}"><div class="nums"><span>Prazo: <b>${prazoPct}%</b></span></div><div class="progress"><i style="width:${Math.min(prazoPct,100)}%"></i></div></div>
            </td>
            <td data-label="Ações"><button class="restore" data-id="${t.id}">Desarquivar</button> <button class="delete" data-id="${t.id}">Excluir</button></td>
          `;
          els.finishedTicketsBody.appendChild(tr);
        });
        els.finishedTicketsBody.querySelectorAll('button.restore').forEach(btn=>{
          const t=DB.state.finishedTickets.find(x=>x.id===btn.dataset.id);
          btn.addEventListener('click',()=>UI.restoreTicket(t,'finished'));
        });
        els.finishedTicketsBody.querySelectorAll('button.delete').forEach(btn=>{
          const t=DB.state.finishedTickets.find(x=>x.id===btn.dataset.id);
          btn.addEventListener('click',()=>UI.deleteTicketPermanent(t,'finished'));
        });
      },

      renderArchivedProjects(){
        if(!els.archivedProjectsBody) return;
        els.archivedProjectsBody.innerHTML='';
        DB.state.archivedProjects.forEach(p=>{
          const tr=document.createElement('tr');
          tr.innerHTML=`
            <td data-label="ID">${p.id}</td>
            <td data-label="Nome">${p.name}</td>
            <td data-label="Prazo">${parseDateLocal(p.prazo).toLocaleDateString('pt-BR')}</td>
            <td data-label="Ações"><button class="restore" data-id="${p.id}">Desarquivar</button> <button class="delete" data-id="${p.id}">Excluir</button></td>
          `;
          els.archivedProjectsBody.appendChild(tr);
        });
        els.archivedProjectsBody.querySelectorAll('button.restore').forEach(btn=>{
          const p=DB.state.archivedProjects.find(x=>x.id===btn.dataset.id);
          btn.addEventListener('click',()=>UI.restoreProject(p,'archived'));
        });
        els.archivedProjectsBody.querySelectorAll('button.delete').forEach(btn=>{
          const p=DB.state.archivedProjects.find(x=>x.id===btn.dataset.id);
          btn.addEventListener('click',()=>UI.deleteProjectPermanent(p,'archived'));
        });
      },

      renderFinishedProjects(){
        if(!els.finishedProjectsBody) return;
        els.finishedProjectsBody.innerHTML='';
        DB.state.finishedProjects.forEach(p=>{
          const tr=document.createElement('tr');
          tr.innerHTML=`
            <td data-label="ID">${p.id}</td>
            <td data-label="Nome">${p.name}</td>
            <td data-label="Prazo">${parseDateLocal(p.prazo).toLocaleDateString('pt-BR')}</td>
            <td data-label="Ações"><button class="restore" data-id="${p.id}">Desarquivar</button> <button class="delete" data-id="${p.id}">Excluir</button></td>
          `;
          els.finishedProjectsBody.appendChild(tr);
        });
        els.finishedProjectsBody.querySelectorAll('button.restore').forEach(btn=>{
          const p=DB.state.finishedProjects.find(x=>x.id===btn.dataset.id);
          btn.addEventListener('click',()=>UI.restoreProject(p,'finished'));
        });
        els.finishedProjectsBody.querySelectorAll('button.delete').forEach(btn=>{
          const p=DB.state.finishedProjects.find(x=>x.id===btn.dataset.id);
          btn.addEventListener('click',()=>UI.deleteProjectPermanent(p,'finished'));
        });
      },

      showCreateTicket(){
        hide('#sectionTickets');
        hide('#sectionCharts');
        hide('#sectionProjects');
        hide('#sectionCreateProject');
        show('#sectionCreateTicket');
        document.body.classList.remove('tickets-page','projects-page');
        if (els.sectionPill) els.sectionPill.textContent = 'Criar chamado';

        // garante que o painel entre em cena com scroll e foco
        requestAnimationFrame(()=>{
          qs('#sectionCreateTicket')?.scrollIntoView({behavior:'smooth', block:'start'});
          qs('#createTicketForm input, #createTicketForm textarea')?.focus();
        });

        const form = qs('#createTicketForm');
        if (form) {
          // Recria do zero SEM depender de dataset.built
          form.innerHTML = '';
          form.autocomplete = 'off';

          // Renderiza os campos baseando-se em TICKET_FIELDS, injeta dueDate se não existir
          const fieldsToRender = Array.isArray(window.TICKET_FIELDS)
            ? [...TICKET_FIELDS]
            : [];
          if (!fieldsToRender.includes('dueDate')) {
            const idx = Math.max(0, fieldsToRender.indexOf('createdAt'));
            fieldsToRender.splice(idx + 1, 0, 'dueDate');
          }

          fieldsToRender.forEach(f=>{
            const wrap = document.createElement('div');
            wrap.className = 'field' + (f === 'descricao' ? ' full' : '');
            const label = document.createElement('label');
            const labelText = TICKET_FIELD_LABELS[f] || (f==='dueDate' ? 'Prazo (data final)' : f);
            label.textContent = labelText;
            let inp;

            if (f === 'descricao') {
              inp = document.createElement('textarea');
              inp.required = true;
            } else if (f === 'id') {
              inp = document.createElement('input');
              inp.type = 'text';
              inp.required = true;
              if (DB && typeof DB.genTicketId === 'function') {
                inp.value = DB.genTicketId();
              }
            } else if (f === 'createdAt') {
              inp = document.createElement('input');
              inp.type = 'datetime-local';
              const now = new Date();
              const iso = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString().slice(0,16);
              inp.value = iso;
              inp.required = true;
            } else if (f === 'concl') {
              inp = document.createElement('input');
              inp.type = 'number';
              inp.min = '0';
              inp.max = '100';
              inp.step = '1';
              inp.value = '0';
            } else if (f === 'dueDate') {
              inp = document.createElement('input');
              inp.type = 'date';
              inp.required = true;
            } else {
              inp = document.createElement('input');
              inp.type = 'text';
              if (['meetPoint','dupla','resumo','solicitante','telefone'].includes(f)) {
                inp.required = true;
              }
            }
            inp.name = f;
            inp.autocomplete = 'off';
            wrap.appendChild(label);
            wrap.appendChild(inp);
            form.appendChild(wrap);
          });

          const actions = document.createElement('div');
          actions.className = 'actions';
          const btnSave = document.createElement('button');
          btnSave.type = 'submit';
          btnSave.className = 'btn btn-primary';
          btnSave.textContent = 'Salvar';
          const btnCancel = document.createElement('button');
          btnCancel.type = 'button';
          btnCancel.className = 'btn';
          btnCancel.id = 'cancelCreateTicket';
          btnCancel.textContent = 'Cancelar';
          actions.appendChild(btnSave);
          actions.appendChild(btnCancel);
          form.appendChild(actions);

          const ui = this;
          form.addEventListener('submit', async ev=>{
            ev.preventDefault();
            const fd = new FormData(form);
            const t = {};
            fieldsToRender.forEach(f=>{ if (fd.has(f)) t[f] = fd.get(f); });
            t.concl = Number(t.concl || 0);
            try{
              await DB.addTicket(t);
              form.reset();
              ui.renderTickets();
              ui.setActiveTab('tickets');
              els.adminMenu?.classList.remove('open');
              els.sidebar?.classList.remove('open');
            }catch(e){
              alert(e.message || 'Erro ao salvar chamado');
            }
          });
          qs('#cancelCreateTicket')?.addEventListener('click', ()=>{
            form.reset();
            ui.setActiveTab('overview');
          });

          // dá foco no primeiro campo
          requestAnimationFrame(()=>{
            qs('#createTicketForm input, #createTicketForm textarea')?.focus();
          });
        }
      },

      showCreateProject(){
        hide('#sectionTickets');
        hide('#sectionCharts');
        hide('#sectionProjects');
        hide('#sectionCreateTicket');
        hide('#sectionAdminChanges');
        show('#sectionCreateProject');
        document.body.classList.remove('tickets-page','projects-page');
        if (els.sectionPill) els.sectionPill.textContent = 'Criar projeto';

        requestAnimationFrame(()=>{
          qs('#sectionCreateProject')?.scrollIntoView({behavior:'smooth', block:'start'});
          qs('#createProjectForm input, #createProjectForm textarea')?.focus();
        });

        const form = qs('#createProjectForm');
        if (form){
          form.innerHTML='';
          form.autocomplete='off';
          const fields=['id','name','desc','prazo','dias','pessoas','diasTrab','pct'];
          const labels={id:'ID',name:'Nome',desc:'Descrição',prazo:'Prazo',dias:'Dias',pessoas:'Pessoas',diasTrab:'Dias trabalhados',pct:'% de conclusão'};
          fields.forEach(f=>{
            const wrap=document.createElement('div');
            wrap.className='field'+(f==='desc'?' full':'');
            const label=document.createElement('label');
            label.textContent=labels[f] || f;
            let inp;
            if(f==='desc'){
              inp=document.createElement('textarea');
              inp.required=true;
            }else if(f==='id'){
              inp=document.createElement('input');
              inp.type='text';
              inp.required=true;
              if(DB && typeof DB.genProjectId==='function'){
                inp.value=DB.genProjectId();
              }
            }else if(f==='prazo'){
              inp=document.createElement('input');
              inp.type='date';
              inp.required=true;
            }else if(['dias','pessoas','diasTrab','pct'].includes(f)){
              inp=document.createElement('input');
              inp.type='number';
              inp.min='0';
            }else{
              inp=document.createElement('input');
              inp.type='text';
              inp.required=true;
            }
            inp.name=f;
            inp.autocomplete='off';
            wrap.appendChild(label);
            wrap.appendChild(inp);
            form.appendChild(wrap);
          });

          const actions=document.createElement('div');
          actions.className='actions';
          const btnSave=document.createElement('button');
          btnSave.type='submit';
          btnSave.className='btn btn-primary';
          btnSave.textContent='Salvar';
          const btnCancel=document.createElement('button');
          btnCancel.type='button';
          btnCancel.className='btn';
          btnCancel.id='cancelCreateProject';
          btnCancel.textContent='Cancelar';
          actions.appendChild(btnSave);
          actions.appendChild(btnCancel);
          form.appendChild(actions);

          const ui=this;
          form.addEventListener('submit', async ev=>{
            ev.preventDefault();
            const fd=new FormData(form);
            const proj={};
            fields.forEach(f=>{ if(fd.has(f)) proj[f]=fd.get(f); });
            ['dias','pessoas','diasTrab','pct'].forEach(k=>{ proj[k]=Number(proj[k]||0); });
            try{
              await DB.addProject(proj);
              form.reset();
              ui.renderProjects();
              ui.updateProjectArrows();
              ui.setActiveTab('projects');
            }catch(e){
              alert(e.message || 'Erro ao salvar projeto');
            }
          });
          qs('#cancelCreateProject')?.addEventListener('click', ()=>{
            form.reset();
            ui.setActiveTab('overview');
          });

          requestAnimationFrame(()=>{
            qs('#createProjectForm input, #createProjectForm textarea')?.focus();
          });
        }
      },

      showAdminChanges(){
        hide('#sectionTickets');
        hide('#sectionCharts');
        hide('#sectionProjects');
        hide('#sectionCreateTicket');
        show('#sectionAdminChanges');
        document.body.classList.remove('tickets-page','projects-page');
        if (els.sectionPill) els.sectionPill.textContent = 'Alterações';
        (async()=>{
          try{
            const res = await fetch('/api/logs');
            const logs = await res.json();
            const render = ()=>{
              const filt = els.logFilterDate?.value;
              const items = (logs||[])
                .filter(l=> !filt || (l.ts||'').slice(0,10) === filt)
                .map(l=>`<li>${new Date(l.ts).toLocaleString('pt-BR')} - ${l.user} - ${l.action}</li>`)
                .join('');
              if (els.logsList) els.logsList.innerHTML = items || '<li>Nenhum log.</li>';
            };
            render();
            els.logFilterDate?.addEventListener('change', render);
          }catch(e){
            console.warn('Não foi possível carregar logs', e);
          }
        })();
      },

      showArchivedTickets(){
        hide('#sectionTickets'); hide('#sectionCharts'); hide('#sectionProjects'); hide('#sectionCreateTicket'); hide('#sectionCreateProject'); hide('#sectionAdminChanges'); hide('#sectionFinishedTickets'); hide('#sectionArchivedProjects'); hide('#sectionFinishedProjects');
        show('#sectionArchivedTickets');
        document.body.classList.add('tickets-page');
        document.body.classList.remove('projects-page');
        if (els.sectionPill) els.sectionPill.textContent = 'Chamados arquivados';
        this.renderArchivedTickets();
      },
      showFinishedTickets(){
        hide('#sectionTickets'); hide('#sectionCharts'); hide('#sectionProjects'); hide('#sectionCreateTicket'); hide('#sectionCreateProject'); hide('#sectionAdminChanges'); hide('#sectionArchivedTickets'); hide('#sectionArchivedProjects'); hide('#sectionFinishedProjects');
        show('#sectionFinishedTickets');
        document.body.classList.add('tickets-page');
        document.body.classList.remove('projects-page');
        if (els.sectionPill) els.sectionPill.textContent = 'Chamados finalizados';
        this.renderFinishedTickets();
      },
      showArchivedProjects(){
        hide('#sectionTickets'); hide('#sectionCharts'); hide('#sectionProjects'); hide('#sectionCreateTicket'); hide('#sectionCreateProject'); hide('#sectionAdminChanges'); hide('#sectionArchivedTickets'); hide('#sectionFinishedTickets'); hide('#sectionFinishedProjects');
        show('#sectionArchivedProjects');
        document.body.classList.add('projects-page');
        document.body.classList.remove('tickets-page');
        if (els.sectionPill) els.sectionPill.textContent = 'Projetos arquivados';
        this.renderArchivedProjects();
      },
      showFinishedProjects(){
        hide('#sectionTickets'); hide('#sectionCharts'); hide('#sectionProjects'); hide('#sectionCreateTicket'); hide('#sectionCreateProject'); hide('#sectionAdminChanges'); hide('#sectionArchivedTickets'); hide('#sectionFinishedTickets'); hide('#sectionArchivedProjects');
        show('#sectionFinishedProjects');
        document.body.classList.add('projects-page');
        document.body.classList.remove('tickets-page');
        if (els.sectionPill) els.sectionPill.textContent = 'Projetos finalizados';
        this.renderFinishedProjects();
      },

      // *** ainda dentro de UI ***
      _selectedRow: null,

      selectTicket(t, rowEl){
        this._selected = t;
        if(this._selectedRow){ this._selectedRow.classList.remove('selected'); }
        if(rowEl){ rowEl.classList.add('selected'); this._selectedRow = rowEl; }
        this.renderProgressChart(DB.state.historyByTicket[t.id]);
        const p = computePrazoPct(t.createdAt, t.dueDate);
        this.renderSLAChart(t.concl, Math.min(p,100));
      },

      openTicketDetail(t, rowEl){
        this.selectTicket(t, rowEl);
        this.setActiveTab('tickets');

        if (els.tdTitle) els.tdTitle.textContent = t.id;
        if (els.tdPct) els.tdPct.textContent = `${t.concl}%`;
        if (els.tdMeta) {
          const prazoPct = computePrazoPct(t.createdAt, t.dueDate);
          const overdue = parseDateLocal(t.dueDate) < new Date();
          const maybeDue = t.dueDate ? `<span><b>Prazo final:</b> ${parseDateLocal(t.dueDate).toLocaleDateString('pt-BR')}</span>` : '';
          els.tdMeta.innerHTML = `
            <span><b>Data:</b> ${fmtDate(t.createdAt)}</span>
            <span><b>Aberto por:</b> ${t.solicitante}</span>
            <span><b>Contato:</b> ${t.telefone}</span>
            <span><b>Ponto de encontro:</b> ${t.meetPoint}</span>
            <span><b>Dupla:</b> ${t.dupla}</span>
            ${maybeDue}
            <span class="${overdue ? 'overdue' : ''}"><b>Prazo consumido:</b> ${prazoPct}%</span>`;
        }

        if (els.tdDesc) {
          els.tdDesc.innerHTML = `
            <p><b>Resumo:</b> ${t.resumo}</p>
            <p>${t.descricao}</p>
          `;
        }

        if (els.tdNotes) {
          const listEl = qs('#tdNotesList', els.tdNotes);
          const notes = DB.state.notesByTicket[t.id] || [];
          if (listEl) listEl.innerHTML = notes.map(n=>`<li><b>${n.user}:</b> ${n.text}</li>`).join('') || '<li>Nenhuma anotação.</li>';
          const form = qs('#tdNoteForm', els.tdNotes);
          if (form && !form._bound) {
            form.addEventListener('submit', ev=>{
              ev.preventDefault();
              const ta = qs('textarea', form);
              const text = ta.value.trim();
              if (!text) return;
              UI.addTicketNote(t, text);
              ta.value = '';
            });
            form._bound = true;
          }
        }

        if (els.tdObs) {
          const obs = DB.state.obsByTicket[t.id] || {};
          if (CURRENT_ROLE === 'admin') {
            els.tdObs.innerHTML = `<form id="tdObsForm"><textarea style="width:100%; min-height:120px; background:#0f131a; border:1px solid var(--card-border); border-radius:10px; color:var(--text); padding:10px" placeholder="Observações gerais..." autocomplete="off">${obs.text||''}</textarea><div class="actions" style="margin-top:6px"><button type="submit" class="btn btn-primary">Salvar</button></div></form>`;
            const form = qs('#tdObsForm', els.tdObs);
            form.addEventListener('submit', ev=>{
              ev.preventDefault();
              const text = qs('textarea', form).value.trim();
              UI.saveTicketObs(t, text);
            });
          } else {
            const content = obs.text ? `<p>${obs.text}${obs.user ? `<br><small>por ${obs.user}</small>` : ''}</p>` : '<p>Nenhuma observação.</p>';
            els.tdObs.innerHTML = content;
          }
        }

        const list = DB.state.rdosByTicket[t.id] || [];
        if (els.tdRDOList) els.tdRDOList.innerHTML = list.map(i=>`<li>${i}</li>`).join('') || '<li>Nenhum RDO registrado.</li>';
        if (els.tdEditForm){
          els.tdEditForm.innerHTML = '';
          const form = document.createElement('form');
          form.id = 'editTicketForm';
          form.className = 'edit-form';
          form.autocomplete = 'off';

          // Mesmo truque: garantir dueDate presente para edição
          const fieldsToRender = Array.isArray(window.TICKET_FIELDS) ? [...TICKET_FIELDS] : [];
          if (!fieldsToRender.includes('dueDate')) {
            const idx = Math.max(0, fieldsToRender.indexOf('createdAt'));
            fieldsToRender.splice(idx+1, 0, 'dueDate');
          }

          fieldsToRender.forEach(f => {
            const wrap = document.createElement('div');
            wrap.className = 'field' + (f === 'descricao' ? ' full' : '');
            const label = document.createElement('label');
            const labelText = TICKET_FIELD_LABELS[f] || (f==='dueDate' ? 'Prazo (data final)' : f);
            label.textContent = labelText;
            let inp;
            if (f === 'descricao') {
              inp = document.createElement('textarea');
              inp.value = t[f] ?? '';
            } else if (f === 'createdAt') {
              inp = document.createElement('input');
              inp.type = 'datetime-local';
              // tenta converter para local ISO se vier como string
              const d = t[f] ? new Date(t[f]) : new Date();
              if (!isNaN(d)) {
                inp.value = new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,16);
              }
            } else if (f === 'concl') {
              inp = document.createElement('input');
              inp.type = 'number'; inp.min = '0'; inp.max = '100'; inp.step = '1';
              inp.value = t[f] ?? 0;
            } else if (f === 'dueDate') {
              inp = document.createElement('input');
              inp.type = 'date';
              if (t[f]) {
                const d = parseDateLocal(t[f]);
                if (!isNaN(d)) inp.value = d.toISOString().slice(0,10);
              }
            } else {
              inp = document.createElement('input');
              inp.type = 'text';
              inp.value = t[f] ?? '';
            }
            inp.name = f;
            inp.autocomplete = 'off';
            wrap.appendChild(label);
            wrap.appendChild(inp);
            form.appendChild(wrap);
          });

          const actions = document.createElement('div');
          actions.className = 'actions';
          const btnSave = document.createElement('button');
          btnSave.type = 'submit';
          btnSave.className = 'btn btn-primary';
          btnSave.textContent = 'Salvar';
          const btnArchive = document.createElement('button');
          btnArchive.type = 'button';
          btnArchive.className = 'btn';
          btnArchive.id = 'btnArchiveTicket';
          btnArchive.textContent = 'Arquivar';
          const btnDel = document.createElement('button');
          btnDel.type = 'button';
          btnDel.className = 'del-btn btn';
          btnDel.id = 'btnDelTicket';
          btnDel.textContent = 'Excluir';
          actions.appendChild(btnSave);
          actions.appendChild(btnArchive);
          actions.appendChild(btnDel);
          form.appendChild(actions);
          els.tdEditForm.appendChild(form);

          form.addEventListener('submit', ev=>{
            ev.preventDefault();
            const fd = new FormData(form);
            const updated = {};
            const allKeys = new Set([...(window.TICKET_FIELDS||[]), 'dueDate']);
            allKeys.forEach(f=>{ if (fd.has(f)) updated[f] = fd.get(f); });
            updated.concl = Number(updated.concl || 0);
            UI.editTicket(t, updated);
          });
          btnArchive.addEventListener('click', ()=> UI.archiveTicket(t));
          btnDel.addEventListener('click', ()=> UI.deleteTicket(t));
        }

        if (!els._subtabsBound && els.ticketDetail) {
          els.ticketDetail.addEventListener('click', (ev)=>{
            const btn = ev.target.closest('.subtab');
            if (!btn) return;

            const tabs = qsa('.subtab', els.ticketDetail);
            const panels = qsa('.subtab-panel', els.ticketDetail);

            tabs.forEach(x=>x.classList.remove('active'));
            panels.forEach(x=>{ x.classList.remove('active'); x.style.display='none'; });

            btn.classList.add('active');
            const panel = qs('#'+btn.dataset.tab, els.ticketDetail);
            if (panel) {
              panel.classList.add('active');
              panel.style.display = '';
              panel.scrollTop = 0;
            }
            els.ticketDetail.scrollTop = 0;
          });
          els._subtabsBound = true;
        }

        // Estado inicial (ativa "Descrição")
        const tabs = qsa('.subtab', els.ticketDetail);
        const panels = qsa('.subtab-panel', els.ticketDetail);
        tabs.forEach(tb=> tb.classList.remove('active'));
        panels.forEach(p=> { p.classList.remove('active'); p.style.display='none'; });

        const first = qs('.subtab[data-tab="tdDesc"]', els.ticketDetail);
        const firstPanel = qs('#tdDesc', els.ticketDetail);
        if (first) first.classList.add('active');
        if (firstPanel){ firstPanel.classList.add('active'); firstPanel.style.display=''; }
      },

      async addTicketNote(t, text){
        await DB.addTicketNote(t.id, text, CURRENT_USER);
        UI.openTicketDetail(t);
      },

      async saveTicketObs(t, text){
        if (CURRENT_ROLE !== 'admin') return;
        await DB.setTicketObs(t.id, text, CURRENT_USER);
        UI.openTicketDetail(t);
      },

      async editTicket(t, updated){
        if (updated.id !== t.id){
          if (DB.state.rdosByTicket[t.id]){ DB.state.rdosByTicket[updated.id] = DB.state.rdosByTicket[t.id]; delete DB.state.rdosByTicket[t.id]; }
          if (DB.state.historyByTicket[t.id]){ DB.state.historyByTicket[updated.id] = DB.state.historyByTicket[t.id]; delete DB.state.historyByTicket[t.id]; }
        }
        Object.assign(t, updated);
        DB.state.historyByTicket[t.id] = genHistory(t.concl);
        DB.state.tickets.sort((a, b) => {
          const da = parseDateLocal(a.dueDate);
          const db = parseDateLocal(b.dueDate);
          if (isNaN(da)) return 1;
          if (isNaN(db)) return -1;
          return da - db;
        });
        await DB.updateTicket(t.id, t);
        UI.renderTickets();
        UI.openTicketDetail(t);
      },

      async deleteTicket(t){
        if(!confirm('Excluir chamado?')) return;
        await DB.finishTicket(t);
        UI.renderTickets();
        UI.renderFinishedTickets();
        clearTicketDetail(els);
      },
      async archiveTicket(t){
        if(!confirm('Arquivar chamado?')) return;
        await DB.archiveTicket(t);
        UI.renderTickets();
        UI.renderArchivedTickets();
        clearTicketDetail(els);
      },
      async restoreTicket(t, from){
        await DB.restoreTicket(t, from);
        UI.renderTickets();
        UI.renderArchivedTickets();
        UI.renderFinishedTickets();
      },
      async deleteTicketPermanent(t, from){
        if(!confirm('Excluir definitivamente?')) return;
        await DB.deleteTicketPermanent(t, from);
        UI.renderArchivedTickets();
        UI.renderFinishedTickets();
      },

      updateProject(p, updated){
        if (updated.id !== p.id){
          if (DB.state.materialsByProject[p.id]){ DB.state.materialsByProject[updated.id] = DB.state.materialsByProject[p.id]; delete DB.state.materialsByProject[p.id]; }
          if (DB.state.rdosByProject[p.id]){ DB.state.rdosByProject[updated.id] = DB.state.rdosByProject[p.id]; delete DB.state.rdosByProject[p.id]; }
        }
        Object.assign(p, updated);
        DB.state.projects.sort((a,b)=> parseDateLocal(a.prazo) - parseDateLocal(b.prazo));
        DB.updateProject(p.id, p);
        UI.renderProjects();
        UI.updateProjectArrows();
        UI.openProjectDetailInline(p);
      },

      async addProjectNote(p, text){
        await DB.addProjectNote(p.id, text, CURRENT_USER);
        UI.openProjectDetailInline(p);
      },

      async saveProjectObs(p, text){
        if (CURRENT_ROLE !== 'admin') return;
        await DB.setProjectObs(p.id, text, CURRENT_USER);
        UI.openProjectDetailInline(p);
      },

      async deleteProject(p){
        if(!confirm('Excluir projeto?')) return;
        await DB.finishProject(p);
        UI.renderProjects();
        UI.renderFinishedProjects();
        UI.updateProjectArrows();
        if(els.projDetailsInline) els.projDetailsInline.innerHTML = '';
      },
      async archiveProject(p){
        if(!confirm('Arquivar projeto?')) return;
        await DB.archiveProject(p);
        UI.renderProjects();
        UI.renderArchivedProjects();
        UI.updateProjectArrows();
        if(els.projDetailsInline) els.projDetailsInline.innerHTML = '';
      },
      async restoreProject(p, from){
        await DB.restoreProject(p, from);
        UI.renderProjects();
        UI.renderArchivedProjects();
        UI.renderFinishedProjects();
        UI.updateProjectArrows();
      },
      async deleteProjectPermanent(p, from){
        if(!confirm('Excluir definitivamente?')) return;
        await DB.deleteProjectPermanent(p, from);
        UI.renderArchivedProjects();
        UI.renderFinishedProjects();
      },

      // ===== Charts (andamento) =====
      renderProgressChart(series, targetId='chartProgress'){
        const svg = targetId ? qs('#'+targetId) : els.chartProgress;
        if (!svg) return;
        const pts = (series && series.length ? series : [5,12,18,32,46,60,75,90]);
        const path = pts.map((v,i)=>{
          const x = (i/(pts.length-1))*100; const y = 38 - (v*0.35);
          return `${i? 'L':'M'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        }).join(' ');
        const dots = pts.map((v,i)=>{
          const x = (i/(pts.length-1))*100; const y = 38 - (v*0.35);
          return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.3" fill="url(#gradP)" />`;
        }).join('');
        svg.innerHTML = `
          <defs>
            <linearGradient id="gradP" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="${cssVar('--brand')}"/>
              <stop offset="100%" stop-color="${cssVar('--brand-strong')}"/>
            </linearGradient>
          </defs>
          <path d="${path}" fill="none" stroke="url(#gradP)" stroke-width="1.2" />
          ${dots}
          <g fill="#9aa0a6" font-size="3.2">
            <text x="0" y="39">0%</text>
            <text x="92" y="39">100%</text>
          </g>`;
      },

      renderSLAChart(concl, prazo, targetId='chartSLA'){
        const svg = targetId ? qs('#'+targetId) : els.chartSLA;
        if (!svg) return;
        const c = Math.max(0, Math.min(100, concl||0));
        const p = Math.max(0, Math.min(100, prazo||0));
        svg.innerHTML = `
          <defs>
            <linearGradient id="gradC" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="${cssVar('--brand')}"/>
              <stop offset="100%" stop-color="${cssVar('--brand-strong')}"/>
            </linearGradient>
          </defs>
          <rect x="2" y="10" width="96" height="8" rx="2" fill="#0f131a" stroke="${cssVar('--card-border')}"/>
          <rect x="2" y="10" width="${p*0.96}" height="8" rx="2" fill="rgba(255,255,255,.25)" />
          <rect x="2" y="24" width="96" height="8" rx="2" fill="#0f131a" stroke="${cssVar('--card-border')}"/>
          <rect x="2" y="24" width="${c*0.96}" height="8" rx="2" fill="url(#gradC)" />
          <g fill="#9aa0a6" font-size="3.2">
            <text x="2" y="8">Prazo consumido: ${p}%</text>
            <text x="2" y="36">Conclusão: ${c}%</text>
          </g>`;
      },

      // ====== Projects list + inline details ======
      updateProjectArrows(){
        const el = els.projectsCarousel;
        if (!el || !els.caroPrev || !els.caroNext) return;
        const atStart = el.scrollLeft <= 4;
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
        els.caroPrev.classList.toggle('disabled', atStart);
        els.caroNext.classList.toggle('disabled', atEnd);
      },
      scrollProjects(dir){
        const el = els.projectsCarousel; if (!el) return;
        const delta = el.clientWidth * 0.9 * dir;
        el.scrollBy({ left: delta, behavior: 'smooth' });
        setTimeout(()=> UI.updateProjectArrows(), 300);
      },
      openProjectDetailInline(p){
        UI.setActiveTab('projects');
        const rdos = DB.state.rdosByProject[p.id] || [];
        if (!els.projDetailsInline) return;
        els.projDetailsInline.innerHTML = `
          <div class="project-detail-inline">
            <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
              <strong>${p.name}</strong>
              <span class="badge">${p.pct}%</span>
            </header>
            <div id="pdMeta" style="display:flex; gap:12px; flex-wrap:wrap; color:var(--muted); font-size:13px">
              <span><b>Prazo:</b> ${new Date(p.prazo).toLocaleDateString('pt-BR')}</span>
              <span><b>Dias:</b> ${p.dias}</span>
              <span><b>Pessoas:</b> ${p.pessoas}</span>
              <span><b>Dias trabalhados:</b> ${p.diasTrab}</span>
            </div>
            <div class="pbar" style="margin-top:6px"><i style="width:${p.pct}%"></i></div>
            <div class="subtabs" style="display:flex; gap:8px; border-bottom:1px solid var(--card-border); margin-top:10px">
              <button class="subtab active" data-tab="pdDesc" style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">Descrição</button>
              <button class="subtab" data-tab="pdNotes" style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">Anotações</button>
              <button class="subtab" data-tab="pdRDO" style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">RDO's</button>
              <button class="subtab" data-tab="pdObs" style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">Observações</button>
              <button class="subtab" data-tab="pdEditForm" style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">Editar</button>
            </div>
            <div class="subtab-panel active" id="pdDesc" style="padding-top:10px"><p>${p.desc}</p></div>
            <div class="subtab-panel" id="pdNotes" style="display:none;padding-top:10px"><ul id="pdNotesList" style="display:grid; gap:6px; margin-left:18px"></ul><form id="pdNoteForm" style="margin-top:8px"><textarea style="width:100%; min-height:120px; background:#0f131a; border:1px solid var(--card-border); border-radius:10px; color:var(--text); padding:10px" placeholder="Anotações do projeto..." autocomplete="off"></textarea><div class="actions" style="margin-top:6px"><button type="submit" class="btn btn-primary">Adicionar</button></div></form></div>
            <div class="subtab-panel" id="pdRDO" style="display:none;padding-top:10px"><ul id="pdRDOList" style="display:grid; gap:6px; margin-left:18px">${rdos.map(r=>`<li>${r}</li>`).join('') || '<li>Nenhum RDO registrado.</li>'}</ul></div>
          <div class="subtab-panel" id="pdObs" style="display:none;padding-top:10px"></div>
          <div class="subtab-panel" id="pdEditForm" style="display:none;padding-top:10px"></div>
        </div>`;

        const notesPanel = qs('#pdNotes', els.projDetailsInline);
        const nList = qs('#pdNotesList', notesPanel);
        const notes = DB.state.notesByProject[p.id] || [];
        if (nList) nList.innerHTML = notes.map(n=>`<li><b>${n.user}:</b> ${n.text}</li>`).join('') || '<li>Nenhuma anotação.</li>';
        const nForm = qs('#pdNoteForm', notesPanel);
        if (nForm && !nForm._bound){
          nForm.addEventListener('submit', ev=>{
            ev.preventDefault();
            const ta = qs('textarea', nForm);
            const text = ta.value.trim();
            if (!text) return;
            UI.addProjectNote(p, text);
            ta.value = '';
          });
          nForm._bound = true;
        }

        const obsPanel = qs('#pdObs', els.projDetailsInline);
        const obs = DB.state.obsByProject[p.id] || {};
        if (CURRENT_ROLE === 'admin') {
          obsPanel.innerHTML = `<form id="pdObsForm"><textarea style="width:100%; min-height:120px; background:#0f131a; border:1px solid var(--card-border); border-radius:10px; color:var(--text); padding:10px" placeholder="Observações gerais..." autocomplete="off">${obs.text||''}</textarea><div class="actions" style="margin-top:6px"><button type="submit" class="btn btn-primary">Salvar</button></div></form>`;
          const oform = qs('#pdObsForm', obsPanel);
          oform.addEventListener('submit', ev=>{
            ev.preventDefault();
            const text = qs('textarea', oform).value.trim();
            UI.saveProjectObs(p, text);
          });
        } else {
          const content = obs.text ? `<p>${obs.text}${obs.user ? `<br><small>por ${obs.user}</small>` : ''}</p>` : '<p>Nenhuma observação.</p>';
          obsPanel.innerHTML = content;
        }

        // Construção do form de edição
        const form = document.createElement('form');
        form.id = 'editProjectForm';
        form.className = 'edit-form';
        form.autocomplete = 'off';
        const fields = ['id','name','desc','prazo','dias','pessoas','diasTrab','pct'];
        fields.forEach(f=>{
          const wrap = document.createElement('div');
          wrap.className = 'field' + (f === 'desc' ? ' full' : '');
          const label = document.createElement('label');
          label.textContent = f;
          const inp = document.createElement('input');
          inp.name = f;
          inp.autocomplete = 'off';
          if (f === 'desc') { inp.type = 'text'; }
          else if (f === 'prazo') { inp.type = 'date'; }
          else if (['dias','pessoas','diasTrab','pct'].includes(f)) { inp.type = 'number'; }
          else { inp.type = 'text'; }
          inp.value = p[f] ?? '';
          wrap.appendChild(label);
          wrap.appendChild(inp);
          form.appendChild(wrap);
        });
        const actions = document.createElement('div');
        actions.className = 'actions';
        const btnSave = document.createElement('button');
        btnSave.type = 'submit';
        btnSave.className = 'btn btn-primary';
        btnSave.textContent = 'Salvar';
        const btnArchive = document.createElement('button');
        btnArchive.type = 'button';
        btnArchive.className = 'btn';
        btnArchive.textContent = 'Arquivar';
        const btnDel = document.createElement('button');
        btnDel.type = 'button';
        btnDel.className = 'btn';
        btnDel.textContent = 'Excluir';
        actions.appendChild(btnSave);
        actions.appendChild(btnArchive);
        actions.appendChild(btnDel);
        form.appendChild(actions);
        const editWrap = qs('#pdEditForm', els.projDetailsInline);
        editWrap?.appendChild(form);

        form.addEventListener('submit', ev=>{
          ev.preventDefault();
          const fd = new FormData(form);
          const updated = {};
          fields.forEach(f=>{ if(fd.has(f)) updated[f] = fd.get(f); });
          UI.updateProject(p, updated);
        });
        btnArchive.addEventListener('click', ()=> UI.archiveProject(p));
        btnDel.addEventListener('click', ()=> UI.deleteProject(p));
        const detail = els.projDetailsInline.querySelector('.project-detail-inline');
        els.projDetailsInline.scrollIntoView({behavior:'smooth', block:'start'});
        detail?.addEventListener('click', ev=>{
          const btn = ev.target.closest('.subtab');
          if(!btn) return;
          const tab = btn.dataset.tab;
          qsa('.subtab', detail).forEach(b=>b.classList.remove('active'));
          qsa('.subtab-panel', detail).forEach(pn=>{ pn.classList.remove('active'); pn.style.display='none'; });
          btn.classList.add('active');
          const panel = detail.querySelector('#'+tab);
          if(panel){ panel.classList.add('active'); panel.style.display=''; }
        });
      },
    };
  // ===== Helpers do Modo TV (fora do UI!) =====
  function isTV(){
    return document.body.classList.contains('tv-mode');
  }

  const sizeContentForTV = () => {
    const top = document.querySelector('.top.panel');
    const content = document.getElementById('dashboardContent');
    if (!top || !content) return;
    content.style.height = (window.innerHeight - top.offsetHeight) + 'px';
  };

  function toggleTVMode(){
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

    if (!fsEl) {
      const root = document.documentElement;
      const req = root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen;
      if (req) req.call(root).catch?.(e=>console.warn('Fullscreen error:', e));
      document.body.classList.add('tv-mode');
      sizeContentForTV();
      window.addEventListener('resize', sizeContentForTV);
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (exit) exit.call(document).catch?.(e=>console.warn('Exit FS error:', e));
      document.body.classList.remove('tv-mode');
      const content = document.getElementById('dashboardContent');
      if (content) content.style.height = '';
      window.removeEventListener('resize', sizeContentForTV);
    }

    // re-render pra aplicar/remover a coluna Resumo e extras dos projetos
    UI.renderTickets();
    UI.renderProjects();
    UI.updateProjectArrows();
  }

  // Sincroniza classe ao sair por ESC/gesto
  ['fullscreenchange','webkitfullscreenchange','msfullscreenchange'].forEach(ev=>{
    document.addEventListener(ev, ()=>{
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
      if (!fsEl) {
        document.body.classList.remove('tv-mode');
        const content = document.getElementById('dashboardContent');
        if (content) content.style.height = '';
        window.removeEventListener('resize', sizeContentForTV);
      } else {
        document.body.classList.add('tv-mode');
        sizeContentForTV();
        window.addEventListener('resize', sizeContentForTV);
      }
      UI.renderTickets();
      UI.renderProjects();
      UI.updateProjectArrows();
    });
  });

  // Botão TV
  els.btnTV?.addEventListener('click', toggleTVMode);

    // ====== listeners globais (blindados) ======
    els.btnLogout?.addEventListener('click', ()=>{ location.reload(); });
    els.btnHamb?.addEventListener('click', ()=> els.sidebar?.classList.toggle('open'));
    els.caroPrev?.addEventListener('click', ()=> UI.scrollProjects(-1));
    els.caroNext?.addEventListener('click', ()=> UI.scrollProjects(1));
    els.projectsCarousel?.addEventListener('scroll', ()=> UI.updateProjectArrows());

    els.tabOverview?.addEventListener('click', ()=> UI.setActiveTab('overview'));
    els.tabTickets?.addEventListener('click', ()=> UI.setActiveTab('tickets'));
    els.tabProjects?.addEventListener('click', ()=> UI.setActiveTab('projects'));
    els.tabAdmin?.addEventListener('click', ()=> els.adminMenu?.classList.toggle('open'));
    els.btnAdminCreateTicket?.addEventListener('click', ()=>{
      UI.showCreateTicket();
      els.adminMenu?.classList.remove('open');
      els.sidebar?.classList.remove('open');
    });
    els.btnAdminCreateProject?.addEventListener('click', ()=>{
      UI.showCreateProject();
      els.adminMenu?.classList.remove('open');
      els.sidebar?.classList.remove('open');
    });
    els.btnAdminChanges?.addEventListener('click', ()=>{
      UI.showAdminChanges();
      els.adminMenu?.classList.remove('open');
      els.sidebar?.classList.remove('open');
    });
    els.btnAdminArchivedTickets?.addEventListener('click', ()=>{
      UI.showArchivedTickets();
      els.adminMenu?.classList.remove('open');
      els.sidebar?.classList.remove('open');
    });
    els.btnAdminFinishedTickets?.addEventListener('click', ()=>{
      UI.showFinishedTickets();
      els.adminMenu?.classList.remove('open');
      els.sidebar?.classList.remove('open');
    });
    els.btnAdminArchivedProjects?.addEventListener('click', ()=>{
      UI.showArchivedProjects();
      els.adminMenu?.classList.remove('open');
      els.sidebar?.classList.remove('open');
    });
    els.btnAdminFinishedProjects?.addEventListener('click', ()=>{
      UI.showFinishedProjects();
      els.adminMenu?.classList.remove('open');
      els.sidebar?.classList.remove('open');
    });

    // Boot inicial
    UI.setActiveTab('overview');
    UI.renderAll();
    UI.selectTicket(DB.state.tickets[0]);

    // Debug opcional: veja o que existe na DOM
    // console.table(Object.fromEntries(Object.entries(els).map(([k,v])=>[k, !!v])));
  }

  function show(sel){ const el=qs(sel); if(el) el.style.display=''; }
  function hide(sel){ const el=qs(sel); if(el) el.style.display='none'; }
})();
