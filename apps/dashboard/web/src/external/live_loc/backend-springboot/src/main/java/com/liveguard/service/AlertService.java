package com.liveguard.service;

import com.liveguard.dto.AlertDto;
import com.liveguard.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AlertService {
    private final AlertRepository alertRepository;

    public Page<AlertDto> getAllAlerts(Pageable pageable) {
        return Page.empty();
    }
}
