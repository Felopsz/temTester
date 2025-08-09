// Telemix – app.js (v3.1)
// - Fix crítico: força injeção do template da dashboard para evitar elementos null
// - Listeners com optional chaining (?.) para blindar em dev
// - Mantém correções anteriores (sem "vazar" estado entre abas, subtabs escopadas, donuts únicos, modo TV)

(function(){
  const qs = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
  const fmtDate = (d) => new Date(d).toLocaleString('pt-BR',{ day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  const cssVar = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  let CURRENT_USER = 'admin';

  // ========== MOCK DE DADOS ==========
  const DB = {
    state: {
      tickets: [],
      projects: [],
      materialsByProject: {},
      rdosByTicket: {},
      historyByTicket: {}, // série de progresso (8 pontos)
    },
    bootstrap(){
      this.state.tickets = [
        { id:'CH-1021', createdAt:'2025-08-06T09:35:00', meetPoint:'Centro - Loja 12', dupla:'Ana & João', concl:62, prazo:45, resumo:'Queda intermitente na rede local.', solicitante:'Carlos M.', telefone:'(21) 90000-1021', descricao:'Queda intermitente na rede local. Equipamentos reiniciam sem aviso, requer verificação detalhada.' },
        { id:'CH-1022', createdAt:'2025-08-06T14:10:00', meetPoint:'Zona Sul - Posto 3', dupla:'Marcos & Lia', concl:35, prazo:22, resumo:'Atualização de firmware pendente.', solicitante:'Júlia P.', telefone:'(21) 90000-1022', descricao:'Atualização de firmware pendente em vários roteadores da filial.' },
        { id:'CH-1023', createdAt:'2025-08-07T18:55:00', meetPoint:'Barra - Quiosque B', dupla:'Rafa & Gui', concl:88, prazo:76, resumo:'Troca de ONU e reconfiguração.', solicitante:'Ricardo L.', telefone:'(21) 90000-1023', descricao:'Troca de ONU e reconfiguração completa do enlace principal.' },
        { id:'CH-1024', createdAt:'2025-08-07T07:20:00', meetPoint:'Centro - Praça 7', dupla:'Paula & Leo', concl:20, prazo:12, resumo:'Visita inicial, aguardando acesso.', solicitante:'Mariana S.', telefone:'(21) 90000-1024', descricao:'Visita inicial, aguardando acesso ao edifício para diagnóstico.' },
        { id:'CH-1025', createdAt:'2025-08-08T11:45:00', meetPoint:'Niterói - Estação', dupla:'Bia & Tom', concl:58, prazo:40, resumo:'Ajuste de alinhamento de antena.', solicitante:'Eduardo T.', telefone:'(21) 90000-1025', descricao:'Ajuste de alinhamento de antena para melhora de sinal.' },
        { id:'CH-1026', createdAt:'2025-08-08T12:30:00', meetPoint:'Copacabana - Posto 5', dupla:'Vivi & Dan', concl:12, prazo:8, resumo:'Inspeção de cabeamento.', solicitante:'Fernanda B.', telefone:'(21) 90000-1026', descricao:'Inspeção de cabeamento em rede interna do cliente.' },
        { id:'CH-1027', createdAt:'2025-08-08T13:05:00', meetPoint:'Tijuca - Saens Peña', dupla:'Caio & Nina', concl:42, prazo:51, resumo:'Oscilação de potência no enlace.', solicitante:'Sérgio A.', telefone:'(21) 90000-1027', descricao:'Oscilação de potência no enlace precisa de análise de interferência.' },
        { id:'CH-1028', createdAt:'2025-08-08T13:50:00', meetPoint:'Centro - Ed. Rio', dupla:'Leo & Tati', concl:74, prazo:60, resumo:'Revisão de configuração de roteador.', solicitante:'Patrícia F.', telefone:'(21) 90000-1028', descricao:'Revisão de configuração de roteador e otimização de QoS.' },
        { id:'CH-1029', createdAt:'2025-08-08T14:25:00', meetPoint:'Ilha - Galeão', dupla:'Iuri & Fê', concl:28, prazo:30, resumo:'Troca de patch cords danificados.', solicitante:'Henrique C.', telefone:'(21) 90000-1029', descricao:'Troca de patch cords danificados e testes de continuidade.' },
        { id:'CH-1030', createdAt:'2025-08-08T15:10:00', meetPoint:'Barra - Shopping X', dupla:'Gabi & Renan', concl:91, prazo:85, resumo:'Homologação final do link.', solicitante:'Bianca R.', telefone:'(21) 90000-1030', descricao:'Homologação final do link com validação de performance.' },
      ];
      this.state.projects = [
        { id:'PR-2001', name:'Integração CRM', desc:'Conectar pipeline de vendas ao painel.', prazo:'2025-09-15', dias:40, pessoas:5, diasTrab:22, pct:55 },
        { id:'PR-2002', name:'App Mobile Field', desc:'Aplicativo de campo para equipes externas.', prazo:'2025-10-02', dias:55, pessoas:7, diasTrab:18, pct:32 },
        { id:'PR-2003', name:'Relatórios V2', desc:'Dashboards executivos e exportações.', prazo:'2025-08-30', dias:20, pessoas:3, diasTrab:12, pct:70 },
        { id:'PR-2004', name:'Onboarding Rápido', desc:'Fluxo simplificado para novos clientes.', prazo:'2025-09-05', dias:18, pessoas:2, diasTrab:9, pct:48 },
        { id:'PR-2005', name:'Chatbot L2', desc:'Bot de triagem de chamados nível 2.', prazo:'2025-11-01', dias:60, pessoas:6, diasTrab:10, pct:20 },
        { id:'PR-2006', name:'Portal Parceiros', desc:'Área para parceiros externos.', prazo:'2025-12-15', dias:75, pessoas:8, diasTrab:15, pct:26 },
      ];
      this.state.materialsByProject = {
        'PR-2001': ['API Key CRM','Webhook /lead-created','Tabela staging_crm','Doc mapeamento campos'],
        'PR-2002': ['Design Figma Mobile','SDK Camera','GPS Provider','Guia de acessibilidade'],
        'PR-2003': ['Spec KPIs','Lib export CSV','Template PDF','Exemplos de queries'],
        'PR-2004': ['Flowchart onboarding','Email templates','Checklist CS'],
        'PR-2005': ['Dataset intents L2','NLP model v0.9','Playbook fallback'],
        'PR-2006': ['Contrato parceiro','Guia branding','Endpoint /partners'],
      };
      this.state.rdosByTicket = {
        'CH-1021': ['RDO 08/06 - inspeção inicial','RDO 08/07 - ajuste de parâmetros'],
        'CH-1023': ['RDO 08/07 - troca de ONU','RDO 08/08 - testes finais'],
      };
      this.state.tickets.forEach(t=>{
        this.state.historyByTicket[t.id] = genHistory(t.concl);
      });
      function genHistory(finalPct){
        const pts = []; let v = Math.max(5, Math.min(90, finalPct - 20));
        for(let i=0;i<8;i++){ v = Math.min(100, Math.max(0, v + (Math.random()*18-5))); pts.push(Math.round(v)); }
        pts[7] = finalPct;
        return pts;
      }
    }
  };

  // ========== TEMPLATES ==========
  const tpl = {
    login: () => `
      <main class="card">
        <div class="top-bar" id="topBar">
          <button type="button" class="back-btn" id="btnBack">← Voltar</button>
        </div>
        <header class="brand">
          <div class="logo" aria-hidden="true"></div>
          <div class="brand-text">
            <div class="title">Telemix</div>
            <p class="subtitle">Acesse sua conta para continuar</p>
          </div>
        </header>
        <section class="actions" id="actions">
          <button class="btn btn-primary" id="btnLogin">Login</button>
          <button class="btn" id="btnCreate">Criar conta</button>
        </section>
        <div class="divider"></div>
        <form id="loginForm" novalidate>
          <div class="field">
            <label class="label" for="user">Usuário</label>
            <input class="input" id="user" name="user" placeholder="ex.: admin" autocomplete="username" />
          </div>
          <div class="field">
            <label class="label" for="pass">Senha</label>
            <input class="input" id="pass" name="pass" type="password" placeholder="••••" autocomplete="current-password" />
            <small class="label">Dica de teste: admin / 1234</small>
          </div>
          <button id="btnContinue" class="continue" type="submit" disabled>Continuar</button>
        </form>
      </main>` ,

    dashboard: () => `
      <div class="app">
        <aside class="sidebar panel" id="sidebar">
          <div class="logo-row"><div class="logo"></div><strong>Telemix</strong></div>
          <nav class="nav">
            <button class="navbtn" id="tabOverview">Visão geral</button>
            <button class="navbtn" id="tabTickets">Chamados</button>
            <button class="navbtn" id="tabReports">Relatórios</button>
            <button class="navbtn" id="tabProjects">Projetos</button>
            <button class="navbtn">Configurações</button>
          </nav>
        </aside>

        <header class="top panel">
          <div class="brand-inline">
            <button id="btnHamb" class="hamburger">☰</button>
            <span class="pill" id="sectionPill">Dashboard</span>
            <span class="greet" id="greet" style="margin-left:8px;color:#cbd5e1;font-size:12px"></span>
            <span class="clock" id="clock" style="margin-left:10px;color:#9aa0a6;font-size:12px"></span>
          </div>
          <div class="top-actions">
            <button class="tv-mode-btn" id="btnTV" title="Modo TV">📺</button>
            <button class="logout" id="btnLogout">Sair</button>
          </div>
        </header>

        <main class="content panel" id="dashboardContent">
          <!-- CHAMADOS -->
          <section class="section tickets" id="sectionTickets">
            <h2>Chamados</h2>
            <div class="table-wrap" id="ticketsWrap">
              <table class="table" id="ticketsTable">
                <thead>
                  <tr>
                    <th>ID do chamado</th>
                    <th>Data de criação</th>
                    <th>Ponto de encontro</th>
                    <th>Dupla</th>
                    <th>% de conclusão</th>
                    <th>% de prazo</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>

            <!-- Detalhe do chamado + subtabs -->
            <div class="ticket-detail" id="ticketDetail" style="display:none; background:#0f131a; border:1px solid var(--card-border); border-radius:12px; padding:12px; margin-top:8px">
              <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
                <strong id="tdTitle">Chamado</strong>
                <span class="badge" id="tdPct">0%</span>
              </header>
              <div id="tdMeta" style="display:flex; gap:12px; flex-wrap:wrap; color:var(--muted); font-size:13px"></div>

              <div class="subtabs" style="display:flex; gap:8px; border-bottom:1px solid var(--card-border); margin-top:10px">
                <button class="subtab active" data-tab="tdDesc" style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">Descrição</button>
                <button class="subtab" data-tab="tdNotes" style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">Anotações</button>
                <button class="subtab" data-tab="tdRDO"   style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">RDO's</button>
                <button class="subtab" data-tab="tdObs"   style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">Observações</button>
              </div>
              <div class="subtab-panel active" id="tdDesc" style="padding-top:10px"></div>
              <div class="subtab-panel" id="tdNotes" style="display:none;padding-top:10px">
                <textarea style="width:100%; min-height:120px; background:#0f131a; border:1px solid var(--card-border); border-radius:10px; color:var(--text); padding:10px" placeholder="Escreva anotações do chamado..."></textarea>
              </div>
              <div class="subtab-panel" id="tdRDO" style="display:none;padding-top:10px">
                <ul id="tdRDOList" style="display:grid; gap:6px; margin-left:18px"></ul>
              </div>
              <div class="subtab-panel" id="tdObs" style="display:none;padding-top:10px">
                <textarea style="width:100%; min-height:120px; background:#0f131a; border:1px solid var(--card-border); border-radius:10px; color:var(--text); padding:10px" placeholder="Observações gerais..."></textarea>
              </div>
            </div>
          </section>

          <!-- GRÁFICOS (overview) -->
          <section class="section charts" id="sectionCharts">
            <h2>Andamento do chamado selecionado</h2>
            <div class="chart">
              <h3>Progresso ao longo do tempo (%)</h3>
              <div class="svg-wrap"><svg id="chartProgress" viewBox="0 0 100 40" preserveAspectRatio="none"></svg></div>
            </div>
            <div class="chart">
              <h3>Prazo consumido vs Conclusão (%)</h3>
              <div class="svg-wrap"><svg id="chartSLA" viewBox="0 0 100 40" preserveAspectRatio="none"></svg></div>
            </div>
          </section>

          <!-- PROJETOS -->
          <section class="section projects" id="sectionProjects">
            <h2>
              <span>Projetos</span>
              <span class="proj-actions">
                <button class="caro-btn" id="caroPrev" title="Anterior">◀</button>
                <button class="caro-btn" id="caroNext" title="Próximo">▶</button>
              </span>
            </h2>
            <div class="carousel" id="projectsCarousel"></div>
            <div class="project-details-inline" id="projectDetailsInline"></div>
          </section>
        </main>
      </div>`
  };

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
      CURRENT_USER = (user.value.trim() || 'admin');
      DB.bootstrap();
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
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (btnContinue.disabled) return;
      const u = user.value.trim();
      const p = pass.value;
      if (u === 'admin' && p === '1234') {
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
      btnLogout: qs('#btnLogout'),
      btnHamb: qs('#btnHamb'),
      btnTV: qs('#btnTV'),
      sidebar: qs('#sidebar'),
      _subtabsBound: false,
    };

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
        this.renderSLAChart(t.concl, t.prazo, 'chartSLA');
      },

      renderAll(){ this.renderTickets(); this.renderProjects(); this.updateProjectArrows(); },

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

  DB.state.tickets.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><button class="linklike" data-id="${t.id}">${t.id}</button></td>
      <td>${fmtDate(t.createdAt)}</td>
      <td>${t.meetPoint}</td>
      <td>${t.dupla}</td>
      ${isTV() ? `<td class="col-resumo" title="${t.resumo}">${t.resumo}</td>` : ''}
      <td>
        <div class="prog">
          <div class="nums"><span>Concl.: <b>${t.concl}%</b></span></div>
          <div class="progress"><i style="width:${t.concl}%"></i></div>
        </div>
      </td>
      <td>
        <div class="prog">
          <div class="nums"><span>Prazo: <b>${t.prazo}%</b></span></div>
          <div class="progress"><i style="width:${t.prazo}%"></i></div>
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

  DB.state.projects.forEach(p => {
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

// *** ainda dentro de UI ***
_selectedRow: null,

selectTicket(t, rowEl){
  this._selected = t;
  if(this._selectedRow){ this._selectedRow.classList.remove('selected'); }
  if(rowEl){ rowEl.classList.add('selected'); this._selectedRow = rowEl; }
  this.renderProgressChart(DB.state.historyByTicket[t.id]);
  this.renderSLAChart(t.concl, t.prazo);
},

openTicketDetail(t, rowEl){
  this.selectTicket(t, rowEl);
  this.setActiveTab('tickets');

  if (els.tdTitle) els.tdTitle.textContent = t.id;
  if (els.tdPct) els.tdPct.textContent = `${t.concl}%`;
  if (els.tdMeta) els.tdMeta.innerHTML = `
    <span><b>Data:</b> ${fmtDate(t.createdAt)}</span>
    <span><b>Aberto por:</b> ${t.solicitante}</span>
    <span><b>Contato:</b> ${t.telefone}</span>
    <span><b>Ponto de encontro:</b> ${t.meetPoint}</span>
    <span><b>Dupla:</b> ${t.dupla}</span>
    <span><b>Prazo consumido:</b> ${t.prazo}%</span>`;

  if (els.tdDesc) {
    els.tdDesc.innerHTML = `
      <p><b>Resumo:</b> ${t.resumo}</p>
      <p>${t.descricao}</p>
    `;
  }

  const list = DB.state.rdosByTicket[t.id] || [];
  if (els.tdRDOList) els.tdRDOList.innerHTML = list.map(i=>`<li>${i}</li>`).join('') || '<li>Nenhum RDO registrado.</li>';

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
      if (panel) { panel.classList.add('active'); panel.style.display = ''; }
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
            <span class="badge">${p.pct}%</span>
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
