package com.edl.requestservice.listener;

import com.edl.requestservice.model.RequestStatus;
import com.edl.requestservice.model.StatusHistory;
import com.edl.requestservice.repository.ServiceRequestRepository;
import com.edl.requestservice.repository.StatusHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDateTime;

@Component
public class StatusUpdateListener {

    private static final Logger log = LoggerFactory.getLogger(StatusUpdateListener.class);

    private final JsonMapper mapper = JsonMapper.builder().build();
    private final ServiceRequestRepository repository;
    private final StatusHistoryRepository historyRepository;

    public StatusUpdateListener(ServiceRequestRepository repository,
                                StatusHistoryRepository historyRepository) {
        this.repository = repository;
        this.historyRepository = historyRepository;
    }

    @KafkaListener(topics = "request-status", groupId = "request-group")
    public void onStatus(String message) {
        try {
            JsonNode json = mapper.readTree(message);

            if (!"RequestStatusChanged".equals(json.path("eventType").asText(""))) {
                log.warn("Ignoring unknown event: {}", message);
                return;
            }

            long requestId = json.path("requestId").asLong();
            RequestStatus newStatus = RequestStatus.valueOf(json.path("status").asText(""));
            String reason = json.path("reason").asText("");

            repository.findById(requestId).ifPresentOrElse(request -> {
                LocalDateTime now = LocalDateTime.now();

                request.setStatus(newStatus);
                request.setUpdatedAt(now);
                repository.save(request);

                StatusHistory entry = new StatusHistory();
                entry.setRequestId(requestId);
                entry.setStatus(newStatus);
                entry.setReason(reason);
                entry.setChangedAt(now);
                historyRepository.save(entry);

                log.info("Request {} status updated to {}", requestId, newStatus);
            }, () -> log.warn("Request {} not found, skipping", requestId));
        } catch (Exception e) {
            log.warn("Skipping bad message: {}", message);
        }
    }
}