package com.gofleet.dto.request;

import jakarta.validation.constraints.NotNull;

public record TicketRequest(@NotNull Long reservationId) {
}
