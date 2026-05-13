package com.liveguard.repository;

import com.liveguard.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID> {
    List<Device> findByUserId(UUID userId);
    Optional<Device> findBySerialNumber(String serialNumber);
    long countByIsOnlineTrue();
    List<Device> findByIsOnlineTrue();
}
