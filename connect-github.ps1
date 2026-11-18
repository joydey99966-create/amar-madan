# Connect this project to your GitHub repository and push.
# You type the URL into YOUR terminal — nothing is sent anywhere else.
# Git Credential Manager will open a browser for GitHub sign-in (no token needed).

Write-Host "=== Amar Madan -> GitHub ===" -ForegroundColor Green
Write-Host ""

$url = Read-Host "Paste your GitHub repo HTTPS URL (e.g. https://github.com/joydey99966/amar-madan.git)"

if (-not $url.StartsWith("https://github.com/")) {
  Write-Host "That does not look like a GitHub HTTPS URL. Aborting." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Setting remote 'origin'..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $url

Write-Host "Pushing to main..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "Done! Your site is on GitHub." -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "Push failed. If a browser did not open for sign-in, run:" -ForegroundColor Yellow
  Write-Host "  git config --global credential.helper manager" -ForegroundColor Yellow
  Write-Host "then run this script again." -ForegroundColor Yellow
}
