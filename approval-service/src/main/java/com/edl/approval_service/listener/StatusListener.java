package com.edl.approval_service.listener;

import com.edl.approval_service.service.StatusEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Component
public class StatusListener {

    private static final Logger log = LoggerFactory.getLogger(StatusListener.class);

    private final JsonMapper mapper = JsonMapper.builder().build();
    private final StatusEventPublisher publisher;

    public StatusListener(StatusEventPublisher publisher) {
        this.publisher = publisher;
    }

    @KafkaListener(topics = "request-status", groupId = "approval-group")
    public void onStatus(String message) {
        try {
            JsonNode json = mapper.readTree(message);

            if (!"RequestStatusChanged".equals(json.path("eventType").asText(""))) {
                log.warn("Ignoring unknown event: {}", message);
                return;
            }

            // The filter that prevents an infinite loop: only react to VERIFIED
            String status = json.path("status").asText("");
            if (!"VERIFIED".equals(status)) {
                log.info("Ignoring status {}", status);
                return;
            }

            long requestId = json.path("requestId").asLong();
            log.info("Request {} is VERIFIED -> approving", requestId);
            publisher.publishStatus(requestId, "APPROVED", "Auto-approved");
        } catch (Exception e) {
            log.warn("Skipping bad message: {}", message);
        }
    }
}
