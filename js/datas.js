// Datas sempre no fuso local, à meia-noite.
export function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function deISO(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function hoje() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
export function segundaDaSemana(d) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  return r;
}
export function diasEntre(a, b) {
  return Math.round((b - a) / 86400000);
}
const fmtLongo = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtCurto = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
export const dataLonga = (d) => { const s = fmtLongo.format(d); return s[0].toUpperCase() + s.slice(1); };
export const dataCurta = (d) => fmtCurto.format(d);
export function mmss(seg) {
  seg = Math.max(0, Math.ceil(seg));
  return `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`;
}
