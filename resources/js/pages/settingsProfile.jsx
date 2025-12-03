import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, ShieldCheck, Smartphone, Loader2 } from 'lucide-react';
import { useLocalization } from '../context/LocalizationContext';

const initialPasswordForm = {
    current_password: '',
    password: '',
    password_confirmation: '',
};

export default function SettingsProfile() {
    const { t } = useLocalization();
    const navigate = useNavigate();
    const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordStatus, setPasswordStatus] = useState(null);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [devices, setDevices] = useState([]);
    const [isLoadingDevices, setIsLoadingDevices] = useState(false);
    const [deviceError, setDeviceError] = useState(null);

    const pageCopy = useMemo(() => ({
        title: t('settings.account.title', 'Pengaturan Akun'),
        subtitle: t('settings.account.subtitle', 'Kelola keamanan akun dan perangkat yang terhubung.'),
        password: {
            title: t('settings.account.password.title', 'Keamanan Password'),
            description: t('settings.account.password.description', 'Ganti password secara berkala untuk menjaga akun tetap aman.'),
            current: t('settings.account.password.current', 'Password saat ini'),
            new: t('settings.account.password.new', 'Password baru'),
            confirm: t('settings.account.password.confirm', 'Konfirmasi password baru'),
            hint: t('settings.account.password.hint', 'Minimal 8 karakter, gunakan kombinasi huruf, angka, dan simbol.'),
            button: t('settings.account.password.button', 'Perbarui password'),
            processing: t('common.processing', 'Memproses...'),
        },
        devices: {
            title: t('settings.account.devices.title', 'Perangkat Aktif'),
            description: t('settings.account.devices.description', 'Pantau sesi login aktif. Logout jika bukan kamu.'),
            recent: t('settings.account.devices.recent', 'Session aktif terbaru'),
            placeholder: t('settings.account.devices.placeholder', 'Perangkat tambahan akan tampil di sini segera.'),
            empty: t('settings.account.devices.empty', 'Belum ada perangkat lain yang terhubung.'),
            ipLabel: t('settings.account.devices.ip_label', 'IP address'),
            lastUsed: t('settings.account.devices.last_used', 'Aktif terakhir'),
            addedAt: t('settings.account.devices.added_at', 'Ditambahkan'),
            refresh: t('settings.account.devices.refresh', 'Segarkan daftar'),
            error: t('settings.account.devices.error', 'Gagal memuat perangkat. Coba lagi.'),
        },
    }), [t]);

    useEffect(() => {
        loadDevices();
    }, []);

    const loadDevices = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setDeviceError(t('settings.account.devices.session', 'Sesi kamu berakhir.')); // fallback copy
            return;
        }

        setIsLoadingDevices(true);
        setDeviceError(null);
        try {
            const { data } = await axios.get('/profile/devices', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDevices(data?.devices ?? []);
        } catch (error) {
            setDeviceError(error.response?.data?.message ?? pageCopy.devices.error);
        } finally {
            setIsLoadingDevices(false);
        }
    };

    const handlePasswordInput = (field, value) => {
        setPasswordForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        if (isUpdatingPassword) {
            return;
        }

        setIsUpdatingPassword(true);
        setPasswordErrors({});
        setPasswordStatus(null);

        const token = localStorage.getItem('token');
        if (!token) {
            setPasswordStatus({ type: 'error', message: t('settings.account.password.session', 'Sesi kamu sudah berakhir. Silakan login kembali.') });
            setIsUpdatingPassword(false);
            return;
        }

        try {
            const { data } = await axios.put('/profile/password', passwordForm, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPasswordStatus({ type: 'success', message: data?.message ?? t('settings.account.password.success', 'Password berhasil diperbarui.') });
            setPasswordForm(initialPasswordForm);
        } catch (error) {
            if (error.response?.status === 422 && error.response.data?.errors) {
                setPasswordErrors(error.response.data.errors);
                setPasswordStatus({ type: 'error', message: error.response.data?.message ?? t('settings.account.password.error', 'Gagal memperbarui password.') });
            } else {
                const fallback = error.response?.data?.message ?? t('settings.account.password.error', 'Gagal memperbarui password.');
                setPasswordStatus({ type: 'error', message: fallback });
            }
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="space-y-8">
            <button
                type="button"
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
                <span className="inline-block rounded-full border border-emerald-200 px-3 py-1 text-xs uppercase tracking-wide">
                    {t('common.back', 'Kembali')}
                </span>
            </button>
            <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">Chronos</p>
                <h1 className="text-3xl font-semibold text-gray-900">{pageCopy.title}</h1>
                <p className="text-sm text-gray-500">{pageCopy.subtitle}</p>
            </header>

            <div className="grid gap-6 lg:grid-cols-3">
                <section className="lg:col-span-2 rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <Lock size={22} />
                        </span>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">{pageCopy.password.title}</p>
                            <p className="text-sm text-gray-500">{pageCopy.password.description}</p>
                        </div>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
                        <PasswordField
                            label={pageCopy.password.current}
                            value={passwordForm.current_password}
                            onChange={(value) => handlePasswordInput('current_password', value)}
                            error={passwordErrors.current_password}
                            autoComplete="current-password"
                        />
                        <PasswordField
                            label={pageCopy.password.new}
                            value={passwordForm.password}
                            onChange={(value) => handlePasswordInput('password', value)}
                            error={passwordErrors.password}
                            autoComplete="new-password"
                        />
                        <PasswordField
                            label={pageCopy.password.confirm}
                            value={passwordForm.password_confirmation}
                            onChange={(value) => handlePasswordInput('password_confirmation', value)}
                            error={passwordErrors.password_confirmation}
                            autoComplete="new-password"
                        />
                        <p className="text-xs text-gray-500">{pageCopy.password.hint}</p>

                        {passwordStatus && (
                            <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${passwordStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {passwordStatus.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isUpdatingPassword}
                        >
                            {isUpdatingPassword ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {pageCopy.password.processing}
                                </>
                            ) : (
                                pageCopy.password.button
                            )}
                        </button>
                    </form>
                </section>

                <section className="rounded-3xl border border-emerald-100 bg-white/95 p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <ShieldCheck size={22} />
                        </span>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">{pageCopy.devices.title}</p>
                            <p className="text-sm text-gray-500">{pageCopy.devices.description}</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-4">
                        {isLoadingDevices ? (
                            <div className="space-y-3">
                                <DeviceSkeleton />
                                <DeviceSkeleton />
                            </div>
                        ) : deviceError ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {deviceError}
                                <button
                                    type="button"
                                    onClick={loadDevices}
                                    className="mt-3 inline-flex items-center rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                                >
                                    {pageCopy.devices.refresh}
                                </button>
                            </div>
                        ) : devices.length === 0 ? (
                            <p className="rounded-2xl border border-dashed border-emerald-200 px-4 py-3 text-xs font-medium text-emerald-600">
                                {pageCopy.devices.empty}
                            </p>
                        ) : (
                            devices.map((device) => (
                                <DeviceCard key={device.id} device={device} copy={pageCopy.devices} />
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function PasswordField({ label, value, onChange, error, autoComplete = 'off' }) {
    return (
        <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
            <input
                type="password"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:ring-2 focus:ring-emerald-100 ${error ? 'border-red-400 focus:border-red-400' : 'border-emerald-100 focus:border-emerald-400'}`}
                autoComplete={autoComplete}
            />
            {error && (
                <span className="text-xs font-semibold text-red-500">{Array.isArray(error) ? error[0] : error}</span>
            )}
        </label>
    );
}

function DeviceCard({ device, copy }) {
    const icon = <Smartphone size={18} />;
    const formatDate = (value) => {
        if (!value) {
            return '-';
        }
        const date = new Date(value);
        return `${date.toLocaleDateString()} • ${date.toLocaleTimeString()}`;
    };

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm text-gray-700">
            <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-500">
                    {icon}
                </span>
                <div>
                    <p className="text-sm font-semibold text-gray-900">{device.name ?? copy.recent}</p>
                    <p className="text-xs text-gray-500">{device.user_agent ?? '-'}</p>
                </div>
            </div>
            <div className="grid gap-2 text-xs text-gray-500">
                <p><span className="font-semibold text-gray-600">{copy.ipLabel}:</span> {device.ip_address ?? '-'}</p>
                <p><span className="font-semibold text-gray-600">{copy.lastUsed}:</span> {formatDate(device.last_used_at)}</p>
                <p><span className="font-semibold text-gray-600">{copy.addedAt}:</span> {formatDate(device.created_at)}</p>
            </div>
        </div>
    );
}

function DeviceSkeleton() {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3">
            <div className="h-10 w-10 rounded-xl bg-white/60" />
            <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 rounded-full bg-gray-200" />
                <div className="h-2.5 w-2/3 rounded-full bg-gray-200" />
                <div className="h-2 w-1/3 rounded-full bg-gray-100" />
            </div>
        </div>
    );
}
