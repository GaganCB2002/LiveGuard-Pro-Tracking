package com.liveguard.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.locationtech.jts.geom.Point;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gps_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GpsLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 10, scale = 8)
    private Double latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private Double longitude;

    private Double accuracy;
    private Double altitude;
    private Double speed;
    private Double heading;

    @Column(name = "battery_level")
    private Integer batteryLevel;

    @Column(name = "network_type")
    private String networkType;

    @Column(columnDefinition = "geography(Point, 4326)")
    private Point location;

    @Column(name = "is_moving")
    @Builder.Default
    private Boolean isMoving = false;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
