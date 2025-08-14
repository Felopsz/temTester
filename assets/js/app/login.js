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
    const goToDashboard = async (data) => {
      viewLogin.style.display = 'none';
      viewDash.style.display = 'block';
      if(data) await DB.load(data);
      APP.dashboard.init();
    };

    async function bootSession(){
      try{
        const me = await fetch('/me', {credentials:'include'});
        if(me.ok){
          const db = await fetch('/api/db',{credentials:'include'}).then(r=>r.json());
          const info = await me.json();
          window.CURRENT_USER = info.user.email;
          window.CURRENT_ROLE = db.users?.[window.CURRENT_USER]?.role;
          await goToDashboard(db);
        }else{
          viewLogin.style.display='';
        }
      }catch(e){ viewLogin.style.display=''; }
    }

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
      const r = await fetch('/auth/login', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({ email:u, password:p })
      });
      if (r.ok) {
        const db = await fetch('/api/db',{credentials:'include'}).then(r=>r.json());
        window.CURRENT_USER = u;
        window.CURRENT_ROLE = db.users?.[u]?.role;
        await goToDashboard(db);
      } else {
        alert('Usuário ou senha inválidos.');
        pass.select();
      }
    });

    bootSession();
  }

  APP.login = { bindLogin };
})();
