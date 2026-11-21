package com.edl.verification_service.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class StatusEventPublisher {

    private static final String TOPIC = "request-status";

    private final KafkaTemplate<String, String> kafkaTemplate;

    public StatusEventPublisher(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishStatus(long requestId, String status, String reason) {
        String json = "{"
                + "\"eventType\":\"RequestStatusChanged\","
                + "\"requestId\":" + requestId + ","
                + "\"status\":\"" + status + "\","
                + "\"reason\":\"" + clean(reason) + "\","
                + "\"changedAt\":\"" + LocalDateTime.now() + "\""
                + "}";

        // Same key as the original event, so all events for one request stay in order
        kafkaTemplate.send(TOPIC, String.valueOf(requestId), json);
    }

    private String clean(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
