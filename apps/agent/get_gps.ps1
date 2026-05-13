# WorkSphere GPS Acquisition Script (Universal Edition)
# Combines Modern WinRT and Legacy APIs for maximum reliability

$lat = 0
$lng = 0
$acc = 999999

# --- Phase 1: Try Modern WinRT (Windows 10/11) ---
try {
    Add-Type -AssemblyName "System.Runtime.WindowsRuntime" -ErrorAction SilentlyContinue
    $locator = New-Object Windows.Devices.Geolocation.Geolocator
    $locator.DesiredAccuracyInMeters = 50
    
    $asyncOp = $locator.GetGeopositionAsync()
    $timeout = 0
    while ($asyncOp.Status -eq 'Started' -and $timeout -lt 25) {
        Start-Sleep -Milliseconds 200
        $timeout++
    }

    if ($asyncOp.Status -eq 'Completed') {
        $pos = $asyncOp.GetResults()
        $lat = $pos.Coordinate.Point.Position.Latitude
        $lng = $pos.Coordinate.Point.Position.Longitude
        $acc = $pos.Coordinate.Accuracy
    }
} catch {}

# --- Phase 2: Fallback to Legacy System.Device (Windows 7/8/10) ---
if ($lat -eq 0 -or $acc -gt 1000) {
    try {
        Add-Type -AssemblyName System.Device -ErrorAction SilentlyContinue
        $Watcher = New-Object System.Device.Location.GeoCoordinateWatcher([System.Device.Location.GeoPositionAccuracy]::High)
        $Watcher.Start()
        
        $timeout = 0
        while (($Watcher.Status -ne 'Ready') -and ($timeout -lt 20)) {
            Start-Sleep -Milliseconds 200
            $timeout++
        }

        if ($Watcher.Status -eq 'Ready') {
            $Location = $Watcher.Position.Location
            if (!$Location.IsUnknown) {
                # Only update if legacy is more accurate than what we found
                if ($Location.HorizontalAccuracy -lt $acc) {
                    $lat = $Location.Latitude
                    $lng = $Location.Longitude
                    $acc = $Location.HorizontalAccuracy
                }
            }
        }
        $Watcher.Stop()
    } catch {}
}

# --- Phase 3: Network Awareness (BSSID / AP Detection) ---
$ssid = "Unknown Network"
try {
    # Get the current connected SSID
    $networkInfo = netsh wlan show interfaces | Select-String "^\s+SSID\s+:\s+(.*)$"
    if ($networkInfo) {
        $ssid = $networkInfo.Matches.Groups[1].Value.Trim()
    }
    
    # Analyze 2 to 3 nearest access points (BSSIDs) to augment location context
    $bssidList = @()
    $networks = netsh wlan show networks mode=bssid
    $bssids = $networks | Select-String -Pattern "BSSID\s+\d+\s+:\s+([0-9a-fA-F:]+)"
    foreach ($b in $bssids) {
        if ($bssidList.Count -lt 3) {
            $bssidList += $b.Matches.Groups[1].Value.Trim()
        }
    }
    if ($bssidList.Count -gt 0) {
        $ssid = "$ssid [Nearby APs: $($bssidList -join '| ')]"
    }
} catch {}

# --- Final Output ---
if ($lat -ne 0 -and $lng -ne 0) {
    # CRITICAL: If location is exactly Bangalore (common ISP error), and SSID is known, we can flag accuracy
    if ($lat -gt 12.9 -and $lat -lt 13.0 -and $lng -gt 77.5 -and $lng -lt 77.7) {
        # This is Bangalore region. If the user is NOT there, this is likely IP noise.
        # We report it but keep the SSID for better context.
    }
    Write-Output "$lat|$lng|$acc|$ssid"
} else {
    Write-Output "FAILED"
}
