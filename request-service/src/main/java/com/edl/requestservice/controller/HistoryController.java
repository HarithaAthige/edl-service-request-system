package com.edl.requestservice.controller;

import com.edl.requestservice.model.StatusHistory;
import com.edl.requestservice.repository.ServiceRequestRepository;
import com.edl.requestservice.repository.StatusHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class HistoryController {

    private final ServiceRequestRepository requestRepository;
    private final StatusHistoryRepository historyRepository;

    public HistoryController(ServiceRequestRepository requestRepository,
                             StatusHistoryRepository historyRepository) {
        this.requestRepository = requestRepository;
        this.historyRepository = historyRepository;
    }

    @GetMapping("/requests/{id}/history")
    public ResponseEntity<List<StatusHistory>> history(@PathVariable Long id) {
        if (!requestRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(historyRepository.findByRequestIdOrderByChangedAtAsc(id));
    }
}
