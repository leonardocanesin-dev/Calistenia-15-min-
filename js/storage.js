import { iso, hoje } from './datas.js';
import { VERSAO_APP } from './versao.js';

const CHAVE = 'calistenia.v1';
const CHAVE_COPIA = 'calistenia.v1.antes-da-atualizacao';

const padrao = () => ({
  versao: 1,
  nome: '',        // usado na saudação ("Boa tarde, Leo!"); vazio = genérico
  inicio: iso(hoje()),
  fimAno: hoje().getFullYear(),  // plano vai até 31/12 deste ano (pode estender)
  niveis: {},      // { exercicioId: índice do nível }
  dias: {},        // { 'AAAA-MM-DD': { status: 'feito'|'pulado'|'descanso', treino } }
  registros: [],   // [{ id, data, treino, esforco, series: { exId: { nivel, valores: [..] } } }]
  dispensas: {},   // { exId: id do registro } — sugestão de subir nível dispensada
  trocas: {},      // { 'AAAA-MM-DD': 'A'|'B'|'C'|'D' } — treino trocado à mão (os seguintes são adiados)
  mobilidade: [],  // ['AAAA-MM-DD', ...] — dias em que fez Movimentação e Flexibilidade
});

// ---------- Backup ----------
export function exportarJSON() {
  return JSON.stringify({ app: 'calistenia', exportadoEm: new Date().toISOString(), ...getEstado() }, null, 2);
}

// Valida e substitui todos os dados. Lança erro com mensagem amigável se o arquivo for inválido.
export function importarJSON(texto) {
  let d;
  try { d = JSON.parse(texto); } catch { throw new Error('O arquivo não é um JSON válido.'); }
  const ok = d && typeof d === 'object' && typeof d.inicio === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.inicio)
    && typeof d.dias === 'object' && Array.isArray(d.registros);
  if (!ok) throw new Error('Esse arquivo não parece ser um backup deste app.');
  const { app, exportadoEm, ...dados } = d;
  estado = migrar({ ...padrao(), ...dados, versaoApp: VERSAO_APP });
  salvar();
  return estado;
}

let estado = null;
let atualizacao = null;

// REGRAS PARA ATUALIZAÇÕES NÃO APAGAREM DADOS:
// 1. Nunca renomeie a CHAVE acima.
// 2. Campo novo? Basta colocar um valor padrão em padrao() — dados antigos ganham o campo sozinhos.
// 3. Mudou o formato de algo que já existe? Aumente `versao` em padrao() e converta aqui em migrar().
function migrar(d) {
  // Exemplo futuro: if ((d.versao ?? 1) < 2) { ...converter...; d.versao = 2; }
  return d;
}

export function carregar() {
  const bruto = localStorage.getItem(CHAVE);
  let salvo = {};
  if (bruto) {
    try {
      salvo = JSON.parse(bruto);
    } catch {
      // Nunca sobrescreve dados ilegíveis: guarda uma cópia antes de recomeçar.
      try { localStorage.setItem(`${CHAVE}.ilegivel-${Date.now()}`, bruto); } catch {}
      salvo = {};
    }
  }
  estado = migrar({ ...padrao(), ...salvo });

  // App foi atualizado desde a última abertura: guarda uma cópia automática dos dados de antes.
  if (bruto && salvo.versaoApp !== VERSAO_APP) {
    try {
      localStorage.setItem(CHAVE_COPIA, JSON.stringify({ deVersao: salvo.versaoApp ?? 'anterior', em: new Date().toISOString(), dados: bruto }));
    } catch {}
    atualizacao = { de: salvo.versaoApp ?? null, para: VERSAO_APP };
  }
  if (estado.versaoApp !== VERSAO_APP) {
    estado.versaoApp = VERSAO_APP;
    salvar();
  }
  return estado;
}

// Informação "o app acabou de ser atualizado" (aparece uma vez no Início).
export function consumirAtualizacao() {
  const a = atualizacao;
  atualizacao = null;
  return a;
}

// ---------- Cópia automática de antes da última atualização ----------
export function copiaAutomatica() {
  try {
    const c = JSON.parse(localStorage.getItem(CHAVE_COPIA) || 'null');
    if (!c?.dados) return null;
    const d = JSON.parse(c.dados);
    return { deVersao: c.deVersao, em: c.em, treinos: d.registros?.length ?? 0, dias: Object.keys(d.dias ?? {}).length, dados: c.dados };
  } catch {
    return null;
  }
}

export function restaurarCopiaAutomatica() {
  const c = copiaAutomatica();
  if (!c) throw new Error('Não há cópia automática neste aparelho.');
  return importarJSON(c.dados);
}

export function getEstado() {
  return estado ?? carregar();
}

export function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch (e) {
    console.warn('Não foi possível salvar', e);
  }
}

export function atualizar(fn) {
  fn(getEstado());
  salvar();
}

// Pede ao navegador para não apagar os dados em caso de pouco espaço.
navigator.storage?.persist?.().catch(() => {});
