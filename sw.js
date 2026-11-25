// Service worker: guarda o app no aparelho para funcionar offline.
// Estratégia "rede primeiro": com internet pega a versão nova; sem internet usa o cache.
// Ao publicar uma versão nova, aumente VERSAO.
const VERSAO = '2026.11.25-165318';
const CACHE = `calistenia-${VERSAO}`;
const ARQUIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/app.js',
  'js/datas.js',
  'js/plano.js',
  'js/storage.js',
  'js/som.js',
  'js/telaAcesa.js',
  'js/timer.js',
  'js/dados/exercicios.js',
  'js/dados/treinos.js',
  'js/telas/inicio.js',
  'js/telas/hoje.js',
  'js/telas/timer.js',
  'js/telas/exercicio.js',
  'js/telas/ajustes.js',
  'js/telas/calendario.js',
  'js/animacao/boneco.js',
  'js/animacao/poses.js',
  'js/registros.js',
  'js/dialogo.js',
  'js/texto.js',
  'js/versao.js',
  'js/telas/progresso.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        if (resp.ok) {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copia));
        }
        return resp;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))),
  );
});
