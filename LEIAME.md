# Calistenia 15' — guia de uso

App de treino (PWA): funciona no navegador, instala na tela inicial do celular e funciona offline.
Os dados ficam **só no aparelho** (sem login).

---

## 1. Publicar pela primeira vez (uma vez só)

1. **Crie a conta** em https://github.com/signup (grátis).
2. **Crie o repositório:** https://github.com/new
   - Nome: `calistenia`
   - Marque **Public** (o GitHub Pages grátis exige repositório público; o código fica visível, os seus dados não)
   - Não marque nenhuma outra opção → **Create repository**
3. **Envie o app** — no PowerShell:
   ```powershell
   cd F:\Claude\calistenia
   .\publicar.ps1 -Usuario SEU_USUARIO_DO_GITHUB
   ```
   Na primeira vez abre uma janela para entrar na sua conta do GitHub. Entre e autorize.
   > Se o PowerShell disser que scripts estão desativados, rode antes (uma vez só):
   > `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
4. **Ligue o GitHub Pages:** no repositório → **Settings** → **Pages** →
   *Source*: **Deploy from a branch** → *Branch*: **main** e **/ (root)** → **Save**.
5. Espere 1–2 minutos. O app fica em: `https://SEU_USUARIO.github.io/calistenia/`

## 2. Instalar no celular

Abra o endereço acima **no celular**:

- **Android (Chrome):** menu **⋮** → **Instalar app** (ou "Adicionar à tela inicial").
- **iPhone (Safari — tem que ser o Safari):** botão **Compartilhar** → **Adicionar à Tela de Início**.

Depois **use sempre pelo ícone** da tela inicial.
No iPhone o app instalado guarda dados separados do Safari: o que você fizer na aba do Safari não aparece no app instalado.

Primeiros passos no app: **Ajustes** → seu nome e a data de início do plano → **Testar aviso** (som).

## 3. Atualizar o app (sem perder dados)

Depois de mudar qualquer coisa no código:

```powershell
cd F:\Claude\calistenia
.\publicar.ps1 -Mensagem "o que mudou"
```

No celular: **feche e abra o app com internet**. Ele pega a versão nova sozinho e mostra
"✔ App atualizado … Seus dados foram mantidos". A versão aparece em **Ajustes → Sobre o app**.
(O GitHub pode levar alguns minutos; se não atualizou, feche e abra de novo.)

### Por que os dados não se perdem

- Atualizar troca só os arquivos do app. Os dados ficam guardados no celular, ligados ao **endereço** do app.
- A cada versão nova o app guarda uma **cópia automática** dos dados de antes da atualização.
  Se algo sumir: **Ajustes → Sobre o app → Voltar aos dados de antes da atualização**.
- Dados que não puderem ser lidos nunca são apagados: o app guarda uma cópia antes de recomeçar.

### O que APAGA os dados (evite)

| Ação | O que acontece |
|---|---|
| Remover o app da tela inicial (iPhone) | apaga os dados do app |
| "Limpar dados do site/armazenamento" no navegador | apaga os dados |
| Trocar o nome do repositório ou do usuário do GitHub | o endereço muda e o app novo começa vazio (os dados ficam no endereço antigo) |
| Trocar de celular | o celular novo começa vazio |

Em todos esses casos a solução é a mesma: **backup**.

## 4. Backup

- **Ajustes → Exportar backup** de vez em quando (o atalho de Ajustes no Início mostra a data do último).
  No celular abre o compartilhar: salve no Drive/iCloud ou mande para você no WhatsApp/e-mail.
- Para recuperar: **Ajustes → Importar backup** e escolha o arquivo `.json`.
- Faça um backup antes de mudanças grandes no app.

## 5. Testar no PC antes de publicar

```powershell
cd F:\Claude\calistenia
node servidor.js
```
Abra http://localhost:8080 . Para conferir as animações: http://localhost:8080/ferramentas/galeria.html

## Para quem for mexer no código

- Dados: `js/storage.js`. **Nunca renomeie a chave `calistenia.v1`.**
  Campo novo → coloque um valor padrão em `padrao()`. Mudou o formato de algo existente → aumente
  `versao` e converta em `migrar()`.
- Todo arquivo `.js` novo precisa entrar na lista `ARQUIVOS` do `sw.js` (o `publicar.ps1` avisa se faltar).
- A versão (`sw.js` e `js/versao.js`) é atualizada pelo `publicar.ps1`; não precisa mexer à mão.
