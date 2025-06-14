@echo off
REM Navigate to the directory where this .bat file is located
cd /d "%~dp0"

echo Starting Docker containers for Restaurant POS App...
echo This may take a few minutes the first time as images are built/downloaded.
echo.

REM --- Step 1: Bring up Docker Compose services ---
REM --build: Ensures your custom images (app) are rebuilt if code changed.
REM -d: Runs containers in detached mode (in the background).
docker compose up --build -d

REM --- Step 2: Check if Docker Compose command was successful ---
REM %errorlevel% captures the exit code of the last command. 0 means success.
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Docker Compose failed to start the application.
    echo Please ensure:
    echo 1. Docker Desktop is running and fully initialized.
    echo 2. You have an active internet connection (for first-time image downloads).
    echo 3. There are no port conflicts (e.g., ports 27017 or 5000 are already in use).
    echo 4. Review the terminal output above for specific error messages.
    echo.
    pause
    exit /b %errorlevel%
)

echo.
echo Docker containers started successfully.
echo Opening the application in your default web browser...

REM --- Step 3: Wait a few seconds for services to fully initialize ---
REM This is important as the app might take a moment to be ready to receive requests.
timeout /t 8 /nobreak

REM --- Step 4: Open the application URL in the default browser ---
REM Assumes your combined app container exposes port 5000 to the host.
start http://localhost:5000

echo.
echo Restaurant POS App should now be running in your browser.
echo You can safely close this window.
exit /b 0