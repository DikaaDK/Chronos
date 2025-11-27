import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Edit3, LogOut, Settings, ChevronRight, Mail, ShieldCheck, Sparkles } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const user = useMemo(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Gagal membaca data user dari localStorage:', error);
            return null;
        }
    }, []);

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);
        setShowLogoutConfirm(false);

        const token = localStorage.getItem('token');

        try {
            if (token) {
                await axios.post('/logout', null, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (error) {
            console.error('Logout gagal:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoggingOut(false);
            navigate('/', { replace: true });
        }
    };

    const displayName = user?.name ?? 'Pengguna Chronos';
    const displayEmail = user?.email ?? 'email@chronos.app';

    return (
        <div className="space-y-8">
            <section className="overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/90 shadow-lg shadow-emerald-500/10 backdrop-blur">
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-400 px-6 py-8 text-white">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-white shadow-xl">
                                    <User size={42} className="opacity-90" />
                                </div>
                                <button
                                    type="button"
                                    className="absolute -right-1 -bottom-1 inline-flex items-center justify-center rounded-full bg-white/90 p-1.5 text-emerald-600 shadow-lg transition hover:bg-white"
                                >
                                    <Edit3 size={14} />
                                </button>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold leading-tight">{displayName}</h2>
                                <p className="mt-1 text-sm text-white/80">{displayEmail}</p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                                <Sparkles size={14} />
                                <span>Mode desktop baru</span>
                            </div>
                            <p className="mt-2 leading-relaxed">Nikmati tampilan Chronos yang lebih luas dan nyaman untuk eksplorasi jurnalmu.</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
                    <InfoChip icon={<Mail size={16} />} label="Email" value={displayEmail} />
                    <InfoChip icon={<ShieldCheck size={16} />} label="Status" value="Akun aktif" />
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <ProfileItem
                    icon={<Settings size={20} />}
                    label="Pengaturan Akun"
                    description="Kelola preferensi login dan pengaturan keamanan."
                />
                <ProfileItem
                    icon={<User size={20} />}
                    label="Informasi Pribadi"
                    description="Perbarui nama lengkap dan detail profil lainnya."
                />
                <ProfileItem
                    icon={<Edit3 size={20} />}
                    label="Ubah Kata Sandi"
                    description="Atur ulang kata sandi untuk keamanan ekstra."
                />
                <ProfileItem
                    icon={<Sparkles size={20} />}
                    label="Preferensi Tampilan"
                    description="Aktifkan tema dan mode tampilan favoritmu."
                />
            </section>

            <section>
                <button
                    onClick={() => setShowLogoutConfirm(true)}
                    disabled={isLoggingOut}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    <LogOut size={18} />
                    {isLoggingOut ? 'Keluar...' : 'Keluar'}
                </button>
            </section>

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
                    <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-white/95 p-6 shadow-xl backdrop-blur">
                        <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Logout</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Apakah Anda yakin ingin keluar dari akun Chronos?
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                disabled={isLoggingOut}
                                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 disabled:opacity-70"
                            >
                                {isLoggingOut ? 'Keluar...' : 'Keluar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-4 text-center text-xs text-gray-400">
                Chronos v1.0
            </div>
        </div>
    );
}

function ProfileItem({ icon, label, description }) {
    return (
        <button className="flex h-full flex-col justify-between rounded-3xl border border-emerald-100/60 bg-white/85 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
            <div className="flex items-center gap-3 text-gray-800">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    {icon}
                </span>
                <div>
                    <p className="text-base font-semibold">{label}</p>
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-500">
                <span>Pengaturan</span>
                <ChevronRight size={14} />
            </span>
        </button>
    );
}

function InfoChip({ icon, label, value }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/30 px-4 py-3 text-sm text-gray-700 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/50 text-emerald-600">
                    {icon}
                </span>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
            </div>
        </div>
    );
}
