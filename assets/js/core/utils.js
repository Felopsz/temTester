export function qs(s, r=document){ return r.querySelector(s); }
export function qsa(s, r=document){ return Array.from(r.querySelectorAll(s)); }
export function fmtDate(d){
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
export function cssVar(v){
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
}
