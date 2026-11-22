$ErrorActionPreference = "Stop"

$dbUser = Read-Host "Atlas database username"
$secret = Read-Host "Rotated Atlas database password" -AsSecureString
$clusterHost = Read-Host "Atlas cluster hostname (without mongodb+srv://)"

if ([string]::IsNullOrWhiteSpace($dbUser) -or [string]::IsNullOrWhiteSpace($clusterHost)) {
    throw "Database username and cluster hostname are required."
}

$plainPassword = [System.Net.NetworkCredential]::new("", $secret).Password
$encodedUser = [uri]::EscapeDataString($dbUser)
$encodedPassword = [uri]::EscapeDataString($plainPassword)
$env:MONGODB_URI = "mongodb+srv://${encodedUser}:${encodedPassword}@${clusterHost}/schemesaathi?retryWrites=true&w=majority&authSource=admin"
$env:SPRING_PROFILES_ACTIVE = "local"

Push-Location $PSScriptRoot
try {
    mvn spring-boot:run
}
finally {
    Remove-Item Env:\MONGODB_URI -ErrorAction SilentlyContinue
    Remove-Item Env:\SPRING_PROFILES_ACTIVE -ErrorAction SilentlyContinue
    Remove-Variable plainPassword, encodedPassword, secret -ErrorAction SilentlyContinue
    Pop-Location
}
