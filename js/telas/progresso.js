// Tela Progresso: nível de cada exercício, sugestões de subir de nível e gráfico de evolução.
import { TREINOS } from '../dados/treinos.js';
import { EXERCICIOS, nivelAtual } from '../dados/exercicios.js';
import { getEstado, atualizar } from '../storage.js';
import { semanaDoPlano, tempos } from '../plano.js';
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
const SEMANAS_NO_GRAFICO = 12;

function secaoGeral(est) {
  const semanaAtual = semanaDoPlano(hoje(), est.inicio);
  const feitos = Object.values(est.dias).filter((d) => d.status === 'feito').length;
  const totalGeral = est.registros.reduce((s, r) => s + totalReps(r), 0);
  const sessoes = [...est.registros].sort((a, b) => (a.data === b.data ? b.id - a.id : a.data < b.data ? 1 : -1));
  const visiveis = mostrarTodas ? sessoes : sessoes.slice(0, 5);

  return `
    <section class="card geral">
      <h2>Geral</h2>
      <div class="stats">
        <div><strong>${feitos}</strong><span>treinos feitos</span></div>
        <div><strong>${totalGeral}</strong><span>repetições</span></div>
        <div><strong>${semanaAtual}</strong><span>semana do plano</span></div>
      </div>
      <h3 class="subtitulo">Repetições por semana</h3>
      <div class="grafico">${est.registros.length ? graficoSemanas(est, semanaAtual)
        : '<p class="nota vazio">Os gráficos aparecem depois do primeiro treino com repetições registradas.</p>'}</div>
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

// Barras: soma das repetições de todos os exercícios (sem isometrias) em cada semana do plano.
function graficoSemanas(est, semanaAtual) {
  const porSemana = new Map();
  for (const r of est.registros) {
    const s = semanaDoPlano(deISO(r.data), est.inicio);
    const v = porSemana.get(s) ?? { reps: 0, treinos: 0 };
    v.reps += totalReps(r);
    v.treinos += 1;
    porSemana.set(s, v);
  }
  const ultima = Math.max(semanaAtual, ...porSemana.keys());
  const primeira = Math.max(1, ultima - SEMANAS_NO_GRAFICO + 1);
  const semanas = [];
  for (let s = primeira; s <= ultima; s++) semanas.push({ s, ...(porSemana.get(s) ?? { reps: 0, treinos: 0 }) });

  const W = 320, H = 180, E = 34, Dir = 8, T = 16, B = 24;
  const topo = Math.max(10, ...semanas.map((x) => x.reps));
  const passo = [10, 20, 50, 100, 200, 250, 500, 1000].find((p) => topo / p <= 5) ?? 2000;
  const maxY = Math.ceil((topo * 1.12) / passo) * passo;
  const y = (v) => T + (1 - v / maxY) * (H - T - B);
  const faixa = (W - E - Dir) / semanas.length;
  const larg = Math.max(4, Math.min(26, faixa - 2));

  const grade = [];
  for (let v = 0; v <= maxY; v += passo) {
    grade.push(`<line class="g-grade" x1="${E}" x2="${W - Dir}" y1="${y(v)}" y2="${y(v)}"/>
      <text class="g-eixo" x="${E - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`);
  }
  // Barra com topo arredondado (4px) e base reta no eixo.
  const barra = (x, topoY, w) => {
    const h = y(0) - topoY;
    if (h <= 0) return '';
    const r = Math.min(4, h, w / 2);
    return `M${x} ${y(0)}V${topoY + r}Q${x} ${topoY} ${x + r} ${topoY}H${x + w - r}Q${x + w} ${topoY} ${x + w} ${topoY + r}V${y(0)}Z`;
  };
  const inicioSemana = (s) => {
    const d = new Date(deISO(est.inicio));
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + (s - 1) * 7);
    return d;
  };
  const barras = semanas.map((b, i) => {
    const x = E + i * faixa + (faixa - larg) / 2;
    const ini = inicioSemana(b.s);
    const fim = new Date(ini); fim.setDate(fim.getDate() + 6);
    const dica = `Semana ${b.s} (${dataCurta(ini)}–${dataCurta(fim)}) · ${b.reps} repetições · ${b.treinos} ${b.treinos === 1 ? 'treino' : 'treinos'}`;
    const atual = b.s === semanaAtual;
    return `<g class="g-ponto${atual ? ' atual' : ''}" data-dica="${dica}">
      <rect class="g-alvo" x="${E + i * faixa}" y="${T}" width="${faixa}" height="${H - T - B}"/>
      <path class="g-barra" d="${barra(x, y(b.reps), larg)}"/>
      ${semanas.length <= 12 || i % 2 === 0 ? `<text class="g-eixo" x="${x + larg / 2}" y="${H - 8}" text-anchor="middle">S${b.s}</text>` : ''}
    </g>`;
  }).join('');
  const ultimaBarra = semanas.at(-1);
  const rotuloUlt = ultimaBarra.reps
    ? `<text class="g-rotulo g-rotulo-meta" x="${E + (semanas.length - 1) * faixa + faixa / 2}" y="${y(ultimaBarra.reps) - 5}" text-anchor="middle">${ultimaBarra.reps}</text>` : '';
  return `
    <svg viewBox="0 0 ${W} ${H}" class="g-svg" role="img" aria-label="Repetições por semana do plano">
      ${grade.join('')}${barras}${rotuloUlt}
    </svg>
    <div class="g-dica" hidden></div>`;
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
