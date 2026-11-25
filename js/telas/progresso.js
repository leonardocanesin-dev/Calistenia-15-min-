// Tela Progresso: nível de cada exercício, sugestões de subir de nível e gráfico de evolução.
import { TREINOS } from '../dados/treinos.js';
import { EXERCICIOS, nivelAtual } from '../dados/exercicios.js';
import { getEstado, atualizar } from '../storage.js';
import { semanaDoPlano, tempos, resumoMes, resumoSemana, anoFinal } from '../plano.js';
import { hoje, deISO, dataCurta } from '../datas.js';
import { historico, sugestao, subirNivel, dispensar, metaReps, bateuMeta, SESSOES_PARA_SUBIR,
  totalReps, apagarComDia } from '../registros.js';
import { confirmar, perguntar } from '../dialogo.js';

const fmtVals = (id, vals) => vals.join(' · ') + (EXERCICIOS[id].isometria ? ' s' : '');

export function telaProgresso(main) {
  const est = getEstado();
  const sugestoes = ['A', 'B', 'C'].flatMap((t) => TREINOS[t].exercicios).map((id) => sugestao(est, id)).filter(Boolean);

  const cartao = (id) => {
    const nv = nivelAtual(id, est.niveis);
    const h = historico(est, id);
    const ult = h.at(-1);
    const sg = sugestoes.some((s) => s.exId === id);
    return `<li><button data-ex="${id}">
      <span><strong>${EXERCICIOS[id].nome}</strong>${sg ? ' <span class="selo">⬆ subir</span>' : ''}<br>
        <small>Nível ${nv.indice + 1}/${nv.total} · ${nv.nome}</small></span>
      <span class="nivel">${ult ? `${fmtVals(id, ult.valores)}<br><small>${dataCurta(deISO(ult.data))}</small>` : '<small>sem registros</small>'}</span>
    </button></li>`;
  };

  main.innerHTML = `
    <header class="cabecalho"><div class="data">Progresso</div>
      <div class="info">Visão geral, e abaixo cada exercício com seu gráfico e nível.</div></header>
    ${secaoGeral(est)}
    ${sugestoes.map((s) => `
      <div class="sugestao">
        <div><strong>⬆ ${s.nome}</strong>: bateu a meta em ${SESSOES_PARA_SUBIR} treinos seguidos.
          Se a técnica estava boa, passe de <em>${s.de}</em> para <strong>${s.para}</strong>.</div>
        <div class="sug-botoes">
          <button class="btn principal" data-subir="${s.exId}">Subir</button>
          <button class="btn" data-dispensar="${s.exId}">Agora não</button>
        </div>
      </div>`).join('')}
    ${['A', 'B', 'C'].map((t) => `
      <section class="card" style="--cor: var(--${t})">
        <h2>${TREINOS[t].nome}</h2><p class="sub">${TREINOS[t].subtitulo}</p>
        <ul class="lista-ex">${TREINOS[t].exercicios.map(cartao).join('')}</ul>
      </section>`).join('')}`;

  ligarDica(main);
  main.onclick = async (e) => {
    if (e.target.closest('[data-acao="todas-sessoes"]')) {
      mostrarTodas = !mostrarTodas;
      return telaProgresso(main);
    }
    const sessao = e.target.closest('[data-apagar-sessao]')?.dataset.apagarSessao;
    if (sessao) {
      const r = getEstado().registros.find((x) => x.id === Number(sessao));
      const ok = await confirmar('Apagar este treino registrado?',
        `${TREINOS[r.treino]?.nome ?? 'Treino'} de ${dataCurta(deISO(r.data))}: as repetições saem do histórico e dos gráficos, e o dia deixa de contar como feito. Não dá para desfazer.`,
        { sim: 'Apagar', perigo: true });
      if (ok) atualizar((st) => apagarComDia(st, r.id));
      return telaProgresso(main);
    }
    const subir = e.target.closest('[data-subir]')?.dataset.subir;
    const disp = e.target.closest('[data-dispensar]')?.dataset.dispensar;
    if (subir || disp) {
      atualizar((st) => {
        const sg = subir && sugestao(st, subir);
        if (sg) subirNivel(st, sg);
        if (disp) dispensar(st, disp);
      });
      return telaProgresso(main);
    }
    const ex = e.target.closest('[data-ex]')?.dataset.ex;
    if (ex) abrirEvolucao(ex, () => telaProgresso(main));
  };
}

// ---------- Visão geral ----------
let mostrarTodas = false;
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function secaoGeral(est) {
  const d = hoje();
  const semanaAtual = semanaDoPlano(d, est.inicio);
  const t = tempos(semanaAtual);
  const mes = resumoMes(est, d.getFullYear(), d.getMonth(), { ateHoje: true });
  const sem = resumoSemana(est, d);
  const faltaTxt = sem.feitos >= sem.total ? 'semana completa ✔'
    : sem.faltam ? `${sem.faltam === 1 ? 'falta 1' : `faltam ${sem.faltam}`}` : 'semana encerrada';
  const sessoes = [...est.registros].sort((a, b) => (a.data === b.data ? b.id - a.id : a.data < b.data ? 1 : -1));
  const visiveis = mostrarTodas ? sessoes : sessoes.slice(0, 5);

  return `
    <section class="card geral">
      <h2>Geral</h2>
      <div class="stats">
        <div><strong>${mes.total ? `${mes.pct}%` : '–'}</strong><span>${MESES[d.getMonth()]}</span><small>${mes.total ? `${mes.feitos} de ${mes.total} treinos até hoje` : 'conta a partir do 1º treino'}</small></div>
        <div><strong>${sem.feitos}/${sem.total}</strong><span>na semana</span><small>${faltaTxt}</small></div>
        <div><strong>Sem. ${semanaAtual}</strong><span>do plano</span><small>${t.esforco}s / ${t.pausa}s · até 31/12/${anoFinal(est)}</small></div>
      </div>
      <h3 class="subtitulo">Rumo ao próximo nível</h3>
      ${rumoAoNivel(est, t.esforco)}
      ${sessoes.length ? `
        <h3 class="subtitulo">Treinos registrados</h3>
        <ul class="sessoes">${visiveis.map((r) => `
          <li style="--cor: var(--${r.treino})">
            <span class="marca-treino">${r.treino}</span>
            <span class="sessao-info"><strong>${dataCurta(deISO(r.data))}</strong> · ${TREINOS[r.treino]?.nome ?? ''}<br>
              <small>${Object.keys(r.series).length} exercícios · ${totalReps(r)} reps</small></span>
            <button class="apagar" data-apagar-sessao="${r.id}" aria-label="Apagar treino de ${dataCurta(deISO(r.data))}">🗑</button>
          </li>`).join('')}
        </ul>
        ${sessoes.length > 5 ? `<button class="btn" data-acao="todas-sessoes">${mostrarTodas ? 'Mostrar menos' : `Ver todos (${sessoes.length})`}</button>` : ''}` : ''}
    </section>`;
}

// Barra por exercício: pior volta do último treino no nível atual, comparada com a meta.
// Na meta (barra cheia) nas 3 voltas por 2 treinos seguidos = hora de subir de nível.
function rumoAoNivel(est, esforco) {
  const linha = (id) => {
    const ex = EXERCICIOS[id];
    const nv = nivelAtual(id, est.niveis);
    const meta = ex.isometria ? esforco : metaReps(esforco);
    const ult = historico(est, id).filter((h) => h.nivel === nv.indice).at(-1);
    const pior = ult ? Math.min(...ult.valores) : null;
    const pct = pior == null ? 0 : Math.min(100, (100 * pior) / meta);
    const un = ex.isometria ? 's' : '';
    const subir = !!sugestao(est, id);
    const topo = nv.indice >= nv.total - 1 && pior != null && pior >= meta;
    const valor = pior == null ? '<small>—</small>' : `${pior}/${meta}${un}`;
    const dica = pior == null ? `Nível ${nv.indice + 1}: ainda sem registro`
      : `Nível ${nv.indice + 1} · ${dataCurta(deISO(ult.data))}: ${fmtVals(id, ult.valores)}`
        + (pior >= meta ? ' · meta batida' : ` · faltam ${meta - pior}${un} na pior volta`);
    return `<li><button class="rn-linha${pct >= 100 ? ' cheia' : ''}" data-ex="${id}" title="${dica}" aria-label="${ex.nome}: ${dica}">
      <span class="rn-nome"><span class="rn-txt">${ex.nome}</span>${subir ? '<span class="selo" title="Hora de subir de nível">⬆ subir</span>' : topo ? '<span class="selo">★ máx.</span>' : ''}</span>
      <span class="rn-trilho"><span class="rn-barra" style="width:${pct}%"></span><span class="rn-meta"></span></span>
      <span class="rn-valor">${valor}</span>
    </button></li>`;
  };
  return `
    <p class="nota rn-legenda">Pior volta do último treino no nível atual. Linha tracejada = meta
      (${metaReps(esforco)} repetições ou ${esforco}s). Toque para ver a evolução.</p>
    ${['A', 'B', 'C'].map((t) => `
      <div class="rn-grupo" style="--cor: var(--${t})">
        <div class="rn-titulo">${TREINOS[t].nome} · ${TREINOS[t].subtitulo}</div>
        <ul>${TREINOS[t].exercicios.map(linha).join('')}</ul>
      </div>`).join('')}`;
}

// ---------- Detalhe com gráfico ----------
function abrirEvolucao(id, aoFechar) {
  const el = document.createElement('div');
  el.className = 'modal';
  document.body.append(el);
  const ex = EXERCICIOS[id];
  const cor = `var(--${['A', 'B', 'C'].find((t) => TREINOS[t].exercicios.includes(id))})`;

  function desenhar() {
    const est = getEstado();
    const nv = nivelAtual(id, est.niveis);
    const h = historico(est, id);
    const esforcoAtual = tempos(semanaDoPlano(hoje(), est.inicio)).esforco;
    const meta = ex.isometria ? esforcoAtual : metaReps(esforcoAtual);
    el.innerHTML = `
      <div class="conteudo" style="--cor: ${cor}">
        <div class="topo"><h1>${ex.nome}</h1><button class="fechar" data-acao="fechar" aria-label="Fechar">✕</button></div>
        <div class="seletor-nivel">
          <button data-acao="menos" ${nv.indice === 0 ? 'disabled' : ''} aria-label="Nível anterior">‹</button>
          <div class="meio"><small>Nível ${nv.indice + 1} de ${nv.total}</small><strong>${nv.nome}</strong></div>
          <button data-acao="mais" ${nv.indice === nv.total - 1 ? 'disabled' : ''} aria-label="Próximo nível">›</button>
        </div>
        <p class="nota">Meta para subir: ${ex.isometria ? `segurar ${meta}s` : `${meta} repetições`} nas 3 voltas,
          em ${SESSOES_PARA_SUBIR} treinos seguidos no mesmo nível${ex.isometria ? '' : ` (${metaReps(40)} em blocos de 40s, ${metaReps(30)} em 30s)`}.</p>
        <h3>Evolução · pior volta de cada treino</h3>
        <div class="grafico">${h.length ? grafico(id, h, meta) : '<p class="nota vazio">Ainda sem registros. Faça um treino e registre as repetições na pausa entre os exercícios.</p>'}</div>
        ${h.length ? `
        <h3>Histórico</h3>
        <table class="tabela">
          <thead><tr><th>Data</th><th>Nível</th><th>Voltas</th><th></th><th></th></tr></thead>
          <tbody>${[...h].reverse().slice(0, 30).map((r) => `
            <tr><td>${dataCurta(deISO(r.data))}</td><td>${r.nivel + 1}</td><td>${fmtVals(id, r.valores)}</td>
            <td>${bateuMeta(id, r) ? '<span class="ok" title="Bateu a meta">✔ meta</span>' : ''}</td>
            <td><button class="apagar" data-apagar="${r.id}" aria-label="Apagar registro de ${dataCurta(deISO(r.data))}">🗑</button></td></tr>`).join('')}
          </tbody>
        </table>` : ''}
      </div>`;
    ligarDica(el);
  }

  el.addEventListener('click', async (e) => {
    const apagar = e.target.closest('[data-apagar]')?.dataset.apagar;
    if (apagar) {
      const reg = getEstado().registros.find((r) => r.id === Number(apagar));
      const outros = Object.keys(reg.series).length - 1;
      const escolha = await perguntar({
        titulo: `Apagar o registro de ${dataCurta(deISO(reg.data))}?`,
        texto: outros > 0
          ? `Nesse dia você também registrou ${outros} ${outros === 1 ? 'outro exercício' : 'outros exercícios'} do ${TREINOS[reg.treino]?.nome ?? 'treino'}. Não dá para desfazer.`
          : 'Ele sai do histórico e dos gráficos, e o dia deixa de contar como feito. Não dá para desfazer.',
        opcoes: [
          { rotulo: `Apagar só ${ex.nome}`, valor: 'serie', tipo: 'perigo' },
          ...(outros > 0 ? [{ rotulo: 'Apagar o treino inteiro desse dia', valor: 'treino', tipo: 'perigo' }] : []),
          { rotulo: 'Cancelar', valor: null },
        ],
      });
      if (escolha) {
        atualizar((st) => apagarComDia(st, reg.id, escolha === 'serie' ? id : null));
        desenhar();
      }
      return;
    }
    const acao = e.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'fechar') { el.remove(); aoFechar?.(); }
    else if (acao === 'mais' || acao === 'menos') {
      const nv = nivelAtual(id, getEstado().niveis);
      atualizar((s) => { s.niveis[id] = nv.indice + (acao === 'mais' ? 1 : -1); });
      desenhar();
    }
  });
  desenhar();
}

// Gráfico de linha (SVG): um ponto por treino, linha tracejada = meta, mudanças de nível marcadas.
function grafico(id, h, meta) {
  const W = 320, H = 190, E = 30, Dir = 12, T = 14, B = 26;
  const ys = h.map((r) => Math.min(...r.valores));
  const topo = Math.max(meta, ...h.map((r) => Math.max(...r.valores)));
  const passo = topo > 40 ? 10 : 5;
  const maxY = Math.ceil((topo * 1.1) / passo) * passo;
  const x = (i) => (h.length === 1 ? (E + W - Dir) / 2 : E + (i * (W - E - Dir)) / (h.length - 1));
  const y = (v) => T + (1 - v / maxY) * (H - T - B);

  const grade = [];
  for (let v = 0; v <= maxY; v += passo) {
    grade.push(`<line class="g-grade" x1="${E}" x2="${W - Dir}" y1="${y(v)}" y2="${y(v)}"/>
      <text class="g-eixo" x="${E - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`);
  }
  const niveis = h.map((r, i) => (i === 0 || r.nivel !== h[i - 1].nivel)
    ? `<line class="g-nivel" x1="${x(i)}" x2="${x(i)}" y1="${T - 4}" y2="${H - B}"/>
       <text class="g-rotulo" x="${x(i) + 4}" y="${T + 6}">N${r.nivel + 1}</text>` : '').join('');
  const datas = [0, h.length - 1].filter((v, i, a) => a.indexOf(v) === i)
    .map((i) => `<text class="g-eixo" x="${x(i)}" y="${H - 8}" text-anchor="${h.length === 1 ? 'middle' : i === 0 ? 'start' : 'end'}">${dataCurta(deISO(h[i].data))}</text>`).join('');
  const linha = h.length > 1 ? `<polyline class="g-linha" points="${ys.map((v, i) => `${x(i)},${y(v)}`).join(' ')}"/>` : '';
  const pontos = h.map((r, i) => `
    <g class="g-ponto" data-dica="${dataCurta(deISO(r.data))} · nível ${r.nivel + 1} · ${fmtVals(id, r.valores)}">
      <circle class="g-alvo" cx="${x(i)}" cy="${y(ys[i])}" r="14"/>
      <circle class="g-marca" cx="${x(i)}" cy="${y(ys[i])}" r="4.5"/>
    </g>`).join('');
  return `
    <svg viewBox="0 0 ${W} ${H}" class="g-svg" role="img" aria-label="Evolução de ${EXERCICIOS[id].nome}: pior volta por treino">
      ${grade.join('')}${niveis}
      <line class="g-meta" x1="${E}" x2="${W - Dir}" y1="${y(meta)}" y2="${y(meta)}"/>
      <text class="g-rotulo g-rotulo-meta" x="${E + 4}" y="${y(meta) - 5}">meta ${meta}</text>
      ${linha}${pontos}${datas}
    </svg>
    <div class="g-dica" hidden></div>`;
}

// Toque/passar o mouse num ponto mostra os valores daquele treino.
function ligarDica(raiz) {
  const dica = raiz.querySelector('.g-dica');
  if (!dica) return;
  const mostrar = (g) => {
    raiz.querySelectorAll('.g-ponto.ativo').forEach((n) => n.classList.remove('ativo'));
    if (!g) { dica.hidden = true; return; }
    g.classList.add('ativo');
    dica.textContent = g.dataset.dica;
    dica.hidden = false;
  };
  raiz.querySelectorAll('.g-ponto').forEach((g) => {
    g.addEventListener('pointerenter', () => mostrar(g));
    g.addEventListener('click', () => mostrar(g));
  });
  const ultimo = [...raiz.querySelectorAll('.g-ponto')].at(-1);
  mostrar(ultimo);
}
