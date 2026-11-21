package com.edl.requestservice.repository;

import com.edl.requestservice.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    List<StatusHistory> findByRequestIdOrderByChangedAtAsc(Long requestId);
}
