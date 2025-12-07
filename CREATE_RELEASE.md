# Cara Membuat GitHub Release Beta

## Opsi 1: Melalui GitHub Web Interface (Paling Mudah)

1. Buka: https://github.com/Gungna/smart-incubator-iot/releases/new

2. Isi form:
   - **Tag**: Pilih `v1.0.0-beta` (sudah dibuat)
   - **Release title**: `Beta Release v1.0.0-beta`
   - **Description**: Copy-paste isi dari file `RELEASE_NOTES_BETA.md`

3. Klik **"Publish release"**

## Opsi 2: Menggunakan GitHub CLI (jika terinstall)

```bash
gh release create v1.0.0-beta --title "Beta Release v1.0.0-beta" --notes-file RELEASE_NOTES_BETA.md
```

## Opsi 3: Menggunakan PowerShell dengan GitHub API

Jika Anda memiliki GitHub Personal Access Token:

```powershell
$token = "YOUR_GITHUB_TOKEN"
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}

$body = @{
    tag_name = "v1.0.0-beta"
    name = "Beta Release v1.0.0-beta"
    body = Get-Content -Path "RELEASE_NOTES_BETA.md" -Raw
    draft = $false
    prerelease = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.github.com/repos/Gungna/smart-incubator-iot/releases" -Method Post -Headers $headers -Body $body -ContentType "application/json"
```

**Catatan**: Untuk mendapatkan GitHub Token:
1. Buka: https://github.com/settings/tokens
2. Generate new token (classic)
3. Beri permission: `repo` (full control of private repositories)

