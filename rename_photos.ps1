$dir = "C:\ttd\public\gallery"
$files = Get-ChildItem -Path $dir -Filter "*.jpeg" | Sort-Object Name
$count = 13
foreach ($file in $files) {
    $newName = "photo$count.jpg"
    Rename-Item -Path $file.FullName -NewName $newName
    Write-Host "Renamed: $($file.Name) -> $newName"
    $count++
}
Write-Host "Done!"
