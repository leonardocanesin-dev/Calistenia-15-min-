import { deISO, iso, hoje, segundaDaSemana, diasEntre } from './datas.js';

// Índice = getDay() (0 = domingo). D = descanso ativo.
const SEMANA_IMPAR = ['D', 'A', 'C', 'B', 'C', 'A', 'B'];
const SEMANA_PAR   = ['D', 'B', 'C', 'A', 'C', 'B', 'A'];

// Ano final do plano: o plano vai até 31/12 deste ano.
export function anoFinal(est) {
  return Math.max(est.fimAno ?? 0, deISO(est.inicio).getFullYear());
}
export const fimDoPlano = (est) => new Date(anoFinal(est), 11, 31);

// Semana 1 = a semana (seg–dom) que contém a data de início.
export function semanaDoPlano(data, inicioISO) {
  const s0 = segundaDaSemana(deISO(inicioISO));
  return Math.max(1, Math.floor(diasEntre(s0, segundaDaSemana(data)) / 7) + 1);
}

// Ordem dos treinos de seg a sáb: semana ímpar + semana par, repetindo.
const ORDEM = [...SEMANA_IMPAR.slice(1), ...SEMANA_PAR.slice(1)];

// Agenda do plano inteiro: { 'AAAA-MM-DD': 'A'|'B'|'C'|'D' }.
// Os treinos seguem a ORDEM, um por dia de seg a sáb; domingo é sempre descanso ativo (D).
// Um dia trocado por descanso, ou trocado à mão para outro treino (est.trocas), não "gasta"
// o treino previsto: ele passa para o próximo dia e todos os seguintes andam junto.
// Dia pulado (✖) gasta o treino normalmente.
let cache = { chave: null, agenda: null };
export function agenda(est, { ignorarTroca } = {}) {
  const trocas = { ...(est.trocas ?? {}) };
  if (ignorarTroca) delete trocas[ignorarTroca];
  const descansos = Object.keys(est.dias).filter((k) => est.dias[k]?.status === 'descanso').sort();
  const chave = `${est.inicio}|${anoFinal(est)}|${JSON.stringify(trocas)}|${descansos.join(',')}`;
  if (cache.chave === chave) return cache.agenda;

  const mapa = {};
  const fim = fimDoPlano(est);
  // Começa na posição do dia da semana do início (início numa quarta = 3º treino da semana 1),
  // assim, sem trocas, a agenda é igual à tabela de semanas ímpares/pares.
  let k = (deISO(est.inicio).getDay() + 6) % 7;
  for (const d = deISO(est.inicio); d <= fim; d.setDate(d.getDate() + 1)) {
    const dia = iso(d);
    if (d.getDay() === 0) { mapa[dia] = 'D'; continue; }
    if (trocas[dia]) { mapa[dia] = trocas[dia]; continue; }
    mapa[dia] = ORDEM[k % ORDEM.length];
    if (est.dias[dia]?.status !== 'descanso') k++;
  }
  cache = { chave, agenda: mapa };
  return mapa;
}

// 'A' | 'B' | 'C' | 'D', ou null se a data está fora do plano.
// Num dia trocado por descanso, devolve o treino que foi adiado (mostrado como ☾).
export function treinoDoDia(data, est) {
  if (data < deISO(est.inicio) || data > fimDoPlano(est)) return null;
  return agenda(est)[iso(data)] ?? null;
}

// Treino que o dia teria sem a troca manual dele (para saber se a troca é "voltar ao plano").
export const treinoSemTroca = (data, est) => agenda(est, { ignorarTroca: iso(data) })[iso(data)] ?? null;

// Troca manual do treino de um dia. Escolher o mesmo do plano desfaz a troca.
export function trocarTreino(est, dataISO, treino) {
  est.trocas ??= {};
  delete est.trocas[dataISO];
  if (treino && treinoSemTroca(deISO(dataISO), est) !== treino) est.trocas[dataISO] = treino;
}

export function tempos(semana) {
  return semana <= 2 ? { esforco: 30, pausa: 30 } : { esforco: 40, pausa: 20 };
}

export const statusDoDia = (est, data) => est.dias[iso(data)]?.status ?? null;

// Sequência de dias treinados.
// Conta +1 por dia "feito". Domingo de descanso não feito, dia trocado por descanso
// e o dia de hoje ainda sem registro NÃO quebram a sequência.
// Quebram: dia "pulado" ou dia de treino que já passou sem registro.
export function sequencias(est) {
  const d = deISO(est.inicio);
  const fim = hoje();
  let atual = 0;
  let melhor = 0;
  for (; d <= fim; d.setDate(d.getDate() + 1)) {
    const st = statusDoDia(est, d);
    const plan = treinoDoDia(d, est);
    const ehHoje = d.getTime() === fim.getTime();
    if (st === 'feito') atual++;
    else if (st === 'pulado') atual = 0;
    else if (st === 'descanso' || plan === 'D' || plan === null || ehHoje) { /* neutro */ }
    else atual = 0;
    melhor = Math.max(melhor, atual);
  }
  return { atual, melhor };
}

// Treinos (A/B/C) da semana seg–dom que contém `data`: quantos feitos, quantos previstos
// (dias trocados por descanso saem da conta) e quantos ainda faltam a partir de hoje.
export function resumoSemana(est, data = hoje()) {
  const seg = segundaDaSemana(data);
  const hj = hoje();
  let feitos = 0, total = 0, faltam = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(seg);
    d.setDate(seg.getDate() + i);
    const plan = treinoDoDia(d, est);
    if (!plan || plan === 'D') continue;
    const st = statusDoDia(est, d);
    if (st === 'descanso') continue;
    total++;
    if (st === 'feito') feitos++;
    else if (d >= hj && st !== 'pulado') faltam++;
  }
  return { feitos, total, faltam };
}

// Conclusão do mês: treinos feitos ÷ treinos planejados no mês inteiro
// (dias trocados por descanso saem da conta).
// Com { ateHoje: true }: só os treinos A/B/C até hoje (hoje entra só se já foi feito),
// para o número não começar o mês lá embaixo por causa dos dias que ainda não chegaram.
export function resumoMes(est, ano, mes, { ateHoje = false } = {}) {
  let feitos = 0;
  let total = 0;
  const hj = hoje();
  const d = new Date(ano, mes, 1);
  for (; d.getMonth() === mes; d.setDate(d.getDate() + 1)) {
    const plan = treinoDoDia(d, est);
    if (!plan) continue;
    const st = statusDoDia(est, d);
    if (st === 'descanso') continue;
    if (ateHoje && (plan === 'D' || d > hj || (d.getTime() === hj.getTime() && st !== 'feito'))) continue;
    total++;
    if (st === 'feito') feitos++;
  }
  return { feitos, total, pct: total ? Math.round((100 * feitos) / total) : 0 };
}
