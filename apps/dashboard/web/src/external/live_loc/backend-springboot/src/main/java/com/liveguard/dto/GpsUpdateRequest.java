package com.liveguard.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class GpsUpdateRequest {
    @NotNull
    private UUID deviceId;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private Double accuracy;
    private Double altitude;
    private Double speed;
    private Double heading;
    private Integer batteryLevel;
    private String networkType;
    private Boolean isMoving;
    private LocalDateTime recordedAt;
}
