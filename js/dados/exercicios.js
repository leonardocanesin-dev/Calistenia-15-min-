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
  mob_cocoras_balanco: {
    nome: 'Cócoras com balanço',
    como: [
      'Agache bem fundo, pés inteiros no chão, e apoie as mãos no chão à frente.',
      'Leve o peso devagar para as mãos, deixando os joelhos irem à frente.',
      'Volte o peso para os pés e sente fundo de novo. Respire solto.',
    ],
    erros: ['Tirar os calcanhares do chão', 'Fazer rápido, com tranco'],
  },
  mob_afastada: {
    nome: 'Flexão à frente, pernas afastadas',
    como: [
      'Em pé, pernas bem afastadas e pontas dos pés para a frente.',
      'Dobre o quadril (não a lombar) e desça o tronco entre as pernas.',
      'Apoie as mãos no chão e solte a cabeça. A cada expiração, desça um pouco mais.',
    ],
    erros: ['Travar os joelhos com força', 'Forçar com balanço'],
  },
  mob_mesa_invertida: {
    nome: 'Mesa invertida',
    como: [
      'Sentado, joelhos dobrados, pés no chão e mãos no chão atrás do quadril.',
      'Empurre o chão e suba o quadril até o tronco ficar reto como uma mesa.',
      'Abra o peito, segure 1 segundo no alto e desça devagar.',
    ],
    erros: ['Encolher os ombros perto das orelhas', 'Deixar o quadril cair no alto'],
  },
  mob_90_90: {
    nome: 'Sentado 90/90, braços acima',
    ladoALado: true,
    trocaTexto: 'Troque a perna da frente!',
    como: [
      'Sentado no chão: perna da frente dobrada a 90° na frente, a de trás dobrada a 90° atrás.',
      'Estique os braços acima da cabeça e cresça a coluna.',
      'Incline o tronco devagar sobre a perna da frente e volte. Troque de lado na metade.',
    ],
    erros: ['Arredondar as costas', 'Prender a respiração'],
  },
  mob_agulha: {
    nome: 'Passa a agulha (rotação torácica)',
    ladoALado: true,
    como: [
      'De quatro apoios, mãos embaixo dos ombros e joelhos embaixo do quadril.',
      'Abra um braço para o teto, girando o peito e olhando para a mão.',
      'Depois passe esse braço por baixo do outro, encostando o ombro no chão. Troque de lado na metade.',
    ],
    erros: ['Girar o quadril junto', 'Fazer rápido'],
  },
  mob_sapo: {
    nome: 'Sapo com braços à frente',
    como: [
      'Joelhos no chão bem afastados, antebraços ou mãos no chão à frente.',
      'Leve o quadril para trás devagar, com o peito perto do chão e os braços esticados.',
      'Volte um pouco à frente e repita, sentindo a parte de dentro das coxas.',
    ],
    erros: ['Forçar a abertura dos joelhos até doer', 'Afundar a lombar'],
  },
  mob_cocoras: {
    nome: 'Cócoras profunda (segurar)',
    como: [
      'Agache o mais fundo que conseguir, pés inteiros no chão.',
      'Cotovelos por dentro dos joelhos, mãos juntas, peito aberto.',
      'Fique parado respirando fundo. Se o calcanhar sobe, afaste mais os pés.',
    ],
    erros: ['Calcanhar saindo do chão', 'Costas muito arredondadas'],
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
