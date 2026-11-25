import { TREINOS, AQUECIMENTO, ALONGAMENTO } from '../dados/treinos.js';
import { EXERCICIOS, nivelAtual } from '../dados/exercicios.js';
import { getEstado } from '../storage.js';
import { semanaDoPlano, treinoDoDia, tempos, sequencias, resumoMes, anoFinal } from '../plano.js';
import { abrirDia } from './calendario.js';
import { hoje, iso, deISO, dataLonga, dataCurta } from '../datas.js';
import { desbloquearSom } from '../som.js';
import { abrirTimer } from './timer.js';
import { abrirExercicio } from './exercicio.js';

function listaExercicios(ids, niveis) {
  return `<ul class="lista-ex">${ids.map((id) => {
    const nv = nivelAtual(id, niveis);
    return `<li><button data-ex="${id}"><span>${EXERCICIOS[id].nome}</span><span class="nivel">${nv ? nv.nome : ''}</span></button></li>`;
  }).join('')}</ul>`;
}

export function telaHoje(main) {
  const est = getEstado();
  const d = hoje();
  const sem = semanaDoPlano(d, est.inicio);
  const t = tempos(sem);
  const idHoje = treinoDoDia(d, est);
  const stHoje = est.dias[iso(d)]?.status;
  const feitoHoje = stHoje === 'feito';
  const seq = sequencias(est);
  const mes = resumoMes(est, d.getFullYear(), d.getMonth());
  const ROTULO = { feito: '✔ Feito hoje', pulado: '✖ Pulado hoje', descanso: '☾ Trocado por descanso' };

  let destaque;
  if (!idHoje) {
    const antes = d < deISO(est.inicio);
    destaque = `<section class="card destaque"><span class="etiqueta">${antes ? 'Aguardando' : 'Plano encerrado'}</span>
      <h1>${antes ? `Plano começa em ${dataCurta(deISO(est.inicio))}` : `Plano terminou em 31/12/${anoFinal(est)}`}</h1>
      <p class="sub">${antes ? 'Mude a data de início em Ajustes' : 'Estenda o plano no Calendário'}, ou faça qualquer treino abaixo.</p></section>`;
  } else {
    const tr = TREINOS[idHoje];
    destaque = `<section class="card destaque" style="--cor: var(--${idHoje})">
      <span class="etiqueta">Treino de hoje</span>
      <h1>${tr.nome}</h1>
      <p class="sub">${tr.subtitulo}</p>
      ${stHoje ? `<span class="status-hoje st-${stHoje}">${ROTULO[stHoje]}</span>` : ''}
      ${listaExercicios(tr.exercicios, est.niveis)}
      <button class="btn principal" data-iniciar="${idHoje}">▶ ${feitoHoje ? 'TREINAR DE NOVO' : 'INICIAR'}</button>
      <button class="btn" data-marcar="${iso(d)}">Marcar dia…</button>
    </section>`;
  }

  const outros = Object.values(TREINOS).filter((tr) => tr.id !== idHoje).map((tr) => `
    <section class="card" style="--cor: var(--${tr.id})">
      <h2>${tr.nome}</h2>
      <p class="sub">${tr.subtitulo}</p>
      ${listaExercicios(tr.exercicios, est.niveis)}
      <button class="btn secundario" data-iniciar="${tr.id}">▶ Iniciar ${tr.nome}</button>
    </section>`).join('');

  main.innerHTML = `
    <header class="cabecalho">
      <div class="data">${dataLonga(d)}</div>
      <div class="info">Semana ${sem} do plano · ${t.esforco}s esforço / ${t.pausa}s pausa</div>
      <div class="stats-linha">
        <span>🔥 <strong>${seq.atual}</strong> ${seq.atual === 1 ? 'dia seguido' : 'dias seguidos'}</span>
        <span>Mês: <strong>${mes.pct}%</strong> (${mes.feitos}/${mes.total})</span>
      </div>
    </header>
    ${destaque}
    <h2 class="secao">Outros treinos</h2>
    ${outros}
    <h2 class="secao">Todo treino inclui</h2>
    <section class="card" style="--cor: var(--aquecimento)">
      <h2>Aquecimento · 2 min</h2>
      ${listaExercicios(AQUECIMENTO.exercicios, est.niveis)}
    </section>
    <section class="card" style="--cor: var(--alongamento)">
      <h2>Alongamento · 1 min</h2>
      ${listaExercicios(ALONGAMENTO.exercicios, est.niveis)}
    </section>`;

  main.onclick = (e) => {
    const ex = e.target.closest('[data-ex]')?.dataset.ex;
    if (ex) return abrirExercicio(ex, { aoFechar: () => telaHoje(main) });
    const dia = e.target.closest('[data-marcar]')?.dataset.marcar;
    if (dia) return abrirDia(dia, () => telaHoje(main));
    const ini = e.target.closest('[data-iniciar]')?.dataset.iniciar;
    if (ini) {
      desbloquearSom(); // precisa acontecer dentro do toque
      abrirTimer(ini, { aoFechar: () => telaHoje(main) });
    }
  };
}
