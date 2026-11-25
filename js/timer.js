// Motor do timer: monta a sequência de etapas e controla o tempo.
// Usa relógio absoluto (Date.now), então não "atrasa" se o celular engasgar.
import { TREINOS, AQUECIMENTO, ALONGAMENTO, VOLTAS, PREPARAR, DESCANSO_ATIVO } from './dados/treinos.js';
import { EXERCICIOS } from './dados/exercicios.js';
import { tempos } from './plano.js';
import { som } from './som.js';

export function montarEtapas(treinoId, semana) {
  if (treinoId === 'D') {
    return [
      { fase: 'preparar', exId: 'caminhada', dur: 5 },
      { fase: 'descanso', exId: 'caminhada', dur: DESCANSO_ATIVO },
    ];
  }
  const { esforco, pausa } = tempos(semana);
  const lista = TREINOS[treinoId].exercicios;
  const troca = (id) => !!EXERCICIOS[id].ladoALado;
  const etapas = [{ fase: 'preparar', exId: AQUECIMENTO.exercicios[0], dur: PREPARAR }];

  for (const id of AQUECIMENTO.exercicios) {
    etapas.push({ fase: 'aquecimento', exId: id, dur: AQUECIMENTO.dur, trocaLado: troca(id) });
  }
  for (let v = 1; v <= VOLTAS; v++) {
    lista.forEach((id, k) => {
      etapas.push({ fase: 'esforco', exId: id, dur: esforco, volta: v, trocaLado: troca(id) });
      const ultimo = k === lista.length - 1;
      const fimDoCircuito = ultimo && v === VOLTAS;
      etapas.push({
        fase: 'pausa',
        feito: id,                                   // exercício que acabou (para registrar reps)
        voltaFeita: v,
        esforco,
        exId: fimDoCircuito ? ALONGAMENTO.exercicios[0] : ultimo ? lista[0] : lista[k + 1],
        volta: fimDoCircuito ? v : ultimo ? v + 1 : v,
        dur: pausa,
      });
    });
  }
  for (const id of ALONGAMENTO.exercicios) {
    etapas.push({ fase: 'alongamento', exId: id, dur: ALONGAMENTO.dur, trocaLado: troca(id) });
  }
  return etapas;
}

export class Sessao {
  constructor(etapas, { aoMudar, aoTick, aoFim, aoTrocar } = {}) {
    this.etapas = etapas;
    this.cb = { aoMudar, aoTick, aoFim, aoTrocar };
    this.i = 0;
    this.restanteMs = etapas[0].dur * 1000;
    this.fimEm = 0;
    this.rodando = false;
    this.terminou = false;
    this.ultimoSeg = null;
    this.trocou = false;
    this.intervalo = null;
  }

  get etapa() { return this.etapas[this.i]; }

  restante() {
    return this.rodando ? Math.max(0, this.fimEm - Date.now()) : this.restanteMs;
  }

  restanteTotal() {
    let s = this.restante() / 1000;
    for (let k = this.i + 1; k < this.etapas.length; k++) s += this.etapas[k].dur;
    return s;
  }

  iniciar() {
    if (this.rodando || this.terminou) return;
    this.rodando = true;
    this.fimEm = Date.now() + this.restanteMs;
    this.intervalo = setInterval(() => this._tick(), 100);
    this._tick();
  }

  pausar() {
    if (!this.rodando) return;
    this.restanteMs = this.restante();
    this.rodando = false;
    clearInterval(this.intervalo);
    this.cb.aoTick?.(this);
  }

  alternar() { this.rodando ? this.pausar() : this.iniciar(); }

  proxima() { this._irPara(this.i + 1); }

  // Se já passou mais de 3s na etapa, volta ao início dela; senão, à anterior.
  anterior() {
    const decorrido = this.etapa.dur * 1000 - this.restante();
    this._irPara(decorrido > 3000 ? this.i : Math.max(0, this.i - 1));
  }

  parar() {
    this.rodando = false;
    clearInterval(this.intervalo);
  }

  _irPara(i) {
    if (i >= this.etapas.length) return this._finalizar();
    this.i = i;
    this.restanteMs = this.etapa.dur * 1000;
    if (this.rodando) this.fimEm = Date.now() + this.restanteMs;
    this.ultimoSeg = null;
    this.trocou = false;
    if (this.rodando) {
      const f = this.etapa.fase;
      f === 'pausa' || f === 'preparar' ? som.pausa() : som.esforco();
    }
    this.cb.aoMudar?.(this);
    this._tick();
  }

  _finalizar() {
    this.parar();
    this.terminou = true;
    som.fim();
    this.cb.aoFim?.(this);
  }

  _tick() {
    const ms = this.restante();
    if (this.rodando) {
      const seg = Math.ceil(ms / 1000);
      if (seg !== this.ultimoSeg) {
        this.ultimoSeg = seg;
        if (seg >= 1 && seg <= 3) som.contagem();
      }
      if (this.etapa.trocaLado && !this.trocou && ms <= this.etapa.dur * 500) {
        this.trocou = true;
        som.troca();
        this.cb.aoTrocar?.(this);
      }
      if (ms <= 0) return this.proxima();
    }
    this.cb.aoTick?.(this);
  }
}
