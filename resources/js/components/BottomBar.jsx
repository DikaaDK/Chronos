import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, PlusCircle, User, Building, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modaljournal from './modaljournal';
import ConfirmModal from './ConfirmModal';
import { useLocalization } from '../context/LocalizationContext';
import { readUserFromLocalStorage } from '../utils/userStorage';

export default function BottomBar() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const { t } = useLocalization();
    const location = useLocation();
    const [storedUser, setStoredUser] = useState(() => readUserFromLocalStorage());
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const syncUser = () => setStoredUser(readUserFromLocalStorage());
        const handleStorage = (event) => {
            if (event?.key && event.key !== 'user') {
                return;
            }
            syncUser();
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('user-data-updated', syncUser);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('user-data-updated', syncUser);
        };
    }, []);
    const profileName = storedUser?.name ?? t('profile.default_name', 'Pengguna Chronos');
    const profileInitial = (() => {
        if (!profileName || typeof profileName !== 'string') {
            return 'C';
        }

        const trimmed = profileName.trim();
        return trimmed ? trimmed.charAt(0).toUpperCase() : 'C';
    })();

    const navCopy = {
        home: t('bottom_bar.home', 'Home'),
        journal: t('bottom_bar.journal', 'Journal'),
        group: t('bottom_bar.group', 'Group'),
        profile: t('bottom_bar.profile', 'Profile'),
        desktopSection: t('navigation.section_title', 'Navigasi utama'),
        cta: t('navigation.cta', 'Tulis jurnal baru'),
        sidebarSubtitle: t('profile.sidebar_subtitle', 'Kelola preferensi profilmu'),
        logoutButton: isLoggingOut ? t('profile.logout.processing', 'Keluar...') : t('profile.logout.button', 'Keluar'),
    };

    const handleLogout = () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLogoutConfirmOpen(false);
        navigate('/');
        setIsLoggingOut(false);
    };

    useEffect(() => {
        document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
        return () => (document.body.style.overflow = 'auto');
    }, [isModalOpen]);

    const handleAddJournal = async ({ title, content, startDate, endDate }) => {
        if (isSubmitting) {
            return false;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return false;
        }

        const normalizedStartDate = normalizeDateForApi(startDate);
        const normalizedEndDate = normalizeDateForApi(endDate || startDate);
        const effectiveEndDate = normalizedEndDate < normalizedStartDate ? normalizedStartDate : normalizedEndDate;
        const payload = {
            title,
            content,
            start_date: normalizedStartDate,
            end_date: effectiveEndDate,
            date: normalizedStartDate,
        };

        try {
            setIsSubmitting(true);

            const res = await fetch('http://localhost:8000/api/journals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    navigate('/login');
                    return false;
                }

                await res.json().catch(() => ({}));
                return false;
            }

            await res.json();
            return true;
        } catch (error) {
            console.error('Gagal menambahkan jurnal:', error);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const pathname = location.pathname ?? '';
    const isGroupRoute = pathname === '/group' || pathname.startsWith('/groups');
    const isProfileRoute = pathname === '/profile' || pathname.startsWith('/settings');

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 bg-white/30 backdrop-blur-xl border-t border-white/20 shadow-lg md:hidden z-40">
                <div className="relative flex justify-center items-center py-2 px-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 z-10"
                    >
                        <PlusCircle size={28} />
                    </button>

                    <div className="flex gap-24 items-end w-full max-w-lg">
                        <div className="flex justify-around flex-1">
                            <NavLink
                                to="/home"
                                className={({ isActive }) =>
                                    `flex flex-col items-center text-sm transition-all ${isActive
                                        ? 'text-emerald-600 scale-110'
                                        : 'text-gray-500 hover:text-emerald-500'
                                    }`
                                }
                            >
                                <Home size={24} />
                                <span className="mt-1 text-xs">{navCopy.home}</span>
                            </NavLink>

                            <NavLink
                                to="/journal"
                                className={({ isActive }) =>
                                    `flex flex-col items-center text-sm transition-all ${isActive
                                        ? 'text-emerald-600 scale-110'
                                        : 'text-gray-500 hover:text-emerald-500'
                                    }`
                                }
                            >
                                <BookOpen size={24} />
                                <span className="mt-1 text-xs">{navCopy.journal}</span>
                            </NavLink>
                        </div>

                        <div className="flex justify-around flex-1">
                            <NavLink
                                to="/group"
                                className={({ isActive }) =>
                                    `flex flex-col items-center text-sm transition-all ${(isActive || isGroupRoute)
                                        ? 'text-emerald-600 scale-110'
                                        : 'text-gray-500 hover:text-emerald-500'
                                    }`
                                }
                            >
                                <Building size={24} />
                                <span className="mt-1 text-xs">{navCopy.group}</span>
                            </NavLink>

                            <NavLink
                                to="/profile"
                                className={({ isActive }) =>
                                    `flex flex-col items-center text-sm transition-all ${(isActive || isProfileRoute)
                                        ? 'text-emerald-600 scale-110'
                                        : 'text-gray-500 hover:text-emerald-500'
                                    }`
                                }
                            >
                                <User size={24} />
                                <span className="mt-1 text-xs">{navCopy.profile}</span>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden md:flex fixed top-0 left-0 z-40 h-screen w-72 flex-col border-r border-emerald-100/50 bg-gradient-to-b from-white/95 via-white/85 to-emerald-50/60 px-5 pt-16 pb-10 shadow-[0_20px_60px_rgba(16,185,129,0.18)] backdrop-blur-xl">
                <div className="mt-8 mb-8 flex h-full flex-col gap-6 pb-6">
                    <div className="space-y-5">
                        <div className="rounded-3xl border border-emerald-100/70 bg-white/90 p-4 shadow-lg shadow-emerald-500/10">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">{navCopy.desktopSection}</p>
                            <div className="mt-4 flex flex-col gap-2">
                                <DesktopNavItem to="/home" icon={<Home size={18} />} label={t('navigation.home', 'Beranda')} />
                                <DesktopNavItem to="/journal" icon={<BookOpen size={18} />} label={t('navigation.journal', 'Jurnal')} />
                                <DesktopNavItem to="/group" icon={<Building size={18} />} label={t('navigation.group', 'Group')} isActiveOverride={isGroupRoute} />
                                <DesktopNavItem to="/profile" icon={<User size={18} />} label={t('navigation.profile', 'Profil')} isActiveOverride={isProfileRoute} />
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-2xl"
                            >
                                <PlusCircle size={18} />
                                <span>{navCopy.cta}</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-20 space-y-4">
                        <div className="rounded-3xl border border-gray-100 bg-gray-50/80 p-4 shadow-lg shadow-gray-300/30">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-bold text-emerald-600">
                                    {profileInitial}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{profileName}</p>
                                    <p className="text-xs text-gray-500">{navCopy.sidebarSubtitle}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsLogoutConfirmOpen(true)}
                                    disabled={isLoggingOut}
                                    className="w-full rounded-2xl border border-red-200 bg-red-50/80 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {navCopy.logoutButton}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modaljournal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddJournal}
            />

            <ConfirmModal
                isOpen={isLogoutConfirmOpen}
                title={t('modals.logout.title', 'Konfirmasi Logout')}
                description={t('modals.logout.description', 'Apakah Anda yakin ingin keluar dari akun Chronos?')}
                confirmText={t('modals.logout.confirm', 'Keluar')}
                cancelText={t('modals.logout.cancel', 'Batal')}
                processingText={t('common.processing', 'Memproses...')}
                onConfirm={handleLogout}
                onCancel={() => setIsLogoutConfirmOpen(false)}
                isConfirming={isLoggingOut}
                variant="danger"
            />
        </>
    );
}

function normalizeDateForApi(value) {
    if (!value) {
        return getTodayForInputValue();
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    parsed.setMinutes(parsed.getMinutes() - parsed.getTimezoneOffset());
    return parsed.toISOString().slice(0, 10);
}

function getTodayForInputValue() {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().slice(0, 10);
}

function DesktopNavItem({ to, icon, label, isActiveOverride }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => {
                const active = typeof isActiveOverride === 'boolean' ? isActiveOverride : isActive;
                const base = 'group flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold transition';
                const state = active
                    ? ' border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-lg shadow-emerald-500/20'
                    : ' border-transparent bg-white/60 text-gray-600 hover:border-emerald-200 hover:bg-white hover:text-emerald-600';
                return base + state;
            }}
        >
            <span
                className={
                    'flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 transition group-hover:bg-emerald-500 group-hover:text-white'
                }
            >
                {icon}
            </span>
            <span className="flex-1 text-left">{label}</span>
        </NavLink>
    );
}
