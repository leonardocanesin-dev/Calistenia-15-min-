// Tela Início: resumo rápido + atalhos para todas as telas.
import { TREINOS } from '../dados/treinos.js';
import { getEstado, consumirAtualizacao } from '../storage.js';
import { semanaDoPlano, treinoDoDia, tempos, sequencias, resumoMes, anoFinal, statusDoDia } from '../plano.js';
import { hoje, iso, deISO, dataLonga, dataCurta, segundaDaSemana } from '../datas.js';
import { exerciciosDoCircuito, sugestao, totalReps } from '../registros.js';
import { desbloquearSom } from '../som.js';
import { abrirTimer } from './timer.js';
import { abrirDia } from './calendario.js';
import { esc } from '../texto.js';

const SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MARCA = { feito: '✔', pulado: '✖', descanso: '☾' };

// "Boa tarde, Leo!" ou só "Boa tarde!" quando não há nome em Ajustes.
export function saudacao(nome) {
  const h = new Date().getHours();
  const s = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  return nome ? `${s}, ${nome}!` : `${s}!`;
}

export function telaInicio(main) {
  const est = getEstado();
  const d = hoje();
  const sem = semanaDoPlano(d, est.inicio);
  const t = tempos(sem);
  const idHoje = treinoDoDia(d, est);
  const stHoje = statusDoDia(est, d);
  const seq = sequencias(est);
  const mes = resumoMes(est, d.getFullYear(), d.getMonth(), { ateHoje: true });
  const feitos = Object.values(est.dias).filter((x) => x.status === 'feito').length;
  const sugestoes = exerciciosDoCircuito().map((id) => sugestao(est, id)).filter(Boolean);
  const totalRegs = est.registros.reduce((s, r) => s + totalReps(r), 0);
  const ultimoReg = [...est.registros].sort((a, b) => (a.data < b.data ? 1 : -1))[0];

  // ---------- Destaque de hoje ----------
  let destaque;
  if (!idHoje) {
    const antes = d < deISO(est.inicio);
    destaque = `<section class="card destaque">
      <span class="etiqueta">${antes ? 'Aguardando' : 'Plano encerrado'}</span>
      <h1>${antes ? `Começa em ${dataCurta(deISO(est.inicio))}` : `Terminou em 31/12/${anoFinal(est)}`}</h1>
      <a class="btn secundario" href="${antes ? '#/ajustes' : '#/calendario'}">${antes ? 'Mudar data de início' : 'Estender o plano'}</a>
    </section>`;
  } else {
    const tr = TREINOS[idHoje];
    const rotulo = { feito: '✔ Feito hoje', pulado: '✖ Pulado hoje', descanso: '☾ Trocado por descanso' }[stHoje];
    destaque = `<section class="card destaque" style="--cor: var(--${idHoje})">
      <span class="etiqueta">Treino de hoje</span>
      <h1>${tr.nome}</h1>
      <p class="sub">${tr.subtitulo}${idHoje === 'D' ? ' · 15 min' : ` · ${t.esforco}s esforço / ${t.pausa}s pausa`}</p>
      ${rotulo ? `<span class="status-hoje st-${stHoje}">${rotulo}</span>` : ''}
      <button class="btn ${stHoje === 'feito' ? 'secundario' : 'principal'}" data-iniciar="${idHoje}">▶ ${stHoje === 'feito' ? 'Treinar de novo' : 'INICIAR'}</button>
    </section>`;
  }

  // ---------- Esta semana ----------
  const seg = segundaDaSemana(d);
  const dias = SEMANA.map((nome, i) => {
    const dia = new Date(seg);
    dia.setDate(seg.getDate() + i);
    const plan = treinoDoDia(dia, est);
    const st = statusDoDia(est, dia);
    const ehHoje = dia.getTime() === d.getTime();
    return `<button class="dia-sem ${st ? `st-${st}` : ''} ${ehHoje ? 'hoje' : ''} ${!plan ? 'fora' : ''}"
        ${plan ? `data-dia="${iso(dia)}"` : 'disabled'} style="--cor: var(--${plan ?? 'D'})"
        aria-label="${nome}: ${plan ? TREINOS[plan].nome : 'fora do plano'}${st ? `, ${st}` : ''}">
      <small>${nome}</small>
      <strong>${st === 'descanso' ? '☾' : plan ?? '–'}</strong>
      <span class="m">${st && st !== 'descanso' ? MARCA[st] : ''}</span>
    </button>`;
  }).join('');

  // ---------- Atalhos ----------
  const atalho = (href, icone, titulo, sub, cor) => `
    <a class="atalho" href="${href}" style="--cor: ${cor}">
      <span class="ic">${icone}</span><strong>${titulo}</strong><small>${sub}</small>
    </a>`;
  const backup = est.ultimoBackup ? `Último backup ${dataCurta(deISO(est.ultimoBackup))}` : 'Nenhum backup ainda';

  const atualizou = consumirAtualizacao();
  const avisoAtualizacao = atualizou ? `
    <div class="aviso-atualizado" role="status">
      <strong>✔ App atualizado</strong> para a versão ${atualizou.para}.
      Seus dados foram mantidos${est.registros.length ? ` (${est.registros.length} ${est.registros.length === 1 ? 'treino registrado' : 'treinos registrados'})` : ''}.
    </div>` : '';

  main.innerHTML = `
    ${avisoAtualizacao}
    <header class="cabecalho">
      <div class="data">${esc(saudacao(est.nome))}</div>
      <div class="info">${dataLonga(d)} · Semana ${sem} do plano</div>
    </header>

    ${destaque}

    <div class="stats">
      <div><strong>🔥 ${seq.atual}</strong><span>${seq.atual === 1 ? 'dia seguido' : 'dias seguidos'}</span></div>
      <div><strong>${mes.total ? `${mes.pct}%` : '–'}</strong><span>${mes.total ? `do mês (${mes.feitos}/${mes.total})` : 'do mês · conta a partir do 1º treino'}</span></div>
      <div><strong>${feitos}</strong><span>treinos feitos</span></div>
    </div>

    <h2 class="secao">Esta semana</h2>
    <div class="semana-tira">${dias}</div>

    ${sugestoes.length ? `
      <a class="aviso-subir" href="#/progresso">
        <strong>⬆ ${sugestoes.length === 1 ? `${sugestoes[0].nome} pronto` : `${sugestoes.length} exercícios prontos`} para subir de nível</strong>
        <span>Ver no Progresso ›</span>
      </a>` : ''}

    <h2 class="secao">Atalhos</h2>
    <nav class="atalhos">
      ${atalho('#/hoje', '▶&#xFE0E;', 'Treinos', idHoje && idHoje !== 'D' ? `Hoje: ${TREINOS[idHoje].nome}` : 'A, B, C e descanso', 'var(--A)')}
      ${atalho('#/calendario', '▦', 'Calendário', mes.total ? `${mes.feitos} de ${mes.total} no mês` : 'Seu mês aparece aqui', 'var(--B)')}
      ${atalho('#/progresso', '↗', 'Progresso', ultimoReg ? `${totalRegs} reps · último ${dataCurta(deISO(ultimoReg.data))}` : 'Gráficos e níveis', 'var(--C)')}
      ${atalho('#/ajustes', '⚙', 'Ajustes', backup, 'var(--alongamento)')}
    </nav>

    <p class="nota rodape">Plano até 31/12/${anoFinal(est)} · melhor sequência: ${seq.melhor} ${seq.melhor === 1 ? 'dia' : 'dias'}</p>`;

  main.onclick = (e) => {
    const ini = e.target.closest('[data-iniciar]')?.dataset.iniciar;
    if (ini) {
      desbloquearSom();
      return abrirTimer(ini, { aoFechar: () => telaInicio(main) });
    }
    const dia = e.target.closest('[data-dia]')?.dataset.dia;
    if (dia) abrirDia(dia, () => telaInicio(main));
  };
}
