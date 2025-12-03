import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

const runtimeWindow = typeof window !== 'undefined' ? window : {};

const DEFAULT_SUPPORTED_LOCALES = ['id', 'en', 'zh'];
const LOCALE_STORAGE_KEY = 'chronos:preferred-locale';
const translationStorageKey = (locale) => `chronos:translations:${locale}`;

const safeStorage = {
    get(key) {
        try {
            return runtimeWindow.localStorage?.getItem?.(key) ?? null;
        } catch (error) {
            return null;
        }
    },
    set(key, value) {
        try {
            runtimeWindow.localStorage?.setItem?.(key, value);
        } catch (error) {
            // ignore storage write issues
        }
    },
    remove(key) {
        try {
            runtimeWindow.localStorage?.removeItem?.(key);
        } catch (error) {
            // ignore storage removal issues
        }
    },
};

const loadStoredLocale = () => safeStorage.get(LOCALE_STORAGE_KEY);

const loadStoredTranslations = (locale) => {
    if (!locale) {
        return null;
    }

    const raw = safeStorage.get(translationStorageKey(locale));
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        safeStorage.remove(translationStorageKey(locale));
        return null;
    }
};

const persistLocaleSnapshot = (nextLocale, nextTranslations) => {
    if (!nextLocale) {
        return;
    }

    safeStorage.set(LOCALE_STORAGE_KEY, nextLocale);

    if (nextTranslations && typeof nextTranslations === 'object') {
        try {
            safeStorage.set(translationStorageKey(nextLocale), JSON.stringify(nextTranslations));
        } catch (error) {
            // ignore serialization errors
        }
    }
};

const storedLocaleBootstrap = loadStoredLocale();
const storedTranslationsBootstrap = loadStoredTranslations(storedLocaleBootstrap);

const LocalizationContext = createContext({
    locale: 'id',
    supportedLocales: DEFAULT_SUPPORTED_LOCALES,
    translations: {},
    isLoading: false,
    t: (key, fallback) => fallback ?? key,
    changeLocale: async () => ({}),
    applyUserLocale: async () => ({}),
});

const initialLocale = storedLocaleBootstrap ?? runtimeWindow.__APP_LOCALE__ ?? 'id';
const initialTranslations = storedTranslationsBootstrap ?? runtimeWindow.__APP_TRANSLATIONS__ ?? {};
const initialSupportedLocales = runtimeWindow.__APP_SUPPORTED_LOCALES__ ?? DEFAULT_SUPPORTED_LOCALES;

const buildAuthHeaders = () => {
    try {
        const token = runtimeWindow.localStorage?.getItem?.('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (error) {
        return {};
    }
};

export function LocalizationProvider({ children }) {
    const [locale, setLocale] = useState(initialLocale);
    const [translations, setTranslations] = useState(initialTranslations);
    const [supportedLocales, setSupportedLocales] = useState(initialSupportedLocales);
    const [isLoading, setIsLoading] = useState(false);
    const hydrationState = useRef({
        storedLocale: storedLocaleBootstrap,
        hasStoredTranslations: Boolean(storedTranslationsBootstrap),
        status: storedLocaleBootstrap ? 'pending' : 'ready',
    });

    const updateDocumentLocale = useCallback((nextLocale) => {
        if (typeof document !== 'undefined' && document.documentElement) {
            document.documentElement.lang = nextLocale;
        }

        if (runtimeWindow.axios?.defaults?.headers?.common) {
            runtimeWindow.axios.defaults.headers.common['X-Locale'] = nextLocale;
        }
    }, []);

    const fetchLocalePayload = useCallback(async (nextLocale, persist) => {
        if (!nextLocale) {
            return null;
        }

        const action = persist
            ? axios.post('/localization', { locale: nextLocale }, {
                headers: buildAuthHeaders(),
            })
            : axios.get(`/localization/${nextLocale}`);

        const response = await action;
        return response.data ?? null;
    }, []);

    const applyPayload = useCallback((payload, fallbackLocale) => {
        if (!payload) {
            return null;
        }

        const resolvedLocale = payload.locale ?? fallbackLocale;
        if (resolvedLocale) {
            setLocale(resolvedLocale);
            updateDocumentLocale(resolvedLocale);
        }

        if (payload.translations) {
            setTranslations(payload.translations);
        }

        if (Array.isArray(payload.supported_locales) && payload.supported_locales.length > 0) {
            setSupportedLocales(payload.supported_locales);
        } else {
            setSupportedLocales(DEFAULT_SUPPORTED_LOCALES);
        }

        return payload;
    }, [updateDocumentLocale]);

    useEffect(() => {
        updateDocumentLocale(locale);
    }, [locale, updateDocumentLocale]);

    const changeLocale = useCallback(async (nextLocale, { persist = false, forceReload = false } = {}) => {
        if (!nextLocale || (!forceReload && nextLocale === locale)) {
            return { locale, translations, supported_locales: supportedLocales };
        }

        setIsLoading(true);
        try {
            const payload = await fetchLocalePayload(nextLocale, persist);
            return applyPayload(payload, nextLocale);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [applyPayload, fetchLocalePayload, locale, supportedLocales, translations]);

    const applyUserLocale = useCallback(async (nextLocale) => {
        if (!nextLocale || nextLocale === locale) {
            return { locale, translations };
        }

        return changeLocale(nextLocale, { persist: false });
    }, [changeLocale, locale, translations]);

    useEffect(() => {
        const state = hydrationState.current;

        if (state.status === 'ready') {
            if (!state.storedLocale) {
                persistLocaleSnapshot(locale, translations);
            }
            return;
        }

        const storedLocale = state.storedLocale;

        if (!storedLocale) {
            state.status = 'ready';
            persistLocaleSnapshot(locale, translations);
            return;
        }

        if (storedLocale === locale && state.hasStoredTranslations) {
            state.status = 'ready';
            return;
        }

        const forceReload = storedLocale === locale;

        changeLocale(storedLocale, { persist: false, forceReload })
            .catch(() => {
                persistLocaleSnapshot(locale, translations);
            })
            .finally(() => {
                state.status = 'ready';
            });
    }, [changeLocale, locale, translations]);

    useEffect(() => {
        if (hydrationState.current.status !== 'ready') {
            return;
        }

        persistLocaleSnapshot(locale, translations);
    }, [locale, translations]);

    const translate = useCallback((key, fallback) => {
        if (!key) {
            return fallback ?? key;
        }

        const segments = key.split('.');
        let current = translations;

        for (const segment of segments) {
            if (current && Object.prototype.hasOwnProperty.call(current, segment)) {
                current = current[segment];
            } else {
                current = null;
                break;
            }
        }

        if (typeof current === 'string') {
            return current;
        }

        return fallback ?? key;
    }, [translations]);

    const value = useMemo(() => ({
        locale,
        translations,
        supportedLocales,
        isLoading,
        t: translate,
        changeLocale,
        applyUserLocale,
    }), [applyUserLocale, changeLocale, isLoading, locale, supportedLocales, translate, translations]);

    return (
        <LocalizationContext.Provider value={value}>
            {children}
        </LocalizationContext.Provider>
    );
}

export function useLocalization() {
    return useContext(LocalizationContext);
}
