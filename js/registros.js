// Registro de repetições/segundos e regra de progressão.
import { EXERCICIOS, nivelAtual } from './dados/exercicios.js';
import { TREINOS } from './dados/treinos.js';

export const VOLTAS_PARA_SUBIR = 3;
export const SESSOES_PARA_SUBIR = 2;

// Meta de repetições por volta: 15 em blocos de 40s (12 nos blocos de 30s, proporcional).
export const metaReps = (esforco) => (esforco >= 40 ? 15 : 12);

export const exerciciosDoCircuito = () =>
  ['A', 'B', 'C'].flatMap((t) => TREINOS[t].exercicios);

// Histórico de um exercício, do mais antigo para o mais novo.
export function historico(est, exId) {
  return est.registros
    .filter((r) => r.series?.[exId]?.valores?.length)
    .map((r) => ({ id: r.id, data: r.data, esforco: r.esforco, ...r.series[exId] }))
    .sort((a, b) => (a.data === b.data ? a.id - b.id : a.data < b.data ? -1 : 1));
}

export function ultimoValor(est, exId) {
  const h = historico(est, exId);
  const v = h.at(-1)?.valores;
  return v?.length ? v.at(-1) : null;
}

// Uma sessão "bate a meta" se as 3 voltas atingiram 15 reps em 40s
// (12 em 30s), ou, nas isometrias, se segurou o tempo todo nas 3 voltas.
export function bateuMeta(exId, item) {
  const iso = !!EXERCICIOS[exId].isometria;
  const alvo = iso ? item.esforco : metaReps(item.esforco);
  return item.valores.length >= VOLTAS_PARA_SUBIR && item.valores.every((v) => v >= alvo);
}

// Sugere subir de nível após 2 sessões seguidas batendo a meta no nível atual.
export function sugestao(est, exId) {
  const nv = nivelAtual(exId, est.niveis);
  if (!nv || nv.indice >= nv.total - 1) return null;
  const doNivel = historico(est, exId).filter((h) => h.nivel === nv.indice);
  const ultimas = doNivel.slice(-SESSOES_PARA_SUBIR);
  if (ultimas.length < SESSOES_PARA_SUBIR || !ultimas.every((h) => bateuMeta(exId, h))) return null;
  if (est.dispensas?.[exId] === ultimas.at(-1).id) return null;
  return { exId, nome: EXERCICIOS[exId].nome, de: nv.nome, para: EXERCICIOS[exId].niveis[nv.indice + 1], novo: nv.indice + 1 };
}

export function subirNivel(est, s) {
  est.niveis[s.exId] = s.novo;
}

// ---------- Sessões registradas ----------
export const registrosDoDia = (est, dataISO) => est.registros.filter((r) => r.data === dataISO);

// Total de repetições de uma sessão (isometrias ficam de fora: são segundos).
export function totalReps(r) {
  return Object.entries(r.series)
    .filter(([id]) => !EXERCICIOS[id]?.isometria)
    .reduce((s, [, v]) => s + v.valores.reduce((a, b) => a + b, 0), 0);
}

export function apagarRegistro(est, id) {
  est.registros = est.registros.filter((r) => r.id !== id);
}

export function apagarRegistrosDoDia(est, dataISO) {
  est.registros = est.registros.filter((r) => r.data !== dataISO);
}

// Remove só um exercício de uma sessão (e a sessão, se ficar vazia).
export function apagarSerie(est, id, exId) {
  const r = est.registros.find((x) => x.id === id);
  if (!r) return;
  delete r.series[exId];
  if (!Object.keys(r.series).length) apagarRegistro(est, id);
}

// Apagando pelo Progresso: se o dia ficou sem nenhum registro, ele deixa de contar como "feito".
export function apagarComDia(est, id, exId = null) {
  const data = est.registros.find((r) => r.id === id)?.data;
  if (exId) apagarSerie(est, id, exId);
  else apagarRegistro(est, id);
  if (data && !registrosDoDia(est, data).length && est.dias[data]?.status === 'feito') delete est.dias[data];
}

export function dispensar(est, exId) {
  const ultimo = historico(est, exId).at(-1);
  est.dispensas ??= {};
  if (ultimo) est.dispensas[exId] = ultimo.id;
}
