// Funções utilitárias
function qs(s, r=document){return r.querySelector(s);}
function qsa(s, r=document){return Array.from(r.querySelectorAll(s));}
function fmtDate(d){return new Date(d).toLocaleString('pt-BR',{ day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });}
function cssVar(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}

window.qs = qs;
window.qsa = qsa;
window.fmtDate = fmtDate;
window.cssVar = cssVar;
