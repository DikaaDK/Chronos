import { Github } from 'lucide-react';
import { useLocalization } from '../context/LocalizationContext';

export default function Footer({ repositoryUrl = 'https://github.com/DikaaDK/Chronos' }) {
    const { t } = useLocalization();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-16 border-t border-emerald-100/60 bg-white/60 px-6 py-6 text-sm text-gray-600">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-center text-xs font-medium uppercase tracking-wide text-gray-500 md:text-left">
                    &copy; {currentYear} Chronos. {t('footer.copyright', 'Seluruh hak cipta dilindungi.')}
                </p>
                <a
                    href={repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                    <Github size={18} />
                    <span>{t('footer.github_button', 'Github Repository')}</span>
                </a>
            </div>
        </footer>
    );
}
