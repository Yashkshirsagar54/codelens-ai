$files = Get-ChildItem -Recurse -Include "*.tsx" -Path "src" | Where-Object { $_.FullName -notlike "*node_modules*" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content

    # Replace near-black text with soft slate
    $content = $content -replace 'text-\[#0B1210\] dark:', 'text-slate-700 dark:'
    $content = $content -replace 'text-\[#0B1210\]"', 'text-slate-700"'

    # Replace black/ opacity backgrounds
    $content = $content -replace 'bg-black/5 dark:', 'bg-white/60 dark:'
    $content = $content -replace 'bg-black/10 dark:', 'bg-emerald-50/70 dark:'

    # Replace black/ borders  
    $content = $content -replace 'border-black/10 dark:', 'border-emerald-200/70 dark:'
    $content = $content -replace 'border-black/15 dark:', 'border-emerald-200/80 dark:'
    $content = $content -replace 'border-black/20 dark:', 'border-emerald-300/60 dark:'

    # Replace section backgrounds (flat color) with transparent (inherits gradient body)
    $content = $content -replace 'bg-\[#F7FAF9\] dark:', 'bg-transparent dark:'
    $content = $content -replace 'bg-\[#EFF5F2\] dark:', 'bg-transparent dark:'

    # hover:text-black
    $content = $content -replace 'hover:text-black dark:', 'hover:text-slate-900 dark:'
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host ("Updated: " + $file.Name)
    }
}
Write-Host "Done"
