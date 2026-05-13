package com.liveguard.repository;

import com.liveguard.entity.GpsLocation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GpsLocationRepository extends JpaRepository<GpsLocation, UUID> {
    Optional<GpsLocation> findTopByUserIdOrderByRecordedAtDesc(UUID userId);
    Page<GpsLocation> findByUserIdAndRecordedAtBetween(UUID userId, LocalDateTime from, LocalDateTime to, Pageable pageable);
    List<GpsLocation> findByUserIdAndRecordedAtBetweenOrderByRecordedAtAsc(UUID userId, LocalDateTime from, LocalDateTime to);

    @Query(value = "SELECT DISTINCT ON (user_id) * FROM gps_locations ORDER BY user_id, recorded_at DESC", nativeQuery = true)
    List<GpsLocation> findAllLatestLocations();
}
