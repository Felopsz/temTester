(function(){
  window.APP = window.APP || {};

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
      APP.dashboard.init();
    };

    btnLogin?.addEventListener('click', () => {
      btnCreate.classList.add('fade-out');
      btnLogin.classList.add('fade-out');
      setTimeout(() => {
        actions.classList.add('hidden');
        topBar.classList.add('visible');
        form.classList.add('visible');
        user.focus();
      }, 240);
    });
    btnBack?.addEventListener('click', goHome);
    user?.addEventListener('input', enableContinueIfFilled);
    pass?.addEventListener('input', enableContinueIfFilled);
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (btnContinue.disabled) return;
      const u = user.value.trim();
      const p = pass.value;
      const res = await fetch('/api/db');
      const data = await res.json();
      const account = data.users?.[u];
      if (account && account.password === p) {
        window.CURRENT_USER = u;
        window.CURRENT_ROLE = account.role;
        await DB.load(data);
        goToDashboard();
      } else {
        alert('Usuário ou senha inválidos.');
        pass.select();
      }
    });
  }

  APP.login = { bindLogin };
})();
