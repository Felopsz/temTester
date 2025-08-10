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

  // Calcula % de prazo restante com base em createdAt e dueDate (clamped 0–100)
  function computePrazoPct(createdAt, dueDate, now = new Date()){
    const end = new Date(dueDate);
    if (isNaN(end)) return 0;
    let start = new Date(createdAt);
    if (isNaN(start)) start = now;
    const total = end - start;
    if (total <= 0) return 0;
    const remaining = end - now;
    return Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));
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
      sectionCreateTicket: qs('#sectionCreateTicket'),
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
        this.renderSLAChart(t.concl, 100 - p, 'chartSLA');
      },

      renderAll(){
        this.renderTickets();
        this.renderProjects();
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
            <th>% de prazo restante</th>
          `;
        }

        [...DB.state.tickets]
          .sort((a, b) => {
            const da = new Date(a.dueDate);
            const db = new Date(b.dueDate);
            if (isNaN(da)) return 1;
            if (isNaN(db)) return -1;
            return da - db;
          })
          .forEach(t => {
          const tr = document.createElement('tr');
          const prazoPct = computePrazoPct(t.createdAt, t.dueDate);
          const overdue = new Date(t.dueDate) < new Date();
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
                <div class="progress"><i style="width:${prazoPct}%"></i></div>
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
          .sort((a, b) => new Date(a.prazo) - new Date(b.prazo))
          .forEach(p => {
          const daysLeft = Math.max(0, Math.ceil((new Date(p.prazo) - new Date())/86400000));
          const el = document.createElement('article');
          el.className = 'project';

          el.innerHTML = `
            <header style="display:flex; justify-content:space-between; align-items:center">
              <strong>${p.name}</strong>
              <span class="badge">${p.pct}%</span>
            </header>
            <p class="proj-desc" style="color:#cbd5e1; font-size:13px">${p.desc}</p>
            <div class="meta">
              <span>Prazo: <b>${new Date(p.prazo).toLocaleDateString('pt-BR')}</b></span>
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

      showCreateTicket(){
        hide('#sectionTickets');
        hide('#sectionCharts');
        hide('#sectionProjects');
        show('#sectionCreateTicket');
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

          // Renderiza os campos baseando-se em TICKET_FIELDS (exceto id), injeta dueDate se não existir
          const fieldsToRender = Array.isArray(window.TICKET_FIELDS)
            ? TICKET_FIELDS.filter(f => f !== 'id')
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
            // inclui também dueDate se inserimos manualmente
            const allKeys = new Set([...(window.TICKET_FIELDS||[]).filter(f=>f!=='id'), 'dueDate']);
            allKeys.forEach(f=>{ if (fd.has(f)) t[f] = fd.get(f); });

            t.concl = Number(t.concl || 0);
            await DB.addTicket(t);
            form.reset();
            ui.renderTickets();
            ui.setActiveTab('tickets');
            els.adminMenu?.classList.remove('open');
            els.sidebar?.classList.remove('open');
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

      // *** ainda dentro de UI ***
      _selectedRow: null,

      selectTicket(t, rowEl){
        this._selected = t;
        if(this._selectedRow){ this._selectedRow.classList.remove('selected'); }
        if(rowEl){ rowEl.classList.add('selected'); this._selectedRow = rowEl; }
        this.renderProgressChart(DB.state.historyByTicket[t.id]);
        const p = computePrazoPct(t.createdAt, t.dueDate);
        this.renderSLAChart(t.concl, 100 - p);
      },

      openTicketDetail(t, rowEl){
        this.selectTicket(t, rowEl);
        this.setActiveTab('tickets');

        if (els.tdTitle) els.tdTitle.textContent = t.id;
        if (els.tdPct) els.tdPct.textContent = `${t.concl}%`;
        if (els.tdMeta) {
          const prazoPct = computePrazoPct(t.createdAt, t.dueDate);
          const overdue = new Date(t.dueDate) < new Date();
          const maybeDue = t.dueDate ? `<span><b>Prazo final:</b> ${new Date(t.dueDate).toLocaleDateString('pt-BR')}</span>` : '';
          els.tdMeta.innerHTML = `
            <span><b>Data:</b> ${fmtDate(t.createdAt)}</span>
            <span><b>Aberto por:</b> ${t.solicitante}</span>
            <span><b>Contato:</b> ${t.telefone}</span>
            <span><b>Ponto de encontro:</b> ${t.meetPoint}</span>
            <span><b>Dupla:</b> ${t.dupla}</span>
            ${maybeDue}
            <span class="${overdue ? 'overdue' : ''}"><b>Prazo restante:</b> ${prazoPct}%</span>`;
        }

        if (els.tdDesc) {
          els.tdDesc.innerHTML = `
            <p><b>Resumo:</b> ${t.resumo}</p>
            <p>${t.descricao}</p>
          `;
        }

        const list = DB.state.rdosByTicket[t.id] || [];
        if (els.tdRDOList) els.tdRDOList.innerHTML = list.map(i=>`<li>${i}</li>`).join('') || '<li>Nenhum RDO registrado.</li>';
        if (els.tdEditForm){
          els.tdEditForm.innerHTML = '';
          const form = document.createElement('form');
          form.id = 'editTicketForm';
          form.className = 'edit-form';

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
              if (t[f]) inp.value = new Date(t[f]).toISOString().slice(0,10);
            } else {
              inp = document.createElement('input');
              inp.type = 'text';
              inp.value = t[f] ?? '';
            }
            inp.name = f;
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
          const btnDel = document.createElement('button');
          btnDel.type = 'button';
          btnDel.className = 'del-btn btn';
          btnDel.id = 'btnDelTicket';
          btnDel.textContent = 'Excluir';
          actions.appendChild(btnSave);
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

      editTicket(t, updated){
        if (updated.id !== t.id){
          if (DB.state.rdosByTicket[t.id]){ DB.state.rdosByTicket[updated.id] = DB.state.rdosByTicket[t.id]; delete DB.state.rdosByTicket[t.id]; }
          if (DB.state.historyByTicket[t.id]){ DB.state.historyByTicket[updated.id] = DB.state.historyByTicket[t.id]; delete DB.state.historyByTicket[t.id]; }
        }
        Object.assign(t, updated);
        DB.state.historyByTicket[t.id] = genHistory(t.concl);
        DB.state.tickets.sort((a, b) => {
          const da = new Date(a.dueDate);
          const db = new Date(b.dueDate);
          if (isNaN(da)) return 1;
          if (isNaN(db)) return -1;
          return da - db;
        });
        UI.renderTickets();
        UI.openTicketDetail(t);
      },

      deleteTicket(t){
        if(!confirm('Excluir chamado?')) return;
        DB.state.tickets = DB.state.tickets.filter(x=>x!==t);
        delete DB.state.rdosByTicket[t.id];
        delete DB.state.historyByTicket[t.id];
        UI.renderTickets();
        clearTicketDetail(els);
      },

      editProject(p){
        const fields = ['id','name','desc','prazo','dias','pessoas','diasTrab','pct'];
        const updated = { ...p };
        fields.forEach(f => {
          const val = prompt(`Novo ${f}`, p[f] ?? '');
          if (val !== null) updated[f] = val;
        });
        if (updated.id !== p.id){
          if (DB.state.materialsByProject[p.id]){ DB.state.materialsByProject[updated.id] = DB.state.materialsByProject[p.id]; delete DB.state.materialsByProject[p.id]; }
        }
        Object.assign(p, updated);
        UI.renderProjects();
        UI.updateProjectArrows();
        UI.openProjectDetailInline(p);
      },

      deleteProject(p){
        if(!confirm('Excluir projeto?')) return;
        DB.state.projects = DB.state.projects.filter(x=>x!==p);
        delete DB.state.materialsByProject[p.id];
        UI.renderProjects();
        UI.updateProjectArrows();
        if(els.projDetailsInline) els.projDetailsInline.innerHTML = '';
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
        const mats = DB.state.materialsByProject[p.id] || [];
        if (!els.projDetailsInline) return;
        els.projDetailsInline.innerHTML = `
          <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
            <strong>${p.name}</strong>
            <div style="display:flex; gap:6px; align-items:center">
              <span class="badge">${p.pct}%</span>
              <button class="edit-btn" id="projEdit">Editar</button>
              <button class="del-btn" id="projDel">Excluir</button>
            </div>
          </header>
          <div style="display:flex; gap:12px; flex-wrap:wrap; color:var(--muted); font-size:13px">
            <span><b>Prazo:</b> ${new Date(p.prazo).toLocaleDateString('pt-BR')}</span>
            <span><b>Dias:</b> ${p.dias}</span>
            <span><b>Pessoas:</b> ${p.pessoas}</span>
            <span><b>Dias trabalhados:</b> ${p.diasTrab}</span>
          </div>
          <div class="pbar" style="margin-top:6px"><i style="width:${p.pct}%"></i></div>
          <div style="margin-top:8px">
            <h3 style="font-size:13px; color:var(--muted); margin-bottom:6px">Materiais</h3>
            <ul style="margin-left:18px; display:grid; gap:4px">${mats.map(m=>`<li>${m}</li>`).join('')}</ul>
          </div>`;
        qs('#projEdit')?.addEventListener('click', ()=> UI.editProject(p));
        qs('#projDel')?.addEventListener('click', ()=> UI.deleteProject(p));
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
