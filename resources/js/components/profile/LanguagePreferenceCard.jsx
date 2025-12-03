import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import { useLocalization } from '../../context/LocalizationContext';
import { persistUserToLocalStorage } from '../../utils/userStorage';

export default function LanguagePreferenceCard() {
    const { locale, supportedLocales, translations, t, changeLocale } = useLocalization();
    const [selectedLocale, setSelectedLocale] = useState(locale);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const optionLabels = translations?.profile?.language_preference?.options ?? {};
    const title = t('profile.cards.language.title', 'Ubah Bahasa');
    const description = t('profile.cards.language.description', 'Atur Bahasa sesuai dengan Negara kamu.');
    const selectLabel = t('profile.language_preference.select_label', 'Bahasa aplikasi');
    const saveLabel = t('profile.language_preference.save', 'Simpan bahasa');
    const processingText = t('common.processing', 'Memproses...');

    useEffect(() => {
        setSelectedLocale(locale);
    }, [locale]);

    const getLocaleLabel = (value) => optionLabels[value] ?? value?.toUpperCase();
    const isPristine = selectedLocale === locale;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedLocale || isPristine) {
            return;
        }

        setIsSaving(true);
        setFeedback(null);

        try {
            const payload = await changeLocale(selectedLocale, { persist: true });
            if (payload?.user) {
                persistUserToLocalStorage(payload.user);
            }

            const template = t('profile.language_preference.success', 'Bahasa aplikasi berhasil diperbarui.');
            setFeedback({ type: 'success', message: template.replace(':language', getLocaleLabel(selectedLocale)) });
        } catch (error) {
            setFeedback({ type: 'error', message: t('profile.language_preference.error', 'Gagal memperbarui bahasa, coba lagi.') });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex h-full flex-col justify-between rounded-3xl border border-emerald-100/60 bg-white/85 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-xl"
        >
            <div className="flex items-start gap-3 text-gray-800">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Languages size={20} />
                </span>
                <div>
                    <p className="text-base font-semibold">{title}</p>
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{selectLabel}</label>
                <select
                    value={selectedLocale}
                    onChange={(event) => setSelectedLocale(event.target.value)}
                    className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-medium text-gray-800 focus:border-emerald-400 focus:outline-none"
                >
                    {(supportedLocales ?? []).map((value) => (
                        <option key={value} value={value}>
                            {getLocaleLabel(value)}
                        </option>
                    ))}
                </select>

                {feedback && (
                    <div className={`rounded-2xl px-4 py-2 text-xs font-semibold ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {feedback.message}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isSaving || isPristine}
                className="mt-4 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSaving ? processingText : saveLabel}
            </button>
        </form>
    );
}
