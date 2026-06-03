const config = {
    // Change cette URL quand le backend de ton camarade sera prêt
    BASE_URL: "http://localhost:8080/api/v1",

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