(function(){
  // Namespace global da aplicação
  window.APP = window.APP || {};

  const state = {
    adminMenuOpen: false,
    IS_MOBILE: false
  };

  function detectMobile(){
    const params = new URLSearchParams(location.search);
    const force = params.get('mobile') ?? localStorage.getItem('forceMobile');
    if (force === '1') return true;
    if (force === '0') return false;
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const isNarrow = window.matchMedia('(max-width: 900px)').matches;
    return isTouch && isNarrow;
  }

  function applyIsMobile(){
    state.IS_MOBILE = detectMobile();
    document.body.classList.toggle('is-mobile', state.IS_MOBILE);
  }

  APP.state = state;
  APP.detectMobile = detectMobile;
  APP.applyIsMobile = applyIsMobile;
})();
