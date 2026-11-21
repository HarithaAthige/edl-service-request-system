package com.edl.verification_service.service;

import org.springframework.stereotype.Component;

@Component
public class RequestValidator {

    public record Result(boolean valid, String reason) {}

    public Result validate(String nic, String phone, String address) {
        // Sri Lankan NIC: new format = 12 digits, old format = 9 digits + V or X
        if (nic == null || !nic.matches("^(\\d{12}|\\d{9}[VvXx])$")) {
            return new Result(false, "Invalid NIC");
        }
        // Phone: 10 digits starting with 0, like 0771234567
        if (phone == null || !phone.matches("^0\\d{9}$")) {
            return new Result(false, "Invalid phone number");
        }
        // Address: at least 5 characters
        if (address == null || address.trim().length() < 5) {
            return new Result(false, "Address is too short");
        }
        return new Result(true, "All checks passed");
    }
}
