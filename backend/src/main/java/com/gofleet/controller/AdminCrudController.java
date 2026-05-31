package com.gofleet.controller;

import com.gofleet.dto.request.*;
import com.gofleet.dto.response.*;
import com.gofleet.entity.*;
import com.gofleet.enums.Role;
import com.gofleet.exception.ResourceNotFoundException;
import com.gofleet.mapper.ApiMapper;
import com.gofleet.repository.*;
import com.gofleet.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Transactional
public class AdminCrudController {
    private final UtilisateurRepository utilisateurs;
    private final AgenceRepository agences;
    private final MoyenTransportRepository moyens;
    private final VehiculeRepository vehicules;
    private final VoyageRepository voyages;
    private final SiegeRepository sieges;
    private final ReservationRepository reservations;
    private final PaiementRepository paiements;
    private final FactureRepository factures;
    private final TicketRepository tickets;
    private final AvisRepository avisRepository;
    private final ReservationService reservationService;
    private final PaiementService paiementService;
    private final FactureService factureService;
    private final TicketService ticketService;
    private final AvisService avisService;
    private final PasswordEncoder passwordEncoder;
    private final ApiMapper mapper;

    @GetMapping("/utilisateurs")
    public PageResponse<UtilisateurResponse> utilisateurs(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int taille) {
        return PageResponse.from(utilisateurs.findAll(PageRequest.of(page, taille)).map(mapper::utilisateur));
    }

    @PostMapping("/utilisateurs")
    @ResponseStatus(HttpStatus.CREATED)
    public MutationResponse<UtilisateurResponse> createUtilisateur(@Valid @RequestBody UtilisateurRequest request) {
        var utilisateur = Utilisateur.builder()
                .nom(request.nom()).prenom(request.prenom()).email(request.email()).telephone(request.telephone())
                .motDePasse(passwordEncoder.encode(request.motDePasse() == null ? "Password123" : request.motDePasse()))
                .dateNaissance(request.dateNaissance()).sexe(request.sexe()).photoProfilUrl(request.photoProfilUrl())
                .numeroCni(request.numeroCni()).role(request.role() == null ? Role.USER : request.role()).build();
        return created("Utilisateur", mapper.utilisateur(utilisateurs.save(utilisateur)));
    }

    @GetMapping("/utilisateurs/{id}")
    public UtilisateurResponse getUtilisateur(@PathVariable Long id) {
        return mapper.utilisateur(utilisateurs.findById(id).orElseThrow(() -> nf("Utilisateur")));
    }

    @PutMapping("/utilisateurs/{id}")
    public MutationResponse<UtilisateurResponse> updateUtilisateur(@PathVariable Long id, @Valid @RequestBody UtilisateurRequest request) {
        var u = utilisateurs.findById(id).orElseThrow(() -> nf("Utilisateur"));
        u.setNom(request.nom()); u.setPrenom(request.prenom()); u.setEmail(request.email()); u.setTelephone(request.telephone());
        if (request.motDePasse() != null && !request.motDePasse().isBlank()) u.setMotDePasse(passwordEncoder.encode(request.motDePasse()));
        u.setDateNaissance(request.dateNaissance()); u.setSexe(request.sexe()); u.setPhotoProfilUrl(request.photoProfilUrl());
        u.setNumeroCni(request.numeroCni()); if (request.role() != null) u.setRole(request.role());
        return updated("Utilisateur", mapper.utilisateur(u));
    }

    @DeleteMapping("/utilisateurs/{id}")
    public MutationResponse<Void> deleteUtilisateur(@PathVariable Long id) {
        utilisateurs.delete(utilisateurs.findById(id).orElseThrow(() -> nf("Utilisateur")));
        return deleted("Utilisateur");
    }

    @GetMapping("/agences")
    public PageResponse<AgenceResponse> agences(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int taille) {
        return PageResponse.from(agences.findAll(PageRequest.of(page, taille)).map(mapper::agence));
    }

    @PostMapping("/agences")
    @ResponseStatus(HttpStatus.CREATED)
    public MutationResponse<AgenceResponse> createAgence(@Valid @RequestBody AgenceRequest request) {
        return created("Agence", mapper.agence(agences.save(applyAgence(new Agence(), request))));
    }

    @GetMapping("/agences/{id}")
    public AgenceResponse getAgence(@PathVariable Long id) {
        return mapper.agence(agences.findById(id).orElseThrow(() -> nf("Agence")));
    }

    @PutMapping("/agences/{id}")
    public MutationResponse<AgenceResponse> updateAgence(@PathVariable Long id, @Valid @RequestBody AgenceRequest request) {
        return updated("Agence", mapper.agence(applyAgence(agences.findById(id).orElseThrow(() -> nf("Agence")), request)));
    }

    @DeleteMapping("/agences/{id}")
    public MutationResponse<Void> deleteAgence(@PathVariable Long id) {
        agences.delete(agences.findById(id).orElseThrow(() -> nf("Agence")));
        return deleted("Agence");
    }

    @GetMapping("/moyens-transport")
    public PageResponse<MoyenTransportResponse> moyens(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int taille) {
        return PageResponse.from(moyens.findAll(PageRequest.of(page, taille)).map(mapper::moyenTransport));
    }

    @PostMapping("/moyens-transport")
    @ResponseStatus(HttpStatus.CREATED)
    public MutationResponse<MoyenTransportResponse> createMoyen(@Valid @RequestBody MoyenTransportRequest request) {
        return created("Moyen de transport", mapper.moyenTransport(moyens.save(MoyenTransport.builder().libelle(request.libelle()).description(request.description()).build())));
    }

    @GetMapping("/moyens-transport/{id}")
    public MoyenTransportResponse getMoyen(@PathVariable Long id) {
        return mapper.moyenTransport(moyens.findById(id).orElseThrow(() -> nf("Moyen de transport")));
    }

    @PutMapping("/moyens-transport/{id}")
    public MutationResponse<MoyenTransportResponse> updateMoyen(@PathVariable Long id, @Valid @RequestBody MoyenTransportRequest request) {
        var m = moyens.findById(id).orElseThrow(() -> nf("Moyen de transport"));
        m.setLibelle(request.libelle()); m.setDescription(request.description());
        return updated("Moyen de transport", mapper.moyenTransport(m));
    }

    @DeleteMapping("/moyens-transport/{id}")
    public MutationResponse<Void> deleteMoyen(@PathVariable Long id) {
        moyens.delete(moyens.findById(id).orElseThrow(() -> nf("Moyen de transport")));
        return deleted("Moyen de transport");
    }

    @GetMapping("/vehicules")
    public PageResponse<VehiculeResponse> vehicules(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int taille) {
        return PageResponse.from(vehicules.findAll(PageRequest.of(page, taille)).map(mapper::vehicule));
    }

    @PostMapping("/vehicules")
    @ResponseStatus(HttpStatus.CREATED)
    public MutationResponse<VehiculeResponse> createVehicule(@Valid @RequestBody VehiculeRequest request) {
        return created("Vehicule", mapper.vehicule(vehicules.save(applyVehicule(new Vehicule(), request))));
    }

    @GetMapping("/vehicules/{id}")
    public VehiculeResponse getVehicule(@PathVariable Long id) {
        return mapper.vehicule(vehicules.findById(id).orElseThrow(() -> nf("Vehicule")));
    }

    @PutMapping("/vehicules/{id}")
    public MutationResponse<VehiculeResponse> updateVehicule(@PathVariable Long id, @Valid @RequestBody VehiculeRequest request) {
        return updated("Vehicule", mapper.vehicule(applyVehicule(vehicules.findById(id).orElseThrow(() -> nf("Vehicule")), request)));
    }

    @DeleteMapping("/vehicules/{id}")
    public MutationResponse<Void> deleteVehicule(@PathVariable Long id) {
        vehicules.delete(vehicules.findById(id).orElseThrow(() -> nf("Vehicule")));
        return deleted("Vehicule");
    }

    @GetMapping("/voyages")
    public PageResponse<VoyageResponse> voyages(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int taille) {
        return PageResponse.from(voyages.findAll(PageRequest.of(page, taille)).map(mapper::voyage));
    }

    @PostMapping("/voyages")
    @ResponseStatus(HttpStatus.CREATED)
    public MutationResponse<VoyageResponse> createVoyage(@Valid @RequestBody VoyageRequest request) {
        return created("Voyage", mapper.voyage(voyages.save(applyVoyage(new Voyage(), request))));
    }

    @GetMapping("/voyages/{id}")
    public VoyageResponse getVoyage(@PathVariable Long id) {
        return mapper.voyage(voyages.findById(id).orElseThrow(() -> nf("Voyage")));
    }

    @PutMapping("/voyages/{id}")
    public MutationResponse<VoyageResponse> updateVoyage(@PathVariable Long id, @Valid @RequestBody VoyageRequest request) {
        return updated("Voyage", mapper.voyage(applyVoyage(voyages.findById(id).orElseThrow(() -> nf("Voyage")), request)));
    }

    @DeleteMapping("/voyages/{id}")
    public MutationResponse<Void> deleteVoyage(@PathVariable Long id) {
        voyages.delete(voyages.findById(id).orElseThrow(() -> nf("Voyage")));
        return deleted("Voyage");
    }

    @GetMapping("/sieges")
    public PageResponse<SiegeResponse> sieges(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int taille) {
        return PageResponse.from(sieges.findAll(PageRequest.of(page, taille)).map(mapper::siege));
    }

    @PostMapping("/sieges")
    @ResponseStatus(HttpStatus.CREATED)
    public MutationResponse<SiegeResponse> createSiege(@Valid @RequestBody SiegeRequest request) {
        return created("Siege", mapper.siege(sieges.save(applySiege(new Siege(), request))));
    }

    @GetMapping("/sieges/{id}")
    public SiegeResponse getSiege(@PathVariable Long id) {
        return mapper.siege(sieges.findById(id).orElseThrow(() -> nf("Siege")));
    }

    @PutMapping("/sieges/{id}")
    public MutationResponse<SiegeResponse> updateSiege(@PathVariable Long id, @Valid @RequestBody SiegeRequest request) {
        return updated("Siege", mapper.siege(applySiege(sieges.findById(id).orElseThrow(() -> nf("Siege")), request)));
    }

    @DeleteMapping("/sieges/{id}")
    public MutationResponse<Void> deleteSiege(@PathVariable Long id) {
        sieges.delete(sieges.findById(id).orElseThrow(() -> nf("Siege")));
        return deleted("Siege");
    }

    @GetMapping("/reservations")
    public PageResponse<ReservationResponse> reservations(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int taille) {
        return PageResponse.from(reservations.findAll(PageRequest.of(page, taille)).map(mapper::reservation));
    }

    @PostMapping("/reservations")
    @ResponseStatus(HttpStatus.CREATED)
    public MutationResponse<ReservationCreationResponse> createReservation(@Valid @RequestBody CreerReservationRequest request) {
        var user = utilisateurs.findById(request.utilisateurId()).orElseThrow(() -> nf("Utilisateur"));
        return created("Reservation", reservationService.creer(request, user));
    }

    @GetMapping("/reservations/{id}")
    public ReservationResponse getReservation(@PathVariable Long id) {
        return mapper.reservation(reservations.findById(id).orElseThrow(() -> nf("Reservation")));
    }

    @PutMapping("/reservations/{id}")
    public MutationResponse<ReservationResponse> updateReservation(@PathVariable Long id, @Valid @RequestBody ReservationAdminRequest request) {
        var r = reservations.findById(id).orElseThrow(() -> nf("Reservation"));
        r.setUtilisateur(utilisateurs.findById(request.utilisateurId()).orElseThrow(() -> nf("Utilisateur")));
        r.setVoyage(voyages.findById(request.voyageId()).orElseThrow(() -> nf("Voyage")));
        r.setSiege(sieges.findById(request.siegeId()).orElseThrow(() -> nf("Siege")));
        r.setNomComplet(request.nomComplet()); r.setTelephone(request.telephone()); r.setEmail(request.email());
        r.setNumeroPieceIdentite(request.numeroPieceIdentite()); r.setContactUrgenceNom(request.contactUrgenceNom());
        r.setContactUrgenceTelephone(request.contactUrgenceTelephone()); r.setMontant(request.montant());
        if (request.statut() != null) r.setStatut(request.statut());
        return updated("Reservation", mapper.reservation(r));
    }

    @DeleteMapping("/reservations/{id}")
    public MutationResponse<Void> deleteReservation(@PathVariable Long id) {
        reservations.delete(reservations.findById(id).orElseThrow(() -> nf("Reservation")));
        return deleted("Reservation");
    }

    @GetMapping("/paiements")
    public PageResponse<PaiementResponse> paiements(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int taille) {
        return PageResponse.from(paiements.findAll(PageRequest.of(page, taille)).map(mapper::paiement));
    }

    @PostMapping("/paiements")
    @ResponseStatus(HttpStatus.CREATED)
    public MutationResponse<PaiementResponse> createPaiement(@Valid @RequestBody PaiementRequest request) {
        return created("Paiement", paiementService.initier(request));
    }

    @GetMapping("/paiements/{id}")
    public PaiementResponse getPaiement(@PathVariable Long id) {
        return mapper.paiement(paiements.findById(id).orElseThrow(() -> nf("Paiement")));
    }

    @PutMapping("/paiements/{id}")
    public MutationResponse<PaiementResponse> updatePaiement(@PathVariable Long id, @Valid @RequestBody PaiementRequest request) {
        var p = paiements.findById(id).orElseThrow(() -> nf("Paiement"));
        p.setReservation(reservations.findById(request.reservationId()).orElseThrow(() -> nf("Reservation")));
        p.setMethode(request.methode()); p.setNumeroPaiement(request.numeroPaiement());
        if (request.referenceTransaction() != null) p.setReferenceTransaction(request.referenceTransaction());
        if (request.statut() != null) p.setStatut(request.statut());
        p.setMontant(p.getReservation().getMontant());
        return updated("Paiement", mapper.paiement(p));
    }

    @DeleteMapping("/paiements/{id}")
    public MutationResponse<Void> deletePaiement(@PathVariable Long id) {
        paiements.delete(paiements.findById(id).orElseThrow(() -> nf("Paiement")));
        return deleted("Paiement");
    }

    @GetMapping("/factures")
    public PageResponse<FactureResponse> factures(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int taille) {
        return PageResponse.from(factures.findAll(PageRequest.of(page, taille)).map(mapper::facture));
    }

    @PostMapping("/factures")
    @ResponseStatus(HttpStatus.CREATED)
    public MutationResponse<FactureResponse> createFacture(@Valid @RequestBody FactureRequest request) {
        return created("Facture", factureService.generer(request));
    }

    @GetMapping("/factures/{id}")
    public FactureResponse getFacture(@PathVariable Long id) {
        return mapper.facture(factures.findById(id).orElseThrow(() -> nf("Facture")));
    }

    @PutMapping("/factures/{id}")
    public MutationResponse<FactureResponse> updateFacture(@PathVariable Long id, @Valid @RequestBody FactureAdminRequest request) {
        var f = factures.findById(id).orElseThrow(() -> nf("Facture"));
        f.setReservation(reservations.findById(request.reservationId()).orElseThrow(() -> nf("Reservation")));
        if (request.numeroFacture() != null) f.setNumeroFacture(request.numeroFacture());
        f.setMontant(request.montant()); f.setPdfUrl(request.pdfUrl());
        if (f.getDateGeneration() == null) f.setDateGeneration(LocalDateTime.now());
        return updated("Facture", mapper.facture(f));
    }

    @DeleteMapping("/factures/{id}")
    public MutationResponse<Void> deleteFacture(@PathVariable Long id) {
        factures.delete(factures.findById(id).orElseThrow(() -> nf("Facture")));
        return deleted("Facture");
    }

    @GetMapping("/tickets")
    public PageResponse<TicketResponse> tickets(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int taille) {
        return PageResponse.from(tickets.findAll(PageRequest.of(page, taille)).map(mapper::ticket));
    }

    @PostMapping("/tickets")
    @ResponseStatus(HttpStatus.CREATED)
    public MutationResponse<TicketResponse> createTicket(@Valid @RequestBody TicketRequest request) {
        return created("Ticket", ticketService.generer(request));
    }

    @GetMapping("/tickets/{id}")
    public TicketResponse getTicket(@PathVariable Long id) {
        return mapper.ticket(tickets.findById(id).orElseThrow(() -> nf("Ticket")));
    }

    @PutMapping("/tickets/{id}")
    public MutationResponse<TicketResponse> updateTicket(@PathVariable Long id, @Valid @RequestBody TicketAdminRequest request) {
        var t = tickets.findById(id).orElseThrow(() -> nf("Ticket"));
        t.setReservation(reservations.findById(request.reservationId()).orElseThrow(() -> nf("Reservation")));
        if (request.codeTicket() != null) t.setCodeTicket(request.codeTicket());
        t.setQrCodeBase64(request.qrCodeBase64()); t.setQrCodeUrl(request.qrCodeUrl());
        t.setDateExpiration(request.dateExpiration()); if (request.statut() != null) t.setStatut(request.statut());
        if (t.getDateGeneration() == null) t.setDateGeneration(LocalDateTime.now());
        return updated("Ticket", mapper.ticket(t));
    }

    @DeleteMapping("/tickets/{id}")
    public MutationResponse<Void> deleteTicket(@PathVariable Long id) {
        tickets.delete(tickets.findById(id).orElseThrow(() -> nf("Ticket")));
        return deleted("Ticket");
    }

    @GetMapping("/avis")
    public PageResponse<AvisResponse> avis(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int taille) {
        return PageResponse.from(avisRepository.findAll(PageRequest.of(page, taille)).map(mapper::avis));
    }

    @PostMapping("/avis")
    @ResponseStatus(HttpStatus.CREATED)
    public MutationResponse<AvisResponse> createAvis(@Valid @RequestBody AvisRequest request) {
        var user = utilisateurs.findById(request.utilisateurId()).orElseThrow(() -> nf("Utilisateur"));
        return created("Avis", avisService.creer(request, user));
    }

    @GetMapping("/avis/{id}")
    public AvisResponse getAvis(@PathVariable Long id) {
        return mapper.avis(avisRepository.findById(id).orElseThrow(() -> nf("Avis")));
    }

    @PutMapping("/avis/{id}")
    public MutationResponse<AvisResponse> updateAvis(@PathVariable Long id, @Valid @RequestBody AvisRequest request) {
        var a = avisRepository.findById(id).orElseThrow(() -> nf("Avis"));
        a.setUtilisateur(utilisateurs.findById(request.utilisateurId()).orElseThrow(() -> nf("Utilisateur")));
        a.setAgence(agences.findById(request.agenceId()).orElseThrow(() -> nf("Agence")));
        a.setNote(request.note()); a.setCommentaire(request.commentaire());
        return updated("Avis", mapper.avis(a));
    }

    @DeleteMapping("/avis/{id}")
    public MutationResponse<Void> deleteAvis(@PathVariable Long id) {
        avisRepository.delete(avisRepository.findById(id).orElseThrow(() -> nf("Avis")));
        return deleted("Avis");
    }

    private Agence applyAgence(Agence a, AgenceRequest r) {
        a.setNom(r.nom()); a.setLogoUrl(r.logoUrl()); a.setVillePrincipale(r.villePrincipale()); a.setDescription(r.description());
        a.setTelephone(r.telephone()); a.setEmail(r.email()); a.setAdresse(r.adresse()); a.setSiteWeb(r.siteWeb());
        if (r.statut() != null) a.setStatut(r.statut());
        return a;
    }

    private Vehicule applyVehicule(Vehicule v, VehiculeRequest r) {
        v.setNumeroVehicule(r.numeroVehicule()); v.setMarque(r.marque()); v.setImmatriculation(r.immatriculation());
        v.setCapacite(r.capacite()); v.setTypeClasse(r.typeClasse());
        v.setAgence(agences.findById(r.agenceId()).orElseThrow(() -> nf("Agence")));
        v.setMoyenTransport(moyens.findById(r.moyenTransportId()).orElseThrow(() -> nf("Moyen de transport")));
        return v;
    }

    private Voyage applyVoyage(Voyage v, VoyageRequest r) {
        v.setNumeroVoyage(r.numeroVoyage()); v.setAgence(agences.findById(r.agenceId()).orElseThrow(() -> nf("Agence")));
        v.setVehicule(vehicules.findById(r.vehiculeId()).orElseThrow(() -> nf("Vehicule")));
        v.setVilleDepart(r.villeDepart()); v.setGareDepart(r.gareDepart()); v.setVilleArrivee(r.villeArrivee()); v.setGareArrivee(r.gareArrivee());
        v.setDateDepart(r.dateDepart()); v.setHeureDepart(r.heureDepart()); v.setHeureArriveeEstimee(r.heureArriveeEstimee());
        v.setDureeEstimee(r.dureeEstimee()); v.setTypeClasse(r.typeClasse()); v.setPlacesTotales(r.placesTotales());
        v.setPlacesRestantes(r.placesRestantes() != null ? r.placesRestantes() : r.placesTotales()); v.setPrixNormal(r.prixNormal());
        v.setPrixPromo(r.prixPromo()); v.setDevise(r.devise() == null ? "FCFA" : r.devise()); if (r.statut() != null) v.setStatut(r.statut());
        v.setBagage(r.bagage()); v.setDescription(r.description());
        return v;
    }

    private Siege applySiege(Siege s, SiegeRequest r) {
        s.setNumeroSiege(r.numeroSiege()); if (r.statut() != null) s.setStatut(r.statut());
        s.setVoyage(voyages.findById(r.voyageId()).orElseThrow(() -> nf("Voyage")));
        return s;
    }

    private ResourceNotFoundException nf(String name) {
        return new ResourceNotFoundException(name + " introuvable");
    }

    private <T> MutationResponse<T> created(String resource, T data) {
        return MutationResponse.of(resource + " cree avec succes", data);
    }

    private <T> MutationResponse<T> updated(String resource, T data) {
        return MutationResponse.of(resource + " modifie avec succes", data);
    }

    private MutationResponse<Void> deleted(String resource) {
        return MutationResponse.of(resource + " supprime avec succes", null);
    }
}
