# 네이버 플레이스에서 메뉴 데이터를 다시 가져옵니다.
$placeId = "994681330"
$url = "https://m.place.naver.com/restaurant/$placeId/menu/list"
$htmlPath = Join-Path $PSScriptRoot "naver-menu.html"

curl.exe -s `
  -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" `
  -H "Accept-Language: ko-KR,ko;q=0.9" `
  -H "Referer: https://map.naver.com/" `
  $url `
  -o $htmlPath

if ($LASTEXITCODE -ne 0) {
  Write-Error "네이버 메뉴 페이지 다운로드에 실패했습니다."
  exit 1
}

python (Join-Path $PSScriptRoot "generate_menu_data.py")
if ($LASTEXITCODE -ne 0) {
  Write-Error "menu-data.js 생성에 실패했습니다."
  exit 1
}

Write-Host "menu-data.js 업데이트 완료"
