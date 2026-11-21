package com.edl.requestservice.controller;

import com.edl.requestservice.model.RequestStatus;
import com.edl.requestservice.model.ServiceRequest;
import com.edl.requestservice.model.StatusHistory;
import com.edl.requestservice.repository.ServiceRequestRepository;
import com.edl.requestservice.repository.StatusHistoryRepository;
import com.edl.requestservice.service.RequestEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/requests")
public class RequestController {

    private final ServiceRequestRepository repository;
    private final StatusHistoryRepository historyRepository;
    private final RequestEventPublisher publisher;

    public RequestController(ServiceRequestRepository repository,
                             StatusHistoryRepository historyRepository,
                             RequestEventPublisher publisher) {
        this.repository = repository;
        this.historyRepository = historyRepository;
        this.publisher = publisher;
    }

    @PostMapping
    public ServiceRequest create(@RequestBody ServiceRequest request) {
        request.setId(null);
        request.setStatus(RequestStatus.SUBMITTED);
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        ServiceRequest saved = repository.save(request);

        // First step of the timeline, saved before the event is published
        StatusHistory first = new StatusHistory();
        first.setRequestId(saved.getId());
        first.setStatus(RequestStatus.SUBMITTED);
        first.setReason("Request received");
        first.setChangedAt(saved.getCreatedAt());
        historyRepository.save(first);

        publisher.publishSubmitted(saved);
        return saved;
    }

    @GetMapping
    public List<ServiceRequest> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequest> getOne(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}