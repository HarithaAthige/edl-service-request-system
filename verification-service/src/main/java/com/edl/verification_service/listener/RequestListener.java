package com.edl.verification_service.listener;

import com.edl.verification_service.service.RequestValidator;
import com.edl.verification_service.service.StatusEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Component
public class RequestListener {

    private static final Logger log = LoggerFactory.getLogger(RequestListener.class);

    private final JsonMapper mapper = JsonMapper.builder().build();
    private final RequestValidator validator;
    private final StatusEventPublisher publisher;

    public RequestListener(RequestValidator validator, StatusEventPublisher publisher) {
        this.validator = validator;
        this.publisher = publisher;
    }

    @KafkaListener(topics = "requests", groupId = "verification-group")
    public void onRequest(String message) {
        try {
            JsonNode json = mapper.readTree(message);

            if (!"RequestSubmitted".equals(json.path("eventType").asText(""))) {
                log.warn("Ignoring unknown event: {}", message);
                return;
            }

            long requestId = json.path("requestId").asLong();
            String nic = json.path("nic").asText(null);
            String phone = json.path("phone").asText(null);
            String address = json.path("address").asText(null);

            RequestValidator.Result result = validator.validate(nic, phone, address);
            String status = result.valid() ? "VERIFIED" : "REJECTED";

            log.info("Request {} -> {} ({})", requestId, status, result.reason());
            publisher.publishStatus(requestId, status, result.reason());
        } catch (Exception e) {
            log.warn("Bad message, will retry then dead-letter: {}", message);
            throw new IllegalStateException("Could not process message", e);
        }
    }
}