// Escapa texto digitado pelo usuário antes de colocar no HTML.
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

export const NOME_MAX = 24;
export const limparNome = (s) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, NOME_MAX);
