package com.gofleet.dto.response;

import java.time.LocalDateTime;

public record MutationResponse<T>(
        String message,
        T data,
        LocalDateTime timestamp
) {
    public static <T> MutationResponse<T> of(String message, T data) {
        return new MutationResponse<>(message, data, LocalDateTime.now());
    }
}
