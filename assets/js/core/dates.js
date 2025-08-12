export function parseDateLocal(str){
  if (!str) return new Date(NaN);
  if (typeof str === 'string' && str.length <= 10){
    const [y,m,d] = str.split('-').map(Number);
    return new Date(y, m-1, d, 23, 59, 59);
  }
  return new Date(str);
}

export function parseDateSmart(v){
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);
  const s = String(v).trim();
  const iso = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[ T].*)?$/);
  if (iso){
    const y = +iso[1], m = +iso[2]-1, d = +iso[3];
    return new Date(y, m, d);
  }
  const br = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (br){
    const d = +br[1], m = +br[2]-1, y = +br[3];
    return new Date(y, m, d);
  }
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
}

export function computeDeadlinePct(startDate, endDate, now = new Date()){
  const a = parseDateSmart(startDate);
  const b = parseDateSmart(endDate);
  if (!a || !b) return 0;
  const total = b.getTime() - a.getTime();
  if (total <= 0){
    return now > b ? 200 : 0;
  }
  const elapsed = now.getTime() - a.getTime();
  const pct = (elapsed / total) * 100;
  return Math.max(0, pct);
}
