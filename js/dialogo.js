// Diálogo próprio do app (substitui confirm/alert do navegador, que alguns ambientes bloqueiam).
// Botões grandes, fácil de tocar no meio do treino.
//
// perguntar({ titulo, texto, opcoes: [{ rotulo, valor, tipo: 'principal'|'perigo'|'' }] })
//   → Promise com o `valor` escolhido, ou null se fechar tocando fora.
export function perguntar({ titulo, texto = '', opcoes }) {
  return new Promise((resolver) => {
    const fundo = document.createElement('div');
    fundo.className = 'dialogo-fundo';
    fundo.innerHTML = `
      <div class="dialogo" role="alertdialog" aria-modal="true" aria-labelledby="dlg-titulo">
        <h2 id="dlg-titulo">${titulo}</h2>
        ${texto ? `<p class="nota">${texto}</p>` : ''}
        <div class="dialogo-botoes">
          ${opcoes.map((o, i) => `<button class="btn ${o.tipo ?? ''}" data-i="${i}">${o.rotulo}</button>`).join('')}
        </div>
      </div>`;
    document.body.append(fundo);

    const fechar = (valor) => {
      fundo.remove();
      document.removeEventListener('keydown', tecla);
      resolver(valor);
    };
    const tecla = (e) => { if (e.key === 'Escape') fechar(null); };
    document.addEventListener('keydown', tecla);
    fundo.addEventListener('click', (e) => {
      if (e.target === fundo) return fechar(null);
      const i = e.target.closest('[data-i]')?.dataset.i;
      if (i != null) fechar(opcoes[Number(i)].valor);
    });
    fundo.querySelector('.dialogo-botoes .principal, .dialogo-botoes .perigo, .dialogo-botoes button')?.focus();
  });
}

export async function confirmar(titulo, texto, { sim = 'Sim', nao = 'Cancelar', perigo = false } = {}) {
  const r = await perguntar({ titulo, texto, opcoes: [
    { rotulo: sim, valor: true, tipo: perigo ? 'perigo' : 'principal' },
    { rotulo: nao, valor: false },
  ] });
  return r === true;
}

export function avisar(titulo, texto) {
  return perguntar({ titulo, texto, opcoes: [{ rotulo: 'OK', valor: true, tipo: 'principal' }] });
}
