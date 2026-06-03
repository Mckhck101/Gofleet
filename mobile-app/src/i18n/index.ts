import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import fr from "./locales/fr";
import en from "./locales/en";
import ewondo from "./locales/ewondo";
import bassa from "./locales/bassa";
import fulfulde from "./locales/fulfulde";

const resources = {
    fr:       { translation: fr },
    en:       { translation: en },
    ewondo:   { translation: ewondo },
    bassa:    { translation: bassa },
    fulfulde: { translation: fulfulde },
};

const deviceLanguage =
    Localization.getLocales()[0]?.languageCode ?? "fr";
const supportedLanguages = ["fr", "en", "ewondo", "bassa", "fulfulde"];
const defaultLanguage = supportedLanguages.includes(deviceLanguage)
    ? deviceLanguage
    : "fr";

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: defaultLanguage,
        fallbackLng: "fr",
        interpolation: { escapeValue: false },
    });

export default i18n;

export const LANGUES_DISPONIBLES = [
    { code: "fr",       label: "Français", flag: "FR" },
    { code: "en",       label: "English",  flag: "GB" },
    { code: "ewondo",   label: "Ewondo",   flag: "CM" },
    { code: "bassa",    label: "Bassa",    flag: "CM" },
    { code: "fulfulde", label: "Fulfulde", flag: "CM" },
];
