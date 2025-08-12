Refatoração do app.js — Split modular
=====================================

Este pacote contém **apenas** os novos arquivos do app (em `assets/js/app/`),
um `index.refactored.html` de exemplo, e esta documentação. A ideia é: você
copia a pastinha `assets/js/app/` por cima do seu projeto, ajusta o `index.html`
trocando UMA linha (a do `app.js`) por SETE (os módulos), e pronto.

▶ Compatibilidade: não mudei nenhuma API do seu projeto. O `DB`, os templates,
o `utils.js`, o servidor Node e os endpoints (`GET /api/db`, `PATCH /api/db`)
continuam idênticos. O comportamento de login, dashboard e modo TV permanece.

------------------------------------------------------------
Como aplicar (2 jeitos)
------------------------------------------------------------
A) Copiar e colar (recomendado)
   1. Copie a pasta `assets/js/app/` deste ZIP para o mesmo caminho no seu projeto
      (crie as pastas se não existirem).
   2. Abra seu `index.html` e substitua a linha:
          <script src="./assets/js/app.js" defer></script>
      pelas linhas abaixo (na mesma posição, após `templates.js`):
          <script src="./assets/js/app/state.js" defer></script>
          <script src="./assets/js/app/shell.js" defer></script>
          <script src="./assets/js/app/helpers.js" defer></script>
          <script src="./assets/js/app/tv.js" defer></script>
          <script src="./assets/js/app/ui.js" defer></script>
          <script src="./assets/js/app/login.js" defer></script>
          <script src="./assets/js/app/bootstrap.js" defer></script>
   3. (Opcional) Remova o arquivo antigo `assets/js/app.js` ou mantenha como backup
      — ele não será mais carregado.

B) Usar o arquivo pronto
   - No ZIP há um `index.refactored.html`. Você pode compará-lo ao seu `index.html` e
     replicar somente a troca das tags de script. Nada mais foi alterado.

------------------------------------------------------------
Nova estrutura
------------------------------------------------------------
assets/
  js/
    utils.js               (já existe no seu projeto)
    data.js                (já existe no seu projeto)
    templates.js           (já existe no seu projeto)
    app/
      state.js             -> estado global + detecção de mobile
      shell.js             -> injeta os templates de login/dashboard
      helpers.js           -> utilidades específicas da app (datas, obs/anotações, etc.)
      tv.js                -> modo TV + sincronização com fullscreen
      ui.js                -> TUDO da dashboard (render de tickets/projetos, detalhes, forms)
      login.js             -> fluxo de login
      bootstrap.js         -> boot: detecta mobile, renderiza shell, e faz bind do login

------------------------------------------------------------
Garantias (o que não mudou)
------------------------------------------------------------
- `DB` e os métodos (`load`, `addTicket`, `updateTicket`, `addProject`, etc.) seguem iguais.
- Templates continuam em `tpl.*` e são usados do mesmo jeito.
- Utilitários `qs`, `qsa`, `fmtDate`, `cssVar` continuam globais via `utils.js`.
- A flag de mobile pode ser forçada com `?mobile=1` ou `?mobile=0` (ou `localStorage.forceMobile`).

------------------------------------------------------------
Mapa dos módulos (resumo)
------------------------------------------------------------
- state.js
    APP.state + APP.detectMobile + APP.applyIsMobile
- shell.js
    APP.shell.renderShell() - injeta `tpl.login|loginMobile` e `tpl.dashboard|dashboardMobile`
- helpers.js
    Datas (parseDateLocal/Smart, computeDeadlinePct), observações/anotações, show/hide, etc.
- tv.js
    APP.tv.toggleTVMode(), listeners de fullscreen e re-render da UI ao alternar o modo
- ui.js
    APP.dashboard.init() + objeto APP.UI (render e ações de tickets/projetos, formulários, gráficos)
- login.js
    APP.login.bindLogin() - fluxo de login, chamada a `DB.load` e início do dashboard
- bootstrap.js
    DOMContentLoaded -> `APP.applyIsMobile()`, `APP.shell.renderShell()`, `APP.login.bindLogin()`

------------------------------------------------------------
Dicas de manutenção
------------------------------------------------------------
1) Novo campo em Chamado (Ticket)
   - Adicione o rótulo em `TICKET_FIELD_LABELS` (arquivo data.js).
   - O formulário de criação/edição é gerado dinamicamente com base em `TICKET_FIELDS`,
     então o novo campo já aparece automaticamente. Se for data, use o nome `dueDate`
     para aproveitar o input `<input type="date">` usado no fluxo atual.

2) Nova aba (subtab) no detalhe do chamado/projeto
   - Crie o botão no `templates.js` (subtabs) e o painel correspondente.
   - Na UI (ui.js), ao abrir o detalhe, o listener genérico já alterna as subtabs
     pela `data-tab`. Para lógica extra, adicione no trecho de `openTicketDetail`
     ou `openProjectDetailInline`.

3) Regras de negócio do prazo / datas
   - Centralize em `helpers.js` (`parseDateSmart`, `computeDeadlinePct`) para manter
     consistência na renderização, sorting e cálculos.

4) Estilo e CSS
   - Continue usando as variáveis de CSS (`--brand`, `--card-border`, etc.). O gráfico SLA
     lê direto do CSS, então a identidade visual fica coesa.

5) Padrões de código
   - Cada arquivo usa IIFE e o namespace global `APP` (sem ESM/bundler). Se no futuro
     quiser migrar pra `type="module"`, essa divisão já facilita.

6) TV Mode
   - Ao entrar/sair do fullscreen o app re-renderiza tickets/projetos, ajusta altura,
     e ativa colunas/extras específicas. Se mexer no layout, mantenha o `UI.updateProjectArrows()`.

------------------------------------------------------------
Como testar
------------------------------------------------------------
- Suba o servidor local: `node server.js` (ou `npm start`).
- Acesse no browser. Faça login com `admin/1234` ou `filipe/1234` (credenciais de demo).
- Clique no botão “TV” para alternar modo TV; `Esc` sai do fullscreen.
- Para simular mobile, abra com `?mobile=1` ou redimensione a janela.

------------------------------------------------------------
Perguntas rápidas
------------------------------------------------------------
- *Nada aparece depois de logar?* Confira se `utils.js`, `data.js` e `templates.js` estão carregando antes
  dos novos módulos (todas as tags `<script>` com `defer`, na ordem).
- *Os novos scripts não sobem?* Verifique o caminho `assets/js/app/*.js` e o `Content-Type` servido pelo Node.
- *Quebro o `app.js` antigo?* Pode remover; a página não o referencia mais.

------------------------------------------------------------
Changelog desta refatoração
------------------------------------------------------------
- Divisão do `app.js` em 7 módulos menores e coesos.
- Preservação de toda a API/fluxo original.
- `index.refactored.html` para facilitar a troca das tags.
