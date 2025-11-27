import { NavLink, useNavigate } from 'react-router-dom';
import { Home, BookOpen, PlusCircle, User, Building, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modaljournal from './modaljournal';

export default function BottomBar() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
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
                                <span className="mt-1 text-xs">Home</span>
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
                                <span className="mt-1 text-xs">Journal</span>
                            </NavLink>
                        </div>

                        <div className="flex justify-around flex-1">
                            <NavLink
                                to="/group"
                                className={({ isActive }) =>
                                    `flex flex-col items-center text-sm transition-all ${isActive
                                        ? 'text-emerald-600 scale-110'
                                        : 'text-gray-500 hover:text-emerald-500'
                                    }`
                                }
                            >
                                <Building size={24} />
                                <span className="mt-1 text-xs">Group</span>
                            </NavLink>

                            <NavLink
                                to="/profile"
                                className={({ isActive }) =>
                                    `flex flex-col items-center text-sm transition-all ${isActive
                                        ? 'text-emerald-600 scale-110'
                                        : 'text-gray-500 hover:text-emerald-500'
                                    }`
                                }
                            >
                                <User size={24} />
                                <span className="mt-1 text-xs">Profile</span>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden md:flex fixed top-0 left-0 z-40 h-screen w-64 flex-col justify-between border-r border-emerald-100/70 bg-white/80 px-5 pt-24 pb-10 shadow-[0_0_45px_rgba(16,185,129,0.12)] backdrop-blur-xl">
                <div className="space-y-6">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        Navigasi Utama
                    </div>

                    <nav className="flex flex-col gap-3">
                        <DesktopNavItem to="/home" icon={<Home size={18} />} label="Home" />
                        <DesktopNavItem to="/journal" icon={<BookOpen size={18} />} label="Journal" />
                        <DesktopNavItem to="/group" icon={<Building size={18} />} label="Group" />
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-px hover:shadow-xl"
                        >
                            <PlusCircle size={18} />
                            <span>Buat Jurnal</span>
                        </button>
                    </nav>
                </div>

                <div className="space-y-3">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Akun
                    </div>
                    <DesktopNavItem to="/profile" icon={<User size={18} />} label="Profile" />
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl border border-red-100 bg-red-50/70 px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-red-100 text-red-500">
                            <LogOut size={18} />
                        </span>
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            <Modaljournal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddJournal}
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

function DesktopNavItem({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => {
                const base = 'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition';
                const state = isActive
                    ? ' bg-emerald-100 text-emerald-700 shadow-inner shadow-emerald-500/10'
                    : ' text-gray-600 hover:bg-emerald-50 hover:text-emerald-600';
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
            <span>{label}</span>
        </NavLink>
    );
}
