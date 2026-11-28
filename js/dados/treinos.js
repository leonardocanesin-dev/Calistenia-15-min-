export const TREINOS = {
  A: { id: 'A', nome: 'Treino A', subtitulo: 'Empurrar + pernas', exercicios: ['agachamento', 'flexao', 'ponte', 'prancha'] },
  B: { id: 'B', nome: 'Treino B', subtitulo: 'Puxar + pernas', exercicios: ['afundo', 'remada', 'pike', 'superman'] },
  C: { id: 'C', nome: 'Treino C', subtitulo: 'Condicionamento + core', exercicios: ['burpee', 'mountain', 'prancha_lateral', 'hollow'] },
  D: { id: 'D', nome: 'Descanso ativo', subtitulo: 'Caminhada ou alongamento livre', exercicios: ['caminhada'] },
};

export const AQUECIMENTO = { exercicios: ['polichinelo', 'circulos_braco', 'agachamento_leve', 'cat_camel'], dur: 30 };
export const ALONGAMENTO = { exercicios: ['along_pernas', 'along_peito', 'along_ombros'], dur: 20 };
// Opcional, oferecido ao fim de cada treino (não muda nenhum treino).
export const MOBILIDADE = {
  nome: 'Movimentação e Flexibilidade',
  exercicios: ['mob_barriga_projetada', 'mob_posterior', 'mob_core', 'mob_pelvica', 'mob_toracico', 'mob_corcunda'],
  dur: 40,
};
export const VOLTAS = 3;
export const PREPARAR = 10;        // contagem antes de começar
export const ESCOLHA = 15;         // entre aquecimento e 1º exercício: escolher o nível
export const DESCANSO_ATIVO = 15 * 60;
