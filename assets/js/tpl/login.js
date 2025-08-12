export function login(){
  return `
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
      </main>`;
}
