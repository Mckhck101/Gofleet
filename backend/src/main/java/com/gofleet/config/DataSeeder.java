package com.gofleet.config;

import com.gofleet.entity.*;
import com.gofleet.enums.*;
import com.gofleet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {
    private final MoyenTransportRepository moyens;
    private final AgenceRepository agences;
    private final VehiculeRepository vehicules;
    private final VoyageRepository voyages;
    private final SiegeRepository sieges;
    private final UtilisateurRepository utilisateurs;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seed() {
        return args -> {
            if (!utilisateurs.existsByEmail("admin@gofleet.cm")) {
                utilisateurs.save(Utilisateur.builder()
                        .nom("Admin").prenom("Gofleet").email("admin@gofleet.cm").telephone("+237699000000")
                        .motDePasse(passwordEncoder.encode("Admin12345")).dateNaissance(LocalDate.of(1990, 1, 1))
                        .sexe(Sexe.M).role(Role.ADMIN).statutVerification(StatutVerification.VERIFIE).build());
            }

            MoyenTransport bus = moyen("Bus", "Transport routier interurbain");
            MoyenTransport train = moyen("Train", "Transport ferroviaire");
            MoyenTransport avion = moyen("Avion", "Transport aerien");

            if (agences.count() == 0) {
                Agence tour = agences.save(Agence.builder()
                        .nom("Touristique Express").villePrincipale("Douala").telephone("+237690111111")
                        .email("contact@touristique.cm").adresse("Bonaberi, Douala")
                        .description("Agence de transport terrestre fiable.").statut(StatutAgence.VALIDE).build());
                Agence camrail = agences.save(Agence.builder()
                        .nom("Camrail Voyage").villePrincipale("Yaounde").telephone("+237690222222")
                        .email("contact@camrail.cm").adresse("Gare Centrale, Yaounde")
                        .description("Voyages en train au Cameroun.").statut(StatutAgence.VALIDE).build());
                Agence sky = agences.save(Agence.builder()
                        .nom("Gofleet Air").villePrincipale("Douala").telephone("+237690333333")
                        .email("air@gofleet.cm").adresse("Aeroport International de Douala")
                        .description("Vols domestiques et regionaux.").statut(StatutAgence.VALIDE).build());

                Vehicule bus1 = vehicules.save(Vehicule.builder().numeroVehicule("BUS-001").marque("Mercedes-Benz")
                        .immatriculation("LT-1234-A").capacite(45).typeClasse(TypeClasse.CLASSIQUE).agence(tour).moyenTransport(bus).build());
                Vehicule train1 = vehicules.save(Vehicule.builder().numeroVehicule("TRN-001").marque("InterCity")
                        .immatriculation("TRAIN-01").capacite(80).typeClasse(TypeClasse.BUSINESS).agence(camrail).moyenTransport(train).build());
                Vehicule avion1 = vehicules.save(Vehicule.builder().numeroVehicule("AIR-001").marque("Embraer")
                        .immatriculation("TJ-GFA").capacite(70).typeClasse(TypeClasse.VIP).agence(sky).moyenTransport(avion).build());

                Voyage v1 = voyage("VY-2026-001", tour, bus1, "Douala", "Gare Bonaberi", "Yaounde", "Gare Mvan",
                        LocalDate.now().plusDays(10), LocalTime.of(8, 0), TypeClasse.CLASSIQUE, 45, new BigDecimal("5000"));
                Voyage v2 = voyage("VY-2026-002", camrail, train1, "Yaounde", "Gare Centrale", "Ngaoundere", "Gare Ngaoundere",
                        LocalDate.now().plusDays(15), LocalTime.of(18, 30), TypeClasse.BUSINESS, 80, new BigDecimal("12000"));
                Voyage v3 = voyage("VY-2026-003", sky, avion1, "Douala", "Aeroport Douala", "Garoua", "Aeroport Garoua",
                        LocalDate.now().plusDays(20), LocalTime.of(10, 15), TypeClasse.VIP, 70, new BigDecimal("85000"));

                createSieges(v1, 45);
                createSieges(v2, 80);
                createSieges(v3, 70);
            }
        };
    }

    private MoyenTransport moyen(String libelle, String description) {
        return moyens.findByLibelleIgnoreCase(libelle)
                .orElseGet(() -> moyens.save(MoyenTransport.builder().libelle(libelle).description(description).build()));
    }

    private Voyage voyage(String numero, Agence agence, Vehicule vehicule, String depart, String gareDepart,
                          String arrivee, String gareArrivee, LocalDate date, LocalTime heure,
                          TypeClasse classe, int places, BigDecimal prix) {
        return voyages.save(Voyage.builder()
                .numeroVoyage(numero).agence(agence).vehicule(vehicule).villeDepart(depart).gareDepart(gareDepart)
                .villeArrivee(arrivee).gareArrivee(gareArrivee).dateDepart(date).heureDepart(heure)
                .heureArriveeEstimee(heure.plusHours(4)).dureeEstimee("4h00").typeClasse(classe)
                .placesTotales(places).placesRestantes(places).prixNormal(prix).devise("FCFA")
                .statut(StatutVoyage.OUVERT).bagage("23kg max").description("Voyage de test Gofleet").build());
    }

    private void createSieges(Voyage voyage, int total) {
        for (int i = 1; i <= total; i++) {
            sieges.save(Siege.builder().voyage(voyage).numeroSiege("S" + i).statut(StatutSiege.DISPONIBLE).build());
        }
    }
}
