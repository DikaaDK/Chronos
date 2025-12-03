import { Sparkles, Sun, Moon } from 'lucide-react';
import { useLocalization } from '../../context/LocalizationContext';
import { useDisplayPreferences } from '../../context/DisplayPreferenceContext';

const fontSizeOptions = [
    { value: 'small', labelKey: 'profile.appearance.font.small', fallback: 'Kecil' },
    { value: 'medium', labelKey: 'profile.appearance.font.medium', fallback: 'Sedang' },
    { value: 'large', labelKey: 'profile.appearance.font.large', fallback: 'Besar' },
];

const themeOptions = [
    { value: 'light', labelKey: 'profile.appearance.theme.light', fallback: 'Mode terang', icon: Sun },
    { value: 'dark', labelKey: 'profile.appearance.theme.dark', fallback: 'Mode gelap', icon: Moon },
];

const classNames = (...tokens) => tokens.filter(Boolean).join(' ');

export default function DisplayPreferenceCard() {
    const { t } = useLocalization();
    const { theme, fontSize, setTheme, setFontSize, resetPreferences } = useDisplayPreferences();

    const title = t('profile.cards.appearance.title', 'Preferensi Tampilan');
    const description = t('profile.cards.appearance.description', 'Aktifkan tema dan mode tampilan favoritmu.');
    const themeLabel = t('profile.appearance.theme_label', 'Mode tampilan');
    const fontLabel = t('profile.appearance.font_label', 'Ukuran font');
    const resetLabel = t('profile.appearance.reset', 'Atur ulang');

    return (
        <div className="flex h-full flex-col gap-5 rounded-3xl border border-emerald-100/60 bg-white/85 p-5 text-left shadow-sm transition theme-transition hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-xl">
            <div className="flex items-start gap-3 text-gray-800">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Sparkles size={20} />
                </span>
                <div>
                    <p className="text-base font-semibold">{title}</p>
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
            </div>

            <section className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{themeLabel}</label>
                <div className="grid grid-cols-2 gap-3">
                    {themeOptions.map(({ value, labelKey, fallback, icon: Icon }) => {
                        const isActive = theme === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setTheme(value)}
                                className={classNames(
                                    'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                                    isActive
                                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm'
                                        : 'border-transparent bg-white/60 text-gray-600 hover:border-emerald-100'
                                )}
                            >
                                <Icon size={18} />
                                <span>{t(labelKey, fallback)}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{fontLabel}</label>
                <div className="flex rounded-2xl border border-emerald-100/60 bg-white/60 p-1 text-sm font-semibold text-gray-600">
                    {fontSizeOptions.map(({ value, labelKey, fallback }) => {
                        const isActive = fontSize === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setFontSize(value)}
                                className={classNames(
                                    'flex-1 rounded-2xl px-3 py-2 transition',
                                    isActive ? 'bg-white text-emerald-600 shadow-sm' : 'hover:text-emerald-600'
                                )}
                            >
                                {t(labelKey, fallback)}
                            </button>
                        );
                    })}
                </div>
            </section>

            <button
                type="button"
                onClick={resetPreferences}
                className="inline-flex items-center justify-center rounded-2xl border border-emerald-100/80 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-emerald-600 transition hover:border-emerald-300 hover:text-emerald-700"
            >
                {resetLabel}
            </button>
        </div>
    );
}
