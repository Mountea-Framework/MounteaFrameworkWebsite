param(
    [ValidateSet("local", "ci")]
    [string]$Mode = "local",
    [string]$DialoguerBase = "/dialoguer/",
    [switch]$SkipMkdocs
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..")

Push-Location $RepoRoot
try {
    $Args = @(
        "script/build_combined.py",
        "--mode", $Mode,
        "--dialoguer-base", $DialoguerBase
    )

    if ($SkipMkdocs) {
        $Args += "--skip-mkdocs"
    }

    & python @Args
} finally {
    Pop-Location
}
