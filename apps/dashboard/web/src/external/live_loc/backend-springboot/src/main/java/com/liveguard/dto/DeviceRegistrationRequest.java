package com.liveguard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeviceRegistrationRequest {
    @NotBlank
    private String deviceName;

    @NotNull
    private String deviceType;

    private String osVersion;
    private String appVersion;
    private String deviceModel;
    private String serialNumber;
    private String fcmToken;
}