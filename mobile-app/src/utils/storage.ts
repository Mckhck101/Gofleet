import * as SecureStore from "expo-secure-store";

export const storage = {
    async get(key: string): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(key);
        } catch {
            return null;
        }
    },

    async set(key: string, value: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.error("Erreur storage.set :", error);
        }
    },

    async remove(key: string): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error("Erreur storage.remove :", error);
        }
    },

    async clear(): Promise<void> {
        try {
            const keys = Object.values({
                ACCESS_TOKEN: "access_token",
                REFRESH_TOKEN: "refresh_token",
                USER: "user_data",
            });
            await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
        } catch (error) {
            console.error("Erreur storage.clear :", error);
        }
    },
};