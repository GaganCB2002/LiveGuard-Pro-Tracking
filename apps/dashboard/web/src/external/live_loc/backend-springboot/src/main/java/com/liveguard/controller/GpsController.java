package com.liveguard.controller;

import com.liveguard.dto.GpsUpdateRequest;
import com.liveguard.entity.GpsLocation;
import com.liveguard.service.GpsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gps")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "GPS Tracking", description = "GPS location APIs")
public class GpsController {

    private final GpsService gpsService;

    @PostMapping("/update")
    @Operation(summary = "Update GPS location")
    public ResponseEntity<Void> updateLocation(@Valid @RequestBody GpsUpdateRequest request) {
        gpsService.saveLocation(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/batch")
    @Operation(summary = "Batch update GPS locations")
    public ResponseEntity<Void> batchUpdate(@Valid @RequestBody List<GpsUpdateRequest> requests) {
        gpsService.saveLocationsBatch(requests);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/live/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or @securityService.isCurrentUser(#userId)")
    @Operation(summary = "Get user's live location")
    public ResponseEntity<GpsLocation> getLiveLocation(@PathVariable UUID userId) {
        return ResponseEntity.ok(gpsService.getLatestLocation(userId));
    }

    @GetMapping("/history/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or @securityService.isCurrentUser(#userId)")
    @Operation(summary = "Get location history")
    public ResponseEntity<Page<GpsLocation>> getHistory(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            Pageable pageable) {
        return ResponseEntity.ok(gpsService.getLocationHistory(userId, from, to, pageable));
    }

    @GetMapping("/route/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get route for playback")
    public ResponseEntity<List<GpsLocation>> getRoute(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(gpsService.getRoute(userId, from, to));
    }

    @GetMapping("/users/live")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get all live user locations")
    public ResponseEntity<List<GpsLocation>> getAllLiveLocations() {
        return ResponseEntity.ok(gpsService.getAllLatestLocations());
    }
}