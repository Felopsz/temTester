// Templates de interface
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
            <small class="label">Dica de teste: admin / 1234 ou filipe / 1234</small>
          </div>
      <button id="btnContinue" class="continue" type="submit" disabled>Continuar</button>
    </form>
      </main>` ,

  loginMobile: () => `
    <main class="card mobile">
      <header class="brand">
        <div class="logo"></div>
        <div class="brand-text">
          <div class="title">Telemix</div>
          <p class="subtitle">Entrar</p>
        </div>
      </header>
      <form id="loginForm" novalidate>
        <div class="field">
          <label class="label" for="user">Usuário</label>
          <input class="input" id="user" name="user" placeholder="ex.: admin" autocomplete="username" />
        </div>
        <div class="field">
          <label class="label" for="pass">Senha</label>
          <input class="input" id="pass" name="pass" type="password" placeholder="••••" autocomplete="current-password" />
        </div>
        <button id="btnContinue" class="btn btn-primary" type="submit">Continuar</button>
      </form>
    </main>
  `,

  dashboard: () => `
      <div class="app">
        <aside class="sidebar panel" id="sidebar">
          <div class="logo-row"><div class="logo"></div><strong>Telemix</strong></div>
          <nav class="nav">
            <button class="navbtn" id="tabOverview">Visão geral</button>
            <button class="navbtn" id="tabTickets">Chamados</button>
            <button class="navbtn" id="tabReports">Relatórios</button>
            <button class="navbtn" id="tabProjects">Projetos</button>
            <button class="navbtn" id="tabAdmin">Admin</button>
            <div class="admin-subnav" id="adminMenu">
              <button class="navbtn" id="btnAdminCreateTicket">Criar chamado</button>
              <button class="navbtn" id="btnAdminArchivedTickets">Chamados arquivados</button>
              <button class="navbtn" id="btnAdminFinishedTickets">Chamados finalizados</button>
              <button class="navbtn" id="btnAdminCreateProject">Criar projeto</button>
              <button class="navbtn" id="btnAdminArchivedProjects">Projetos arquivados</button>
              <button class="navbtn" id="btnAdminFinishedProjects">Projetos finalizados</button>
            </div>
            <!-- menu admin-only -->
            <button class="navbtn" id="tabConfig">Configurações</button>
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
            <button class="btn btn-outline" id="btnTV" title="Modo TV">TV</button>
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
                <div style="display:flex; gap:6px; align-items:center">
                  <span class="badge" id="tdPct">0%</span>
                </div>
              </header>
              <div id="tdMeta" style="display:flex; gap:12px; flex-wrap:wrap; color:var(--muted); font-size:13px"></div>

              <div class="subtabs" style="display:flex; gap:8px; border-bottom:1px solid var(--card-border); margin-top:10px">
                <button class="subtab active" data-tab="tdDesc" style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">Descrição</button>
                <button class="subtab" data-tab="tdNotes" style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">Anotações</button>
                <button class="subtab" data-tab="tdRDO"   style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">RDO's</button>
                <button class="subtab" data-tab="tdObs"   style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">Observações</button>
                <button class="subtab" data-tab="tdEditForm" style="background:transparent;border:1px solid var(--card-border);border-bottom:0;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;cursor:pointer;color:var(--text)">Editar</button>
              </div>
              <div class="subtab-panel active" id="tdDesc" style="padding-top:10px"></div>
              <div class="subtab-panel" id="tdNotes" style="display:none;padding-top:10px">
                <ul id="tdNotesList" style="display:grid; gap:6px; margin-left:18px"></ul>
                <div id="tdNoteForm" style="margin-top:8px">
                  <textarea style="width:100%; min-height:120px; background:#0f131a; border:1px solid var(--card-border); border-radius:10px; color:var(--text); padding:10px" placeholder="Escreva anotações do chamado..." autocomplete="off"></textarea>
                  <div class="actions" style="margin-top:6px"><button type="button" class="btn btn-primary" id="tdAddNoteBtn">Adicionar</button></div>
                </div>
              </div>
              <div class="subtab-panel" id="tdRDO" style="display:none;padding-top:10px">
                <ul id="tdRDOList" style="display:grid; gap:6px; margin-left:18px"></ul>
              </div>
              <div class="subtab-panel" id="tdObs" style="display:none;padding-top:10px"></div>
              <div class="subtab-panel" id="tdEditForm" style="display:none;padding-top:10px"></div>
            </div>
          </section>

          <!-- GRÁFICOS (overview) -->
          <section class="section charts" id="sectionCharts">
            <h2>Andamento do chamado selecionado</h2>
            <div class="chart">
              <h3>Progresso ao longo do tempo (%)</h3>
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
          <!-- ADMIN: criar chamado -->
          <section class="section" id="sectionCreateTicket" style="display:none">
            <h2>Novo chamado</h2>
            <form class="edit-form" id="createTicketForm"></form>
          </section>
          <!-- ADMIN: criar projeto -->
          <section class="section" id="sectionCreateProject" style="display:none">
            <h2>Novo projeto</h2>
            <form class="edit-form" id="createProjectForm"></form>
          </section>
          <!-- ADMIN: chamados arquivados -->
          <section class="section" id="sectionArchivedTickets" style="display:none">
            <h2>Chamados arquivados</h2>
            <div class="table-wrap">
              <table class="table" id="archivedTicketsTable">
                <thead>
                  <tr>
                    <th>ID do chamado</th>
                    <th>Data de criação</th>
                    <th>Ponto de encontro</th>
                    <th>Dupla</th>
                    <th>% de conclusão</th>
                    <th>% de prazo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </section>
          <!-- ADMIN: chamados finalizados -->
          <section class="section" id="sectionFinishedTickets" style="display:none">
            <h2>Chamados finalizados</h2>
            <div class="table-wrap">
              <table class="table" id="finishedTicketsTable">
                <thead>
                  <tr>
                    <th>ID do chamado</th>
                    <th>Data de criação</th>
                    <th>Ponto de encontro</th>
                    <th>Dupla</th>
                    <th>% de conclusão</th>
                    <th>% de prazo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </section>
          <!-- ADMIN: projetos arquivados -->
          <section class="section" id="sectionArchivedProjects" style="display:none">
            <h2>Projetos arquivados</h2>
            <div class="table-wrap">
              <table class="table" id="archivedProjectsTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Prazo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </section>
          <!-- ADMIN: projetos finalizados -->
          <section class="section" id="sectionFinishedProjects" style="display:none">
            <h2>Projetos finalizados</h2>
            <div class="table-wrap">
              <table class="table" id="finishedProjectsTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Prazo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </section>
        </main>
      </div>`
  ,

  dashboardMobile: () => `
    <div class="app app-mobile">
      <header class="top panel">
        <div class="brand-inline">
          <span class="pill" id="sectionPill">Dashboard</span>
          <span class="greet" id="greet"></span>
        </div>
        <div class="top-actions">
          <button class="btn btn-outline" id="btnTV" title="Modo TV">TV</button>
          <button class="logout" id="btnLogout">Sair</button>
        </div>
      </header>

      <main class="content panel" id="dashboardContent">
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

          <div class="ticket-detail" id="ticketDetail" style="display:none; background:#0f131a; border:1px solid var(--card-border); border-radius:12px; padding:12px; margin-top:8px">
            <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
              <strong id="tdTitle">Chamado</strong>
              <span class="badge" id="tdPct">0%</span>
            </header>
            <div id="tdMeta" style="display:flex; gap:12px; flex-wrap:wrap; color:var(--muted); font-size:13px"></div>
            <div class="subtabs" style="display:flex; gap:8px; border-bottom:1px solid var(--card-border); margin-top:10px">
              <button class="subtab active" data-tab="tdDesc">Descrição</button>
              <button class="subtab" data-tab="tdNotes">Anotações</button>
              <button class="subtab" data-tab="tdRDO">RDO's</button>
              <button class="subtab" data-tab="tdObs">Observações</button>
              <button class="subtab" data-tab="tdEditForm">Editar</button>
            </div>
            <div class="subtab-panel active" id="tdDesc" style="padding-top:10px"></div>
            <div class="subtab-panel" id="tdNotes" style="display:none;padding-top:10px"><ul id="tdNotesList"></ul></div>
            <div class="subtab-panel" id="tdRDO" style="display:none;padding-top:10px"><ul id="tdRDOList"></ul></div>
            <div class="subtab-panel" id="tdObs" style="display:none;padding-top:10px"></div>
            <div class="subtab-panel" id="tdEditForm" style="display:none;padding-top:10px"></div>
          </div>
        </section>

        <section class="section projects" id="sectionProjects">
          <h2>Projetos</h2>
          <div class="carousel" id="projectsCarousel"></div>
          <div class="project-details-inline" id="projectDetailsInline"></div>
        </section>

        <section class="section" id="sectionCreateTicket" style="display:none">
          <h2>Novo chamado</h2>
          <form class="edit-form" id="createTicketForm"></form>
        </section>

        <section class="section" id="sectionCreateProject" style="display:none">
          <h2>Novo projeto</h2>
          <form class="edit-form" id="createProjectForm"></form>
        </section>

        <section class="section" id="sectionArchivedTickets" style="display:none">
          <h2>Chamados arquivados</h2>
          <div class="table-wrap">
            <table class="table" id="archivedTicketsTable">
              <thead>
                <tr>
                  <th>ID do chamado</th>
                  <th>Data de criação</th>
                  <th>Ponto de encontro</th>
                  <th>Dupla</th>
                  <th>% de conclusão</th>
                  <th>% de prazo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </section>

        <section class="section" id="sectionFinishedTickets" style="display:none">
          <h2>Chamados finalizados</h2>
          <div class="table-wrap"><table class="table" id="finishedTicketsTable"><thead><tr>
            <th>ID do chamado</th><th>Data de criação</th><th>Ponto de encontro</th><th>Dupla</th><th>% de conclusão</th><th>% de prazo</th><th>Ações</th>
          </tr></thead><tbody></tbody></table></div>
        </section>

        <section class="section" id="sectionArchivedProjects" style="display:none">
          <h2>Projetos arquivados</h2>
          <div class="table-wrap"><table class="table" id="archivedProjectsTable"><thead><tr>
            <th>ID</th><th>Nome</th><th>Prazo</th><th>Ações</th>
          </tr></thead><tbody></tbody></table></div>
        </section>

        <section class="section" id="sectionFinishedProjects" style="display:none">
          <h2>Projetos finalizados</h2>
          <div class="table-wrap"><table class="table" id="finishedProjectsTable"><thead><tr>
            <th>ID</th><th>Nome</th><th>Prazo</th><th>Ações</th>
          </tr></thead><tbody></tbody></table></div>
        </section>
      </main>

      <nav class="bottom-nav">
        <button class="bn-btn" data-tab="overview">Visão</button>
        <button class="bn-btn" data-tab="tickets">Chamados</button>
        <button class="bn-btn" data-tab="projects">Projetos</button>
        <button class="bn-btn" data-tab="admin">Admin</button>
      </nav>

      <div class="admin-subnav" id="adminMenu">
        <button class="navbtn" id="btnAdminCreateTicket">Criar chamado</button>
        <button class="navbtn" id="btnAdminArchivedTickets">Chamados arquivados</button>
        <button class="navbtn" id="btnAdminFinishedTickets">Chamados finalizados</button>
        <button class="navbtn" id="btnAdminCreateProject">Criar projeto</button>
        <button class="navbtn" id="btnAdminArchivedProjects">Projetos arquivados</button>
        <button class="navbtn" id="btnAdminFinishedProjects">Projetos finalizados</button>
      </div>
    </div>
  `
};

window.tpl = tpl;
