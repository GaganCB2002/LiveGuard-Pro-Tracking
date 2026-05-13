package com.liveguard.service;

import com.liveguard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;
    private final GpsLocationRepository gpsRepository;
    private final AlertRepository alertRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("onlineUsers", deviceRepository.countByIsOnlineTrue());
        stats.put("totalDevices", deviceRepository.count());
        stats.put("onlineDevices", deviceRepository.countByIsOnlineTrue());
        stats.put("unreadAlerts", 0);
        stats.put("todayLocations", 0);
        stats.put("avgBattery", 75);
        return stats;
    }

    public List<Map<String, Object>> getHeatmapData(String date) {
        return List.of();
    }

    public Map<String, Object> getProductivityReport(UUID userId, String dateFrom, String dateTo) {
        return Map.of("userId", userId, "score", 85);
    }
}
