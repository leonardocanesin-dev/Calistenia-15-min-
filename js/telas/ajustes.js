import { getEstado, atualizar, exportarJSON, importarJSON, copiaAutomatica, restaurarCopiaAutomatica } from '../storage.js';
import { iso, dataCurta } from '../datas.js';
import { VERSAO_APP } from '../versao.js';
import { confirmar, avisar } from '../dialogo.js';
import { esc, limparNome, NOME_MAX } from '../texto.js';
import { saudacao } from './inicio.js';

// No celular abre o menu de compartilhar (salvar no Drive, mandar no WhatsApp…); no PC baixa o arquivo.
const previaNome = (nome) => `Prévia: <strong>${esc(saudacao(nome))}</strong>`;

const marcarBackup =() => atualizar((s) => { s.ultimoBackup = iso(new Date()); });

async function exportar() {
  const nome = `calistenia-backup-${iso(new Date())}.json`;
  const arquivo = new File([exportarJSON()], nome, { type: 'application/json' });
  if (navigator.canShare?.({ files: [arquivo] })) {
    try { await navigator.share({ files: [arquivo], title: 'Backup Calistenia' }); marcarBackup(); return; } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(arquivo);
  const a = Object.assign(document.createElement('a'), { href: url, download: nome });
  document.body.append(a);
  a.click();
  marcarBackup();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
import { semanaDoPlano, tempos, anoFinal } from '../plano.js';
import { hoje, deISO } from '../datas.js';
import { desbloquearSom, som } from '../som.js';
import { wakeLockSuportado } from '../telaAcesa.js';

export function telaAjustes(main) {
  const est = getEstado();
  const sem = semanaDoPlano(hoje(), est.inicio);
  const t = tempos(sem);
  const copia = copiaAutomatica();
  const instalado = matchMedia('(display-mode: standalone)').matches || navigator.standalone;

  main.innerHTML = `
    <header class="cabecalho"><div class="data">Ajustes</div></header>

    <section class="card">
      <h2>Seu nome</h2>
      <label class="campo">
        <span class="nota">Aparece na saudação da tela Início. Deixe em branco para não usar nome.</span>
        <input type="text" id="nome" value="${esc(est.nome)}" maxlength="${NOME_MAX}"
          placeholder="Como quer ser chamado?" autocomplete="given-name" enterkeyhint="done">
      </label>
      <p class="nota" id="nome-previa">${previaNome(est.nome)}</p>
    </section>

    <section class="card">
      <h2>Início do plano</h2>
      <label class="campo">
        <span class="nota">A semana 1 é a semana (seg–dom) que contém esta data.</span>
        <input type="date" id="inicio" value="${est.inicio}">
      </label>
      <p class="nota">Hoje: semana ${sem} · ${t.esforco}s esforço / ${t.pausa}s pausa
        (semanas 1–2: 30/30, a partir da 3: 40/20).</p>
    </section>

    <section class="card">
      <h2>Fim do plano: 31/12/${anoFinal(est)}</h2>
      <button class="btn secundario" data-acao="estender">+ Estender até 31/12/${anoFinal(est) + 1}</button>
      ${anoFinal(est) > deISO(est.inicio).getFullYear() && anoFinal(est) > hoje().getFullYear()
        ? `<button class="btn" data-acao="encurtar">− Voltar para 31/12/${anoFinal(est) - 1}</button>` : ''}
    </section>

    <section class="card">
      <h2>Backup dos dados</h2>
      <p class="nota">Seus treinos, repetições e níveis ficam só neste aparelho. Exporte de vez em quando
        e guarde o arquivo (Drive, e-mail, WhatsApp) para não perder nada se trocar de celular.</p>
      <p class="nota">${est.registros.length} treinos com repetições · ${Object.keys(est.dias).length} dias marcados</p>
      <button class="btn" data-acao="exportar">⬇ Exportar backup (JSON)</button>
      <label class="btn secundario" for="arquivo-backup">⬆ Importar backup</label>
      <input type="file" id="arquivo-backup" accept="application/json,.json" hidden>
    </section>

    <section class="card">
      <h2>Som e vibração</h2>
      <p class="nota">No iPhone não existe vibração para web apps: o aviso é só sonoro.
        Verifique também se o botão de silencioso está desligado.</p>
      <button class="btn" data-acao="testar">🔊 Testar aviso</button>
    </section>

    <section class="card">
      <h2>Sobre este aparelho</h2>
      <p class="nota">Tela sempre acesa (Wake Lock): ${wakeLockSuportado() ? '✔ suportado' : '✖ não suportado neste navegador'}<br>
        Instalado como app: ${instalado ? '✔ sim' : 'não (abra pelo navegador e use “Adicionar à tela inicial”)'}<br>
        Seus dados ficam só neste aparelho.</p>
    </section>

    <section class="card">
      <h2>Sobre o app</h2>
      <p class="nota">Versão instalada: <strong>${VERSAO_APP}</strong><br>
        Atualizações chegam sozinhas quando você abre o app com internet. Seus dados não são apagados.</p>
      ${copia ? `
        <p class="nota">Cópia automática de antes da última atualização (de ${dataCurta(new Date(copia.em))}):
          ${copia.treinos} ${copia.treinos === 1 ? 'treino registrado' : 'treinos registrados'}, ${copia.dias} ${copia.dias === 1 ? 'dia marcado' : 'dias marcados'}.</p>
        <button class="btn perigo-contorno" data-acao="restaurar-copia">↺ Voltar aos dados de antes da atualização</button>` : ''}
    </section>`;

  // Nome: salva enquanto digita (sem redesenhar a tela, para não perder o foco).
  const campoNome = main.querySelector('#nome');
  campoNome.oninput = () => {
    const nome = limparNome(campoNome.value);
    atualizar((s) => { s.nome = nome; });
    main.querySelector('#nome-previa').innerHTML = previaNome(nome);
  };
  campoNome.onkeydown = (e) => { if (e.key === 'Enter') campoNome.blur(); };
  campoNome.onblur = () => { campoNome.value = limparNome(campoNome.value); };

  main.querySelector('#inicio').onchange = (e) => {
    if (!e.target.value) return;
    atualizar((s) => { s.inicio = e.target.value; });
    telaAjustes(main);
  };
  main.querySelector('#arquivo-backup').onchange = async (e) => {
    const arq = e.target.files?.[0];
    e.target.value = '';
    if (!arq) return;
    const ok = await confirmar('Importar este backup?', 'Os dados atuais deste aparelho serão substituídos pelos do arquivo.',
      { sim: 'Importar', perigo: true });
    if (!ok) return;
    try {
      importarJSON(await arq.text());
      await avisar('Backup importado!', 'Seus treinos, repetições e níveis foram restaurados.');
      telaAjustes(main);
    } catch (erro) {
      avisar('Não deu para importar', erro.message);
    }
  };

  main.onclick = async (e) => {
    const acao = e.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'exportar') return exportar();
    if (acao === 'restaurar-copia') {
      const ok = await confirmar('Voltar aos dados de antes da atualização?',
        `Os dados atuais serão trocados pela cópia de ${dataCurta(new Date(copia.em))} (${copia.treinos} treinos registrados). Use só se algo sumiu depois de uma atualização.`,
        { sim: 'Restaurar cópia', perigo: true });
      if (!ok) return;
      restaurarCopiaAutomatica();
      await avisar('Dados restaurados', 'A cópia de antes da atualização foi recuperada.');
      return telaAjustes(main);
    }
    if (acao === 'estender' || acao === 'encurtar') {
      atualizar((s) => { s.fimAno = anoFinal(s) + (acao === 'estender' ? 1 : -1); });
      return telaAjustes(main);
    }
    if (acao === 'testar') {
      desbloquearSom();
      som.esforco();
      setTimeout(() => som.troca(), 900);
      setTimeout(() => som.pausa(), 1800);
    }
  };
}
