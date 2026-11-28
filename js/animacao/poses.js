// Poses-chave de cada exercício (vista lateral, boneco olhando para a direita).
// Exercícios com escada de progressão têm `niveis: [...]`, na mesma ordem de dados/exercicios.js.
//
// Campos: q = quadril [x,y] · t = tronco · h = cabeça · c = curva da coluna
//         pe / mao = alvos [x,y] (ou [[perto],[longe]], com null = usar ângulos)
//         th/sh = coxa/canela · ua/la = braço/antebraço (ângulos diretos)
//         jd / cd = sentido de dobra do joelho / cotovelo · pa = ângulo do pé
//         anc = ponto que fica parado ('pe', 'mao' ou 'q') · frente = vista de frente
//         esc = escala de segmentos (escorço) · ms = transição · pausa = tempo parado
export const CHAO = 134;
const G = CHAO;
const D = 128; // altura do tronco deitado no chão

// ---------- Cenário ----------
const MESA = `<g class="prop">
  <rect x="100" y="62" width="92" height="6" rx="2"/>
  <rect x="106" y="68" width="4" height="${G - 64}"/><rect x="182" y="68" width="4" height="${G - 64}"/></g>`;
const MESA_BAIXA = `<g class="prop">
  <rect x="136" y="98" width="60" height="5" rx="2"/><rect x="140" y="103" width="4" height="${G - 99}"/></g>`;
const CADEIRA = `<g class="prop">
  <rect x="120" y="82" width="5" height="${G - 79}" rx="2"/><rect x="120" y="106" width="34" height="5" rx="2"/>
  <rect x="149" y="111" width="5" height="${G - 107}"/></g>`;
const BANCO_TRAS = `<g class="prop"><rect x="44" y="111" width="36" height="6" rx="2"/>
  <rect x="48" y="117" width="4" height="${G - 113}"/><rect x="72" y="117" width="4" height="${G - 113}"/></g>`;
const SOFA_FRENTE = `<g class="prop"><rect x="112" y="112" width="52" height="${G - 108}" rx="5"/>
  <rect x="152" y="88" width="14" height="${G - 84}" rx="5"/></g>`;
const SOFA_TRAS = `<g class="prop"><rect x="20" y="110" width="52" height="${G - 106}" rx="5"/>
  <rect x="14" y="86" width="14" height="${G - 82}" rx="5"/></g>`;
const POSTE = `<g class="prop"><rect x="137" y="14" width="5" height="${G - 10}" rx="2"/></g>`;
const PAREDE_TRAS = `<g class="prop"><rect x="50" y="10" width="7" height="${G - 6}"/></g>`;
const PAREDE_FRENTE = `<g class="prop"><rect x="153" y="10" width="7" height="${G - 6}"/></g>`;
const PAREDE_INV = `<g class="prop"><rect x="80" y="10" width="7" height="${G - 6}"/></g>`;
const DIAMANTE = `<path class="marca" d="M134 120 l7 7 -7 7 -7 -7z"/>`;
const PAUSA_2S = `<text class="rotulo" x="160" y="30">2s ⏸</text>`;

// ---------- Poses reutilizadas ----------
const EM_PE = { q: [100, 86.3], t: 180, pe: [100, G], ua: [8, -6], la: [14, -2], anc: 'pe' };
const BRACOS_SOLTOS = { ua: [6, -6], la: [12, -2] };
const PRANCHA = { q: [106.4, 121.7], t: 104.8, h: 110, pe: [60, G], ua: 0, la: 90, anc: 'pe' };
const PRANCHA_JOELHOS = { q: [100.7, 124.1], t: 109.1, h: 112, th: -70.9, sh: -125, ua: 0, la: 90 };
const FLEXAO_ALTA = { q: [110, 112], t: 118, h: 112, pe: [68, G], mao: [140, G], anc: 'mao' };
const FLEXAO_BAIXA = { q: [116, 130], t: 94, h: 100, pe: [68, G], mao: [140, G], anc: 'mao' };
const AGACH_BAIXO = { q: [84, 108], t: 145, h: 150, pe: [100, G], ua: 90, la: 90, anc: 'pe' };

// Burpee (mãos em x=122).
const B_PE = { q: [100, 86.3], t: 180, pe: [100, G], ...BRACOS_SOLTOS };
const B_AGACHA = { q: [88, 118], t: 125, h: 120, pe: [100, G], mao: [122, G], anc: 'mao' };
const B_PRANCHA = { q: [92, 112], t: 118, h: 112, pe: [50, G], mao: [122, G], anc: 'mao' };
const B_FLEXAO = { q: [98, 130], t: 94, h: 100, pe: [50, G], mao: [122, G], anc: 'mao' };
const B_SALTO = { q: [100, 72], t: 180, th: [4, -4], sh: [-4, 4], ua: [165, 160], la: [172, 168] };

// Remada: pés mais longe = pernas esticadas.
const remada = (pe, extra = {}) => [
  { q: [96.6, 110], t: 120, h: 118, pe: [pe, G], jd: -1, mao: [104, 66], cd: 1, anc: 'mao', ms: 800, pausa: 150 },
  { q: [88.9, 100.1], t: 135, h: 95, pe: [pe, G], jd: -1, mao: [104, 66], cd: 1, anc: 'mao', ms: 800, pausa: 300, ...extra },
];

// Mountain climber.
const mountain = (alvo, ms, pausa = 0) => [
  { ...FLEXAO_ALTA, pe: [alvo, [68, G]], ms, pausa },
  { ...FLEXAO_ALTA, pe: [[68, G], alvo], ms, pausa },
];

// Prancha "respirando" (isometria).
const respira = (base, extra = {}) => [
  { ...base, ...extra, ms: 1600 },
  { ...base, ...extra, q: [base.q[0], base.q[1] - 1.3], ms: 1600 },
];

export const ANIMACOES = {
  // ======================= Circuito =======================
  agachamento: { niveis: [
    // 0. Com apoio na cadeira
    { props: CADEIRA, quadros: [
      { ...EM_PE, mao: [122, 84], ms: 1000, pausa: 200 },
      { ...AGACH_BAIXO, ua: undefined, la: undefined, mao: [122, 84], ms: 1000, pausa: 150 },
    ] },
    // 1. Livre
    { quadros: [
      { ...EM_PE, ua: 10, la: 10, ms: 900, pausa: 200 },
      { ...AGACH_BAIXO, ms: 900, pausa: 150 },
    ] },
    // 2. Com salto
    { quadros: [
      { ...AGACH_BAIXO, ua: -40, la: -30, ms: 300, pausa: 120 },
      { q: [100, 74], t: 180, th: [4, -4], sh: [-4, 4], ua: [165, 160], la: [172, 168], ms: 380 },
    ] },
    // 3. Búlgaro (pé de trás no banco)
    { props: BANCO_TRAS, quadros: [
      { q: [92, 90], t: 175, h: 178, pe: [[112, G], [64, 107]], pa: [null, -90], ua: [20, -10], la: [40, 10], anc: 'pe', ms: 900, pausa: 150 },
      { q: [90, 110], t: 170, h: 175, pe: [[112, G], [64, 107]], pa: [null, -90], ua: [20, -10], la: [40, 10], anc: 'pe', ms: 900, pausa: 150 },
    ] },
    // 4. Pistol com apoio (segurando um poste/batente)
    { props: POSTE, quadros: [
      { q: [100, 86.3], t: 180, pe: [[100, G], [114, 120]], mao: [136, 72], anc: 'pe', ms: 1100, pausa: 200 },
      { q: [86, 114], t: 140, h: 145, pe: [[100, G], [133, 118]], mao: [136, 96], anc: 'pe', ms: 1100, pausa: 200 },
    ] },
  ] },

  flexao: { niveis: [
    // 0. Na parede
    { props: PAREDE_FRENTE, quadros: [
      { q: [106.5, 87.2], t: 167.3, h: 170, pe: [96, G], mao: [150, 60], anc: 'mao', ms: 800, pausa: 150 },
      { q: [117, 90.9], t: 154, h: 160, pe: [96, G], mao: [150, 60], anc: 'mao', ms: 800, pausa: 100 },
    ] },
    // 1. Mãos na mesa
    { props: MESA_BAIXA, quadros: [
      { q: [89, 98.2], t: 138.3, h: 135, pe: [57, G], mao: [140, 96], anc: 'mao', ms: 800, pausa: 150 },
      { q: [96.4, 106.5], t: 125, h: 120, pe: [57, G], mao: [140, 96], anc: 'mao', ms: 800, pausa: 100 },
    ] },
    // 2. Joelhos no chão
    { quadros: [
      { q: [98.1, 116.3], t: 130.9, h: 128, th: -49.1, sh: -120, mao: [124, G], anc: 'mao', ms: 800, pausa: 150 },
      { q: [103.8, 128.7], t: 97.9, h: 102, th: -82.1, sh: -120, mao: [124, G], anc: 'mao', ms: 800, pausa: 100 },
    ] },
    // 3. Normal
    { quadros: [
      { ...FLEXAO_ALTA, pe: [68, G], ms: 800, pausa: 150 },
      { ...FLEXAO_BAIXA, ms: 800, pausa: 100 },
    ] },
    // 4. Diamante (mãos juntas embaixo do peito)
    { props: DIAMANTE, quadros: [
      { ...FLEXAO_ALTA, q: [104, 112], pe: [62, G], mao: [134, G], ms: 900, pausa: 150 },
      { ...FLEXAO_BAIXA, q: [110, 130], pe: [62, G], mao: [134, G], ms: 900, pausa: 100 },
    ] },
    // 5. Archer (vista de frente: desce para um lado, o outro braço fica esticado)
    { quadros: [
      { q: [97, 89.8], t: 0, h: 0, frente: true, esc: { T: 0.3, TH: 0, SH: 0 }, mao: [[66, G], [128, G]], cd: [-1, 1], ms: 700, pausa: 100 },
      { q: [84, 105.8], t: 0, h: 0, frente: true, esc: { T: 0.3, TH: 0, SH: 0 }, mao: [[66, G], [128, G]], cd: [-1, 1], ms: 700, pausa: 200 },
      { q: [97, 89.8], t: 0, h: 0, frente: true, esc: { T: 0.3, TH: 0, SH: 0 }, mao: [[66, G], [128, G]], cd: [-1, 1], ms: 700, pausa: 100 },
      { q: [110, 105.8], t: 0, h: 0, frente: true, esc: { T: 0.3, TH: 0, SH: 0 }, mao: [[66, G], [128, G]], cd: [-1, 1], ms: 700, pausa: 200 },
    ] },
  ] },

  ponte: { niveis: [
    // 0. Duas pernas
    { quadros: [
      { q: [88, D], t: -90, h: -92, pe: [118, G], pa: 90, ua: 82, la: 82, anc: 'pe', ms: 800, pausa: 250 },
      { q: [88, 106], t: -52, h: -75, pe: [118, G], pa: 90, ua: 82, la: 82, anc: 'pe', ms: 800, pausa: 500 },
    ] },
    // 1. Uma perna (a outra esticada no alto)
    { quadros: [
      { q: [88, D], t: -90, h: -92, pe: [[118, G], null], th: [0, 150], sh: [0, 150], pa: [90, null], ua: 82, la: 82, anc: 'pe', ms: 800, pausa: 250 },
      { q: [88, 106], t: -52, h: -75, pe: [[118, G], null], th: [0, 128], sh: [0, 128], pa: [90, null], ua: 82, la: 82, anc: 'pe', ms: 800, pausa: 500 },
    ] },
    // 2. Uma perna com pé no sofá
    { props: SOFA_FRENTE, quadros: [
      { q: [84, D], t: -90, h: -92, pe: [[124, 108], null], th: [0, 150], sh: [0, 150], pa: [90, null], ua: 82, la: 82, anc: 'pe', ms: 900, pausa: 250 },
      { q: [84, 106], t: -52.5, h: -75, pe: [[124, 108], null], th: [0, 128], sh: [0, 128], pa: [90, null], ua: 82, la: 82, anc: 'pe', ms: 900, pausa: 500 },
    ] },
  ] },

  prancha: { niveis: [
    { quadros: respira(PRANCHA_JOELHOS) },          // 0. Com joelhos
    { quadros: respira(PRANCHA) },                  // 1. Normal
    { quadros: [                                    // 2. Com toque no ombro
      { ...FLEXAO_ALTA, anc: 'pe', pe: [68, G], ms: 400, pausa: 200 },
      { ...FLEXAO_ALTA, anc: 'pe', pe: [68, G], mao: [[132, 100], [140, G]], ms: 400, pausa: 300 },
      { ...FLEXAO_ALTA, anc: 'pe', pe: [68, G], ms: 400, pausa: 200 },
      { ...FLEXAO_ALTA, anc: 'pe', pe: [68, G], mao: [[140, G], [132, 100]], ms: 400, pausa: 300 },
    ] },
  ] },

  afundo: { niveis: [
    // 0. Estático (pés parados, só sobe e desce)
    { quadros: [
      { q: [100, 92], t: 178, pe: [[120, G], [80, G]], ...BRACOS_SOLTOS, ms: 800, pausa: 150 },
      { q: [100, 108], t: 178, pe: [[120, G], [80, G]], ...BRACOS_SOLTOS, ms: 800, pausa: 150 },
    ] },
    // 1. Alternado
    { quadros: [
      { q: [100, 86.3], t: 180, pe: [100, G], ...BRACOS_SOLTOS, ms: 600, pausa: 100 },
      { q: [100, 108], t: 178, pe: [[124, G], [76, G]], ...BRACOS_SOLTOS, ms: 600, pausa: 200 },
      { q: [100, 86.3], t: 180, pe: [100, G], ...BRACOS_SOLTOS, ms: 600, pausa: 100 },
      { q: [100, 108], t: 178, pe: [[76, G], [124, G]], ...BRACOS_SOLTOS, ms: 600, pausa: 200 },
    ] },
    // 2. Com salto (troca as pernas no ar)
    { quadros: [
      { q: [100, 108], t: 178, pe: [[124, G], [76, G]], ua: [-30, 30], la: [-10, 50], ms: 320, pausa: 120 },
      { q: [100, 78], t: 180, th: [10, -10], sh: [-5, 5], ua: [30, -30], la: [50, -10], ms: 320 },
      { q: [100, 108], t: 178, pe: [[76, G], [124, G]], ua: [30, -30], la: [50, -10], ms: 320, pausa: 120 },
      { q: [100, 78], t: 180, th: [-10, 10], sh: [5, -5], ua: [-30, 30], la: [-10, 50], ms: 320 },
    ] },
  ] },

  remada: { niveis: [
    { props: MESA, quadros: remada(75) },                                   // 0. Joelhos dobrados
    { props: MESA, quadros: remada(55) },                                   // 1. Pernas esticadas
    { props: MESA + PAUSA_2S, quadros: remada(55, { pausa: 2000 }) },       // 2. Pausa de 2s em cima
  ] },

  pike: { niveis: [
    // 0. Pés no chão
    { quadros: [
      { q: [98, 88], t: 65.7, h: 60, pe: [84, G], mao: [131, G], anc: 'mao', ms: 800, pausa: 150 },
      { q: [104, 90], t: 50.8, h: 45, pe: [84, G], mao: [131, G], anc: 'mao', ms: 800, pausa: 100 },
    ] },
    // 1. Pés no sofá
    { props: SOFA_TRAS, quadros: [
      { q: [94, 76], t: 53.7, h: 50, pe: [64, 106], mao: [128, G], anc: 'mao', ms: 800, pausa: 150 },
      { q: [98, 78], t: 35, h: 30, pe: [64, 106], mao: [128, G], anc: 'mao', ms: 800, pausa: 100 },
    ] },
    // 2. Parada de mão com pés na parede
    { props: PAREDE_INV, quadros: [
      { q: [108, 62], t: 0, h: 0, pe: [92, 16], mao: [110, G], cd: 1, anc: 'mao', ms: 1000, pausa: 200 },
      { q: [112, 80], t: 0, h: 8, pe: [92, 34], mao: [110, G], cd: 1, anc: 'mao', ms: 1000, pausa: 100 },
    ] },
  ] },

  superman: { niveis: [
    // 0. Braços ao lado do corpo
    { quadros: [
      { q: [80, D], t: 90, h: 95, th: -90, sh: -90, ua: -92, la: -92, ms: 700, pausa: 200 },
      { q: [80, D], t: 101, h: 108, th: -101, sh: -103, ua: -104, la: -106, ms: 700, pausa: 700 },
    ] },
    // 1. Braços à frente
    { quadros: [
      { q: [80, D], t: 90, h: 95, th: -90, sh: -90, ua: 90, la: 90, ms: 700, pausa: 200 },
      { q: [80, D], t: 101, h: 108, th: -101, sh: -103, ua: 106, la: 108, ms: 700, pausa: 700 },
    ] },
    // 2. Nadador (braço e perna opostos alternando)
    { quadros: [
      { q: [80, D], t: 97, h: 104, th: [-90, -106], sh: [-90, -108], ua: [110, 88], la: [112, 88], ms: 550, pausa: 150 },
      { q: [80, D], t: 97, h: 104, th: [-106, -90], sh: [-108, -90], ua: [88, 110], la: [88, 112], ms: 550, pausa: 150 },
    ] },
  ] },

  burpee: { niveis: [
    // 0. Sem pulo e sem flexão (leva um pé de cada vez para trás)
    { quadros: [
      { ...B_PE, ms: 500, pausa: 100 },
      { ...B_AGACHA, ms: 450, pausa: 50 },
      { ...B_AGACHA, q: [90, 114], t: 122, pe: [[100, G], [50, G]], ms: 450 },
      { ...B_PRANCHA, ms: 450, pausa: 250 },
      { ...B_AGACHA, q: [90, 114], t: 122, pe: [[100, G], [50, G]], ms: 450 },
      { ...B_AGACHA, ms: 500, pausa: 50 },
    ] },
    // 1. Completo (flexão + salto)
    { quadros: [
      { ...B_PE, ms: 400, pausa: 50 },
      { ...B_AGACHA, ms: 350 },
      { ...B_PRANCHA, ms: 450 },
      { ...B_FLEXAO, ms: 450, pausa: 50 },
      { ...B_PRANCHA, ms: 350 },
      { ...B_AGACHA, ms: 350 },
      { ...B_SALTO, ms: 400 },
    ] },
    // 2. Com salto grupado (joelhos no peito no ar)
    { quadros: [
      { ...B_PE, ms: 400, pausa: 50 },
      { ...B_AGACHA, ms: 350 },
      { ...B_PRANCHA, ms: 450 },
      { ...B_FLEXAO, ms: 450, pausa: 50 },
      { ...B_PRANCHA, ms: 350 },
      { ...B_AGACHA, ms: 300 },
      { q: [100, 66], t: 172, h: 168, th: 100, sh: -10, ua: 60, la: 100, ms: 450, pausa: 60 },
    ] },
  ] },

  mountain: { niveis: [
    { quadros: mountain([124, 132], 700, 200) },    // 0. Lento
    { quadros: mountain([124, 132], 300) },         // 1. Rápido
    { quadros: mountain([130, 124], 400, 80) },     // 2. Cruzado (joelho sobe até o cotovelo oposto)
  ] },

  prancha_lateral: { niveis: [
    { quadros: respira(PRANCHA_JOELHOS, { ua: [0, 180], la: [90, 180] }) },  // 0. Joelho apoiado
    { quadros: respira(PRANCHA, { ua: [0, 180], la: [90, 180] }) },          // 1. Normal
    { quadros: [                                                              // 2. Elevação de perna
      { ...PRANCHA, ua: [0, 180], la: [90, 180], ms: 900, pausa: 200 },
      { ...PRANCHA, ua: [0, 180], la: [90, 180], pe: [[60, G], null], th: [0, -112], sh: [0, -112], ms: 900, pausa: 500 },
    ] },
  ] },

  hollow: { niveis: [
    // 0. Joelhos dobrados
    { quadros: [
      { q: [100, D], t: -105, h: -118, th: 150, sh: 80, ua: 95, la: 92, ms: 1400 },
      { q: [100, D], t: -108, h: -121, th: 147, sh: 78, ua: 98, la: 95, ms: 1400 },
    ] },
    // 1. Pernas esticadas
    { quadros: [
      { q: [100, D], t: -107, h: -120, th: 107, sh: 107, ua: 118, la: 112, ms: 1400 },
      { q: [100, D], t: -110, h: -123, th: 110, sh: 111, ua: 121, la: 115, ms: 1400 },
    ] },
    // 2. Braços acima da cabeça
    { quadros: [
      { q: [100, D], t: -107, h: -118, th: 107, sh: 107, ua: -104, la: -104, ms: 1400 },
      { q: [100, D], t: -110, h: -121, th: 110, sh: 111, ua: -107, la: -107, ms: 1400 },
    ] },
  ] },

  // ======================= Aquecimento =======================
  polichinelo: { quadros: [
    { q: [100, 86.3], t: 180, frente: true, th: [3, -3], sh: [0, 0], ua: [10, -10], la: [6, -6], ms: 300 },
    { q: [100, 82], t: 180, frente: true, th: [16, -16], sh: [16, -16], ua: [150, -150], la: [165, -165], ms: 300 },
  ] },

  circulos_braco: { quadros: [0, 90, 180, -90].map((a) => ({ ...EM_PE, ua: a, la: a, ms: 250 })) },

  agachamento_leve: { quadros: [
    { ...EM_PE, ua: 20, la: 20, ms: 700, pausa: 100 },
    { q: [93, 98], t: 165, h: 170, pe: [100, G], ua: 70, la: 70, anc: 'pe', ms: 700, pausa: 100 },
  ] },

  cat_camel: { quadros: [
    { q: [80, 108], t: 114.3, h: 60, c: 9, th: 0, sh: -90, ua: 0, la: 0, pa: -90, ms: 1200, pausa: 400 },
    { q: [80, 108], t: 114.3, h: 135, c: -7, th: 0, sh: -90, ua: 0, la: 0, pa: -90, ms: 1200, pausa: 400 },
  ] },

  // ======================= Alongamento =======================
  along_pernas: { quadros: [
    { q: [70, D], t: 180, th: 90, sh: 90, pa: 180, ua: 160, la: 165, ms: 1200, pausa: 300 },
    { q: [70, D], t: 118, h: 105, th: 90, sh: 90, pa: 180, ua: 82, la: 78, ms: 1200, pausa: 1800 },
  ] },

  along_peito: { props: PAREDE_TRAS, quadros: [
    { ...EM_PE, ua: [-90, 6], la: [-90, 0], ms: 1500, pausa: 500 },
    { ...EM_PE, t: 176, h: 172, ua: [-92, 6], la: [-92, 0], ms: 1500, pausa: 1000 },
  ] },

  along_ombros: { quadros: [
    { q: [100, 86.3], t: 180, frente: true, th: [3, -3], sh: 0, ua: [-85, -25], la: [-85, -100], ms: 600, pausa: 2400 },
    { q: [100, 86.3], t: 180, frente: true, th: [3, -3], sh: 0, ua: [25, 85], la: [100, 85], ms: 600, pausa: 2400 },
  ] },

  // ================ Movimentação e Flexibilidade ================
  // Cócoras funda, mãos no chão à frente; o peso vai para as mãos e volta.
  mob_cocoras_balanco: { quadros: [
    { q: [92, 125], t: 140, h: 150, pe: [102, G], mao: [126, G], anc: 'pe', ms: 1300, pausa: 400 },
    { q: [104, 114], t: 118, h: 112, pe: [102, G], mao: [128, G], anc: 'pe', ms: 1300, pausa: 600 },
  ] },

  // Vista de frente: pernas bem afastadas, tronco pendurado entre elas, mãos no chão.
  mob_afastada: { quadros: [
    { q: [100, 90], t: 0, h: 0, frente: true, esc: { T: 0.55 }, pe: [[76, G], [124, G]], mao: [[86, G], [114, G]], anc: 'pe', ms: 1800, pausa: 600 },
    { q: [100, 91], t: 0, h: 0, frente: true, esc: { T: 0.68 }, pe: [[76, G], [124, G]], mao: [[80, 126], [120, 126]], anc: 'pe', ms: 1800, pausa: 1200 },
  ] },

  // Sentado com mãos atrás → sobe o quadril até a "mesa".
  mob_mesa_invertida: { quadros: [
    { q: [94, 126], t: -150, h: -165, pe: [124, G], jd: 1, mao: [72, G], cd: 1, anc: 'pe', ms: 1000, pausa: 300 },
    { q: [98, 108], t: -92, h: -120, pe: [124, G], jd: -1, mao: [70, G], cd: 1, anc: 'pe', ms: 1000, pausa: 900 },
  ] },

  // Sentado 90/90, braços acima; inclina o tronco sobre a perna da frente e volta.
  mob_90_90: { quadros: [
    { q: [98, 126], t: 180, h: 180, th: [92, -88], sh: [-60, 60], pa: [0, 0], ua: [162, 166], la: [172, 176], ms: 1400, pausa: 600 },
    { q: [98, 126], t: 142, h: 140, th: [92, -88], sh: [-60, 60], pa: [0, 0], ua: [142, 146], la: [146, 150], ms: 1400, pausa: 900 },
  ] },

  // Quatro apoios: abre o braço para o teto, depois passa por baixo do corpo.
  mob_agulha: { quadros: [
    { q: [80, 108], t: 112, h: 150, th: 0, sh: -90, pa: -90, ua: [178, 0], la: [178, 0], mao: [null, [112, G]], ms: 1300, pausa: 500 },
    { q: [80, 110], t: 100, h: 60, c: 4, th: 0, sh: -90, pa: -90, ua: [-30, 0], la: [-70, 0], mao: [null, [112, G]], ms: 1300, pausa: 700 },
  ] },

  // Joelhos no chão, braços esticados à frente; o quadril vai para trás e volta.
  mob_sapo: { quadros: [
    { q: [80, 106], t: 75, h: 80, th: 0, sh: -90, pa: -90, mao: [146, G], anc: 'pe', ms: 1500, pausa: 400 },
    { q: [66, 118], t: 85, h: 88, th: 49, sh: -90, pa: -90, mao: [136, G], anc: 'pe', ms: 1500, pausa: 900 },
  ] },

  // Cócoras funda parada, cotovelos por dentro dos joelhos, respirando.
  mob_cocoras: { quadros: [
    { q: [94, 124], t: 165, h: 175, pe: [102, G], mao: [114, 102], cd: 1, ms: 1800 },
    { q: [94, 123], t: 169, h: 178, pe: [102, G], mao: [115, 100], cd: 1, ms: 1800 },
  ] },

  // ======================= Descanso =======================
  caminhada: { quadros: [
    { q: [100, 88], t: 178, th: [25, -20], sh: [8, -35], ua: [-25, 25], la: [-15, 40], ms: 450 },
    { q: [100, 88], t: 178, th: [-20, 25], sh: [-35, 8], ua: [25, -25], la: [40, -15], ms: 450 },
  ] },
};
