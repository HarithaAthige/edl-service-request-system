package com.edl.requestservice.service;

import com.edl.requestservice.model.ServiceRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class RequestEventPublisher {

    private static final String TOPIC = "requests";

    private final KafkaTemplate<String, String> kafkaTemplate;

    public RequestEventPublisher(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishSubmitted(ServiceRequest r) {
        String json = "{"
                + "\"eventType\":\"RequestSubmitted\","
                + "\"requestId\":" + r.getId() + ","
                + "\"type\":\"" + clean(r.getType()) + "\","
                + "\"citizenName\":\"" + clean(r.getCitizenName()) + "\","
                + "\"nic\":\"" + clean(r.getNic()) + "\","
                + "\"phone\":\"" + clean(r.getPhone()) + "\","
                + "\"address\":\"" + clean(r.getAddress()) + "\","
                + "\"status\":\"" + r.getStatus() + "\","
                + "\"createdAt\":\"" + r.getCreatedAt() + "\""
                + "}";

        // The request ID is the message key, so events for one request stay in order
        kafkaTemplate.send(TOPIC, String.valueOf(r.getId()), json);
    }

    private String clean(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
