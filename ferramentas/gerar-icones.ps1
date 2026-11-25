# Gera os ícones PNG do app (rode uma vez: powershell -File ferramentas\gerar-icones.ps1)
Add-Type -AssemblyName System.Drawing
$pasta = Join-Path $PSScriptRoot '..\icons'
New-Item -ItemType Directory -Force $pasta | Out-Null

function Novo-Icone([int]$tam, [string]$arquivo, [double]$escala) {
    $bmp = New-Object System.Drawing.Bitmap $tam, $tam
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.TextRenderingHint = 'AntiAliasGridFit'
    $g.Clear([System.Drawing.Color]::FromArgb(14, 15, 18))

    $laranja = [System.Drawing.Color]::FromArgb(255, 138, 61)
    $d = $tam * 0.78 * $escala
    $x = ($tam - $d) / 2
    $caneta = New-Object System.Drawing.Pen $laranja, ($tam * 0.07 * $escala)
    $g.DrawEllipse($caneta, [single]$x, [single]$x, [single]$d, [single]$d)

    $fonte = New-Object System.Drawing.Font 'Segoe UI', ([single]($tam * 0.30 * $escala)), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
    $ret = New-Object System.Drawing.RectangleF 0, 0, $tam, $tam
    $g.DrawString("15'", $fonte, [System.Drawing.Brushes]::White, $ret, $fmt)

    $bmp.Save((Join-Path $pasta $arquivo), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}

Novo-Icone 192 'icon-192.png' 1.0
Novo-Icone 512 'icon-512.png' 1.0
Novo-Icone 512 'icon-maskable-512.png' 0.75
Novo-Icone 180 'apple-touch-icon.png' 0.9
Write-Host "Ícones gerados em $pasta"
