package com.liveguard.controller;

import com.liveguard.dto.DeviceRegistrationRequest;
import com.liveguard.entity.Device;
import com.liveguard.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Devices", description = "Device management APIs")
public class DeviceController {

    private final DeviceService deviceService;

    @PostMapping("/register")
    @Operation(summary = "Register new device")
    public ResponseEntity<Device> registerDevice(@Valid @RequestBody DeviceRegistrationRequest request) {
        return ResponseEntity.ok(deviceService.registerDevice(request));
    }

    @GetMapping("/my-devices")
    @Operation(summary = "Get current user's devices")
    public ResponseEntity<List<Device>> getMyDevices() {
        return ResponseEntity.ok(deviceService.getCurrentUserDevices());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get all devices (Admin/Manager)")
    public ResponseEntity<List<Device>> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @PutMapping("/{deviceId}/authorize")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Authorize device")
    public ResponseEntity<Device> authorizeDevice(@PathVariable UUID deviceId) {
        return ResponseEntity.ok(deviceService.authorizeDevice(deviceId));
    }

    @PutMapping("/{deviceId}/toggle-tracking")
    @Operation(summary = "Toggle tracking for device")
    public ResponseEntity<Device> toggleTracking(@PathVariable UUID deviceId, @RequestParam boolean enabled) {
        return ResponseEntity.ok(deviceService.toggleTracking(deviceId, enabled));
    }

    @DeleteMapping("/{deviceId}")
    @Operation(summary = "Remove device")
    public ResponseEntity<Void> removeDevice(@PathVariable UUID deviceId) {
        deviceService.removeDevice(deviceId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{deviceId}/heartbeat")
    @Operation(summary = "Device heartbeat")
    public ResponseEntity<Void> heartbeat(
            @PathVariable UUID deviceId,
            @RequestParam Integer batteryLevel,
            @RequestParam String networkType) {
        deviceService.updateHeartbeat(deviceId, batteryLevel, networkType);
        return ResponseEntity.ok().build();
    }
}