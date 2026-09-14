param(
    [string]$UserId = "PASTE_YOUR_USER_ID_HERE",
    [string]$TransId = "test-" + (Get-Date -Format "yyyyMMddHHmmss"),
    [string]$AmountLocal = "1.50",
    [string]$Status = "1",
    [string]$Endpoint = "http://localhost:3000"
)

# Read CPX secret from .env
$envFile = Get-Content .env
$secretLine = $envFile | Where-Object { $_ -match "^CPX_SECURE_HASH=" }
if (-not $secretLine) {
    Write-Host "ERROR: CPX_SECURE_HASH not found in .env" -ForegroundColor Red
    exit 1
}
$secret = ($secretLine -split "=", 2)[1].Trim().Trim('"').Trim("'")

if (-not $secret) {
    Write-Host "ERROR: CPX_SECURE_HASH is empty" -ForegroundColor Red
    exit 1
}

# Compute MD5(trans_id + "-" + secret)
$md5 = [System.Security.Cryptography.MD5]::Create()
$hashInput = "$TransId-$secret"
$hashBytes = $md5.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($hashInput))
$hashHex = -join ($hashBytes | ForEach-Object { $_.ToString("x2") })

Write-Host "=== Test Postback ===" -ForegroundColor Cyan
Write-Host "Endpoint:     $Endpoint/api/webhooks/cpx-research"
Write-Host "user_id:      $UserId"
Write-Host "trans_id:     $TransId"
Write-Host "amount_local: $AmountLocal"
Write-Host "status:       $Status"
Write-Host "hash:         $hashHex"
Write-Host ""

# Build URL
$url = "$Endpoint/api/webhooks/cpx-research" +
       "?status=$Status" +
       "&trans_id=$TransId" +
       "&user_id=$UserId" +
       "&amount_local=$AmountLocal" +
       "&amount_usd=$AmountLocal" +
       "&offer_id=1" +
       "&hash=$hashHex" +
       "&ip_click=127.0.0.1" +
       "&sub_id=" +
       "&sub_id_2="

Write-Host "Sending GET request..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}