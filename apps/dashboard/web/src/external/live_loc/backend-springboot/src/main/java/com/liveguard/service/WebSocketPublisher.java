package com.liveguard.service;

import com.liveguard.dto.GpsUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketPublisher {
    private final SimpMessagingTemplate messagingTemplate;

    public void publishGpsUpdate(GpsUpdateRequest update) {
        messagingTemplate.convertAndSend("/topic/gps/" + update.getDeviceId(), update);
        messagingTemplate.convertAndSend("/topic/gps/live", update);
    }

    public void publishAlert(Object alert) {
        messagingTemplate.convertAndSend("/topic/alerts", alert);
    }

    public void sendToUser(String userId, Object payload) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", payload);
    }
}
