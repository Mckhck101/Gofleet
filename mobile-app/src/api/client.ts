import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { storage } from "@/utils/storage";
import config from "@/constants/config";

// ─── Instance Axios ───────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
    baseURL: config.BASE_URL,
    timeout: config.REQUEST_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// ─── Intercepteur Request (ajout token JWT) ───────────────────
apiClient.interceptors.request.use(
    async (requestConfig: InternalAxiosRequestConfig) => {
        const token = await storage.get(config.STORAGE_KEYS.ACCESS_TOKEN);
        if (token && requestConfig.headers) {
            requestConfig.headers.Authorization = `Bearer ${token}`;
        }
        return requestConfig;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// ─── Intercepteur Response (gestion erreurs globales) ─────────
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Token expiré → tentative de refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await storage.get(
                    config.STORAGE_KEYS.REFRESH_TOKEN
                );

                if (refreshToken) {
                    const response = await axios.post(
                        `${config.BASE_URL}/auth/refresh-token`,
                        { refreshToken }
                    );

                    const { accessToken } = response.data;
                    await storage.set(config.STORAGE_KEYS.ACCESS_TOKEN, accessToken);

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    }

                    return apiClient(originalRequest);
                }
            } catch {
                // Refresh échoué → déconnexion
                await storage.clear();
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;