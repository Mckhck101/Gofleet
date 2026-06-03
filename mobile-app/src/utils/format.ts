// Formater un prix en FCFA
export function formatPrix(montant: number, devise: string = "FCFA"): string {
    return `${montant.toLocaleString("fr-FR")} ${devise}`;
}

// Formater une date — ex: "10 juin 2026"
export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

// Formater une date courte — ex: "10/06/2026"
export function formatDateCourte(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR");
}

// Formater une date + heure — ex: "10 juin 2026 à 08:00"
export function formatDateHeure(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Formater l'heure seule — ex: "08:00"
export function formatHeure(heure: string): string {
    return heure.substring(0, 5);
}

// Initiales d'un nom — ex: "Jean Mbarga" → "JM"
export function getInitiales(nom: string): string {
    return nom
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
}

// Tronquer un texte long
export function tronquer(texte: string, longueur: number = 50): string {
    if (texte.length <= longueur) return texte;
    return `${texte.substring(0, longueur)}...`;
}

// Formater un numéro de téléphone camerounais
export function formatTelephone(tel: string): string {
    const clean = tel.replace(/\D/g, "");
    if (clean.startsWith("237") && clean.length === 12) {
        return `+237 ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
    }
    return tel;
}

// Label lisible pour le statut de réservation
export function labelStatutReservation(statut: string): string {
    const labels: Record<string, string> = {
        EN_ATTENTE: "En attente",
        CONFIRMEE: "Confirmée",
        ANNULEE: "Annulée",
        TERMINEE: "Terminée",
    };
    return labels[statut] ?? statut;
}

// Label lisible pour la méthode de paiement
export function labelMethodePaiement(methode: string): string {
    const labels: Record<string, string> = {
        ORANGE_MONEY: "Orange Money",
        MTN_MOMO: "MTN MoMo",
        CARTE_BANCAIRE: "Carte bancaire",
        PAYPAL: "PayPal",
    };
    return labels[methode] ?? methode;
}

// Label lisible pour la classe
export function labelTypeClasse(classe: string): string {
    const labels: Record<string, string> = {
        VIP: "VIP",
        CLASSIQUE: "Classique",
        BUSINESS: "Business",
        PREMIERE_CLASSE: "Première Classe",
    };
    return labels[classe] ?? classe;
}