(function(){
  window.APP = window.APP || {};

  function isTV(){
    return document.body.classList.contains('tv-mode');
  }

  const sizeContentForTV = () => {
    const top = document.querySelector('.top.panel');
    const content = document.getElementById('dashboardContent');
    if (!top || !content) return;
    content.style.height = (window.innerHeight - top.offsetHeight) + 'px';
  };

  function rerender(){
    if (window.APP && APP.UI){
      try{
        APP.UI.renderTickets();
        APP.UI.renderProjects();
        APP.UI.updateProjectArrows();
      }catch(e){
        // silencia se UI ainda não estiver pronta
      }
    }
  }

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
    rerender();
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
      rerender();
    });
  });

  APP.tv = { isTV, sizeContentForTV, toggleTVMode };
})();
