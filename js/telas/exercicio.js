// Tela de detalhe do exercício (abre ao tocar em qualquer exercício).
import { EXERCICIOS, nivelAtual } from '../dados/exercicios.js';
import { getEstado, atualizar } from '../storage.js';
import { animar } from '../animacao/boneco.js';

export function abrirExercicio(id, { aoFechar } = {}) {
  const ex = EXERCICIOS[id];
  const el = document.createElement('div');
  el.className = 'modal';
  el.setAttribute('role', 'dialog');
  document.body.append(el);

  function desenhar() {
    const nv = nivelAtual(id, getEstado().niveis);
    el.innerHTML = `
      <div class="conteudo">
        <div class="topo">
          <h1>${ex.nome}</h1>
          <button class="fechar" data-acao="fechar" aria-label="Fechar">✕</button>
        </div>
        <div class="anim-caixa"></div>
        ${nv ? `
        <div class="seletor-nivel">
          <button data-acao="menos" ${nv.indice === 0 ? 'disabled' : ''} aria-label="Nível anterior">‹</button>
          <div class="meio"><small>Nível ${nv.indice + 1} de ${nv.total}</small><strong>${nv.nome}</strong></div>
          <button data-acao="mais" ${nv.indice === nv.total - 1 ? 'disabled' : ''} aria-label="Próximo nível">›</button>
        </div>` : ''}
        ${ex.isometria ? '<p class="nota">Isometria: segure a posição o tempo todo.</p>' : ''}
        ${ex.aviso ? `<div class="aviso">⚠ ${ex.aviso}</div>` : ''}
        <h3>Como fazer</h3>
        <ol>${ex.como.map((t) => `<li>${t}</li>`).join('')}</ol>
        ${ex.erros.length ? `<h3>Erros comuns</h3><ul>${ex.erros.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
      </div>`;
    animar(el.querySelector('.anim-caixa'), id, { nivel: nv?.indice });
  }

  el.addEventListener('click', (e) => {
    const acao = e.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'fechar') {
      el.remove();
      aoFechar?.();
    } else if (acao === 'mais' || acao === 'menos') {
      const nv = nivelAtual(id, getEstado().niveis);
      atualizar((s) => { s.niveis[id] = nv.indice + (acao === 'mais' ? 1 : -1); });
      desenhar();
    }
  });

  desenhar();
}
