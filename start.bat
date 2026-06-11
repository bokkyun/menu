@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  스미스가좋아하는 테라스 - 메뉴 선택 서버 시작
echo  ================================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
  echo  Python이 설치되어 있지 않습니다.
  echo  https://www.python.org 에서 Python을 설치한 뒤 다시 실행해주세요.
  pause
  exit /b 1
)

python server.py
if errorlevel 1 (
  echo.
  echo  서버 시작에 실패했습니다.
  pause
)
