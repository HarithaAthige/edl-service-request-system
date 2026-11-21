package com.edl.notification_service.listener;

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

    @KafkaListener(topics = "request-status", groupId = "notification-group")
    public void onStatus(String message) {
        try {
            JsonNode json = mapper.readTree(message);

            if (!"RequestStatusChanged".equals(json.path("eventType").asText(""))) {
                log.warn("Ignoring unknown event: {}", message);
                return;
            }

            long requestId = json.path("requestId").asLong();
            String status = json.path("status").asText("");
            String reason = json.path("reason").asText("");

            // Only final outcomes are sent to the citizen
            if ("APPROVED".equals(status) || "REJECTED".equals(status)) {
                log.info("NOTIFY citizen: request {} was {} ({})", requestId, status, reason);
            } else {
                log.info("No notification needed for status {}", status);
            }
        } catch (Exception e) {
            log.warn("Skipping bad message: {}", message);
        }
    }
}
