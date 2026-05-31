package com.gofleet.mapper;

import com.gofleet.dto.response.*;
import com.gofleet.entity.*;
import com.gofleet.repository.AvisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ApiMapper {
    private final AvisRepository avisRepository;

    public UtilisateurResponse utilisateur(Utilisateur u) {
        if (u == null) return null;
        return new UtilisateurResponse(u.getId(), u.getNom(), u.getPrenom(), u.getEmail(), u.getTelephone(),
                u.getDateNaissance(), u.getSexe(), u.getPhotoProfilUrl(), u.getNumeroCni(),
                u.getStatutVerification(), u.getRole(), u.getDateCreation());
    }

    public AgenceResponse agence(Agence a) {
        if (a == null) return null;
        return new AgenceResponse(a.getId(), a.getNom(), a.getLogoUrl(), a.getVillePrincipale(), a.getDescription(),
                a.getTelephone(), a.getEmail(), a.getAdresse(), a.getSiteWeb(), a.getStatut(), a.getDateCreation(),
                avisRepository.moyenneByAgenceId(a.getId()), avisRepository.countByAgenceId(a.getId()));
    }

    public MoyenTransportResponse moyenTransport(MoyenTransport m) {
        if (m == null) return null;
        return new MoyenTransportResponse(m.getId(), m.getLibelle(), m.getDescription());
    }

    public VehiculeResponse vehicule(Vehicule v) {
        if (v == null) return null;
        return new VehiculeResponse(v.getId(), v.getNumeroVehicule(), v.getMarque(), v.getImmatriculation(),
                v.getCapacite(), v.getTypeClasse(), v.getAgence().getId(), moyenTransport(v.getMoyenTransport()));
    }

    public VoyageResponse voyage(Voyage v) {
        if (v == null) return null;
        return new VoyageResponse(v.getId(), v.getNumeroVoyage(), agence(v.getAgence()), vehicule(v.getVehicule()),
                v.getVilleDepart(), v.getGareDepart(), v.getVilleArrivee(), v.getGareArrivee(), v.getDateDepart(),
                v.getHeureDepart(), v.getHeureArriveeEstimee(), v.getDureeEstimee(), v.getTypeClasse(),
                v.getPlacesTotales(), v.getPlacesRestantes(), v.getPrixNormal(), v.getPrixPromo(), v.getDevise(),
                v.getStatut(), v.getBagage(), v.getDescription(), avisRepository.moyenneByAgenceId(v.getAgence().getId()));
    }

    public SiegeResponse siege(Siege s) {
        if (s == null) return null;
        return new SiegeResponse(s.getId(), s.getNumeroSiege(), s.getStatut(), s.getVoyage().getId());
    }

    public ReservationResponse reservation(Reservation r) {
        if (r == null) return null;
        return new ReservationResponse(r.getId(), utilisateur(r.getUtilisateur()), voyage(r.getVoyage()), siege(r.getSiege()),
                r.getNomComplet(), r.getTelephone(), r.getEmail(), r.getNumeroPieceIdentite(), r.getContactUrgenceNom(),
                r.getContactUrgenceTelephone(), r.getMontant(), r.getStatut(), r.getDateReservation(),
                paiement(r.getPaiement()), facture(r.getFacture()), ticket(r.getTicket()));
    }

    public ReservationCreationResponse reservationCreation(Reservation r) {
        if (r == null) return null;
        return new ReservationCreationResponse(
                r.getId(),
                r.getVoyage().getNumeroVoyage(),
                r.getVoyage().getVilleDepart(),
                r.getVoyage().getVilleArrivee(),
                r.getVoyage().getDateDepart(),
                r.getVoyage().getHeureDepart(),
                r.getSiege().getNumeroSiege(),
                r.getMontant(),
                r.getStatut()
        );
    }

    public PaiementResponse paiement(Paiement p) {
        if (p == null) return null;
        return new PaiementResponse(p.getId(), p.getReservation().getId(), p.getMontant(), p.getMethode(),
                p.getReferenceTransaction(), p.getNumeroPaiement(), p.getDatePaiement(), p.getStatut(), null,
                "Paiement simule. Confirmez la transaction avec la reference fournie.");
    }

    public FactureResponse facture(Facture f) {
        if (f == null) return null;
        return new FactureResponse(f.getId(), f.getReservation().getId(), f.getNumeroFacture(), f.getDateGeneration(),
                f.getMontant(), f.getPdfUrl());
    }

    public TicketResponse ticket(Ticket t) {
        if (t == null) return null;
        return new TicketResponse(t.getId(), t.getReservation().getId(), t.getCodeTicket(), t.getQrCodeBase64(),
                t.getQrCodeUrl(), t.getDateGeneration(), t.getDateExpiration(), t.getStatut());
    }

    public AvisResponse avis(Avis a) {
        if (a == null) return null;
        return new AvisResponse(a.getId(), a.getNote(), a.getCommentaire(), a.getDateAvis(), a.getUtilisateur().getId(),
                a.getUtilisateur().getPrenom(), a.getUtilisateur().getPhotoProfilUrl(), a.getAgence().getId());
    }
}
