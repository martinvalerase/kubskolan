# Ritar PNG-ikoner (samma motiv som icon.svg) med System.Drawing.
Add-Type -AssemblyName System.Drawing
$out = Split-Path $PSScriptRoot -Parent

function Draw-Icon([int]$size, [string]$file) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::FromArgb(124, 77, 255))
  $k = $size / 512.0
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(22, 23, 28)), (10 * $k)
  $pen.LineJoin = 'Round'
  $faces = @(
    @{ c = [System.Drawing.Color]::FromArgb(255, 213, 0);  o = @(0, -170); a = @(56, 32);  b = @(-56, 32) },
    @{ c = [System.Drawing.Color]::FromArgb(0, 166, 81);   o = @(-168, -74); a = @(56, 32); b = @(0, 64) },
    @{ c = [System.Drawing.Color]::FromArgb(255, 122, 0);  o = @(168, -74); a = @(-56, 32); b = @(0, 64) }
  )
  foreach ($f in $faces) {
    $brush = New-Object System.Drawing.SolidBrush $f.c
    for ($i = 0; $i -lt 3; $i++) { for ($j = 0; $j -lt 3; $j++) {
      $pts = @()
      foreach ($d in @(@(0,0), @(1,0), @(1,1), @(0,1))) {
        $u = $i + $d[0]; $v = $j + $d[1]
        $x = 256 + $f.o[0] + $u * $f.a[0] + $v * $f.b[0]
        $y = 234 + $f.o[1] + $u * $f.a[1] + $v * $f.b[1]
        $pts += New-Object System.Drawing.PointF ([float]($x * $k)), ([float]($y * $k))
      }
      $g.FillPolygon($brush, [System.Drawing.PointF[]]$pts)
      $g.DrawPolygon($pen, [System.Drawing.PointF[]]$pts)
    } }
  }
  $bmp.Save((Join-Path $out $file), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

Draw-Icon 180 'icon-180.png'
Draw-Icon 192 'icon-192.png'
Draw-Icon 512 'icon-512.png'
