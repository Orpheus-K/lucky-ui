[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
  [string]$Otp,
  [ValidatePattern('^[A-Za-z][A-Za-z0-9._-]*$')]
  [string]$Tag = 'latest',
  [switch]$PackOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Keep registry checks bounded when credentials or network access are unavailable.
$env:npm_config_fetch_timeout = '10000'
$env:npm_config_fetch_retries = '0'

$repoRoot = Split-Path -Parent $PSScriptRoot
$packageDir = Join-Path $repoRoot 'src\uni_modules\lucky-ui'
$packageJsonPath = Join-Path $packageDir 'package.json'

if (-not (Test-Path -LiteralPath $packageJsonPath)) {
  throw "Package manifest not found: $packageJsonPath"
}

$package = Get-Content -LiteralPath $packageJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$expectedName = 'uni-lucky-ui'
$packageName = [string]$package.name
$packageVersion = [string]$package.version

if ($packageName -ne $expectedName) {
  throw "Unexpected package name: $packageName. Expected $expectedName."
}

if ([string]::IsNullOrWhiteSpace($packageVersion)) {
  throw 'Package version is missing.'
}

Write-Host "Package: $packageName@$packageVersion"
Write-Host 'Checking package contents...'
Push-Location $packageDir
try {
  & npm pack --dry-run
  if ($LASTEXITCODE -ne 0) {
    throw 'npm pack --dry-run failed.'
  }
}
finally {
  Pop-Location
}

if ($PackOnly) {
  Write-Host 'Package validation completed; publish was skipped.'
  return
}

Write-Host 'Checking npm registry for an existing version...'
$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$registryOutput = (& npm view "$packageName@$packageVersion" version 2>&1 | Out-String).Trim()
$registryExitCode = $LASTEXITCODE
$ErrorActionPreference = $previousErrorActionPreference

if ($registryExitCode -eq 0) {
  throw "$packageName@$packageVersion is already published and cannot be overwritten."
}

if ($registryOutput -notmatch '\bE404\b') {
  throw "Unable to verify npm registry state: $registryOutput"
}

Write-Host 'Checking npm authentication...'
& npm whoami
if ($LASTEXITCODE -ne 0) {
  throw 'npm is not authenticated. Run `npm login` and retry.'
}

if (-not $PSCmdlet.ShouldProcess("$packageName@$packageVersion", "Publish to npm with tag '$Tag'")) {
  return
}

$publishArgs = @('publish', '--access', 'public', '--tag', $Tag)
if ($Otp) {
  $publishArgs += "--otp=$Otp"
}

Push-Location $packageDir
try {
  & npm @publishArgs
  if ($LASTEXITCODE -ne 0) {
    throw 'npm publish failed.'
  }
}
finally {
  Pop-Location
}

Write-Host "Published $packageName@$packageVersion successfully."
