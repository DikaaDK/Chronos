import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const runtimeWindow = typeof window !== 'undefined' ? window : undefined;
const runtimeDocument = typeof document !== 'undefined' ? document : undefined;

const STORAGE_KEY = 'chronos:display-preferences';
const DEFAULT_PREFERENCES = {
    theme: 'light',
    fontSize: 'medium',
};

const FONT_SIZE_SCALE = {
    small: 0.95,
    medium: 1,
    large: 1.1,
};

const ensurePreferenceShape = (payload) => {
    const next = payload && typeof payload === 'object' ? payload : {};
    const theme = next.theme === 'dark' ? 'dark' : DEFAULT_PREFERENCES.theme;
    const fontSize = Object.prototype.hasOwnProperty.call(FONT_SIZE_SCALE, next.fontSize)
        ? next.fontSize
        : DEFAULT_PREFERENCES.fontSize;

    return { theme, fontSize };
};

const readStoredPreferences = () => {
    if (!runtimeWindow?.localStorage) {
        return DEFAULT_PREFERENCES;
    }

    try {
        const raw = runtimeWindow.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return DEFAULT_PREFERENCES;
        }

        return ensurePreferenceShape(JSON.parse(raw));
    } catch (error) {
        return DEFAULT_PREFERENCES;
    }
};

const persistPreferences = (preferences) => {
    if (!runtimeWindow?.localStorage) {
        return;
    }

    try {
        runtimeWindow.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
        // ignore storage write issues
    }
};

const applyThemeToDocument = (theme) => {
    if (!runtimeDocument?.documentElement) {
        return;
    }

    runtimeDocument.documentElement.dataset.theme = theme;
    runtimeDocument.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
};

const applyFontSizeToDocument = (fontSize) => {
    if (!runtimeDocument?.documentElement) {
        return;
    }

    const scale = FONT_SIZE_SCALE[fontSize] ?? FONT_SIZE_SCALE.medium;
    runtimeDocument.documentElement.dataset.fontSize = fontSize;
    runtimeDocument.documentElement.style.setProperty('--font-size-scale', String(scale));
    runtimeDocument.documentElement.style.fontSize = `${16 * scale}px`;
};

const DisplayPreferenceContext = createContext({
    theme: DEFAULT_PREFERENCES.theme,
    fontSize: DEFAULT_PREFERENCES.fontSize,
    setTheme: () => {},
    toggleTheme: () => {},
    setFontSize: () => {},
    resetPreferences: () => {},
});

export function DisplayPreferenceProvider({ children }) {
    const [preferences, setPreferences] = useState(() => readStoredPreferences());

    useEffect(() => {
        applyThemeToDocument(preferences.theme);
    }, [preferences.theme]);

    useEffect(() => {
        applyFontSizeToDocument(preferences.fontSize);
    }, [preferences.fontSize]);

    useEffect(() => {
        persistPreferences(preferences);
    }, [preferences]);

    const setTheme = useCallback((nextTheme) => {
        setPreferences((prev) => {
            const theme = nextTheme === 'dark' ? 'dark' : 'light';
            if (prev.theme === theme) {
                return prev;
            }
            return { ...prev, theme };
        });
    }, []);

    const toggleTheme = useCallback(() => {
        setPreferences((prev) => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark',
        }));
    }, []);

    const setFontSize = useCallback((nextSize) => {
        setPreferences((prev) => {
            const fontSize = Object.prototype.hasOwnProperty.call(FONT_SIZE_SCALE, nextSize)
                ? nextSize
                : prev.fontSize;

            if (prev.fontSize === fontSize) {
                return prev;
            }

            return { ...prev, fontSize };
        });
    }, []);

    const resetPreferences = useCallback(() => {
        setPreferences(DEFAULT_PREFERENCES);
    }, []);

    const value = useMemo(() => ({
        theme: preferences.theme,
        fontSize: preferences.fontSize,
        setTheme,
        toggleTheme,
        setFontSize,
        resetPreferences,
    }), [preferences.fontSize, preferences.theme, resetPreferences, setFontSize, setTheme, toggleTheme]);

    return (
        <DisplayPreferenceContext.Provider value={value}>
            {children}
        </DisplayPreferenceContext.Provider>
    );
}

export function useDisplayPreferences() {
    return useContext(DisplayPreferenceContext);
}
