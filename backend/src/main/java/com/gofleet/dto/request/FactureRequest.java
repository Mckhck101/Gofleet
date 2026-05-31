package com.gofleet.dto.request;

import jakarta.validation.constraints.NotNull;

public record FactureRequest(@NotNull Long reservationId, String pdfUrl) {
}
