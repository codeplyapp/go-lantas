# Fetch exact OpenStreetMap / OSRM route geometries for Banyuwangi road segments
$segments = @(
  @{ name = "navRoute"; from = "114.3646,-8.2215"; to = "114.3615,-8.2085" },
  @{ name = "segAhmadYani"; from = "114.3645,-8.2250"; to = "114.3692,-8.2192" },
  @{ name = "segDrSoetomo"; from = "114.3692,-8.2192"; to = "114.3680,-8.2120" },
  @{ name = "segJaksaAgung"; from = "114.3692,-8.2192"; to = "114.3580,-8.2205" },
  @{ name = "segPbSudirman"; from = "114.3692,-8.2192"; to = "114.3760,-8.2120" },
  @{ name = "segGajahMada"; from = "114.3540,-8.2300"; to = "114.3590,-8.2180" },
  @{ name = "segBrawijaya"; from = "114.3570,-8.2360"; to = "114.3475,-8.2160" },
  @{ name = "segCokroaminoto"; from = "114.3680,-8.2165"; to = "114.3615,-8.2085" },
  @{ name = "segKepiting"; from = "114.3692,-8.2192"; to = "114.3745,-8.2340" }
)

$results = @{}

foreach ($seg in $segments) {
  $url = "https://router.project-osrm.org/route/v1/driving/$($seg.from);$($seg.to)?overview=full&geometries=geojson"
  Write-Host "Fetching $($seg.name)..."
  try {
    $res = Invoke-RestMethod -Uri $url -UserAgent "SIGAP-Korlantas-LKTI-Demo/1.0" -TimeoutSec 10
    if ($res.routes -and $res.routes.Length -gt 0) {
      $coords = @()
      foreach ($pt in $res.routes[0].geometry.coordinates) {
        # Convert [lng, lat] to [lat, lng]
        $coords += ,@([Math]::Round([double]$pt[1], 6), [Math]::Round([double]$pt[0], 6))
      }
      $results[$seg.name] = $coords
      Write-Host "  Success: $($coords.Count) coordinates"
    }
  } catch {
    Write-Warning "  Failed to fetch $($seg.name): $_"
  }
  Start-Sleep -Milliseconds 400
}

$json = $results | ConvertTo-Json -Depth 5
$json | Set-Content -Path "scripts/osrm_precise_data.json" -Encoding UTF8
Write-Host "All precision street coordinates saved to scripts/osrm_precise_data.json!"
