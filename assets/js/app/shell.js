(function(){
  window.APP = window.APP || {};

  function renderShell(){
    const IS_MOBILE = APP.state.IS_MOBILE;
    const loginView = qs('#view-login');
    const dashView = qs('#view-dashboard');
    if (loginView) loginView.innerHTML = IS_MOBILE && tpl.loginMobile ? tpl.loginMobile() : tpl.login();
    if (dashView){
      dashView.style.display = 'none';
      dashView.innerHTML = IS_MOBILE && tpl.dashboardMobile ? tpl.dashboardMobile() : tpl.dashboard();
    }
    document.body.classList.toggle('is-mobile', IS_MOBILE);
  }

  APP.shell = { renderShell };
})();
