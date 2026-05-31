package com.gofleet.service.impl;

import com.gofleet.dto.request.CreerReservationRequest;
import com.gofleet.dto.response.PageResponse;
import com.gofleet.dto.response.ReservationCreationResponse;
import com.gofleet.dto.response.ReservationResponse;
import com.gofleet.entity.Reservation;
import com.gofleet.entity.Utilisateur;
import com.gofleet.enums.StatutReservation;
import com.gofleet.enums.StatutSiege;
import com.gofleet.enums.StatutVoyage;
import com.gofleet.exception.BusinessException;
import com.gofleet.exception.ResourceNotFoundException;
import com.gofleet.exception.SiegeIndisponibleException;
import com.gofleet.exception.VoyageNonReservableException;
import com.gofleet.mapper.ApiMapper;
import com.gofleet.repository.ReservationRepository;
import com.gofleet.repository.SiegeRepository;
import com.gofleet.repository.UtilisateurRepository;
import com.gofleet.repository.VoyageRepository;
import com.gofleet.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {
    private final ReservationRepository reservationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final VoyageRepository voyageRepository;
    private final SiegeRepository siegeRepository;
    private final ApiMapper mapper;

    @Override
    @Transactional
    public ReservationCreationResponse creer(CreerReservationRequest request, Utilisateur utilisateurConnecte) {
        Long utilisateurId = request.utilisateurId() != null
                ? request.utilisateurId()
                : utilisateurConnecte != null ? utilisateurConnecte.getId() : null;
        if (utilisateurId == null) {
            throw new ResourceNotFoundException("Utilisateur introuvable");
        }

        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        var voyage = voyageRepository.findWithLockingById(request.voyageId())
                .orElseThrow(() -> new ResourceNotFoundException("Voyage introuvable"));
        var siege = siegeRepository.findWithLockingById(request.siegeId())
                .orElseThrow(() -> new ResourceNotFoundException("Siege introuvable"));

        if (!siege.getVoyage().getId().equals(voyage.getId())) {
            throw new BusinessException("Le siege ne correspond pas au voyage choisi");
        }
        if (voyage.getStatut() == StatutVoyage.ANNULE
                || voyage.getStatut() == StatutVoyage.COMPLET
                || voyage.getStatut() == StatutVoyage.TERMINE
                || voyage.getPlacesRestantes() == null
                || voyage.getPlacesRestantes() <= 0) {
            throw new VoyageNonReservableException("Impossible de reserver un voyage complet, annule ou termine");
        }
        if (siege.getStatut() == StatutSiege.RESERVE || siege.getStatut() == StatutSiege.OCCUPE) {
            throw new SiegeIndisponibleException("Siege deja reserve ou occupe");
        }

        siege.setStatut(StatutSiege.RESERVE);
        voyage.setPlacesRestantes(voyage.getPlacesRestantes() - 1);
        if (voyage.getPlacesRestantes() == 0) {
            voyage.setStatut(StatutVoyage.COMPLET);
        }

        Reservation reservation = Reservation.builder()
                .utilisateur(utilisateur)
                .voyage(voyage)
                .siege(siege)
                .nomComplet(request.nomComplet())
                .telephone(request.telephone())
                .email(request.email())
                .numeroPieceIdentite(request.numeroPieceIdentite())
                .contactUrgenceNom(request.contactUrgenceNom())
                .contactUrgenceTelephone(request.contactUrgenceTelephone())
                .montant(request.montant() != null ? request.montant() : (voyage.getPrixPromo() != null ? voyage.getPrixPromo() : voyage.getPrixNormal()))
                .statut(StatutReservation.EN_ATTENTE)
                .build();
        return mapper.reservationCreation(reservationRepository.save(reservation));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReservationResponse> mesReservations(Utilisateur utilisateur, StatutReservation statut, Pageable pageable) {
        var page = (statut == null
                ? reservationRepository.findByUtilisateurId(utilisateur.getId(), pageable)
                : reservationRepository.findByUtilisateurIdAndStatut(utilisateur.getId(), statut, pageable))
                .map(mapper::reservation);
        return PageResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse get(Long id) {
        return mapper.reservation(reservationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Reservation introuvable")));
    }

    @Override
    @Transactional
    public void annuler(Long id) {
        Reservation reservation = reservationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Reservation introuvable"));
        reservation.setStatut(StatutReservation.ANNULEE);
        reservation.getSiege().setStatut(StatutSiege.DISPONIBLE);
        reservation.getVoyage().setPlacesRestantes(reservation.getVoyage().getPlacesRestantes() + 1);
        if (reservation.getVoyage().getStatut() == StatutVoyage.COMPLET) {
            reservation.getVoyage().setStatut(StatutVoyage.OUVERT);
        }
    }
}
