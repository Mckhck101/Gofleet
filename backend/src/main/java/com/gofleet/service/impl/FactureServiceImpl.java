package com.gofleet.service.impl;

import com.gofleet.dto.request.FactureRequest;
import com.gofleet.dto.response.FactureResponse;
import com.gofleet.entity.Facture;
import com.gofleet.exception.ResourceNotFoundException;
import com.gofleet.mapper.ApiMapper;
import com.gofleet.repository.FactureRepository;
import com.gofleet.repository.ReservationRepository;
import com.gofleet.service.FactureService;
import com.gofleet.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FactureServiceImpl implements FactureService {
    private final FactureRepository factureRepository;
    private final ReservationRepository reservationRepository;
    private final CodeGenerator codeGenerator;
    private final ApiMapper mapper;

    @Override
    @Transactional
    public FactureResponse generer(FactureRequest request) {
        return factureRepository.findByReservationId(request.reservationId()).map(mapper::facture).orElseGet(() -> {
            var reservation = reservationRepository.findById(request.reservationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reservation introuvable"));
            var facture = Facture.builder()
                    .reservation(reservation)
                    .numeroFacture(codeGenerator.numeroFacture())
                    .dateGeneration(LocalDateTime.now())
                    .montant(reservation.getMontant())
                    .pdfUrl(request.pdfUrl() != null ? request.pdfUrl() : "/factures/" + reservation.getId() + ".pdf")
                    .build();
            reservation.setFacture(facture);
            return mapper.facture(factureRepository.save(facture));
        });
    }

    @Override
    @Transactional(readOnly = true)
    public FactureResponse getByReservation(Long reservationId) {
        return mapper.facture(factureRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Facture introuvable")));
    }
}
