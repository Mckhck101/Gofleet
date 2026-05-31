package com.gofleet.dto.response;

import com.gofleet.enums.StatutSiege;

public record SiegeResponse(Long id, String numeroSiege, StatutSiege statut, Long voyageId) {
}
