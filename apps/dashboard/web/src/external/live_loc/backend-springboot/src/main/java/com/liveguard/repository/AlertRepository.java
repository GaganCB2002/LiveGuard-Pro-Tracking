package com.liveguard.repository;

import com.liveguard.entity.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {
    Page<Alert> findByUserIdAndIsReadOrderByCreatedAtDesc(UUID userId, Boolean isRead, Pageable pageable);
}
