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

// 'A' | 'B' | 'C' | 'D', ou null se a data está fora do plano.
export function treinoDoDia(data, est) {
  if (data < deISO(est.inicio) || data > fimDoPlano(est)) return null;
  const sem = semanaDoPlano(data, est.inicio);
  return (sem % 2 ? SEMANA_IMPAR : SEMANA_PAR)[data.getDay()];
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

// Conclusão do mês: treinos feitos ÷ treinos planejados no mês inteiro
// (dias trocados por descanso saem da conta).
export function resumoMes(est, ano, mes) {
  let feitos = 0;
  let total = 0;
  const d = new Date(ano, mes, 1);
  for (; d.getMonth() === mes; d.setDate(d.getDate() + 1)) {
    if (!treinoDoDia(d, est)) continue;
    const st = statusDoDia(est, d);
    if (st === 'descanso') continue;
    total++;
    if (st === 'feito') feitos++;
  }
  return { feitos, total, pct: total ? Math.round((100 * feitos) / total) : 0 };
}
