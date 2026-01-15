Add-Type -AssemblyName System.Drawing

function Convert-ToBmp($sourcePath, $destPath) {
    if (Test-Path $sourcePath) {
        $srcImage = [System.Drawing.Image]::FromFile($sourcePath)
        $bmp = New-Object System.Drawing.Bitmap($srcImage.Width, $srcImage.Height)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        
        # NSIS usually wants black background for dark themes
        $g.Clear([System.Drawing.Color]::Black)
        $g.DrawImage($srcImage, 0, 0)
        
        $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Bmp)
        
        $g.Dispose()
        $bmp.Dispose()
        $srcImage.Dispose()
        Write-Host "Converted $sourcePath to $destPath"
    } else {
        Write-Error "Source file not found: $sourcePath"
    }
}

$buildDir = "C:\Users\archi\.gemini\antigravity\scratch\ungoliant\build"
Convert-ToBmp "$buildDir\installerSidebar.png" "$buildDir\installerSidebar.bmp"
Convert-ToBmp "$buildDir\installerHeader.png" "$buildDir\installerHeader.bmp"
