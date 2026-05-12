# push.ps1 — 수정된 파일을 GitHub에 업로드하고 자동 배포를 트리거합니다.
# 사용법: .\push.ps1            (자동 메시지)
#         .\push.ps1 "수정 내용" (직접 메시지 입력)

param(
    [string]$Message = ""
)

Set-Location $PSScriptRoot

$changed = git status --porcelain
if (-not $changed) {
    Write-Host "변경된 파일이 없습니다." -ForegroundColor Yellow
    exit 0
}

if (-not $Message) {
    $Message = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host "`n📦 변경 파일 목록:" -ForegroundColor Cyan
git status --short

git add .
git commit -m $Message
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ GitHub 업로드 완료!" -ForegroundColor Green
    Write-Host "🚀 GitHub Actions가 자동 배포를 시작합니다. (약 1~2분 소요)" -ForegroundColor Cyan
    Write-Host "🌐 배포 URL: https://neraizel98.github.io/study-app`n" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ 업로드 실패. 위 오류 메시지를 확인하세요." -ForegroundColor Red
}
