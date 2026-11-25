import { TREINOS } from '../dados/treinos.js';
import { getEstado, atualizar } from '../storage.js';
import { treinoDoDia, statusDoDia, sequencias, resumoMes, anoFinal, fimDoPlano } from '../plano.js';
import { hoje, iso, deISO, dataLonga } from '../datas.js';
import { desbloquearSom } from '../som.js';
import { abrirTimer } from './timer.js';
import { registrosDoDia, totalReps, apagarRegistrosDoDia } from '../registros.js';
import { confirmar, perguntar } from '../dialogo.js';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const STATUS = {
  feito: { icone: '✔', texto: 'Feito' },
  pulado: { icone: '✖', texto: 'Pulado' },
  descanso: { icone: '☾', texto: 'Trocado por descanso' },
};

let mesVisivel = null; // { ano, mes }

export function telaCalendario(main) {
  const est = getEstado();
  const h = hoje();
  mesVisivel ??= { ano: h.getFullYear(), mes: h.getMonth() };
  const { ano, mes } = mesVisivel;

  const ini = deISO(est.inicio);
  const fim = fimDoPlano(est);
  const podeVoltar = new Date(ano, mes, 1) > new Date(ini.getFullYear(), ini.getMonth(), 1);
  const podeAvancar = new Date(ano, mes + 1, 1) <= fim;

  const seq = sequencias(est);
  const res = resumoMes(est, ano, mes);

  // Células: começa na segunda-feira.
  const primeiro = new Date(ano, mes, 1);
  const vazios = (primeiro.getDay() + 6) % 7;
  const celulas = [];
  for (let k = 0; k < vazios; k++) celulas.push('<div class="dia vazio"></div>');
  for (const d = new Date(primeiro); d.getMonth() === mes; d.setDate(d.getDate() + 1)) {
    const plan = treinoDoDia(d, est);
    const st = statusDoDia(est, d);
    const passado = d < h;
    const classes = ['dia'];
    if (!plan) classes.push('fora');
    if (st) classes.push(`st-${st}`);
    else if (plan && passado && plan !== 'D') classes.push('sem-registro');
    if (d.getTime() === h.getTime()) classes.push('hoje');
    const letra = st === 'descanso' ? '☾' : plan ?? '';
    celulas.push(`
      <button class="${classes.join(' ')}" ${plan ? `data-dia="${iso(d)}"` : 'disabled'} style="--cor: var(--${plan ?? 'D'})">
        <span class="num">${d.getDate()}</span>
        <span class="letra">${letra}</span>
        ${st && st !== 'descanso' ? `<span class="marca">${STATUS[st].icone}</span>` : ''}
      </button>`);
  }

  main.innerHTML = `
    <header class="cabecalho"><div class="data">Calendário</div></header>

    <div class="stats">
      <div><strong>${seq.atual}</strong><span>dias seguidos</span></div>
      <div><strong>${seq.melhor}</strong><span>melhor sequência</span></div>
      <div><strong>${res.pct}%</strong><span>${res.feitos} de ${res.total} no mês</span></div>
    </div>

    <div class="nav-mes">
      <button data-acao="ant" ${podeVoltar ? '' : 'disabled'} aria-label="Mês anterior">‹</button>
      <h2>${MESES[mes]} ${ano}</h2>
      <button data-acao="prox" ${podeAvancar ? '' : 'disabled'} aria-label="Próximo mês">›</button>
    </div>

    <div class="grade-cal">
      ${['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((s) => `<div class="dsem">${s}</div>`).join('')}
      ${celulas.join('')}
    </div>

    <div class="legenda">
      <span><i class="l-A"></i>A</span><span><i class="l-B"></i>B</span><span><i class="l-C"></i>C</span><span><i class="l-D"></i>Descanso</span>
      <span>✔ feito</span><span>✖ pulado</span><span>☾ trocado</span>
    </div>

    <section class="card">
      <h2>Plano até 31/12/${anoFinal(est)}</h2>
      <p class="nota">Início em ${dataLonga(ini)}. Os treinos continuam alternando semanas ímpares e pares.</p>
      <button class="btn secundario" data-acao="estender">+ Estender até 31/12/${anoFinal(est) + 1}</button>
    </section>`;

  main.onclick = (e) => {
    const alvo = e.target.closest('[data-acao], [data-dia]');
    if (!alvo) return;
    const acao = alvo.dataset.acao;
    if (acao === 'ant' || acao === 'prox') {
      const d = new Date(ano, mes + (acao === 'prox' ? 1 : -1), 1);
      mesVisivel = { ano: d.getFullYear(), mes: d.getMonth() };
      telaCalendario(main);
    } else if (acao === 'estender') {
      atualizar((s) => { s.fimAno = anoFinal(s) + 1; });
      telaCalendario(main);
    } else if (alvo.dataset.dia) {
      abrirDia(alvo.dataset.dia, () => telaCalendario(main));
    }
  };
}

// Folha inferior para mudar o status de um dia.
export function abrirDia(diaISO, aoMudar) {
  const est = getEstado();
  const d = deISO(diaISO);
  const plan = treinoDoDia(d, est);
  const tr = TREINOS[plan];
  const st = statusDoDia(est, d);
  const futuro = d > hoje();
  const ehHoje = diaISO === iso(hoje());
  const regs = registrosDoDia(est, diaISO);

  const fundo = document.createElement('div');
  fundo.className = 'folha-fundo';
  fundo.innerHTML = `
    <div class="folha" style="--cor: var(--${plan})">
      <div class="puxador"></div>
      <div class="nota">${dataLonga(d)}</div>
      <h2>${tr.nome}</h2>
      <p class="sub">${tr.subtitulo}${st ? ` · <strong>${STATUS[st].texto}</strong>` : ''}</p>
      ${ehHoje ? `<button class="btn principal" data-st="iniciar">▶ Iniciar treino</button>` : ''}
      <div class="opcoes">
        <button class="op ok ${st === 'feito' ? 'sel' : ''}" data-st="feito" ${futuro ? 'disabled' : ''}>✔ Feito</button>
        <button class="op ruim ${st === 'pulado' ? 'sel' : ''}" data-st="pulado" ${futuro ? 'disabled' : ''}>✖ Pulado</button>
        ${plan !== 'D' ? `<button class="op ${st === 'descanso' ? 'sel' : ''}" data-st="descanso">☾ Trocar por descanso</button>` : ''}
        ${st ? `<button class="op" data-st="limpar">↺ Limpar</button>` : ''}
      </div>
      ${futuro ? '<p class="nota">Dias futuros só podem ser trocados por descanso.</p>' : ''}
      ${regs.length ? `
        <p class="nota">Repetições registradas neste dia: ${regs.length === 1 ? '1 treino' : `${regs.length} treinos`} (${regs.reduce((s, r) => s + totalReps(r), 0)} reps).</p>
        <button class="btn perigo-contorno" data-st="apagar-reps">🗑 Apagar repetições deste dia</button>` : ''}
      <button class="btn" data-st="fechar">Fechar</button>
    </div>`;
  document.body.append(fundo);

  fundo.addEventListener('click', async (e) => {
    if (e.target === fundo) return fundo.remove();
    const v = e.target.closest('[data-st]')?.dataset.st;
    if (!v) return;
    fundo.remove();
    if (v === 'fechar') return;
    if (v === 'iniciar') {
      desbloquearSom();
      return abrirTimer(plan, { aoFechar: aoMudar });
    }
    let apagarReps = false;
    if (v === 'apagar-reps') {
      apagarReps = await confirmar('Apagar as repetições deste dia?',
        'Elas saem do histórico e dos gráficos. Não dá para desfazer.', { sim: 'Apagar', perigo: true });
      if (!apagarReps) return;
    } else if (regs.length && (v === 'limpar' || v === 'pulado' || v === 'descanso')) {
      // Dia limpo/pulado mas com repetições registradas: pergunta o que fazer com elas.
      const r = await perguntar({
        titulo: 'Apagar também as repetições?',
        texto: 'Este dia tem repetições registradas, que aparecem nos gráficos do Progresso.',
        opcoes: [
          { rotulo: 'Apagar as repetições também', valor: 'sim', tipo: 'perigo' },
          { rotulo: 'Manter as repetições', valor: 'nao' },
        ],
      });
      if (r === null) return;
      apagarReps = r === 'sim';
    }
    atualizar((s) => {
      if (v === 'limpar') delete s.dias[diaISO];
      else if (v !== 'apagar-reps') s.dias[diaISO] = { status: v, treino: plan };
      if (apagarReps) apagarRegistrosDoDia(s, diaISO);
    });
    aoMudar?.();
  });
}
