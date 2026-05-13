package com.liveguard.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class AlertDto {
    private UUID id;
    private String alertType;
    private String severity;
    private String title;
    private String message;
    private Boolean isRead;
    private String triggeredAt;
}
