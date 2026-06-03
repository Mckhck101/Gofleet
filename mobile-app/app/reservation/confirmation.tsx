import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    Share,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
    CheckCircle,
    DownloadSimple,
    ShareNetwork,
    House,
    QrCode,
    Ticket,
    Bus,
    MapPin,
    Clock,
    CalendarBlank,
    Seat,
    Receipt,
    ArrowLeft,
    Sparkle,
    Copy,
} from "phosphor-react-native";
import colors from "@/constants/colors";

const { width: W } = Dimensions.get("window");

// ─── Types (depuis les schemas OpenAPI) ──────────────────────
type StatutTicket = "VALIDE" | "UTILISE" | "ANNULE";

interface TicketResponse {
    id: number;
    codeTicket: string;
    qrCodeBase64: string | null;
    qrCodeUrl: string | null;
    dateGeneration: string;
    dateExpiration: string;
    statut: StatutTicket;
    reservationId: number;
}

interface FactureResponse {
    id: number;
    numeroFacture: string;
    dateGeneration: string;
    montant: number;
    pdfUrl: string;
}

interface ConfirmationData {
    reservationId: number;
    agenceNom: string;
    agenceCouleur: string;
    villeDepart: string;
    gareDepart: string;
    villeArrivee: string;
    gareArrivee: string;
    dateDepart: string;
    heureDepart: string;
    numeroSiege: string;
    typeClasse: string;
    montant: number;
    devise: string;
    nomVoyageur: string;
    ticket: TicketResponse;
    facture: FactureResponse;
}

// ─── Mock Data (à remplacer par les données réelles du store) ─
// Correspond à la réponse de POST /paiements/confirmer
// qui retourne { paiement, reservation } avec reservation.ticket + reservation.facture
const MOCK_CONFIRMATION: ConfirmationData = {
    reservationId: 1042,
    agenceNom: "Touristique Express",
    agenceCouleur: "#1877F2",
    villeDepart: "Douala",
    gareDepart: "Gare Bonabéri",
    villeArrivee: "Yaoundé",
    gareArrivee: "Gare Centrale",
    dateDepart: "2026-06-10",
    heureDepart: "08:00",
    numeroSiege: "A3",
    typeClasse: "VIP",
    montant: 4500,
    devise: "FCFA",
    nomVoyageur: "Jean Mbarga",
    ticket: {
        id: 201,
        codeTicket: "TKT-20260610-A3-01042",
        qrCodeBase64: null, // sera un vrai base64 depuis l'API
        qrCodeUrl: null,    // ou une URL vers le QR code
        dateGeneration: "2026-06-05T14:32:00Z",
        dateExpiration: "2026-06-10T23:59:00Z",
        statut: "VALIDE",
        reservationId: 1042,
    },
    facture: {
        id: 301,
        numeroFacture: "FAC-2026-0042",
        dateGeneration: "2026-06-05T14:32:00Z",
        montant: 4500,
        pdfUrl: "https://api.reservationvoyage.cm/api/v1/factures/301/telecharger",
    },
};

// ─── Helpers ─────────────────────────────────────────────────
const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    const months = [
        "Janvier","Février","Mars","Avril","Mai","Juin",
        "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
    ];
    return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
};

const formatPrix = (p: number, devise: string) =>
    `${p.toLocaleString("fr-FR")} ${devise}`;

const formatDateTime = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// ─── Composant : Ligne de résumé ─────────────────────────────
const SummaryRow = ({
    icon,
    label,
    value,
    valueColor,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    valueColor?: string;
}) => (
    <View style={rowStyles.container}>
        <View style={rowStyles.iconBox}>{icon}</View>
        <Text style={rowStyles.label}>{label}</Text>
        <Text style={[rowStyles.value, valueColor ? { color: valueColor } : {}]}>
            {value}
        </Text>
    </View>
);

const rowStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100 ?? "#F3F4F6",
        gap: 10,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 9,
        backgroundColor: colors.primaryLight ?? "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
    },
    label: { flex: 1, fontSize: 13, color: colors.gray500, fontWeight: "500" },
    value: { fontSize: 13, fontWeight: "700", color: colors.gray800, maxWidth: "45%", textAlign: "right" },
});

// ─── Composant : QR Code Placeholder ─────────────────────────
// Quand qrCodeBase64 sera disponible depuis l'API, utiliser <Image source={{ uri: `data:image/png;base64,${qrCodeBase64}` }} />
// ou qrCodeUrl avec <Image source={{ uri: qrCodeUrl }} />
const QRCodeDisplay = ({ code, color }: { code: string; color: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        // TODO: Clipboard.setStringAsync(code)
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <View style={qrStyles.container}>
            {/* Zone QR — remplacer par <Image> quand l'API renvoie qrCodeBase64 ou qrCodeUrl */}
            <View style={[qrStyles.qrBox, { borderColor: color + "30" }]}>
                <QrCode size={90} color={color} weight="thin" />
                <Text style={qrStyles.qrHint}>
                    {/* TODO: <Image source={{ uri: qrCodeUrl }} style={{ width: 160, height: 160 }} /> */}
                    QR Code généré par l'API
                </Text>
            </View>

            {/* Code ticket */}
            <View style={qrStyles.codeRow}>
                <Text style={[qrStyles.code, { color }]}>{code}</Text>
                <TouchableOpacity
                    style={[qrStyles.copyBtn, { backgroundColor: color + "15" }]}
                    onPress={handleCopy}
                >
                    {copied
                        ? <CheckCircle size={16} color={color} weight="fill" />
                        : <Copy size={16} color={color} />
                    }
                </TouchableOpacity>
            </View>

            {/* Badge statut */}
            <View style={qrStyles.statutBadge}>
                <View style={qrStyles.statutDot} />
                <Text style={qrStyles.statutText}>Ticket valide</Text>
            </View>
        </View>
    );
};

const qrStyles = StyleSheet.create({
    container: { alignItems: "center", gap: 14 },
    qrBox: {
        width: W * 0.55,
        height: W * 0.55,
        borderRadius: 20,
        borderWidth: 2,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    qrHint: { fontSize: 11, color: colors.gray400, textAlign: "center", paddingHorizontal: 12 },
    codeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: colors.gray50 ?? "#F9FAFB",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    code: { fontSize: 13, fontWeight: "800", letterSpacing: 1 },
    copyBtn: {
        width: 32, height: 32, borderRadius: 8,
        justifyContent: "center", alignItems: "center",
    },
    statutBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#DCFCE7",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statutDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#16A34A" },
    statutText: { fontSize: 13, fontWeight: "700", color: "#16A34A" },
});

// ─── Écran Principal ─────────────────────────────────────────
export default function ConfirmationScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    // TODO: récupérer depuis reservationStore ou route params
    // les données viennent de la réponse de POST /paiements/confirmer
    const data = MOCK_CONFIRMATION;
    const c = data.agenceCouleur;

    // ── Animations d'entrée ────────────────────────────────────
    const checkScale = useRef(new Animated.Value(0)).current;
    const checkOp    = useRef(new Animated.Value(0)).current;
    const cardY      = useRef(new Animated.Value(40)).current;
    const cardOp     = useRef(new Animated.Value(0)).current;
    const btnsY      = useRef(new Animated.Value(30)).current;
    const btnsOp     = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            // 1. Icône check apparaît
            Animated.parallel([
                Animated.spring(checkScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
                Animated.timing(checkOp, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            // 2. Carte résumé monte
            Animated.parallel([
                Animated.spring(cardY, { toValue: 0, tension: 55, friction: 8, useNativeDriver: true }),
                Animated.timing(cardOp, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            // 3. Boutons apparaissent
            Animated.parallel([
                Animated.spring(btnsY, { toValue: 0, tension: 55, friction: 8, useNativeDriver: true }),
                Animated.timing(btnsOp, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    // ── Actions ────────────────────────────────────────────────
    const handleTelechargerBillet = () => {
        // TODO: appel API → GET /tickets/${data.ticket.id}/telecharger
        // Retourne un PDF binaire
        Alert.alert(t("ticket.telecharger"), t("confirmation.telechargement_info"));
    };

    const handleTelechargerFacture = () => {
        // TODO: appel API → GET /factures/${data.facture.id}/telecharger
        Alert.alert(t("facture.telecharger"), t("confirmation.telechargement_info"));
    };

    const handlePartager = async () => {
        try {
            await Share.share({
                message: `${t("confirmation.partager_message")}\n${data.agenceNom} : ${data.villeDepart} → ${data.villeArrivee}\n${formatDate(data.dateDepart)} à ${data.heureDepart}\nSiège : ${data.numeroSiege}\nCode : ${data.ticket.codeTicket}`,
            });
        } catch {
            // silencieux
        }
    };

    const handleRetourAccueil = () => {
        router.replace("/(tabs)" as any);
    };

    const handleVoirReservations = () => {
        router.replace("/(tabs)/reservations" as any);
    };

    return (
        <SafeAreaView style={s.container} edges={["top", "bottom"]}>
            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Zone succès ── */}
                <View style={s.successZone}>
                    {/* Cercles décoratifs */}
                    <View style={[s.circle1, { backgroundColor: c + "12" }]} />
                    <View style={[s.circle2, { backgroundColor: c + "08" }]} />

                    {/* Icône check animée */}
                    <Animated.View
                        style={[
                            s.checkWrapper,
                            { backgroundColor: c + "18", transform: [{ scale: checkScale }], opacity: checkOp },
                        ]}
                    >
                        <CheckCircle size={64} color={c} weight="fill" />
                    </Animated.View>

                    <Animated.View style={{ opacity: checkOp, alignItems: "center", gap: 6 }}>
                        <Text style={s.successTitle}>{t("confirmation.paiement_confirme")}</Text>
                        <Text style={s.successSubtitle}>{t("confirmation.ticket_genere")}</Text>
                    </Animated.View>

                    {/* Sparkle décoratif */}
                    <View style={s.sparkleRow}>
                        <Sparkle size={14} color={c} weight="fill" />
                        <Text style={[s.sparkleText, { color: c }]}>
                            {t("ticket.bon_voyage")}
                        </Text>
                        <Sparkle size={14} color={c} weight="fill" />
                    </View>
                </View>

                {/* ── QR Code ── */}
                <Animated.View
                    style={[
                        s.card,
                        { transform: [{ translateY: cardY }], opacity: cardOp },
                    ]}
                >
                    <View style={s.cardHeader}>
                        <Ticket size={20} color={c} weight="fill" />
                        <Text style={s.cardTitle}>{t("ticket.mon_ticket")}</Text>
                    </View>

                    <QRCodeDisplay code={data.ticket.codeTicket} color={c} />

                    <View style={s.ticketMeta}>
                        <Text style={s.ticketMetaText}>
                            {t("ticket.date_expiration")} : {formatDateTime(data.ticket.dateExpiration)}
                        </Text>
                    </View>

                    {/* Séparateur dentelé */}
                    <View style={s.separator}>
                        <View style={[s.sepCircleLeft, { backgroundColor: colors.background ?? "#F3F4F6" }]} />
                        <View style={s.sepLine} />
                        <View style={[s.sepCircleRight, { backgroundColor: colors.background ?? "#F3F4F6" }]} />
                    </View>

                    {/* ── Résumé du voyage ── */}
                    <View style={s.cardHeader}>
                        <Bus size={20} color={c} weight="fill" />
                        <Text style={s.cardTitle}>{t("confirmation.resume_voyage")}</Text>
                    </View>

                    <SummaryRow
                        icon={<Bus size={15} color={c} weight="fill" />}
                        label={t("voyage.agence")}
                        value={data.agenceNom}
                        valueColor={c}
                    />
                    <SummaryRow
                        icon={<MapPin size={15} color={c} weight="fill" />}
                        label={t("voyage.depart")}
                        value={`${data.villeDepart} · ${data.gareDepart}`}
                    />
                    <SummaryRow
                        icon={<MapPin size={15} color="#EF4444" weight="fill" />}
                        label={t("voyage.arrivee")}
                        value={`${data.villeArrivee} · ${data.gareArrivee}`}
                    />
                    <SummaryRow
                        icon={<CalendarBlank size={15} color={c} weight="fill" />}
                        label={t("voyage.date_depart")}
                        value={formatDate(data.dateDepart)}
                    />
                    <SummaryRow
                        icon={<Clock size={15} color={c} weight="fill" />}
                        label={t("reservation.heure_depart")}
                        value={data.heureDepart}
                    />
                    <SummaryRow
                        icon={<Seat size={15} color={c} weight="fill" />}
                        label={t("reservation.siege")}
                        value={`${t("siege.siege_numero", { numero: data.numeroSiege })} · ${data.typeClasse}`}
                    />
                    <SummaryRow
                        icon={<Receipt size={15} color={c} weight="fill" />}
                        label={t("paiement.montant_a_payer")}
                        value={formatPrix(data.montant, data.devise)}
                        valueColor={c}
                    />

                    {/* Numéro facture */}
                    <View style={s.factureRow}>
                        <Receipt size={14} color={colors.gray400} />
                        <Text style={s.factureText}>
                            {t("facture.numero")} : {data.facture.numeroFacture}
                        </Text>
                    </View>

                    {/* Notification email */}
                    <View style={[s.emailNotif, { backgroundColor: c + "10", borderColor: c + "30" }]}>
                        <CheckCircle size={16} color={c} weight="fill" />
                        <Text style={[s.emailNotifText, { color: c }]}>
                            {t("confirmation.email_envoye")}
                        </Text>
                    </View>
                </Animated.View>

                {/* ── Boutons d'action ── */}
                <Animated.View
                    style={[
                        s.actionsCard,
                        { transform: [{ translateY: btnsY }], opacity: btnsOp },
                    ]}
                >
                    {/* Télécharger billet */}
                    <TouchableOpacity
                        style={[s.actionBtn, { backgroundColor: c }]}
                        onPress={handleTelechargerBillet}
                        activeOpacity={0.85}
                    >
                        <DownloadSimple size={20} color="#fff" weight="bold" />
                        <Text style={s.actionBtnText}>{t("ticket.telecharger")}</Text>
                    </TouchableOpacity>

                    {/* Télécharger facture */}
                    <TouchableOpacity
                        style={[s.actionBtnOutline, { borderColor: c }]}
                        onPress={handleTelechargerFacture}
                        activeOpacity={0.85}
                    >
                        <Receipt size={20} color={c} weight="bold" />
                        <Text style={[s.actionBtnOutlineText, { color: c }]}>
                            {t("facture.telecharger")}
                        </Text>
                    </TouchableOpacity>

                    {/* Partager */}
                    <TouchableOpacity
                        style={s.actionBtnGhost}
                        onPress={handlePartager}
                        activeOpacity={0.85}
                    >
                        <ShareNetwork size={20} color={colors.gray500} weight="bold" />
                        <Text style={s.actionBtnGhostText}>{t("confirmation.partager")}</Text>
                    </TouchableOpacity>

                    {/* Séparateur */}
                    <View style={s.divider} />

                    {/* Voir mes réservations */}
                    <TouchableOpacity
                        style={s.reservationsBtn}
                        onPress={handleVoirReservations}
                        activeOpacity={0.85}
                    >
                        <Ticket size={18} color={c} weight="fill" />
                        <Text style={[s.reservationsBtnText, { color: c }]}>
                            {t("reservation.mes_reservations")}
                        </Text>
                    </TouchableOpacity>

                    {/* Retour accueil */}
                    <TouchableOpacity
                        style={s.homeBtn}
                        onPress={handleRetourAccueil}
                        activeOpacity={0.85}
                    >
                        <House size={18} color={colors.gray500} weight="fill" />
                        <Text style={s.homeBtnText}>{t("confirmation.retour_accueil")}</Text>
                    </TouchableOpacity>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background ?? "#F3F4F6" },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 20 },

    // Zone succès
    successZone: {
        alignItems: "center",
        paddingTop: 36,
        paddingBottom: 24,
        paddingHorizontal: 20,
        gap: 14,
        position: "relative",
        overflow: "hidden",
    },
    circle1: {
        position: "absolute",
        width: 220,
        height: 220,
        borderRadius: 110,
        top: -60,
        right: -60,
    },
    circle2: {
        position: "absolute",
        width: 160,
        height: 160,
        borderRadius: 80,
        bottom: -30,
        left: -40,
    },
    checkWrapper: {
        width: 110,
        height: 110,
        borderRadius: 55,
        justifyContent: "center",
        alignItems: "center",
    },
    successTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: colors.gray800,
        textAlign: "center",
    },
    successSubtitle: {
        fontSize: 14,
        color: colors.gray400,
        textAlign: "center",
    },
    sparkleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sparkleText: { fontSize: 14, fontWeight: "700" },

    // Card principale
    card: {
        backgroundColor: colors.white,
        marginHorizontal: 16,
        borderRadius: 22,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 18,
    },
    cardTitle: { fontSize: 16, fontWeight: "800", color: colors.gray800 },

    // Ticket meta
    ticketMeta: {
        marginTop: 14,
        alignItems: "center",
    },
    ticketMetaText: { fontSize: 12, color: colors.gray400 },

    // Séparateur billet dentelé
    separator: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 22,
        marginHorizontal: -20,
    },
    sepCircleLeft: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginLeft: -12,
    },
    sepLine: {
        flex: 1,
        height: 1.5,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: colors.gray200 ?? "#E5E7EB",
    },
    sepCircleRight: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: -12,
    },

    // Facture row
    factureRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 8,
        paddingTop: 10,
    },
    factureText: { fontSize: 12, color: colors.gray400 },

    // Email notif
    emailNotif: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 14,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    emailNotifText: { fontSize: 13, fontWeight: "600", flex: 1 },

    // Actions card
    actionsCard: {
        backgroundColor: colors.white,
        marginHorizontal: 16,
        borderRadius: 22,
        padding: 20,
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 15,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    actionBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },
    actionBtnOutline: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 2,
        backgroundColor: colors.white,
    },
    actionBtnOutlineText: { fontSize: 15, fontWeight: "700" },
    actionBtnGhost: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 13,
        borderRadius: 14,
        backgroundColor: colors.gray50 ?? "#F9FAFB",
    },
    actionBtnGhostText: { fontSize: 14, fontWeight: "600", color: colors.gray500 },

    divider: {
        height: 1,
        backgroundColor: colors.gray100 ?? "#F3F4F6",
        marginVertical: 4,
    },

    reservationsBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 13,
        borderRadius: 14,
        backgroundColor: colors.primaryLight ?? "#EFF6FF",
    },
    reservationsBtnText: { fontSize: 14, fontWeight: "700" },

    homeBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 13,
        borderRadius: 14,
    },
    homeBtnText: { fontSize: 14, fontWeight: "600", color: colors.gray500 },
});
