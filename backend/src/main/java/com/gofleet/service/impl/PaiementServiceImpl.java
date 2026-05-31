package com.gofleet.service.impl;

import com.gofleet.dto.request.ConfirmerPaiementRequest;
import com.gofleet.dto.request.FactureRequest;
import com.gofleet.dto.request.PaiementRequest;
import com.gofleet.dto.request.TicketRequest;
import com.gofleet.dto.response.ConfirmerPaiementResponse;
import com.gofleet.dto.response.PaiementResponse;
import com.gofleet.entity.Paiement;
import com.gofleet.enums.StatutPaiement;
import com.gofleet.enums.StatutReservation;
import com.gofleet.exception.PaiementException;
import com.gofleet.exception.ResourceNotFoundException;
import com.gofleet.mapper.ApiMapper;
import com.gofleet.repository.PaiementRepository;
import com.gofleet.repository.ReservationRepository;
import com.gofleet.service.FactureService;
import com.gofleet.service.PaiementService;
import com.gofleet.service.TicketService;
import com.gofleet.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaiementServiceImpl implements PaiementService {
    private final PaiementRepository paiementRepository;
    private final ReservationRepository reservationRepository;
    private final CodeGenerator codeGenerator;
    private final ApiMapper mapper;
    private final @Lazy TicketService ticketService;
    private final @Lazy FactureService factureService;

    @Override
    @Transactional
    public PaiementResponse initier(PaiementRequest request) {
        var reservation = reservationRepository.findById(request.reservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation introuvable"));
        Paiement paiement = reservation.getPaiement();
        if (paiement == null) {
            paiement = Paiement.builder()
                    .reservation(reservation)
                    .montant(reservation.getMontant())
                    .methode(request.methode())
                    .numeroPaiement(request.numeroPaiement())
                    .referenceTransaction(request.referenceTransaction() != null ? request.referenceTransaction() : codeGenerator.referenceTransaction())
                    .statut(request.statut() != null ? request.statut() : StatutPaiement.EN_ATTENTE)
                    .build();
            reservation.setPaiement(paiement);
        }
        return mapper.paiement(paiementRepository.save(paiement));
    }

    @Override
    @Transactional
    public ConfirmerPaiementResponse confirmer(ConfirmerPaiementRequest request) {
        Paiement paiement = paiementRepository.findByReferenceTransaction(request.referenceTransaction())
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable"));
        paiement.setStatut(request.statut());
        paiement.setDatePaiement(LocalDateTime.now());
        if (request.statut() == StatutPaiement.ECHEC) {
            throw new PaiementException("Paiement echoue");
        }
        if (request.statut() == StatutPaiement.REUSSI) {
            paiement.getReservation().setStatut(StatutReservation.CONFIRMEE);
            ticketService.generer(new TicketRequest(paiement.getReservation().getId()));
            factureService.generer(new FactureRequest(paiement.getReservation().getId(), null));
        }
        paiement = paiementRepository.save(paiement);
        return new ConfirmerPaiementResponse(mapper.paiement(paiement), mapper.reservation(paiement.getReservation()),
                "Paiement confirme. Votre ticket et votre facture ont ete generes.");
    }
}
