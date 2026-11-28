// Catálogo de exercícios: níveis (escada de progressão), instruções e erros comuns.
// `inicial` é o nível padrão (índice em `niveis`) até você trocar.

export const EXERCICIOS = {
  // ---------- Circuito ----------
  agachamento: {
    nome: 'Agachamento',
    niveis: ['Com apoio na cadeira', 'Livre', 'Com salto', 'Búlgaro', 'Pistol com apoio'],
    inicial: 1,
    como: [
      'Pés na largura dos ombros, pontas levemente para fora.',
      'Desça empurrando o quadril para trás, como se fosse sentar.',
      'Coxas pelo menos paralelas ao chão, peito aberto.',
      'Suba empurrando o chão com o pé inteiro.',
    ],
    erros: ['Joelhos caindo para dentro', 'Calcanhar saindo do chão', 'Costas arredondadas'],
  },
  flexao: {
    nome: 'Flexão de braço',
    niveis: ['Na parede', 'Mãos na mesa', 'Joelhos no chão', 'Normal', 'Diamante', 'Archer'],
    inicial: 2,
    como: [
      'Mãos um pouco mais abertas que os ombros.',
      'Corpo reto da cabeça aos pés (ou joelhos), abdômen firme.',
      'Desça até o peito quase tocar o apoio, cotovelos a ~45°.',
      'Empurre de volta até esticar os braços.',
    ],
    erros: ['Quadril afundando', 'Cotovelos abertos a 90°', 'Amplitude curta'],
  },
  ponte: {
    nome: 'Ponte de glúteo',
    niveis: ['Duas pernas', 'Uma perna', 'Uma perna com pé no sofá'],
    inicial: 0,
    como: [
      'Deitado de costas, joelhos dobrados, pés perto do quadril.',
      'Empurre o chão com os calcanhares e suba o quadril.',
      'No topo, aperte o glúteo por 1 segundo.',
      'Desça devagar sem encostar totalmente.',
    ],
    erros: ['Arquear a lombar no topo', 'Empurrar com a ponta dos pés'],
  },
  prancha: {
    nome: 'Prancha',
    niveis: ['Com joelhos', 'Normal', 'Com toque no ombro'],
    inicial: 1,
    isometria: true,
    como: [
      'Antebraços no chão, cotovelos embaixo dos ombros.',
      'Corpo em linha reta, abdômen e glúteo contraídos.',
      'Olhe para o chão, respire normalmente.',
    ],
    erros: ['Quadril alto demais', 'Lombar afundando', 'Prender a respiração'],
  },
  afundo: {
    nome: 'Afundo alternado',
    niveis: ['Estático', 'Alternado', 'Com salto'],
    inicial: 1,
    como: [
      'Dê um passo largo à frente.',
      'Desça até os dois joelhos ficarem a ~90°.',
      'Joelho de trás quase toca o chão.',
      'Volte e troque a perna.',
    ],
    erros: ['Joelho da frente passando muito da ponta do pé', 'Tronco inclinado para frente', 'Passo curto demais'],
  },
  remada: {
    nome: 'Remada invertida (mesa)',
    niveis: ['Joelhos dobrados', 'Pernas esticadas', 'Com pausa de 2s em cima'],
    inicial: 0,
    aviso: 'Use uma mesa firme que aguente seu peso e não tombe. Teste antes!',
    como: [
      'Deite embaixo da mesa e segure a borda com as mãos.',
      'Corpo reto, calcanhares (ou pés) no chão.',
      'Puxe o peito até a borda, apertando as escápulas.',
      'Desça controlando até esticar os braços.',
    ],
    erros: ['Quadril caindo', 'Puxar só com os braços', 'Descer rápido demais'],
  },
  pike: {
    nome: 'Flexão pike',
    niveis: ['Pés no chão', 'Pés no sofá', 'Elevação com apoio na parede'],
    inicial: 0,
    como: [
      'Forme um "V" invertido: quadril alto, mãos e pés no chão.',
      'Dobre os cotovelos levando a cabeça em direção ao chão.',
      'A cabeça vai à frente das mãos, formando um triângulo.',
      'Empurre de volta até esticar os braços.',
    ],
    erros: ['Quadril baixo (vira flexão comum)', 'Cotovelos abrindo para os lados'],
  },
  superman: {
    nome: 'Superman',
    niveis: ['Braços ao lado', 'Braços à frente', 'Nadador'],
    inicial: 1,
    como: [
      'Deitado de bruços, braços estendidos.',
      'Tire braços, peito e pernas do chão ao mesmo tempo.',
      'Segure 1–2 segundos em cima e desça devagar.',
    ],
    erros: ['Jogar o pescoço para trás', 'Movimento rápido com impulso'],
  },
  burpee: {
    nome: 'Burpee',
    niveis: ['Sem pulo e sem flexão', 'Completo', 'Com salto grupado'],
    inicial: 0,
    como: [
      'Agache e apoie as mãos no chão.',
      'Leve os pés para trás até a posição de prancha.',
      'Volte os pés para perto das mãos.',
      'Fique de pé (ou salte, conforme o nível).',
    ],
    erros: ['Lombar afundando na prancha', 'Aterrissar com joelhos travados'],
  },
  mountain: {
    nome: 'Mountain climber',
    niveis: ['Lento', 'Rápido', 'Cruzado'],
    inicial: 1,
    como: [
      'Posição de prancha alta, mãos embaixo dos ombros.',
      'Leve um joelho em direção ao peito.',
      'Troque as pernas em ritmo constante.',
    ],
    erros: ['Quadril subindo', 'Ombros passando muito à frente das mãos'],
  },
  prancha_lateral: {
    nome: 'Prancha lateral',
    niveis: ['Com joelho apoiado', 'Normal', 'Com elevação de perna'],
    inicial: 1,
    isometria: true,
    ladoALado: true,
    como: [
      'De lado, antebraço no chão, cotovelo embaixo do ombro.',
      'Suba o quadril até o corpo ficar em linha reta.',
      'Metade do tempo de cada lado: o app avisa a hora de trocar.',
    ],
    erros: ['Quadril caindo', 'Corpo girando para frente', 'Ombro "afundando"'],
  },
  hollow: {
    nome: 'Hollow hold',
    niveis: ['Joelhos dobrados', 'Pernas esticadas', 'Braços acima da cabeça'],
    inicial: 0,
    isometria: true,
    como: [
      'Deitado de costas, cole a lombar no chão.',
      'Tire ombros e pernas do chão.',
      'Segure a posição como uma "banana".',
    ],
    erros: ['Lombar descolando do chão', 'Puxar o pescoço com força'],
  },

  // ---------- Aquecimento ----------
  polichinelo: {
    nome: 'Polichinelo',
    como: ['Salte abrindo pernas e braços ao mesmo tempo.', 'Volte fechando. Ritmo leve.'],
    erros: ['Aterrissar com os calcanhares'],
  },
  circulos_braco: {
    nome: 'Círculos de braço',
    ladoALado: true,
    trocaTexto: 'Troque o sentido!',
    como: ['Braços abertos na altura dos ombros.', 'Faça círculos, metade do tempo para cada sentido.'],
    erros: ['Encolher os ombros'],
  },
  agachamento_leve: {
    nome: 'Agachamento leve',
    como: ['Agachamento curto e controlado.', 'Só para aquecer joelhos e quadril.'],
    erros: ['Descer rápido demais'],
  },
  cat_camel: {
    nome: 'Cat-camel',
    como: ['De quatro apoios.', 'Arredonde as costas olhando o umbigo.', 'Depois afunde as costas olhando à frente.'],
    erros: ['Movimento rápido demais'],
  },

  // ---------- Alongamento ----------
  along_pernas: {
    nome: 'Alongamento de pernas',
    como: ['Sentado, pernas esticadas.', 'Incline o tronco à frente em direção aos pés.'],
    erros: ['Forçar com balanço'],
  },
  along_peito: {
    nome: 'Alongamento de peito',
    como: ['Mão apoiada na parede ou batente, braço na altura do ombro.', 'Gire o corpo para o lado oposto.'],
    erros: ['Elevar o ombro'],
  },
  along_ombros: {
    nome: 'Alongamento de ombros',
    ladoALado: true,
    como: ['Cruze um braço à frente do peito.', 'Puxe com o outro braço. Troque na metade.'],
    erros: ['Girar o tronco junto'],
  },

  // ---------- Movimentação e Flexibilidade (opcional) ----------
  mob_barriga_projetada: {
    nome: 'Barriga projetada',
    como: [
      'Comece sentado, joelhos dobrados, pés no chão e mãos apoiadas no chão atrás do corpo.',
      'Passe para os joelhos, com as mãos ainda atrás, e empurre o quadril para a frente e para cima.',
      'Abra o peito, solte a cabeça para trás e segure um pouco. Volte devagar e repita.',
    ],
    erros: ['Dobrar na lombar em vez de empurrar o quadril', 'Encolher os ombros perto das orelhas'],
  },

  mob_posterior: {
    nome: 'Alongamento do posterior',
    como: [
      'Em pé, pernas bem abertas, pontas dos pés para a frente e joelhos esticados.',
      'Dobre o quadril e deixe o tronco cair entre as pernas, segurando os cotovelos.',
      'Suba e desça o tronco devagar, sem tranco. A cada descida, deixe a cabeça ir um pouco mais perto do chão.',
    ],
    erros: ['Dobrar os joelhos para chegar mais baixo', 'Descer com balanço forte'],
  },

  mob_core: {
    nome: 'Fortalecimento do core',
    como: [
      'Sentado, pernas quase esticadas à frente e mãos no chão atrás do quadril, dedos para a frente.',
      'Empurre o chão, dobre os joelhos e suba o quadril até o tronco ficar reto como uma mesa.',
      'Segure 1 segundo com o abdômen e o bumbum firmes e desça devagar até sentar.',
    ],
    erros: ['Deixar o quadril cair no alto', 'Encolher os ombros perto das orelhas'],
  },

  mob_pelvica: {
    nome: 'Postura pélvica',
    ladoALado: true,
    trocaTexto: 'Troque a perna!',
    como: [
      'Sentado de pernas cruzadas, coluna alta, braços esticados acima da cabeça com as mãos juntas.',
      'Sem mexer o tronco e os braços, gire uma perna para trás, deixando o joelho dobrado ao lado do corpo.',
      'Volte a perna para a frente e repita. Na metade do tempo, troque de perna.',
    ],
    erros: ['Inclinar o tronco para o lado junto com a perna', 'Deixar os braços caírem'],
  },

  mob_toracico: {
    nome: 'Alongamento torácico',
    como: [
      'Joelhos no chão, tronco abaixado e cotovelos apoiados no chão, com as duas mãos segurando a nuca.',
      'Gire o tronco e leve um cotovelo para o teto, mantendo as mãos na nuca e o quadril parado.',
      'Volte com o cotovelo ao chão e faça para o outro lado. Vá alternando, um de cada vez.',
    ],
    erros: ['Puxar o pescoço com as mãos', 'Mexer o quadril junto com o giro'],
  },

  mob_corcunda: {
    nome: 'Corcunda',
    como: [
      'Joelhos no chão e mãos no chão bem afastadas, mais abertas que os ombros.',
      'Dobre um braço e desça o ombro do outro lado até perto do chão, com esse braço esticado.',
      'Volte ao centro e faça para o outro lado. Vá alternando, devagar.',
    ],
    erros: ['Fazer rápido, com tranco', 'Prender a respiração'],
  },

  // ---------- Descanso ----------
  caminhada: {
    nome: 'Caminhada ou alongamento livre',
    como: ['Caminhe em ritmo confortável ou alongue livremente.', 'O objetivo é se mexer, não cansar.'],
    erros: [],
  },
};

export function nivelAtual(id, niveisSalvos = {}) {
  const ex = EXERCICIOS[id];
  if (!ex?.niveis) return null;
  const i = niveisSalvos[id] ?? ex.inicial ?? 0;
  return { indice: i, nome: ex.niveis[i], total: ex.niveis.length };
}
