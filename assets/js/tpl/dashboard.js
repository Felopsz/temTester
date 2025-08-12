export function dashboard(){
  return `
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
              <div class="tabs small" id="tdTabs" style="margin-bottom:12px">
                <button class="tab active" data-tab="desc">Descrição</button>
                <button class="tab" data-tab="rdos">RDOs</button>
                <button class="tab" data-tab="edit">Editar</button>
              </div>
              <div class="tab-content" id="tdDesc"></div>
              <div class="tab-content" id="tdRDOList" style="display:none"></div>
              <div class="tab-content" id="tdEditForm" style="display:none"></div>
              <div class="td-meta" id="tdMeta" style="margin-top:8px"></div>
            </div>
          </section>

          <!-- OUTRAS SECTIONS AQUI -->
        </main>
      </div>`;
}
