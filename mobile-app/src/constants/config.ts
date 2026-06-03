import Constants from "expo-constants";

function getHostFromUri(uri?: string | null): string {
    if (!uri) return "";
    return uri.replace(/^https?:\/\//, "").split(":")[0];
}

function getApiBaseUrl(): string {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    const constants = Constants as any;
    const hostUri =
        Constants.expoConfig?.hostUri ??
        Constants.manifest2?.extra?.expoClient?.hostUri ??
        constants.manifest?.debuggerHost ??
        constants.manifest?.hostUri ??
        "";
    const host = getHostFromUri(hostUri);

    if (host) {
        return `http://${host}:8080/api/v1`;
    }

    return "http://localhost:8080/api/v1";
}

const config = {
    // Change cette URL quand le backend de ton camarade sera prêt
    BASE_URL: getApiBaseUrl(),
    USE_MOCKS: process.env.EXPO_PUBLIC_USE_MOCKS === "true",
    GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "",
    GEMINI_MODEL: process.env.EXPO_PUBLIC_GEMINI_MODEL ?? "gemini-1.5-flash",

    // Durée avant expiration du token (en ms) — 1 heure
    TOKEN_EXPIRY: 3600 * 1000,

    // Pagination par défaut
    DEFAULT_PAGE_SIZE: 10,

    // Clés AsyncStorage / SecureStore
    STORAGE_KEYS: {
        ACCESS_TOKEN: "access_token",
        REFRESH_TOKEN: "refresh_token",
        USER: "user_data",
    },

    // Devise
    CURRENCY: "FCFA",

    // Timeout requêtes API (en ms)
    REQUEST_TIMEOUT: 15000,
};

export default config;
