(function(){
  document.addEventListener('DOMContentLoaded', () => {
    APP.applyIsMobile();
    APP.shell.renderShell();
    APP.login.bindLogin();
  });
})();
