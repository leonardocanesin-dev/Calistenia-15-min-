// Bipes gerados com Web Audio (sem arquivos de som) + vibração (Android).
let ctx = null;

// Precisa ser chamado dentro de um toque do usuário (exigência do iPhone/Chrome).
export function desbloquearSom() {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const b = ctx.createBuffer(1, 1, 22050);
    const s = ctx.createBufferSource();
    s.buffer = b;
    s.connect(ctx.destination);
    s.start(0);
  } catch (e) {
    console.warn('Áudio indisponível', e);
  }
}

function bip(freq, dur, atraso = 0, vol = 0.7) {
  if (!ctx) return;
  const t = ctx.currentTime + atraso;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'triangle';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function vibrar(padrao) {
  try { navigator.vibrate?.(padrao); } catch {}
}

export const som = {
  contagem() { bip(880, 0.12); vibrar(80); },
  esforco()  { bip(1320, 0.15); bip(1320, 0.35, 0.18); vibrar([200, 100, 200]); },
  pausa()    { bip(587, 0.6); vibrar(500); },
  troca()    { [0, 0.2, 0.4].forEach((a) => bip(990, 0.14, a)); vibrar([100, 80, 100, 80, 100]); },
  fim()      { [523, 659, 784, 1047].forEach((f, i) => bip(f, 0.3, i * 0.18)); vibrar([300, 100, 300, 100, 600]); },
};
