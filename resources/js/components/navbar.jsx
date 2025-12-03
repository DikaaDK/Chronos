import { BookOpen } from 'lucide-react';
import { useLocalization } from '../context/LocalizationContext';

export default function Navbar() {
    const { t } = useLocalization();
    const appName = t('app.name', 'Chronos');

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-lg border-b border-white/30 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-center">
                <div className="flex items-center gap-3 group cursor-pointer select-none">
                    <div className="bg-gradient-to-tr from-emerald-600 to-emerald-500 p-2 rounded-xl shadow-md transition-transform duration-300 group-hover:scale-110">
                        <BookOpen size={22} className="text-white" />
                    </div>
                    <span className="text-2xl font-extrabold text-emerald-700 tracking-tight group-hover:text-emerald-800 transition-colors duration-300">
                        {appName}
                    </span>
                </div>
            </div>
        </nav>
    );
}
