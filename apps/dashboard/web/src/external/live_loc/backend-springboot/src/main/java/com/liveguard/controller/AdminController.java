package com.liveguard.controller;

import com.liveguard.dto.*;
import com.liveguard.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin", description = "Admin dashboard APIs")
public class AdminController {
    private final UserService userService;
    private final AnalyticsService analyticsService;
    private final AlertService alertService;

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<Page<UserDto>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Update user role")
    public ResponseEntity<UserDto> updateUserRole(@PathVariable UUID userId, @RequestParam String role) {
        return ResponseEntity.ok(userService.updateRole(userId, role));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Get all alerts")
    public ResponseEntity<Page<AlertDto>> getAllAlerts(Pageable pageable) {
        return ResponseEntity.ok(alertService.getAllAlerts(pageable));
    }

    @GetMapping("/analytics/heatmap")
    @Operation(summary = "Get GPS heatmap data")
    public ResponseEntity<List<Map<String, Object>>> getHeatmapData(@RequestParam String date) {
        return ResponseEntity.ok(analyticsService.getHeatmapData(date));
    }

    @GetMapping("/reports/productivity")
    @Operation(summary = "Get productivity report")
    public ResponseEntity<Map<String, Object>> getProductivityReport(
            @RequestParam UUID userId,
            @RequestParam String dateFrom,
            @RequestParam String dateTo) {
        return ResponseEntity.ok(analyticsService.getProductivityReport(userId, dateFrom, dateTo));
    }
}
