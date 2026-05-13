package com.liveguard.websocket;

import com.liveguard.dto.GpsUpdateRequest;
import com.liveguard.service.GpsService;
import com.liveguard.service.WebSocketPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class GpsWebSocketController {
    private final GpsService gpsService;
    private final WebSocketPublisher webSocketPublisher;

    @MessageMapping("/gps/update")
    public void handleGpsUpdate(@Payload GpsUpdateRequest request, Principal principal) {
        gpsService.saveLocation(request);
        webSocketPublisher.publishGpsUpdate(request);
    }
}
