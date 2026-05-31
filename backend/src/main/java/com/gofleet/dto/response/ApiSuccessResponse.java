package com.gofleet.dto.response;

import java.time.LocalDateTime;

public record ApiSuccessResponse(String message, LocalDateTime timestamp) {
    public static ApiSuccessResponse of(String message) {
        return new ApiSuccessResponse(message, LocalDateTime.now());
    }
}
