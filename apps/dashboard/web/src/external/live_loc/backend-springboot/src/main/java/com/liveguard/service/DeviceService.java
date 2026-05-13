package com.liveguard.service;

import com.liveguard.dto.DeviceRegistrationRequest;
import com.liveguard.entity.Device;
import com.liveguard.entity.User;
import com.liveguard.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;

    @Transactional
    public Device registerDevice(DeviceRegistrationRequest request) {
        // Implementation
        return null;
    }

    @Transactional
    public Device registerLoginDevice(User user, String deviceInfo, String fcmToken) {
        // Implementation
        return null;
    }

    public List<Device> getCurrentUserDevices() {
        return List.of();
    }

    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    @Transactional
    public Device authorizeDevice(UUID deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        device.setIsAuthorized(true);
        return deviceRepository.save(device);
    }

    @Transactional
    public Device toggleTracking(UUID deviceId, boolean enabled) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        device.setTrackingEnabled(enabled);
        return deviceRepository.save(device);
    }

    @Transactional
    public void removeDevice(UUID deviceId) {
        deviceRepository.deleteById(deviceId);
    }

    @Transactional
    public void updateHeartbeat(UUID deviceId, Integer batteryLevel, String networkType) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        device.setBatteryLevel(batteryLevel);
        device.setNetworkType(networkType);
        device.setLastSeenAt(LocalDateTime.now());
        device.setIsOnline(true);
        deviceRepository.save(device);
    }
}