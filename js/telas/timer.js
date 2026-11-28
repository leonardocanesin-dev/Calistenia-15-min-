// Timer guiado em tela cheia.
import { EXERCICIOS, nivelAtual } from '../dados/exercicios.js';
import { TREINOS, VOLTAS, AQUECIMENTO, ALONGAMENTO, MOBILIDADE } from '../dados/treinos.js';
import { getEstado, atualizar } from '../storage.js';
import { semanaDoPlano, tempos, treinoDoDia, trocarTreino } from '../plano.js';
import { ultimoValor, sugestao, subirNivel, dispensar, SESSOES_PARA_SUBIR, registrarMobilidade, textoUltimaMobilidade } from '../registros.js';
import { hoje, iso, mmss } from '../datas.js';
import { montarEtapas, Sessao } from '../timer.js';
import { manterTelaAcesa, liberarTela } from '../telaAcesa.js';
import { abrirExercicio } from './exercicio.js';
import { animar } from '../animacao/boneco.js';
import { confirmar } from '../dialogo.js';

const ICONES = {
  voltar: '<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM9.5 12 18 18V6z"/></svg>',
  pular: '<svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>',
  pausar: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
  tocar: '<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>',
};

const FASES = {
  preparar: 'PREPARE-SE',
  aquecimento: 'AQUECIMENTO',
  esforco: 'ESFORÇO',
  pausa: 'PAUSA',
  alongamento: 'ALONGAMENTO',
  descanso: 'DESCANSO ATIVO',
  escolha: 'ESCOLHA O NÍVEL',
  mobilidade: 'MOBILIDADE',
};

// Fases em que dá para escolher o nível do exercício que vem a seguir.
const ESCOLHE_NIVEL = new Set(['pausa', 'escolha']);

export function abrirTimer(treinoId, { aoFechar } = {}) {
  const semana = semanaDoPlano(hoje(), getEstado().inicio);
  const etapas = montarEtapas(treinoId, semana);
  const ehMob = treinoId === 'M';
  const treino = ehMob ? { nome: MOBILIDADE.nome, exercicios: [] } : TREINOS[treinoId];

  const el = document.createElement('div');
  el.className = 'timer';
  document.body.append(el);
  document.body.classList.add('em-treino');

  el.innerHTML = `
    <div class="barra-topo">
      <button class="fechar" data-acao="sair" aria-label="Sair do treino">✕</button>
      <div class="local"></div>
      <div class="total"></div>
    </div>
    <div class="progresso"><div></div></div>
    <div class="fase"></div>
    <div class="registro" hidden></div>
    <div class="rotulo-ex"></div>
    <button class="nome" data-acao="detalhe"></button>
    <div class="nivel-atual"></div>
    <div class="area-anim"></div>
    <div class="relogio"></div>
    <div class="troca"></div>
    <div class="proximo"></div>
    <div class="controles">
      <button data-acao="voltar" aria-label="Voltar">${ICONES.voltar}</button>
      <button data-acao="alternar" class="play" aria-label="Pausar"></button>
      <button data-acao="pular" aria-label="Pular">${ICONES.pular}</button>
    </div>`;
  const $ = (s) => el.querySelector(s);
  const total = etapas.reduce((s, e) => s + e.dur, 0);
  let pararAnim = () => {};

  // Repetições (ou segundos) desta sessão: { exId: { nivel, valores: [], confirmado: [] } }
  const series = {};
  const pulados = new Set();
  let salvo = false;

  const sessao = new Sessao(etapas, {
    aoMudar: desenharEtapa,
    aoTick: atualizarTempo,
    aoTrocar: (s) => { $('.troca').textContent = EXERCICIOS[s.etapa.exId].trocaTexto ?? 'Troque de lado!'; },
    aoFim: concluir,
  });

  function local(et) {
    if (et.fase === 'esforco' || et.fase === 'pausa') return `${treino.nome} · Volta ${et.volta}/${VOLTAS}`;
    if (et.fase === 'aquecimento') return `Aquecimento ${AQUECIMENTO.exercicios.indexOf(et.exId) + 1}/${AQUECIMENTO.exercicios.length}`;
    if (et.fase === 'alongamento') return `Alongamento ${ALONGAMENTO.exercicios.indexOf(et.exId) + 1}/${ALONGAMENTO.exercicios.length}`;
    if (et.fase === 'mobilidade') return `Mobilidade ${MOBILIDADE.exercicios.indexOf(et.exId) + 1}/${MOBILIDADE.exercicios.length}`;
    if (et.fase === 'escolha') return `${treino.nome} · antes da volta 1`;
    return treino.nome;
  }

  function proximoDepois(i) {
    for (let k = i + 1; k < etapas.length; k++) {
      if (etapas[k].fase !== 'pausa') return etapas[k];
    }
    return null;
  }

  function desenharEtapa(s) {
    const et = s.etapa;
    const ex = EXERCICIOS[et.exId];
    el.className = `timer fase-${et.fase}`;
    $('.local').textContent = local(et);
    $('.fase').textContent = FASES[et.fase];
    const aSeguir = et.fase === 'pausa' || et.fase === 'preparar' || et.fase === 'escolha';
    $('.rotulo-ex').textContent = aSeguir ? 'A seguir' : '';
    $('.nome').textContent = ex.nome;
    desenharNivel(et);
    $('.troca').textContent = '';
    const prox = aSeguir ? null : proximoDepois(s.i);
    $('.proximo').innerHTML = prox ? `Próximo: <strong>${EXERCICIOS[prox.exId].nome}</strong>` : '';
    desenharRegistro(et);
  }

  // Nível do exercício mostrado. Na pausa e na etapa de escolha vira um seletor ‹ ›
  // (o nível escolhido fica salvo, igual a trocar na tela do exercício).
  function desenharNivel(et) {
    const ex = EXERCICIOS[et.exId];
    const nv = nivelAtual(et.exId, getEstado().niveis);
    const caixa = $('.nivel-atual');
    if (nv && ESCOLHE_NIVEL.has(et.fase)) {
      caixa.innerHTML = `
        <div class="nivel-sel">
          <button data-nivel="-1" ${nv.indice === 0 ? 'disabled' : ''} aria-label="Nível mais fácil">‹</button>
          <span><small>Nível ${nv.indice + 1}/${nv.total}</small>${nv.nome}${ex.isometria ? ' · segure' : ''}</span>
          <button data-nivel="1" ${nv.indice === nv.total - 1 ? 'disabled' : ''} aria-label="Nível mais difícil">›</button>
        </div>`;
    } else {
      caixa.textContent = nv ? nv.nome + (ex.isometria ? ' · segure' : '') : '';
    }
    pararAnim();
    pararAnim = animar($('.area-anim'), et.exId, { nivel: nv?.indice });
  }

  function mudarNivel(direcao) {
    const et = sessao.etapa;
    if (!ESCOLHE_NIVEL.has(et.fase)) return;
    const nv = nivelAtual(et.exId, getEstado().niveis);
    if (!nv) return;
    const novo = Math.max(0, Math.min(nv.total - 1, nv.indice + direcao));
    if (novo === nv.indice) return;
    atualizar((st) => { st.niveis[et.exId] = novo; });
    desenharNivel(et);
  }

  // Painel da pausa: quantas repetições fez no exercício que acabou.
  function desenharRegistro(et) {
    const reg = $('.registro');
    if (et.fase !== 'pausa') { reg.hidden = true; return; }
    const exF = EXERCICIOS[et.feito];
    const isoEx = !!exF.isometria;
    const i = et.voltaFeita - 1;
    const s = (series[et.feito] ??= { nivel: nivelAtual(et.feito, getEstado().niveis)?.indice ?? 0, valores: [], confirmado: [] });
    s.nivel = nivelAtual(et.feito, getEstado().niveis)?.indice ?? s.nivel; // nível em que fez esta volta
    if (s.valores[i] == null) {
      const anterior = s.valores[i - 1] ?? ultimoValor(getEstado(), et.feito);
      s.valores[i] = isoEx ? Math.min(anterior ?? et.esforco, et.esforco) : (anterior ?? 10);
      s.confirmado[i] = !pulados.has(`${et.feito}-${et.voltaFeita}`);
    }
    reg.hidden = false;
    reg.innerHTML = `
      <div class="reg-titulo">${exF.nome} · volta ${et.voltaFeita}: ${isoEx ? 'quantos segundos segurou?' : 'quantas repetições?'}</div>
      <div class="reg-linha">
        <button data-reg="-1" aria-label="Menos">−</button>
        <output>${s.valores[i]}${isoEx ? 's' : ''}</output>
        <button data-reg="1" aria-label="Mais">+</button>
      </div>
      ${s.confirmado[i] ? '' : '<div class="reg-aviso">Exercício pulado: toque em − ou + para registrar mesmo assim</div>'}`;
  }

  function ajustarRegistro(direcao) {
    const et = sessao.etapa;
    if (et.fase !== 'pausa') return;
    const s = series[et.feito];
    const i = et.voltaFeita - 1;
    const isoEx = !!EXERCICIOS[et.feito].isometria;
    const passo = isoEx ? 5 : 1;
    const max = isoEx ? et.esforco : 99;
    s.valores[i] = Math.max(0, Math.min(max, s.valores[i] + direcao * passo));
    s.confirmado[i] = true;
    desenharRegistro(et);
  }

  function salvarSessao() {
    if (salvo) return [];
    salvo = true;
    const registradas = {};
    for (const [exId, s] of Object.entries(series)) {
      const valores = s.valores.filter((v, i) => v != null && s.confirmado[i]);
      if (valores.length) registradas[exId] = { nivel: s.nivel, valores };
    }
    if (!Object.keys(registradas).length) return [];
    atualizar((st) => {
      st.registros.push({ id: Date.now(), data: iso(hoje()), treino: treinoId, esforco: tempos(semana).esforco, series: registradas });
    });
    return Object.keys(registradas);
  }

  function atualizarTempo(s) {
    const ms = s.restante();
    const seg = Math.ceil(ms / 1000);
    const relogio = $('.relogio');
    relogio.textContent = mmss(ms / 1000);
    relogio.classList.toggle('ultimos', s.rodando && seg <= 3);
    const resta = s.restanteTotal();
    $('.total').textContent = mmss(resta);
    $('.progresso div').style.width = `${(100 * (total - resta)) / total}%`;
    el.classList.toggle('pausado', !s.rodando);
    const play = $('[data-acao="alternar"]');
    play.innerHTML = s.rodando ? ICONES.pausar : ICONES.tocar;
    play.setAttribute('aria-label', s.rodando ? 'Pausar' : 'Continuar');
  }

  function concluir() {
    pararAnim();
    liberarTela();
    if (ehMob) {
      atualizar(registrarMobilidade);
      el.className = 'timer fase-mobilidade concluido-tela';
      el.innerHTML = `
        <div class="concluido">
          <div class="grande">🧘</div>
          <h1>Mobilidade concluída!</h1>
          <p class="nota">${MOBILIDADE.nome} · ${mmss(total)} · registrada hoje</p>
          <button class="btn principal" data-acao="fechar">Fechar</button>
        </div>`;
      return;
    }
    atualizar((st) => {
      const dia = iso(hoje());
      // Fez outro treino no lugar do previsto: vira troca, e o previsto passa para o próximo dia.
      const previsto = treinoDoDia(hoje(), st);
      if (previsto && previsto !== treinoId && hoje().getDay() !== 0 && st.dias[dia]?.status !== 'feito') {
        trocarTreino(st, dia, treinoId);
      }
      st.dias[dia] = { status: 'feito', treino: treinoId };
    });
    const feitos = salvarSessao();
    el.className = 'timer fase-esforco concluido-tela';
    desenharConclusao(feitos);
  }

  function desenharConclusao(feitos) {
    const est = getEstado();
    const resumo = feitos.map((id) => {
      const s = series[id];
      const vals = s.valores.filter((v, i) => v != null && s.confirmado[i]);
      return `<li><span>${EXERCICIOS[id].nome}</span><strong>${vals.join(' · ')}${EXERCICIOS[id].isometria ? ' s' : ''}</strong></li>`;
    }).join('');
    const sugestoes = treino.exercicios.map((id) => sugestao(est, id)).filter(Boolean);
    el.innerHTML = `
      <div class="concluido">
        <div class="grande">🎉</div>
        <h1>Treino concluído!</h1>
        <p class="nota">${treino.nome} · ${mmss(total)} · marcado como feito hoje</p>
        ${resumo ? `<ul class="resumo">${resumo}</ul>` : ''}
        ${sugestoes.map((s) => `
          <div class="sugestao">
            <div><strong>⬆ Hora de subir de nível?</strong><br>
              ${s.nome}: bateu a meta em ${SESSOES_PARA_SUBIR} treinos seguidos. Se a técnica estava boa, passe de <em>${s.de}</em> para <strong>${s.para}</strong>.</div>
            <div class="sug-botoes">
              <button class="btn principal" data-subir="${s.exId}">Subir</button>
              <button class="btn" data-dispensar="${s.exId}">Agora não</button>
            </div>
          </div>`).join('')}
        <div class="oferta-mob">
          <span class="etiqueta">Opcional · ~${Math.round((MOBILIDADE.exercicios.length * MOBILIDADE.dur) / 60)} min</span>
          <strong>${MOBILIDADE.nome}</strong>
          <small>${textoUltimaMobilidade(est)}</small>
          <button class="btn principal" data-acao="mobilidade">▶ Fazer agora</button>
        </div>
        <button class="btn" data-acao="fechar">Agora não, fechar</button>
      </div>`;
  }

  // Botão "voltar" do Android: pede confirmação em vez de sair do app.
  let ignorarPop = false;
  history.pushState({ timer: true }, '');
  function aoPop() {
    if (ignorarPop) { ignorarPop = false; return; }
    pedirSaida(true);
  }
  window.addEventListener('popstate', aoPop);

  // Pausa o timer enquanto pergunta; se escolher continuar, retoma de onde estava.
  let perguntando = false;
  async function pedirSaida(veioDoPop = false) {
    if (sessao.terminou) return fechar(veioDoPop);
    if (perguntando) return;
    perguntando = true;
    const rodava = sessao.rodando;
    sessao.pausar();
    const sair = await confirmar('Sair do treino?',
      'As repetições já registradas ficam salvas, mas o dia não é marcado como feito.',
      { sim: 'Sair do treino', nao: 'Continuar treinando', perigo: true });
    perguntando = false;
    if (sair) return fechar(veioDoPop);
    if (veioDoPop) history.pushState({ timer: true }, '');
    if (rodava) sessao.iniciar();
  }

  // `depois` roda quando o histórico já voltou (para abrir outro timer sem confundir o botão voltar).
  function fechar(veioDoPop = false, depois = null) {
    sessao.parar();
    if (!ehMob) salvarSessao(); // saindo no meio: guarda o que já foi registrado
    liberarTela();
    window.removeEventListener('popstate', aoPop);
    if (!veioDoPop) {
      if (depois) window.addEventListener('popstate', () => depois(), { once: true });
      history.back();
    } else depois?.();
    el.remove();
    document.body.classList.remove('em-treino');
    aoFechar?.();
  }

  el.addEventListener('click', (e) => {
    const reg = e.target.closest('[data-reg]')?.dataset.reg;
    if (reg) return ajustarRegistro(Number(reg));
    const nivel = e.target.closest('[data-nivel]')?.dataset.nivel;
    if (nivel) return mudarNivel(Number(nivel));
    const subir = e.target.closest('[data-subir]')?.dataset.subir;
    const dispensa = e.target.closest('[data-dispensar]')?.dataset.dispensar;
    if (subir || dispensa) {
      atualizar((st) => {
        const sg = subir && sugestao(st, subir);
        if (sg) subirNivel(st, sg);
        if (dispensa) dispensar(st, dispensa);
      });
      return desenharConclusao(Object.keys(series).filter((id) => series[id].confirmado.some(Boolean)));
    }
    const acao = e.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'alternar') sessao.alternar();
    else if (acao === 'pular') {
      const et = sessao.etapa;
      if (et.fase === 'esforco' && sessao.restante() > 3000) pulados.add(`${et.exId}-${et.volta}`);
      sessao.proxima();
    }
    else if (acao === 'voltar') sessao.anterior();
    else if (acao === 'detalhe') abrirExercicio(sessao.etapa.exId);
    else if (acao === 'fechar') fechar();
    else if (acao === 'mobilidade') fechar(false, () => abrirTimer('M', { aoFechar }));
    else if (acao === 'sair') pedirSaida();
  });

  manterTelaAcesa();
  desenharEtapa(sessao);
  sessao.iniciar();
}
