# Gofleet Backend API

Base URL locale: `http://localhost:8080/api/v1`

Pour Expo sur telephone physique, remplacer `localhost` par l'adresse IP de la machine qui lance Spring Boot, par exemple `http://192.168.1.20:8080/api/v1`.

Headers recommandes:

```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <accessToken>
```

Les endpoints publics sont `POST /auth/inscription`, `POST /auth/connexion`, `GET /voyages`, `GET /voyages/{id}`, `GET /voyages/{id}/sieges`, `GET /agences`, `GET /agences/{id}`, `GET /agences/{id}/avis` et `GET /moyens-transport`.

## Auth

| Methode | URL | Body attendu | Exemple reponse JSON |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/inscription` | `{"nom":"Mbarga","prenom":"Jean","email":"jean@test.com","telephone":"+237690000001","motDePasse":"Password123","dateNaissance":"1995-04-15","sexe":"M","numeroCni":"CNI123"}` | `{"accessToken":"jwt","refreshToken":"jwt","tokenType":"Bearer","expiresIn":86400,"utilisateur":{"id":1,"email":"jean@test.com","role":"USER"}}` |
| POST | `/api/v1/auth/connexion` | `{"email":"admin@gofleet.cm","motDePasse":"Admin12345"}` | `{"accessToken":"jwt","refreshToken":"jwt","tokenType":"Bearer","expiresIn":86400,"utilisateur":{"id":1,"email":"admin@gofleet.cm","role":"ADMIN"}}` |
| POST | `/api/v1/auth/refresh-token` | `{"refreshToken":"jwt"}` | `{"accessToken":"newJwt","refreshToken":"newJwt","tokenType":"Bearer","expiresIn":86400,"utilisateur":{"id":1}}` |
| POST | `/api/v1/auth/deconnexion` | Aucun | `{"message":"Deconnexion reussie","timestamp":"2026-05-31T22:00:00"}` |
| POST | `/api/v1/auth/mot-de-passe/reinitialiser` | `{"email":"jean@test.com"}` | `{"message":"Email de reinitialisation simule pour jean@test.com","timestamp":"2026-05-31T22:00:00"}` |
| POST | `/api/v1/auth/mot-de-passe/confirmer` | `{"token":"code","nouveauMotDePasse":"Password123"}` | `{"message":"Mot de passe modifie avec succes","timestamp":"2026-05-31T22:00:00"}` |

## Public Catalogue

| Methode | URL | Body attendu | Exemple reponse JSON |
| --- | --- | --- | --- |
| GET | `/api/v1/voyages?villeDepart=Douala&villeArrivee=Yaounde&dateDepart=2026-06-10&heureDepart=08:00&budgetMax=10000&moyenTransportId=1&agenceId=1&typeClasse=CLASSIQUE&placesDisponibles=true&page=0&taille=10&tri=heureAsc` | Aucun | `{"contenu":[{"id":1,"numeroVoyage":"VY-2026-001","villeDepart":"Douala","villeArrivee":"Yaounde","placesRestantes":44,"prixNormal":5000,"statut":"OUVERT"}],"pageActuelle":0,"totalPages":1,"totalElements":1}` |
| GET | `/api/v1/voyages/{id}` | Aucun | `{"id":1,"numeroVoyage":"VY-2026-001","villeDepart":"Douala","villeArrivee":"Yaounde","vehicule":{"id":1},"agence":{"id":1}}` |
| GET | `/api/v1/voyages/{id}/sieges` | Aucun | `[{"id":1,"numeroSiege":"S1","statut":"DISPONIBLE","voyageId":1}]` |
| GET | `/api/v1/agences?page=0&taille=10&ville=Douala` | Aucun | `{"contenu":[{"id":1,"nom":"Touristique Express","villePrincipale":"Douala","noteMoyenne":4.5,"nombreAvis":12}],"pageActuelle":0,"totalPages":1,"totalElements":1}` |
| GET | `/api/v1/agences/{id}` | Aucun | `{"id":1,"nom":"Touristique Express","telephone":"+237690111111","statut":"VALIDE","noteMoyenne":4.5}` |
| GET | `/api/v1/agences/{id}/avis?page=0&taille=10` | Aucun | `{"contenu":[{"id":1,"note":5,"commentaire":"Tres bon service","agenceId":1}],"pageActuelle":0,"totalPages":1,"totalElements":1}` |
| GET | `/api/v1/moyens-transport` | Aucun | `[{"id":1,"libelle":"Bus","description":"Transport routier interurbain"}]` |

## Reservation Et Paiement

| Methode | URL | Body attendu | Exemple reponse JSON |
| --- | --- | --- | --- |
| GET | `/api/v1/reservations?statut=EN_ATTENTE&page=0&taille=10` | Aucun | `{"contenu":[{"id":1,"montant":5000,"statut":"EN_ATTENTE","voyage":{"numeroVoyage":"VY-2026-001"}}],"pageActuelle":0,"totalPages":1,"totalElements":1}` |
| POST | `/api/v1/reservations` | `{"voyageId":1,"siegeId":1,"nomComplet":"Jean Mbarga","telephone":"+237690000001","email":"jean@test.com","numeroPieceIdentite":"CNI123","contactUrgenceNom":"Marie","contactUrgenceTelephone":"+237690000002","montant":5000,"accepteConditions":true}` | `{"id_reservation":1,"numero_voyage":"VY-2026-001","ville_depart":"Douala","ville_arrivee":"Yaounde","date_depart":"2026-06-10","heure_depart":"08:00:00","numero_siege":"S1","montant":5000,"statut_reservation":"EN_ATTENTE"}` |
| GET | `/api/v1/reservations/{id}` | Aucun | `{"id":1,"nomComplet":"Jean Mbarga","montant":5000,"statut":"EN_ATTENTE","siege":{"numeroSiege":"S1"}}` |
| DELETE | `/api/v1/reservations/{id}` | Aucun | `{"message":"Reservation annulee","timestamp":"2026-05-31T22:00:00"}` |
| POST | `/api/v1/paiements/initier` | `{"reservationId":1,"methode":"ORANGE_MONEY","numeroPaiement":"+237690000001"}` | `{"id":1,"reservationId":1,"montant":5000,"methode":"ORANGE_MONEY","referenceTransaction":"PAY-ABC123","statut":"EN_ATTENTE","instructionsPaiement":"Paiement simule. Confirmez la transaction avec la reference fournie."}` |
| POST | `/api/v1/paiements/confirmer` | `{"referenceTransaction":"PAY-ABC123","statut":"REUSSI","codeConfirmation":"123456"}` | `{"paiement":{"id":1,"statut":"REUSSI"},"reservation":{"id":1,"statut":"CONFIRMEE","ticket":{"codeTicket":"TKT-20260610-S1-ABC123"},"facture":{"numeroFacture":"FAC-20260531-ABC123"}},"message":"Paiement confirme. Votre ticket et votre facture ont ete generes."}` |
| POST | `/api/v1/factures` | `{"reservationId":1,"pdfUrl":"/factures/1.pdf"}` | `{"id":1,"reservationId":1,"numeroFacture":"FAC-20260531-ABC123","montant":5000,"pdfUrl":"/factures/1.pdf"}` |
| GET | `/api/v1/factures/reservation/{reservationId}` | Aucun | `{"id":1,"reservationId":1,"numeroFacture":"FAC-20260531-ABC123","montant":5000}` |
| POST | `/api/v1/tickets` | `{"reservationId":1}` | `{"id":1,"reservationId":1,"codeTicket":"TKT-20260610-S1-ABC123","qrCodeBase64":"UVI6...","statut":"VALIDE"}` |
| GET | `/api/v1/tickets/reservation/{reservationId}` | Aucun | `{"id":1,"reservationId":1,"codeTicket":"TKT-20260610-S1-ABC123","statut":"VALIDE"}` |
| POST | `/api/v1/avis` | `{"agenceId":1,"note":5,"commentaire":"Tres bon service"}` | `{"id":1,"note":5,"commentaire":"Tres bon service","utilisateurId":1,"agenceId":1}` |

## CRUD Admin

Tous les endpoints admin demandent `Authorization: Bearer <token-admin>`.

| Ressource | Liste | Detail | Creation | Modification | Suppression |
| --- | --- | --- | --- | --- | --- |
| Utilisateurs | `GET /api/v1/admin/utilisateurs?page=0&taille=20` | `GET /api/v1/admin/utilisateurs/{id}` | `POST /api/v1/admin/utilisateurs` | `PUT /api/v1/admin/utilisateurs/{id}` | `DELETE /api/v1/admin/utilisateurs/{id}` |
| Agences | `GET /api/v1/admin/agences?page=0&taille=20` | `GET /api/v1/admin/agences/{id}` | `POST /api/v1/admin/agences` | `PUT /api/v1/admin/agences/{id}` | `DELETE /api/v1/admin/agences/{id}` |
| Moyens transport | `GET /api/v1/admin/moyens-transport?page=0&taille=20` | `GET /api/v1/admin/moyens-transport/{id}` | `POST /api/v1/admin/moyens-transport` | `PUT /api/v1/admin/moyens-transport/{id}` | `DELETE /api/v1/admin/moyens-transport/{id}` |
| Vehicules | `GET /api/v1/admin/vehicules?page=0&taille=20` | `GET /api/v1/admin/vehicules/{id}` | `POST /api/v1/admin/vehicules` | `PUT /api/v1/admin/vehicules/{id}` | `DELETE /api/v1/admin/vehicules/{id}` |
| Voyages | `GET /api/v1/admin/voyages?page=0&taille=20` | `GET /api/v1/admin/voyages/{id}` | `POST /api/v1/admin/voyages` | `PUT /api/v1/admin/voyages/{id}` | `DELETE /api/v1/admin/voyages/{id}` |
| Sieges | `GET /api/v1/admin/sieges?page=0&taille=20` | `GET /api/v1/admin/sieges/{id}` | `POST /api/v1/admin/sieges` | `PUT /api/v1/admin/sieges/{id}` | `DELETE /api/v1/admin/sieges/{id}` |
| Reservations | `GET /api/v1/admin/reservations?page=0&taille=20` | `GET /api/v1/admin/reservations/{id}` | `POST /api/v1/admin/reservations` | `PUT /api/v1/admin/reservations/{id}` | `DELETE /api/v1/admin/reservations/{id}` |
| Paiements | `GET /api/v1/admin/paiements?page=0&taille=20` | `GET /api/v1/admin/paiements/{id}` | `POST /api/v1/admin/paiements` | `PUT /api/v1/admin/paiements/{id}` | `DELETE /api/v1/admin/paiements/{id}` |
| Factures | `GET /api/v1/admin/factures?page=0&taille=20` | `GET /api/v1/admin/factures/{id}` | `POST /api/v1/admin/factures` | `PUT /api/v1/admin/factures/{id}` | `DELETE /api/v1/admin/factures/{id}` |
| Tickets | `GET /api/v1/admin/tickets?page=0&taille=20` | `GET /api/v1/admin/tickets/{id}` | `POST /api/v1/admin/tickets` | `PUT /api/v1/admin/tickets/{id}` | `DELETE /api/v1/admin/tickets/{id}` |
| Avis | `GET /api/v1/admin/avis?page=0&taille=20` | `GET /api/v1/admin/avis/{id}` | `POST /api/v1/admin/avis` | `PUT /api/v1/admin/avis/{id}` | `DELETE /api/v1/admin/avis/{id}` |

Exemple reponse liste admin:

```json
{
  "contenu": [
    { "id": 1, "nom": "Touristique Express" }
  ],
  "pageActuelle": 0,
  "totalPages": 1,
  "totalElements": 1
}
```

Exemple reponse creation/modification admin:

```json
{
  "message": "Agence cree avec succes",
  "data": {
    "id": 1,
    "nom": "Touristique Express",
    "villePrincipale": "Douala"
  },
  "timestamp": "2026-05-31T22:00:00"
}
```

Exemple reponse suppression admin:

```json
{
  "message": "Agence supprime avec succes",
  "data": null,
  "timestamp": "2026-05-31T22:00:00"
}
```

## Bodies Admin

```json
// UtilisateurRequest
{"nom":"Admin","prenom":"Test","email":"admin2@gofleet.cm","telephone":"+237690000010","motDePasse":"Password123","dateNaissance":"1990-01-01","sexe":"M","photoProfilUrl":null,"numeroCni":"ADM123","role":"ADMIN"}
```

```json
// AgenceRequest
{"nom":"Touristique Express","logoUrl":null,"villePrincipale":"Douala","description":"Agence de transport","telephone":"+237690111111","email":"contact@test.cm","adresse":"Bonaberi","siteWeb":null,"statut":"VALIDE"}
```

```json
// MoyenTransportRequest
{"libelle":"Bus","description":"Transport routier"}
```

```json
// VehiculeRequest
{"numeroVehicule":"BUS-001","marque":"Mercedes-Benz","immatriculation":"LT-1234-A","capacite":45,"typeClasse":"CLASSIQUE","agenceId":1,"moyenTransportId":1}
```

```json
// VoyageRequest
{"numeroVoyage":"VY-2026-001","agenceId":1,"vehiculeId":1,"villeDepart":"Douala","gareDepart":"Bonaberi","villeArrivee":"Yaounde","gareArrivee":"Mvan","dateDepart":"2026-06-10","heureDepart":"08:00:00","heureArriveeEstimee":"12:00:00","dureeEstimee":"4h00","typeClasse":"CLASSIQUE","placesTotales":45,"placesRestantes":45,"prixNormal":5000,"prixPromo":4500,"devise":"FCFA","statut":"OUVERT","bagage":"23kg max","description":"Voyage test"}
```

```json
// SiegeRequest
{"numeroSiege":"S1","statut":"DISPONIBLE","voyageId":1}
```

```json
// ReservationAdminRequest
{"utilisateurId":1,"voyageId":1,"siegeId":1,"nomComplet":"Jean Mbarga","telephone":"+237690000001","email":"jean@test.com","numeroPieceIdentite":"CNI123","contactUrgenceNom":"Marie","contactUrgenceTelephone":"+237690000002","montant":5000,"statut":"EN_ATTENTE"}
```

```json
// PaiementRequest
{"reservationId":1,"methode":"ORANGE_MONEY","numeroPaiement":"+237690000001","statut":"EN_ATTENTE","referenceTransaction":"PAY-ABC123"}
```

```json
// FactureAdminRequest
{"reservationId":1,"numeroFacture":"FAC-20260531-ABC123","montant":5000,"pdfUrl":"/factures/1.pdf"}
```

```json
// TicketAdminRequest
{"reservationId":1,"codeTicket":"TKT-20260610-S1-ABC123","qrCodeBase64":"UVI6...","qrCodeUrl":"/tickets/qr/TKT-20260610-S1-ABC123","dateExpiration":"2026-06-10T23:59:00","statut":"VALIDE"}
```

```json
// AvisRequest
{"utilisateurId":1,"agenceId":1,"note":5,"commentaire":"Tres bon service"}
```

## Erreurs JSON

```json
{
  "timestamp": "2026-05-31T22:00:00",
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Validation invalide",
  "path": "/api/v1/reservations",
  "details": ["email: must be a well-formed email address"]
}
```

