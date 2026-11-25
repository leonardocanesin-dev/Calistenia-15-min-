# Publica o app no GitHub Pages.
#
# Primeira vez:   .\publicar.ps1 -Usuario SEU_USUARIO_DO_GITHUB
# Atualizações:   .\publicar.ps1 -Mensagem "o que mudou"
#
# O que ele faz: gera uma versão nova (data e hora), confere se todos os arquivos estão
# na lista do modo offline, salva no git e envia para o GitHub. O celular pega a versão
# nova na próxima vez que abrir o app com internet. Os dados do celular não são tocados.
param(
    [string]$Mensagem = 'Atualização',
    [string]$Usuario,
    [string]$Repositorio = 'calistenia'
)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Invoke-Git {
    git @args
    if ($LASTEXITCODE -ne 0) { throw "O comando 'git $($args -join ' ')' falhou (veja a mensagem acima)." }
}

function Set-Versao([string]$Arquivo, [string]$Padrao, [string]$Novo) {
    $caminho = Join-Path $PSScriptRoot $Arquivo
    $texto = [IO.File]::ReadAllText($caminho)
    if (-not [regex]::IsMatch($texto, $Padrao)) { throw "Não encontrei a versão dentro de $Arquivo." }
    [IO.File]::WriteAllText($caminho, [regex]::Replace($texto, $Padrao, $Novo), (New-Object Text.UTF8Encoding $false))
}

# 1. Primeira vez: cria o repositório local e liga ao GitHub.
if (-not (Test-Path (Join-Path $PSScriptRoot '.git'))) {
    if (-not $Usuario) { throw 'Primeira publicação: rode  .\publicar.ps1 -Usuario SEU_USUARIO_DO_GITHUB' }
    Invoke-Git init -b main
}
if ($Usuario) {
    Invoke-Git config user.name $Usuario
    Invoke-Git config user.email "$Usuario@users.noreply.github.com"   # e-mail privado do GitHub
    $url = "https://github.com/$Usuario/$Repositorio.git"
    if (git remote) { Invoke-Git remote set-url origin $url } else { Invoke-Git remote add origin $url }
}
if (-not (git remote)) { throw 'Repositório do GitHub não configurado. Rode com -Usuario SEU_USUARIO_DO_GITHUB.' }

# 2. Todo arquivo .js precisa estar na lista do modo offline (sw.js), senão o app quebra sem internet.
$sw = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'sw.js'))
$faltando = Get-ChildItem (Join-Path $PSScriptRoot 'js') -Recurse -Filter *.js |
    ForEach-Object { $_.FullName.Substring($PSScriptRoot.Length + 1).Replace('\', '/') } |
    Where-Object { -not $sw.Contains("'$_'") }
if ($faltando) { throw "Adicione estes arquivos à lista ARQUIVOS do sw.js: $($faltando -join ', ')" }

# 3. Versão nova (o celular percebe a mudança e atualiza sozinho).
$versao = Get-Date -Format 'yyyy.MM.dd-HHmmss'
Set-Versao 'sw.js' "const VERSAO = '[^']*';" "const VERSAO = '$versao';"
Set-Versao 'js/versao.js' "VERSAO_APP = '[^']*';" "VERSAO_APP = '$versao';"

# 4. Salva e envia.
Invoke-Git add -A
Invoke-Git commit -m "$Mensagem (versão $versao)"
Write-Host 'Enviando para o GitHub (na primeira vez abre uma janela para você entrar na sua conta)...'
git push -u origin main
if ($LASTEXITCODE -ne 0) {
    $repo = (git remote get-url origin) -replace '\.git$', ''
    Write-Host ''
    Write-Host 'Não deu para enviar ao GitHub. Confira:' -ForegroundColor Yellow
    Write-Host "  1. O repositório existe? Abra $repo"
    Write-Host "     Se der 'Page not found', crie em https://github.com/new com o nome '$Repositorio' (Public, sem marcar mais nada)."
    Write-Host '  2. Você entrou na conta certa na janela de login do GitHub?'
    Write-Host 'Depois é só rodar o script de novo. Nada foi perdido: a versão já está salva aqui no PC.'
    exit 1
}

$dono = ((git remote get-url origin) -replace '^https://github.com/', '' -split '/')[0]
Write-Host ''
Write-Host "Pronto! Versão $versao publicada." -ForegroundColor Green
Write-Host "Endereço do app: https://$dono.github.io/$Repositorio/"
Write-Host 'O GitHub leva 1 a 2 minutos para colocar a versão nova no ar.'
