// Pequenos utilitários globais (só se ainda não existirem)
(function(w, d){
  w.qs  = w.qs  || function(sel, root){ return (root||d).querySelector(sel); };
  w.qsa = w.qsa || function(sel, root){ return Array.from((root||d).querySelectorAll(sel)); };
  w.fmtDate = w.fmtDate || function(v){
    const dt = new Date(v);
    return isNaN(dt) ? '—' : dt.toLocaleDateString('pt-BR');
  };
})(window, document);
