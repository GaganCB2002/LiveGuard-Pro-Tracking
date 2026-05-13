package com.liveguard.service;

import com.liveguard.dto.GpsUpdateRequest;
import com.liveguard.entity.Device;
import com.liveguard.entity.GpsLocation;
import com.liveguard.entity.User;
import com.liveguard.repository.DeviceRepository;
import com.liveguard.repository.GpsLocationRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GpsService {
    private final GpsLocationRepository gpsRepository;
    private final DeviceRepository deviceRepository;
    private final WebSocketPublisher webSocketPublisher;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional
    public void saveLocation(GpsUpdateRequest request) {
        Device device = deviceRepository.findById(request.getDeviceId())
                .orElseThrow(() -> new RuntimeException("Device not found"));
        Point point = geometryFactory.createPoint(
                new Coordinate(request.getLongitude(), request.getLatitude()));
        GpsLocation location = GpsLocation.builder()
                .device(device)
                .user(device.getUser())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .accuracy(request.getAccuracy())
                .altitude(request.getAltitude())
                .speed(request.getSpeed())
                .heading(request.getHeading())
                .batteryLevel(request.getBatteryLevel())
                .networkType(request.getNetworkType())
                .location(point)
                .isMoving(request.getIsMoving())
                .recordedAt(request.getRecordedAt() != null ? request.getRecordedAt() : LocalDateTime.now())
                .build();
        gpsRepository.save(location);
        device.setLastSeenAt(LocalDateTime.now());
        device.setBatteryLevel(request.getBatteryLevel());
        device.setNetworkType(request.getNetworkType());
        device.setIsOnline(true);
        deviceRepository.save(device);
        webSocketPublisher.publishGpsUpdate(request);
    }

    @Transactional
    public void saveLocationsBatch(List<GpsUpdateRequest> requests) {
        requests.forEach(this::saveLocation);
    }

    public GpsLocation getLatestLocation(UUID userId) {
        return gpsRepository.findTopByUserIdOrderByRecordedAtDesc(userId)
                .orElseThrow(() -> new RuntimeException("No location data found"));
    }

    public Page<GpsLocation> getLocationHistory(UUID userId, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return gpsRepository.findByUserIdAndRecordedAtBetween(userId, from, to, pageable);
    }

    public List<GpsLocation> getRoute(UUID userId, LocalDateTime from, LocalDateTime to) {
        return gpsRepository.findByUserIdAndRecordedAtBetweenOrderByRecordedAtAsc(userId, from, to);
    }

    public List<GpsLocation> getAllLatestLocations() {
        return gpsRepository.findAllLatestLocations();
    }
}
