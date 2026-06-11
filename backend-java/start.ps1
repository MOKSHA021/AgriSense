# Start the AgriSense Java Spring Boot backend.
# Usage: .\start.ps1

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $scriptDir ".env"

if (Test-Path -LiteralPath $envFile) {
    Get-Content -LiteralPath $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]*)\s*=\s*(.*)\s*$") {
            [System.Environment]::SetEnvironmentVariable(
                $matches[1].Trim(),
                $matches[2].Trim(),
                "Process"
            )
        }
    }
}

if (-not $env:PORT) {
    $env:PORT = "5000"
}

Write-Host "Starting AgriSense Java backend on port $env:PORT..." -ForegroundColor Green
mvn spring-boot:run
