package com.liveguard.websocket;

import lombok.Data;
import java.util.UUID;

@Data
public class DeviceHeartbeatMessage {
    private UUID deviceId;
    private Integer batteryLevel;
    private String networkType;
    private Boolean isOnline;
}
