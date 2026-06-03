import React, { useState, useRef} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    User,
    PencilSimple,
    Check,
    X,
    Phone,
    EnvelopeSimple,
    IdentificationCard,
    CalendarBlank,
    GenderIntersex,
    SignOut,
    Camera,
    ShieldCheck,
    WarningCircle,
    HourglassSimple,
    AddressBook,
    ArrowCounterClockwise,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import colors from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { useSearchStore } from "@/store/searchStore";
import BurgerMenu from "@/components/ui/BurgerMenu";
import ChatPanel from "@/components/ui/ChatPanel";
import FloatingChatButton from "@/components/ui/FloatingChatButton";
import VoiceReservation from "@/components/ui/VoiceReservation";
import { List } from "phosphor-react-native";


// ─── Types (depuis les schemas OpenAPI) ─────────────────────
type StatutVerification = "NON_VERIFIE" | "EN_COURS" | "VERIFIE";
type Sexe = "M" | "F";

interface UtilisateurResponse {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    dateNaissance: string;
    sexe: Sexe;
    photoProfilUrl?: string | null;
    numeroCni?: string | null;
    statutVerification: StatutVerification;
    dateCreation: string;
}

// ─── Mock user (sera remplacé par les données du store/API) ──
const mockUser: UtilisateurResponse = {
    id: 1,
    nom: "Mbarga",
    prenom: "Jean",
    email: "jean.mbarga@gmail.com",
    telephone: "+237690000000",
    dateNaissance: "1995-04-15",
    sexe: "M",
    photoProfilUrl: null,
    numeroCni: "123456789",
    statutVerification: "VERIFIE",
    dateCreation: "2024-01-10T10:00:00Z",
};

// ─── Helpers ─────────────────────────────────────────────────
const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
};

const formatDateForAPI = (day: string, month: string, year: string): string => {
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const getInitials = (prenom: string, nom: string): string => {
    return `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
};

// ─── Composant Badge Vérification ────────────────────────────
const VerificationBadge = ({ statut }: { statut: StatutVerification }) => {
    const { t } = useTranslation();
    const config = {
        VERIFIE: {
            label: t("profil.verifie"),
            color: "#16A34A",
            bg: "#DCFCE7",
            icon: ShieldCheck,
        },
        EN_COURS: {
            label: t("profil.en_cours"),
            color: "#D97706",
            bg: "#FEF3C7",
            icon: HourglassSimple,
        },
        NON_VERIFIE: {
            label: t("profil.non_verifie"),
            color: "#DC2626",
            bg: "#FEE2E2",
            icon: WarningCircle,
        },
    };
    const { label, color, bg, icon: Icon } = config[statut];
    return (
        <View style={[badgeStyles.container, { backgroundColor: bg }]}>
            <Icon size={13} color={color} weight="fill" />
            <Text style={[badgeStyles.text, { color }]}>{label}</Text>
        </View>
    );
};

const badgeStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    text: { fontSize: 12, fontWeight: "600" },
});

// ─── Composant champ lecture seule ───────────────────────────
interface ReadOnlyFieldProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    editable?: boolean;
    onEdit?: () => void;
}

const ReadOnlyField = ({ label, value, icon, editable = false, onEdit }: ReadOnlyFieldProps) => (
    <View style={fieldStyles.row}>
        <View style={fieldStyles.iconBox}>{icon}</View>
        <View style={fieldStyles.textBox}>
            <Text style={fieldStyles.label}>{label}</Text>
            <Text style={fieldStyles.value} numberOfLines={1}>{value || "—"}</Text>
        </View>
        {editable && (
            <TouchableOpacity
                onPress={onEdit}
                style={fieldStyles.editBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <PencilSimple size={16} color={colors.primary} weight="bold" />
            </TouchableOpacity>
        )}
    </View>
);

const fieldStyles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
        borderRadius: 14,
        gap: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.primaryLight ?? "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
    },
    textBox: { flex: 1 },
    label: { fontSize: 11, color: colors.gray400, fontWeight: "500", marginBottom: 2 },
    value: { fontSize: 14, color: colors.gray800, fontWeight: "600" },
    editBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.primaryLight ?? "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
    },
});

// ─── Modal Edition texte ─────────────────────────────────────
interface EditModalProps {
    visible: boolean;
    title: string;
    fields: { key: string; label: string; value: string; keyboardType?: any; multiline?: boolean }[];
    onSave: (values: Record<string, string>) => void;
    onClose: () => void;
}

const EditModal = ({ visible, title, fields, onSave, onClose }: EditModalProps) => {
    const { t } = useTranslation();
    const [values, setValues] = useState<Record<string, string>>(() =>
        fields.reduce((acc, f) => ({ ...acc, [f.key]: f.value }), {})
    );
    const inputRefs = useRef<Record<string, TextInput | null>>({});

    React.useEffect(() => {
        if (visible) {
            setValues(fields.reduce((acc, f) => ({ ...acc, [f.key]: f.value }), {}));
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={modalStyles.overlay} onPress={onClose}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={modalStyles.kvContainer}
                >
                    <Pressable style={modalStyles.sheet} onPress={() => {}}>
                        <View style={modalStyles.handle} />
                        <View style={modalStyles.header}>
                            <Text style={modalStyles.title}>{title}</Text>
                            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <X size={22} color={colors.gray400} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            style={{ maxHeight: 340 }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {fields.map((f, idx) => (
                                <View key={f.key} style={modalStyles.fieldWrap}>
                                    <Text style={modalStyles.fieldLabel}>{f.label}</Text>
                                    <TextInput
                                        ref={(r) => (inputRefs.current[f.key] = r)}
                                        style={[
                                            modalStyles.input,
                                            f.multiline && { height: 80, textAlignVertical: "top" },
                                        ]}
                                        value={values[f.key]}
                                        onChangeText={(v) =>
                                            setValues((prev) => ({ ...prev, [f.key]: v }))
                                        }
                                        keyboardType={f.keyboardType ?? "default"}
                                        multiline={f.multiline}
                                        returnKeyType={idx < fields.length - 1 ? "next" : "done"}
                                        onSubmitEditing={() => {
                                            const nextKey = fields[idx + 1]?.key;
                                            if (nextKey) inputRefs.current[nextKey]?.focus();
                                        }}
                                        blurOnSubmit={false}
                                        autoCorrect={false}
                                        autoCapitalize={
                                            f.keyboardType === "email-address" ? "none" : "words"
                                        }
                                    />
                                </View>
                            ))}
                        </ScrollView>
                        <View style={modalStyles.actions}>
                            <TouchableOpacity style={modalStyles.btnCancel} onPress={onClose}>
                                <Text style={modalStyles.btnCancelText}>{t("common.annuler")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={modalStyles.btnSave}
                                onPress={() => { onSave(values); onClose(); }}
                            >
                                <Check size={16} color="#fff" weight="bold" />
                                <Text style={modalStyles.btnSaveText}>{t("common.enregistrer")}</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    kvContainer: { justifyContent: "flex-end" },
    sheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.gray200 ?? "#E5E7EB",
        alignSelf: "center",
        marginBottom: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: { fontSize: 17, fontWeight: "700", color: colors.gray800 },
    fieldWrap: { marginBottom: 14 },
    fieldLabel: { fontSize: 12, color: colors.gray400, fontWeight: "500", marginBottom: 6 },
    input: {
        backgroundColor: colors.background ?? "#F9FAFB",
        borderWidth: 1.5,
        borderColor: colors.gray200 ?? "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.gray800,
        fontWeight: "500",
    },
    actions: { flexDirection: "row", gap: 10, marginTop: 20 },
    btnCancel: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200 ?? "#E5E7EB",
        alignItems: "center",
    },
    btnCancelText: { fontSize: 14, fontWeight: "600", color: colors.gray400 },
    btnSave: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    btnSaveText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});

// ─── Modal DatePicker ────────────────────────────────────────
interface DatePickerModalProps {
    visible: boolean;
    currentDate: string;
    onSave: (date: string) => void;
    onClose: () => void;
}


const DatePickerModal = ({ visible, currentDate, onSave, onClose }: DatePickerModalProps) => {
    const { t } = useTranslation();
    const parts = currentDate?.split("-") ?? ["1995", "01", "01"];
    const [year, setYear] = useState(parts[0]);
    const [month, setMonth] = useState(parseInt(parts[1], 10));
    const [day, setDay] = useState(parts[2]);

    React.useEffect(() => {
        if (visible) {
            const p = currentDate?.split("-") ?? ["1995", "01", "01"];
            setYear(p[0]);
            setMonth(parseInt(p[1], 10));
            setDay(p[2]);
        }
    }, [visible]);

    const daysInMonth = new Date(parseInt(year), month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) =>
        String(i + 1).padStart(2, "0")
    );
    const monthNames = t("profil.mois", { returnObjects: true }) as string[];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 80 }, (_, i) => String(currentYear - 18 - i));

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={modalStyles.overlay} onPress={onClose}>
                <Pressable style={[modalStyles.sheet, { paddingBottom: 40 }]} onPress={() => {}}>
                    <View style={modalStyles.handle} />
                    <View style={modalStyles.header}>
                        <Text style={modalStyles.title}>{t("auth.date_naissance")}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={22} color={colors.gray400} />
                        </TouchableOpacity>
                    </View>
                    <View style={dpStyles.row}>
                        {/* Jour */}
                        <View style={dpStyles.col}>
                            <Text style={dpStyles.colLabel}>{t("profil.jour")}</Text>
                            <ScrollView style={dpStyles.scroll} showsVerticalScrollIndicator={false}>
                                {days.map((d) => (
                                    <TouchableOpacity
                                        key={d}
                                        style={[dpStyles.item, d === day && dpStyles.itemActive]}
                                        onPress={() => setDay(d)}
                                    >
                                        <Text style={[dpStyles.itemText, d === day && dpStyles.itemTextActive]}>
                                            {d}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        {/* Mois */}
                        <View style={dpStyles.col}>
                            <Text style={dpStyles.colLabel}>{t("profil.mois_label")}</Text>
                            <ScrollView style={dpStyles.scroll} showsVerticalScrollIndicator={false}>
                                {monthNames.map((m, i) => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[dpStyles.item, i + 1 === month && dpStyles.itemActive]}
                                        onPress={() => setMonth(i + 1)}
                                    >
                                        <Text style={[dpStyles.itemText, i + 1 === month && dpStyles.itemTextActive]}>
                                            {m}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        {/* Année */}
                        <View style={dpStyles.col}>
                            <Text style={dpStyles.colLabel}>{t("profil.annee")}</Text>
                            <ScrollView style={dpStyles.scroll} showsVerticalScrollIndicator={false}>
                                {years.map((y) => (
                                    <TouchableOpacity
                                        key={y}
                                        style={[dpStyles.item, y === year && dpStyles.itemActive]}
                                        onPress={() => setYear(y)}
                                    >
                                        <Text style={[dpStyles.itemText, y === year && dpStyles.itemTextActive]}>
                                            {y}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={modalStyles.btnSave}
                        onPress={() => {
                            onSave(formatDateForAPI(day, String(month), year));
                            onClose();
                        }}
                    >
                        <Check size={16} color="#fff" weight="bold" />
                        <Text style={modalStyles.btnSaveText}>{t("common.confirmer")}</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const dpStyles = StyleSheet.create({
    row: { flexDirection: "row", gap: 8, marginBottom: 20 },
    col: { flex: 1, alignItems: "center" },
    colLabel: { fontSize: 12, color: colors.gray400, fontWeight: "600", marginBottom: 8 },
    scroll: { height: 180, width: "100%" },
    item: {
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 2,
    },
    itemActive: { backgroundColor: colors.primary },
    itemText: { fontSize: 14, color: colors.gray800, fontWeight: "500" },
    itemTextActive: { color: "#fff", fontWeight: "700" },
});

// ─── Modal Sexe ──────────────────────────────────────────────
interface SexeModalProps {
    visible: boolean;
    current: Sexe;
    onSave: (sexe: Sexe) => void;
    onClose: () => void;
}

const SexeModal = ({ visible, current, onSave, onClose }: SexeModalProps) => {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<Sexe>(current);

    React.useEffect(() => {
        if (visible) setSelected(current);
    }, [visible]);

    const options: { val: Sexe; label: string }[] = [
        { val: "M", label: t("auth.masculin") },
        { val: "F", label: t("auth.feminin") },
    ];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={modalStyles.overlay} onPress={onClose}>
                <Pressable style={[modalStyles.sheet, { paddingBottom: 40 }]} onPress={() => {}}>
                    <View style={modalStyles.handle} />
                    <View style={modalStyles.header}>
                        <Text style={modalStyles.title}>{t("auth.sexe")}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={22} color={colors.gray400} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ gap: 10, marginBottom: 20 }}>
                        {options.map(({ val, label }) => (
                            <TouchableOpacity
                                key={val}
                                style={[sexeStyles.option, selected === val && sexeStyles.optionActive]}
                                onPress={() => setSelected(val)}
                            >
                                <Text style={[sexeStyles.optionText, selected === val && sexeStyles.optionTextActive]}>
                                    {label}
                                </Text>
                                {selected === val && (
                                    <Check size={18} color={colors.primary} weight="bold" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={modalStyles.btnSave}
                        onPress={() => { onSave(selected); onClose(); }}
                    >
                        <Check size={16} color="#fff" weight="bold" />
                        <Text style={modalStyles.btnSaveText}>{t("common.confirmer")}</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const sexeStyles = StyleSheet.create({
    option: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200 ?? "#E5E7EB",
        backgroundColor: colors.white,
    },
    optionActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight ?? "#EFF6FF",
    },
    optionText: { fontSize: 15, fontWeight: "600", color: colors.gray400 },
    optionTextActive: { color: colors.primary },
});

// ─── Écran Principal ─────────────────────────────────────────
export default function ProfilScreen() {
    const { t } = useTranslation();
    const [user, setUser] = useState<UtilisateurResponse>(mockUser);

    const [modalNom, setModalNom] = useState(false);
    const [modalContact, setModalContact] = useState(false);
    const [modalIdentite, setModalIdentite] = useState(false);
    const [modalDate, setModalDate] = useState(false);
    const [modalSexe, setModalSexe] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    // ── Handlers (branchés sur PUT /utilisateurs/moi) ──────────
    const handleSaveNom = (v: Record<string, string>) => {
        setUser((u) => ({ ...u, nom: v.nom, prenom: v.prenom }));
        // TODO: api.put('/utilisateurs/moi', { nom: v.nom, prenom: v.prenom })
    };

    const handleSaveContact = (v: Record<string, string>) => {
        setUser((u) => ({ ...u, telephone: v.telephone, email: v.email }));
        // TODO: api.put('/utilisateurs/moi', { telephone: v.telephone, email: v.email })
    };

    const handleSaveIdentite = (v: Record<string, string>) => {
        setUser((u) => ({ ...u, numeroCni: v.numeroCni }));
        // TODO: api.put('/utilisateurs/moi', { numeroCni: v.numeroCni })
    };

    const handleSaveDate = (date: string) => {
        setUser((u) => ({ ...u, dateNaissance: date }));
        // TODO: api.put('/utilisateurs/moi', { dateNaissance: date })
    };

    const handleSaveSexe = (sexe: Sexe) => {
        setUser((u) => ({ ...u, sexe }));
        // TODO: api.put('/utilisateurs/moi', { sexe })
    };

    const handleDeconnexion = () => {
        Alert.alert(
            t("auth.deconnexion"),
            t("profil.confirmer_deconnexion"),
            [
                { text: t("common.annuler"), style: "cancel" },
                {
                    text: t("auth.deconnexion"),
                    style: "destructive",
                    onPress: () => {
                        // TODO: api.post('/auth/deconnexion') puis navigation
                    },
                },
            ]
        );
    };

    const memberSince = new Date(user.dateCreation).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
    });

    const sexeLabel = user.sexe === "M" ? t("auth.masculin") : t("auth.feminin");

    return (
        
        <SafeAreaView style={s.container} edges={["top"]}>
            {/* ── Header ── */}
            


            <View style={s.header}>
                <Text style={s.headerTitle}>{t("profil.mon_profil")}</Text>
                <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={s.burgerBtn}
                    activeOpacity={0.8}
                >
                    <List size={25} color={colors.white} weight="bold" />
                </TouchableOpacity>
            </View>


            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Avatar + Nom ── */}
                <View style={s.avatarSection}>
                    <View style={s.avatarWrapper}>
                        <View style={s.avatar}>
                            <Text style={s.initials}>
                                {getInitials(user.prenom, user.nom)}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={s.cameraBtn}
                            onPress={() => {
                                // TODO: POST /utilisateurs/moi/photo (multipart)
                                Alert.alert(
                                    t("profil.photo_profil"),
                                    t("profil.changer_photo")
                                );
                            }}
                        >
                            <Camera size={14} color="#fff" weight="fill" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={s.nameRow} onPress={() => setModalNom(true)}>
                        <Text style={s.fullName}>
                            {user.prenom} {user.nom}
                        </Text>
                        <PencilSimple size={14} color={colors.primary} weight="bold" />
                    </TouchableOpacity>

                    <View style={s.badgeRow}>
                        <VerificationBadge statut={user.statutVerification} />
                        <View style={s.memberBadge}>
                            <Text style={s.memberText}>
                                {t("profil.membre_depuis", { date: memberSince })}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ── Section : Informations personnelles ── */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>
                        {t("profil.infos_personnelles")}
                    </Text>

                    <ReadOnlyField
                        label={t("profil.nom_complet")}
                        value={`${user.prenom} ${user.nom}`}
                        icon={<User size={18} color={colors.primary} weight="fill" />}
                        editable
                        onEdit={() => setModalNom(true)}
                    />

                    <TouchableOpacity
                        style={fieldStyles.row}
                        onPress={() => setModalDate(true)}
                        activeOpacity={0.7}
                    >
                        <View style={fieldStyles.iconBox}>
                            <CalendarBlank size={18} color={colors.primary} weight="fill" />
                        </View>
                        <View style={fieldStyles.textBox}>
                            <Text style={fieldStyles.label}>{t("auth.date_naissance")}</Text>
                            <Text style={fieldStyles.value}>
                                {formatDateDisplay(user.dateNaissance)}
                            </Text>
                        </View>
                        <View style={fieldStyles.editBtn}>
                            <PencilSimple size={16} color={colors.primary} weight="bold" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={fieldStyles.row}
                        onPress={() => setModalSexe(true)}
                        activeOpacity={0.7}
                    >
                        <View style={fieldStyles.iconBox}>
                            <GenderIntersex size={18} color={colors.primary} weight="fill" />
                        </View>
                        <View style={fieldStyles.textBox}>
                            <Text style={fieldStyles.label}>{t("auth.sexe")}</Text>
                            <Text style={fieldStyles.value}>{sexeLabel}</Text>
                        </View>
                        <View style={fieldStyles.editBtn}>
                            <PencilSimple size={16} color={colors.primary} weight="bold" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* ── Section : Coordonnées ── */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>{t("profil.coordonnees")}</Text>

                    <ReadOnlyField
                        label={t("auth.telephone")}
                        value={user.telephone}
                        icon={<Phone size={18} color={colors.primary} weight="fill" />}
                        editable
                        onEdit={() => setModalContact(true)}
                    />

                    <ReadOnlyField
                        label={t("auth.email")}
                        value={user.email}
                        icon={<EnvelopeSimple size={18} color={colors.primary} weight="fill" />}
                        editable
                        onEdit={() => setModalContact(true)}
                    />
                </View>

                {/* ── Section : Pièce d'identité ── */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>{t("reservation.piece_identite")}</Text>

                    <ReadOnlyField
                        label={t("reservation.numero_piece")}
                        value={user.numeroCni ?? t("profil.non_renseigne")}
                        icon={
                            <IdentificationCard size={18} color={colors.primary} weight="fill" />
                        }
                        editable
                        onEdit={() => setModalIdentite(true)}
                    />

                    {/* Upload CNI → POST /utilisateurs/moi/cni */}
                    <TouchableOpacity
                        style={s.uploadBtn}
                        onPress={() =>
                            Alert.alert(
                                t("profil.uploader_cni"),
                                t("profil.upload_info")
                            )
                        }
                    >
                        <Camera size={18} color={colors.primary} />
                        <Text style={s.uploadBtnText}>{t("profil.uploader_cni")}</Text>
                        <ArrowCounterClockwise size={14} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* ── Contact d'urgence ── */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>{t("reservation.contact_urgence")}</Text>

                    <ReadOnlyField
                        label={t("reservation.contact_urgence_nom")}
                        value={t("profil.non_renseigne")}
                        icon={<AddressBook size={18} color={colors.primary} weight="fill" />}
                        editable
                        onEdit={() =>
                            Alert.alert(t("reservation.contact_urgence"), t("profil.bientot"))
                        }
                    />
                </View>

                {/* ── Déconnexion ── */}
                <TouchableOpacity style={s.logoutBtn} onPress={handleDeconnexion}>
                    <SignOut size={20} color="#DC2626" weight="bold" />
                    <Text style={s.logoutText}>{t("auth.deconnexion")}</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* ─── Modals ─────────────────────────────────── */}
            <EditModal
                visible={modalNom}
                title={t("profil.modifier_nom")}
                fields={[
                    { key: "prenom", label: t("auth.prenom"), value: user.prenom },
                    { key: "nom", label: t("auth.nom"), value: user.nom },
                ]}
                onSave={handleSaveNom}
                onClose={() => setModalNom(false)}
            />

            <EditModal
                visible={modalContact}
                title={t("profil.modifier_coordonnees")}
                fields={[
                    {
                        key: "telephone",
                        label: t("auth.telephone"),
                        value: user.telephone,
                        keyboardType: "phone-pad",
                    },
                    {
                        key: "email",
                        label: t("auth.email"),
                        value: user.email,
                        keyboardType: "email-address",
                    },
                ]}
                onSave={handleSaveContact}
                onClose={() => setModalContact(false)}
            />

            <EditModal
                visible={modalIdentite}
                title={t("profil.modifier_identite")}
                fields={[
                    {
                        key: "numeroCni",
                        label: t("reservation.numero_piece"),
                        value: user.numeroCni ?? "",
                    },
                ]}
                onSave={handleSaveIdentite}
                onClose={() => setModalIdentite(false)}
            />

            <DatePickerModal
                visible={modalDate}
                currentDate={user.dateNaissance}
                onSave={handleSaveDate}
                onClose={() => setModalDate(false)}
            />

            <SexeModal
                visible={modalSexe}
                current={user.sexe}
                onSave={handleSaveSexe}
                onClose={() => setModalSexe(false)}
            />
            <BurgerMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
            />
        </SafeAreaView>
    );
}

// ─── Styles principaux ───────────────────────────────────────
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background ?? "#F3F4F6" },
    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: "row",          // ← ajouter
        alignItems: "center",          // ← ajouter
        justifyContent: "space-between", // ← ajouter
    },
    burgerBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.18)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 20 },

    avatarSection: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 20 },
    avatarWrapper: { position: "relative", marginBottom: 14 },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    initials: { fontSize: 30, fontWeight: "800", color: "#fff" },
    cameraBtn: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
    },
    fullName: { fontSize: 20, fontWeight: "800", color: colors.gray800 },
    badgeRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
    },
    memberBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: colors.gray100 ?? "#F3F4F6",
        borderRadius: 20,
    },
    memberText: { fontSize: 12, color: colors.gray400, fontWeight: "500" },

    section: { paddingHorizontal: 16, marginBottom: 8 },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.gray400,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 10,
        marginLeft: 4,
    },

    uploadBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 14,
        backgroundColor: colors.primaryLight ?? "#EFF6FF",
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.primary,
        borderStyle: "dashed",
        marginTop: 4,
    },
    uploadBtnText: { flex: 1, fontSize: 14, color: colors.primary, fontWeight: "600" },

    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginHorizontal: 16,
        marginTop: 24,
        paddingVertical: 15,
        borderRadius: 14,
        backgroundColor: "#FEF2F2",
        borderWidth: 1.5,
        borderColor: "#FECACA",
    },
    logoutText: { fontSize: 15, fontWeight: "700", color: "#DC2626" },
});
