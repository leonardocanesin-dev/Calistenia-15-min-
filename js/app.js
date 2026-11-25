import { carregar } from './storage.js';
import { telaInicio } from './telas/inicio.js';
import { telaHoje } from './telas/hoje.js';
import { telaAjustes } from './telas/ajustes.js';
import { telaCalendario } from './telas/calendario.js';
import { telaProgresso } from './telas/progresso.js';

const ROTAS = {
  inicio: telaInicio,
  hoje: telaHoje,
  calendario: telaCalendario,
  progresso: telaProgresso,
  ajustes: telaAjustes,
};

function render() {
  const nome = location.hash.replace('#/', '') || 'inicio';
  const rota = ROTAS[nome] ? nome : 'inicio';
  const main = document.getElementById('conteudo');
  main.onclick = null;
  ROTAS[rota](main);
  document.querySelectorAll('#abas a').forEach((a) => a.classList.toggle('ativa', a.dataset.aba === rota));
  window.scrollTo(0, 0);
}

carregar();
window.addEventListener('hashchange', render);
render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW falhou', e));
}
