// Wake Lock: impede a tela de apagar durante o treino.
// O navegador solta o bloqueio quando o app vai para segundo plano; pedimos de novo ao voltar.
let bloqueio = null;
let desejado = false;

async function pedir() {
  if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
  try {
    bloqueio = await navigator.wakeLock.request('screen');
    bloqueio.addEventListener('release', () => { bloqueio = null; });
  } catch (e) {
    console.warn('Wake Lock negado', e);
  }
}

export function manterTelaAcesa() {
  desejado = true;
  return pedir();
}

export function liberarTela() {
  desejado = false;
  bloqueio?.release().catch(() => {});
  bloqueio = null;
}

export const wakeLockSuportado = () => 'wakeLock' in navigator;

document.addEventListener('visibilitychange', () => {
  if (desejado && !bloqueio && document.visibilityState === 'visible') pedir();
});
