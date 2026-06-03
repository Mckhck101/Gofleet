/**
 * MOCK API — à désactiver quand le backend est prêt
 * Pour désactiver : commenter l'import dans app/_layout.tsx
 */
import MockAdapter from "axios-mock-adapter";
import apiClient from "./client";
 
const mock = new MockAdapter(apiClient, { delayResponse: 900 });
 
// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────
 
const UTILISATEUR_MOCK = {
    id: 1,
    nom: "Mbarga",
    prenom: "Jean",
    email: "jean.mbarga@gmail.com",
    telephone: "+237690000000",
    dateNaissance: "1995-04-15",
    sexe: "M",
    photoProfilUrl: null,
    numeroCni: "123456789",
    statutVerification: "NON_VERIFIE",
    dateCreation: new Date().toISOString(),
};
 
const AUTH_RESPONSE = {
    accessToken: "mock-access-token-xyz",
    refreshToken: "mock-refresh-token-xyz",
    tokenType: "Bearer",
    expiresIn: 3600,
    utilisateur: UTILISATEUR_MOCK,
};
 
mock.onPost("/auth/inscription").reply(201, AUTH_RESPONSE);
mock.onPost("/auth/connexion").reply(200, AUTH_RESPONSE);
mock.onPost("/auth/deconnexion").reply(200, { message: "Déconnexion réussie" });
mock.onPost("/auth/refresh-token").reply(200, AUTH_RESPONSE);
mock.onPost("/auth/mot-de-passe/reinitialiser").reply(200, { message: "Email envoyé" });
mock.onPost("/auth/mot-de-passe/confirmer").reply(200, { message: "Mot de passe modifié" });
 
// ─────────────────────────────────────────────────────────────
// UTILISATEUR
// ─────────────────────────────────────────────────────────────
 
mock.onGet("/utilisateurs/moi").reply(200, UTILISATEUR_MOCK);
mock.onPut("/utilisateurs/moi").reply(200, UTILISATEUR_MOCK);
 
// ─────────────────────────────────────────────────────────────
// AGENCES
// ─────────────────────────────────────────────────────────────
 
const AGENCES_MOCK = [
    {
        id: 1,
        nom: "Touristique Express",
        logoUrl: null,
        villePrincipale: "Douala",
        noteMoyenne: 4.3,
        nombreAvis: 128,
        description: "Leader du transport interurbain au Cameroun depuis 2005.",
        telephone: "+237233000001",
        email: "contact@touristique-express.cm",
        adresse: "Rue de la Gare, Bonabéri",
        siteWeb: null,
        statut: "VALIDE",
        dateCreation: "2005-01-15T00:00:00Z",
    },
    {
        id: 2,
        nom: "Général Voyage",
        logoUrl: null,
        villePrincipale: "Yaoundé",
        noteMoyenne: 3.8,
        nombreAvis: 64,
        description: "Transport confortable vers toutes les villes du Cameroun.",
        telephone: "+237233000002",
        email: "contact@general-voyage.cm",
        adresse: "Avenue Kennedy, Yaoundé",
        siteWeb: null,
        statut: "VALIDE",
        dateCreation: "2010-06-01T00:00:00Z",
    },
    {
        id: 3,
        nom: "Vatican Express",
        logoUrl: null,
        villePrincipale: "Bafoussam",
        noteMoyenne: 4.6,
        nombreAvis: 210,
        description: "Voyagez en toute sécurité avec Vatican Express.",
        telephone: "+237233000003",
        email: "info@vatican-express.cm",
        adresse: "Carrefour Total, Bafoussam",
        siteWeb: null,
        statut: "VALIDE",
        dateCreation: "2008-03-20T00:00:00Z",
    },
];
 
mock.onGet("/agences").reply(200, {
    contenu: AGENCES_MOCK,
    pageActuelle: 0,
    totalPages: 1,
    totalElements: 3,
});
 
mock.onGet(/\/agences\/\d+$/).reply((config) => {
    const id = parseInt(config.url!.split("/").pop()!);
    const agence = AGENCES_MOCK.find((a) => a.id === id);
    return agence ? [200, agence] : [404, { message: "Agence introuvable" }];
});
 
// ─────────────────────────────────────────────────────────────
// VOYAGES
// ─────────────────────────────────────────────────────────────
 
const VOYAGES_MOCK = [
    {
        id: 1,
        numeroVoyage: "VY-2026-001",
        agence: { id: 1, nom: "Touristique Express", logoUrl: null, noteMoyenne: 4.3, nombreAvis: 128 },
        villeDepart: "Douala",
        gareDepart: "Gare Routière Bonabéri",
        villeArrivee: "Yaoundé",
        gareArrivee: "Gare Centrale Yaoundé",
        dateDepart: "2026-06-10",
        heureDepart: "08:00",
        heureArriveeEstimee: "12:00",
        dureeEstimee: "4h00",
        typeClasse: "VIP",
        placesRestantes: 12,
        prixNormal: 5000,
        prixPromo: null,
        devise: "FCFA",
        statut: "OUVERT",
        noteMoyenne: 4.2,
        vehicule: {
            id: 1,
            numeroVehicule: "VH-001",
            marque: "Mercedes-Benz",
            immatriculation: "LT-1234-A",
            capacite: 45,
            typeClasse: "VIP",
            moyenTransport: { id: 1, libelle: "Bus", description: "Bus climatisé" },
        },
        bagage: "23kg max",
        description: "Voyage VIP climatisé avec wifi à bord.",
    },
    {
        id: 2,
        numeroVoyage: "VY-2026-002",
        agence: { id: 2, nom: "Général Voyage", logoUrl: null, noteMoyenne: 3.8, nombreAvis: 64 },
        villeDepart: "Douala",
        gareDepart: "Gare Routière Bonabéri",
        villeArrivee: "Yaoundé",
        gareArrivee: "Gare Centrale Yaoundé",
        dateDepart: "2026-06-10",
        heureDepart: "10:00",
        heureArriveeEstimee: "14:30",
        dureeEstimee: "4h30",
        typeClasse: "CLASSIQUE",
        placesRestantes: 3,
        prixNormal: 3500,
        prixPromo: 3000,
        devise: "FCFA",
        statut: "OUVERT",
        noteMoyenne: 3.9,
        vehicule: {
            id: 2,
            numeroVehicule: "VH-002",
            marque: "Toyota",
            immatriculation: "LT-5678-B",
            capacite: 30,
            typeClasse: "CLASSIQUE",
            moyenTransport: { id: 1, libelle: "Bus", description: "Bus standard" },
        },
        bagage: "15kg max",
        description: null,
    },
    {
        id: 3,
        numeroVoyage: "VY-2026-003",
        agence: { id: 3, nom: "Vatican Express", logoUrl: null, noteMoyenne: 4.6, nombreAvis: 210 },
        villeDepart: "Yaoundé",
        gareDepart: "Gare Centrale Yaoundé",
        villeArrivee: "Bafoussam",
        gareArrivee: "Gare de Bafoussam",
        dateDepart: "2026-06-10",
        heureDepart: "07:00",
        heureArriveeEstimee: "11:00",
        dureeEstimee: "4h00",
        typeClasse: "BUSINESS",
        placesRestantes: 8,
        prixNormal: 7000,
        prixPromo: null,
        devise: "FCFA",
        statut: "OUVERT",
        noteMoyenne: 4.6,
        vehicule: {
            id: 3,
            numeroVehicule: "VH-003",
            marque: "Volvo",
            immatriculation: "CE-9999-C",
            capacite: 50,
            typeClasse: "BUSINESS",
            moyenTransport: { id: 1, libelle: "Bus", description: "Bus premium" },
        },
        bagage: "30kg max",
        description: "Siège inclinable, repas inclus.",
    },
];
 
mock.onGet("/voyages").reply(200, {
    contenu: VOYAGES_MOCK,
    pageActuelle: 0,
    totalPages: 1,
    totalElements: VOYAGES_MOCK.length,
});
 
mock.onGet(/\/voyages\/\d+$/).reply((config) => {
    const id = parseInt(config.url!.split("/").pop()!);
    const voyage = VOYAGES_MOCK.find((v) => v.id === id);
    return voyage ? [200, voyage] : [404, { message: "Voyage introuvable" }];
});
 
// ─────────────────────────────────────────────────────────────
// SIÈGES
// ─────────────────────────────────────────────────────────────
 
function genererSieges(voyageId: number) {
    const rangees = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    const siegesParRangee = 5;
    const sieges = [];
    let id = (voyageId - 1) * 50 + 1;
 
    for (const rangee of rangees) {
        for (let num = 1; num <= siegesParRangee; num++) {
            const aleatoire = Math.random();
            const statut =
                aleatoire < 0.3 ? "RESERVE" :
                aleatoire < 0.35 ? "OCCUPE" :
                "DISPONIBLE";
            sieges.push({ id: id++, numeroSiege: `${rangee}${num}`, statut });
        }
    }
    return sieges;
}
 
mock.onGet(/\/voyages\/\d+\/sieges/).reply((config) => {
    const parts = config.url!.split("/");
    const voyageId = parseInt(parts[parts.indexOf("voyages") + 1]);
    return [200, genererSieges(voyageId)];
});
 
// ─────────────────────────────────────────────────────────────
// RÉSERVATIONS
// ─────────────────────────────────────────────────────────────
 
const RESERVATIONS_MOCK = [
    {
        id: 1,
        voyage: VOYAGES_MOCK[0],
        siege: { id: 3, numeroSiege: "A3", statut: "RESERVE" },
        montant: 5000,
        statut: "CONFIRMEE",
        dateReservation: new Date().toISOString(),
        nomComplet: "Jean Mbarga",
        telephone: "+237690000000",
        email: "jean.mbarga@gmail.com",
        numeroPieceIdentite: "123456789",
        contactUrgenceNom: "Marie Mbarga",
        contactUrgenceTelephone: "+237699000000",
        paiement: {
            id: 1,
            montant: 5000,
            methode: "ORANGE_MONEY",
            referenceTransaction: "OM-2026-001",
            datePaiement: new Date().toISOString(),
            statut: "REUSSI",
        },
        ticket: {
            id: 1,
            codeTicket: "TKT-20260610-A3-00001",
            qrCodeBase64: null,
            qrCodeUrl: null,
            dateGeneration: new Date().toISOString(),
            dateExpiration: "2026-06-10T23:59:59Z",
            statut: "VALIDE",
            reservationId: 1,
        },
        facture: {
            id: 1,
            numeroFacture: "FAC-2026-0001",
            dateGeneration: new Date().toISOString(),
            montant: 5000,
            pdfUrl: "https://example.com/facture-001.pdf",
        },
    },
];
 
mock.onGet("/reservations").reply(200, {
    contenu: RESERVATIONS_MOCK,
    pageActuelle: 0,
    totalPages: 1,
    totalElements: RESERVATIONS_MOCK.length,
});
 
mock.onPost("/reservations").reply(201, RESERVATIONS_MOCK[0]);
 
mock.onGet(/\/reservations\/\d+$/).reply((config) => {
    const id = parseInt(config.url!.split("/").pop()!);
    const resa = RESERVATIONS_MOCK.find((r) => r.id === id);
    return resa ? [200, resa] : [404, { message: "Réservation introuvable" }];
});
 
mock.onPost(/\/reservations\/\d+\/annuler/).reply(200, { message: "Réservation annulée" });
 
mock.onGet(/\/reservations\/\d+\/ticket/).reply(200, RESERVATIONS_MOCK[0].ticket);
mock.onGet(/\/reservations\/\d+\/facture/).reply(200, RESERVATIONS_MOCK[0].facture);
 
// ─────────────────────────────────────────────────────────────
// PAIEMENTS
// ─────────────────────────────────────────────────────────────
 
mock.onPost("/paiements/initier").reply(200, {
    paiementId: 99,
    referenceTransaction: "MOCK-TXN-" + Date.now(),
    urlPaiement: null,
    instructionsPaiement: "Composez *150*1*1*5000# pour confirmer le paiement Orange Money.",
    statut: "EN_ATTENTE",
});
 
mock.onPost("/paiements/confirmer").reply(200, {
    paiement: {
        id: 99,
        montant: 5000,
        methode: "ORANGE_MONEY",
        referenceTransaction: "MOCK-TXN-001",
        datePaiement: new Date().toISOString(),
        statut: "REUSSI",
    },
    reservation: RESERVATIONS_MOCK[0],
    message: "Paiement confirmé. Votre ticket a été généré et envoyé par email.",
});
 
mock.onGet(/\/paiements\/\d+\/statut/).reply(200, {
    id: 99,
    montant: 5000,
    methode: "ORANGE_MONEY",
    referenceTransaction: "MOCK-TXN-001",
    datePaiement: new Date().toISOString(),
    statut: "REUSSI",
});
 
// ─────────────────────────────────────────────────────────────
// TICKETS
// ─────────────────────────────────────────────────────────────
 
mock.onGet(/\/tickets\/\d+$/).reply(200, RESERVATIONS_MOCK[0].ticket);
 
mock.onPost("/tickets/valider").reply(200, {
    valide: true,
    message: "Ticket valide. Bon voyage !",
    ticket: RESERVATIONS_MOCK[0].ticket,
    voyageur: {
        nomComplet: "Jean Mbarga",
        numeroSiege: "A3",
        villeDepart: "Douala",
        villeArrivee: "Yaoundé",
    },
});
 
// ─────────────────────────────────────────────────────────────
// AVIS
// ─────────────────────────────────────────────────────────────
 
const AVIS_MOCK = [
    {
        id: 1,
        note: 5,
        commentaire: "Excellent service, je recommande !",
        dateAvis: new Date().toISOString(),
        utilisateur: { id: 1, prenom: "Jean", photoProfilUrl: null },
        agenceId: 1,
    },
    {
        id: 2,
        note: 4,
        commentaire: "Très bien, quelques petits retards mais globalement satisfait.",
        dateAvis: new Date().toISOString(),
        utilisateur: { id: 2, prenom: "Alice", photoProfilUrl: null },
        agenceId: 1,
    },
];
 
mock.onGet(/\/agences\/\d+\/avis/).reply(200, {
    contenu: AVIS_MOCK,
    noteMoyenne: 4.5,
    totalAvis: 2,
    pageActuelle: 0,
    totalPages: 1,
});
 
mock.onPost("/avis").reply(201, {
    id: 99,
    note: 5,
    commentaire: "Super !",
    dateAvis: new Date().toISOString(),
    utilisateur: { id: 1, prenom: "Jean", photoProfilUrl: null },
    agenceId: 1,
});
 
mock.onGet("/avis/moi").reply(200, AVIS_MOCK);
 
// ─────────────────────────────────────────────────────────────
// TOUTES LES AUTRES REQUÊTES → laissées passer
// ─────────────────────────────────────────────────────────────
mock.onAny().passThrough();
 