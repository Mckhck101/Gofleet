package com.gofleet.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;

public record PageResponse<T>(
        List<T> contenu,
        int pageActuelle,
        int totalPages,
        long totalElements
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getTotalPages(), page.getTotalElements());
    }
}
