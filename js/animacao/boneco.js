// Boneco articulado em SVG, com corpo (camiseta, short, tênis), animado por poses-chave.
//
// Convenção de ângulos (graus): 0 = apontando para baixo, 90 = para a frente (direita),
// 180 = para cima, -90 = para trás (esquerda). O boneco olha para a direita.
// Cada membro tem dois lados: [perto, longe]. O lado "longe" é desenhado mais apagado.
// Na vista de frente (frente: true) os dois lados ficam iguais e afastados.
import { ANIMACOES, CHAO } from './poses.js';

const L = { T: 34, N: 12, UA: 20, LA: 18, TH: 24, SH: 24, PE: 9 };
const LARG = { ombroFrente: 8, quadrilFrente: 5.5 };

const rad = (a) => (a * Math.PI) / 180;
const dir = (a, l) => [Math.sin(rad(a)) * l, Math.cos(rad(a)) * l];
const ang = (dx, dy) => (Math.atan2(dx, dy) * 180) / Math.PI;
const soma = (p, v) => [p[0] + v[0], p[1] + v[1]];
const entre = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const lerp = (a, b, k) => a + (b - a) * k;
const norm = (a) => ((((a % 360) + 540) % 360) - 180);
const lerpAng = (a, b, k) => a + norm(b - a) * k;
const par = (v) => (Array.isArray(v) ? v : [v, v]);
const pontos = (v) => (v[0] === null || Array.isArray(v[0]) ? v : [v, v]);

// Cinemática inversa de 2 ossos: ângulos para levar a ponta até `alvo`.
function ik(raiz, alvo, l1, l2, sentido) {
  const dx = alvo[0] - raiz[0];
  const dy = alvo[1] - raiz[1];
  const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const alfa = (Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)) * 180) / Math.PI;
  const a1 = ang(dx, dy) + sentido * alfa;
  const j = soma(raiz, dir(a1, l1));
  return [a1, ang(alvo[0] - j[0], alvo[1] - j[1])];
}

// Pontos de onde saem braços e pernas (afastados na vista de frente).
function raizes(r) {
  const e = r.esc ?? {};
  const om = soma(r.q, dir(r.t, L.T * (e.T ?? 1)));
  const lado = r.frente ? [-Math.cos(rad(r.t)), Math.sin(rad(r.t))] : [0, 0];
  const desloca = (p, s, w) => [p[0] + lado[0] * s * w, p[1] + lado[1] * s * w];
  return {
    om,
    ombros: [desloca(om, 1, LARG.ombroFrente), desloca(om, -1, LARG.ombroFrente)],
    quadris: [desloca(r.q, 1, LARG.quadrilFrente), desloca(r.q, -1, LARG.quadrilFrente)],
    TH: L.TH * (e.TH ?? 1),
    SH: L.SH * (e.SH ?? 1),
  };
}

// Converte a descrição de uma pose (com alvos de pé/mão) em ângulos.
function resolver(p) {
  const r = { q: p.q, t: p.t, h: p.h ?? p.t, c: p.c ?? 0, anc: p.anc ?? 'q',
    frente: !!p.frente, esc: p.esc ?? null, pa: p.pa == null ? [null, null] : par(p.pa) };
  const R = raizes(r);
  const membros = (alvos, raiz, l1, l2, sentidos, a1s, a2s) => {
    const A = [par(a1s)[0], par(a1s)[1]];
    const B = [par(a2s)[0], par(a2s)[1]];
    if (!alvos) return [A, B];
    const pts = pontos(alvos);
    const s = par(sentidos);
    [0, 1].forEach((i) => {
      if (pts[i]) [A[i], B[i]] = ik(raiz[i], pts[i], l1, l2, s[i]);
    });
    return [A, B];
  };
  [r.th, r.sh] = membros(p.pe, R.quadris, R.TH, R.SH, p.jd ?? 1, p.th ?? 0, p.sh ?? p.th ?? 0);
  [r.ua, r.la] = membros(p.mao, R.ombros, L.UA, L.LA, p.cd ?? -1, p.ua ?? 0, p.la ?? p.ua ?? 0);
  return r;
}

function esqueleto(r) {
  const R = raizes(r);
  const perna = (i) => {
    const a = R.quadris[i];
    const j = soma(a, dir(r.th[i], R.TH));
    const f = soma(j, dir(r.sh[i], R.SH));
    // Pé: plano no chão quando a canela está em pé; senão segue a canela.
    let pa = r.pa[i];
    if (pa == null) {
      if (r.frente) pa = i === 0 ? 90 : -90;
      else pa = f[1] >= CHAO - 1.5 && Math.abs(norm(r.sh[i])) <= 60 ? 90 : r.sh[i] + 90;
    }
    return [a, j, f, soma(f, dir(pa, r.frente ? 5 : L.PE))];
  };
  const braco = (i) => {
    const a = R.ombros[i];
    const j = soma(a, dir(r.ua[i], L.UA));
    return [a, j, soma(j, dir(r.la[i], L.LA))];
  };
  return { q: r.q, om: R.om, cab: soma(R.om, dir(r.h, L.N)), t: r.t, h: r.h, c: r.c,
    frente: r.frente, semPernas: r.esc?.TH === 0, pernas: [perna(0), perna(1)], bracos: [braco(0), braco(1)] };
}

const ancora = (e, anc) => (anc === 'pe' ? e.pernas[0][2] : anc === 'mao' ? e.bracos[0][2] : e.q);

// Pose intermediária: interpola ângulos e mantém o ponto de apoio no lugar.
function interpolar(A, B, k) {
  const anc = A.anc === B.anc ? A.anc : 'q';
  const pa = ancora(esqueleto(A), anc);
  const pb = ancora(esqueleto(B), anc);
  const m = (campo) => [0, 1].map((i) => lerpAng(A[campo][i], B[campo][i], k));
  const r = { q: [0, 0], t: lerpAng(A.t, B.t, k), h: lerpAng(A.h, B.h, k), c: lerp(A.c, B.c, k),
    frente: A.frente, esc: A.esc, pa: k < 0.5 ? A.pa : B.pa,
    th: m('th'), sh: m('sh'), ua: m('ua'), la: m('la') };
  const p = ancora(esqueleto(r), anc);
  r.q = [lerp(pa[0], pb[0], k) - p[0], lerp(pa[1], pb[1], k) - p[1]];
  return esqueleto(r);
}

// ---------- Desenho ----------
const f1 = (n) => n.toFixed(1);

// Segmento com volume: duas pontas arredondadas de raios r1 e r2.
function capsula(a, b, r1, r2) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 0.001;
  const nx = -dy / l;
  const ny = dx / l;
  return `M${f1(a[0] + nx * r1)} ${f1(a[1] + ny * r1)}L${f1(b[0] + nx * r2)} ${f1(b[1] + ny * r2)}`
    + `A${r2} ${r2} 0 0 0 ${f1(b[0] - nx * r2)} ${f1(b[1] - ny * r2)}`
    + `L${f1(a[0] - nx * r1)} ${f1(a[1] - ny * r1)}A${r1} ${r1} 0 0 0 ${f1(a[0] + nx * r1)} ${f1(a[1] + ny * r1)}Z`;
}

const LADO = (s) => `
  <path class="pele" data-p="coxa${s}"/><path class="short" data-p="short${s}"/>
  <path class="pele" data-p="canela${s}"/><path class="tenis" data-p="pe${s}"/>`;
const BRACO = (s) => `
  <path class="pele" data-p="braco${s}"/><path class="camisa" data-p="manga${s}"/>
  <path class="pele" data-p="ante${s}"/><circle class="pele" r="3.8" data-p="mao${s}"/>`;

function desenhar(els, e) {
  const set = (n, d) => els[n].setAttribute('d', d);
  ['L', 'P'].forEach((s, k) => {
    const i = s === 'P' ? 0 : 1;
    const [a, j, f, ponta] = e.pernas[i];
    if (e.semPernas) {
      ['coxa', 'short', 'canela', 'pe'].forEach((n) => set(n + s, ''));
    } else {
      set('coxa' + s, capsula(a, j, 6.5, 5.2));
      set('short' + s, capsula(a, entre(a, j, 0.55), 7.2, 6.6));
      set('canela' + s, capsula(j, f, 5, 3.6));
      set('pe' + s, capsula(f, ponta, 3.8, 3));
    }
    const [o, c, m] = e.bracos[i];
    set('braco' + s, capsula(o, c, 4.8, 4));
    set('manga' + s, capsula(o, entre(o, c, 0.45), 5.6, 5.2));
    set('ante' + s, capsula(c, m, 4, 3.2));
    els['mao' + s].setAttribute('cx', f1(m[0]));
    els['mao' + s].setAttribute('cy', f1(m[1]));
  });

  // Tronco (curvável) + quadril de short.
  const meio = entre(e.q, e.om, 0.5);
  const ctrl = [meio[0] + Math.cos(rad(e.t)) * e.c, meio[1] - Math.sin(rad(e.t)) * e.c];
  set('tronco', `M${f1(e.q[0])} ${f1(e.q[1])}Q${f1(ctrl[0])} ${f1(ctrl[1])} ${f1(e.om[0])} ${f1(e.om[1])}`);
  const fimShort = entre(e.q, ctrl, 0.45);
  set('quadril', e.semPernas ? '' : `M${f1(e.q[0])} ${f1(e.q[1])}L${f1(fimShort[0])} ${f1(fimShort[1])}`);
  const larg = e.frente ? 22 : 18;
  els.tronco.setAttribute('stroke-width', larg);
  els.quadril.setAttribute('stroke-width', larg + 1);

  // Pescoço e cabeça (cabelo atrás/em cima, rosto e olho virados para a frente).
  set('pescoco', capsula(e.om, soma(e.om, dir(e.h, 7)), 3.6, 3.6));
  const face = e.h - 90;
  const pele = e.frente ? soma(e.cab, dir(e.h, -1.8)) : soma(soma(e.cab, dir(face, 1.8)), dir(e.h, -1.6));
  els.cabelo.setAttribute('cx', f1(e.cab[0]));
  els.cabelo.setAttribute('cy', f1(e.cab[1]));
  els.rosto.setAttribute('cx', f1(pele[0]));
  els.rosto.setAttribute('cy', f1(pele[1]));
  const olhos = e.frente
    ? [soma(pele, dir(e.h + 90, 2.8)), soma(pele, dir(e.h - 90, 2.8))]
    : [soma(soma(pele, dir(face, 4)), dir(e.h, 1.2)), null];
  olhos.forEach((p, i) => {
    const o = els['olho' + i];
    o.setAttribute('visibility', p ? 'visible' : 'hidden');
    if (p) { o.setAttribute('cx', f1(p[0])); o.setAttribute('cy', f1(p[1])); }
  });
  els.longe.setAttribute('class', e.frente ? 'longe frente' : 'longe');
}

const suave = (k) => (1 - Math.cos(Math.PI * k)) / 2;

export function definicao(exId, nivel) {
  const def = ANIMACOES[exId];
  if (!def?.niveis) return def ?? null;
  return def.niveis[Math.min(Math.max(nivel ?? 0, 0), def.niveis.length - 1)];
}

// Monta a animação dentro de `container`. Retorna uma função para parar.
export function animar(container, exId, { nivel, quadroFixo } = {}) {
  const def = definicao(exId, nivel);
  if (!def) { container.innerHTML = ''; return () => {}; }

  container.innerHTML = `
    <svg class="boneco" viewBox="0 -2 200 144" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Demonstração animada">
      <line x1="4" y1="${CHAO + 3.6}" x2="196" y2="${CHAO + 3.6}" class="chao"/>
      ${def.props ?? ''}
      <g class="longe">${LADO('L')}${BRACO('L')}</g>
      <path class="camisa-traco" data-p="tronco"/>
      <path class="short-traco" data-p="quadril"/>
      ${LADO('P')}
      <path class="pele" data-p="pescoco"/>
      <circle class="cabelo" r="9" data-p="cabelo"/>
      <circle class="pele" r="7.6" data-p="rosto"/>
      <circle class="olho" r="1.3" data-p="olho0"/><circle class="olho" r="1.3" data-p="olho1"/>
      ${BRACO('P')}
    </svg>`;
  const svg = container.querySelector('svg');
  const els = { longe: svg.querySelector('.longe') };
  svg.querySelectorAll('[data-p]').forEach((n) => { els[n.dataset.p] = n; });

  const quadros = def.quadros.map(resolver);
  const tempos = def.quadros.map((q) => ({ pausa: q.pausa ?? 0, ms: q.ms ?? 600 }));
  const ciclo = tempos.reduce((s, t) => s + t.pausa + t.ms, 0);
  const inicio = performance.now();
  let raf = 0;

  function quadro(agora) {
    if (!svg.isConnected) return;
    let t = (agora - inicio) % ciclo;
    for (let i = 0; i < quadros.length; i++) {
      if (t < tempos[i].pausa) { desenhar(els, esqueleto(quadros[i])); break; }
      t -= tempos[i].pausa;
      if (t < tempos[i].ms) {
        desenhar(els, interpolar(quadros[i], quadros[(i + 1) % quadros.length], suave(t / tempos[i].ms)));
        break;
      }
      t -= tempos[i].ms;
    }
    raf = requestAnimationFrame(quadro);
  }
  desenhar(els, esqueleto(quadros[quadroFixo ?? 0]));
  if (quadroFixo != null) return () => {};
  raf = requestAnimationFrame(quadro);
  return () => cancelAnimationFrame(raf);
}
