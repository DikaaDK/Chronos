import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Edit3, LogOut, Settings, ChevronRight, Mail, ShieldCheck, CheckCircle2, AlertCircle, X } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { useLocalization } from '../context/LocalizationContext';
import LanguagePreferenceCard from '../components/profile/LanguagePreferenceCard';
import DisplayPreferenceCard from '../components/profile/DisplayPreferenceCard';
import { persistUserToLocalStorage } from '../utils/userStorage';


export default function Profile() {
    const navigate = useNavigate();
    const { t } = useLocalization();
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Gagal membaca data user dari localStorage:', error);
            return null;
        }
    });
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [profileAlert, setProfileAlert] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '' });
    const [formErrors, setFormErrors] = useState({});
    const [modalError, setModalError] = useState(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const avatarInputRef = useRef(null);

    useEffect(() => {
        setEditForm({
            name: user?.name ?? '',
            email: user?.email ?? '',
        });
    }, [user]);

    useEffect(() => {
        if (!avatarFile) {
            setAvatarPreview(null);
            return undefined;
        }

        const objectUrl = URL.createObjectURL(avatarFile);
        setAvatarPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [avatarFile]);

    const editModalCopy = {
        title: t('profile.edit_modal.title', 'Edit Profil'),
        description: t('profile.edit_modal.description', 'Perbarui nama dan email agar profil kamu selalu akurat.'),
        nameLabel: t('profile.edit_modal.name_label', 'Nama lengkap'),
        emailLabel: t('profile.edit_modal.email_label', 'Email utama'),
        namePlaceholder: t('profile.edit_modal.name_placeholder', 'Nama lengkap kamu'),
        emailPlaceholder: t('profile.edit_modal.email_placeholder', 'email@chronos.app'),
        save: t('profile.edit_modal.save', 'Simpan perubahan'),
        cancel: t('profile.edit_modal.cancel', 'Batal'),
        processing: t('profile.edit_modal.processing', 'Menyimpan...'),
        success: t('profile.edit_modal.success', 'Profil berhasil diperbarui.'),
        sessionExpired: t('profile.edit_modal.error_session', 'Sesi kamu sudah berakhir. Silakan login ulang.'),
        genericError: t('profile.edit_modal.error_generic', 'Terjadi kesalahan saat menyimpan perubahan.'),
        photoLabel: t('profile.edit_modal.photo_label', 'Foto profil'),
        photoUpload: t('profile.edit_modal.photo_upload', 'Pilih foto baru'),
        photoReset: t('profile.edit_modal.photo_reset', 'Batalkan foto'),
        photoHint: t('profile.edit_modal.photo_hint', 'Format JPG, PNG, atau WEBP ukuran maksimal 4MB.'),
    };

    const handleOpenEditModal = () => {
        if (!user) {
            return;
        }
        setFormErrors({});
        setModalError(null);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        if (isSavingProfile) {
            return;
        }
        handleAvatarReset();
        setFormErrors({});
        setModalError(null);
        setEditForm({
            name: user?.name ?? '',
            email: user?.email ?? '',
        });
        setShowEditModal(false);
    };

    const handleEditInputChange = (field, value) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const goToAccountSettings = () => {
        navigate('/settings/profile');
    };

    const clearAvatarError = () => {
        setFormErrors((prev) => {
            if (!prev?.avatar) {
                return prev;
            }
            const next = { ...prev };
            delete next.avatar;
            return next;
        });
    };

    const handleAvatarPick = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        setAvatarFile(file);
        clearAvatarError();
    };

    const handleAvatarReset = () => {
        setAvatarFile(null);
        clearAvatarError();
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();

        if (isSavingProfile) {
            return;
        }

        setIsSavingProfile(true);
        setFormErrors({});
        setModalError(null);

        const token = localStorage.getItem('token');
        if (!token) {
            setModalError(editModalCopy.sessionExpired);
            setIsSavingProfile(false);
            return;
        }

        try {
            const formData = new FormData();
            let hasChanges = false;

            if (editForm.name !== (user?.name ?? '')) {
                formData.append('name', editForm.name);
                hasChanges = true;
            }

            if (editForm.email !== (user?.email ?? '')) {
                formData.append('email', editForm.email);
                hasChanges = true;
            }

            if (avatarFile) {
                formData.append('avatar', avatarFile);
                hasChanges = true;
            }

            if (!hasChanges) {
                setIsSavingProfile(false);
                return;
            }

            formData.append('_method', 'PUT');

            const { data } = await axios.post('/profile', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const updatedUser = data?.user ?? { ...user, ...editForm };
            persistUserToLocalStorage(updatedUser);
            setUser(updatedUser);
            setProfileAlert({ type: 'success', message: data?.message ?? editModalCopy.success });
            handleAvatarReset();
            setShowEditModal(false);
        } catch (error) {
            if (error.response?.status === 422 && error.response.data?.errors) {
                setFormErrors(error.response.data.errors);
            } else {
                const fallback = error.response?.data?.message ?? editModalCopy.genericError;
                setModalError(fallback);
            }
        } finally {
            setIsSavingProfile(false);
        }
    };

    const isAvatarDirty = Boolean(avatarFile);
    const isEditPristine = (editForm.name === (user?.name ?? '')) && (editForm.email === (user?.email ?? '')) && !isAvatarDirty;
    const dismissAlert = () => setProfileAlert(null);

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

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
            setShowLogoutConfirm(false);
            navigate('/', { replace: true });
        }
    };

    const displayName = user?.name ?? t('profile.default_name', 'Pengguna Chronos');
    const displayEmail = user?.email ?? t('profile.default_email', 'email@chronos.app');
    const cardCta = t('profile.card_cta', 'Pengaturan');
    const canEditProfile = Boolean(user);
    const savedAvatarUrl = user?.avatar_url ?? null;

    return (
        <div className="space-y-8">
            {profileAlert && (
                <div className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${profileAlert.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                    <div className="flex items-center gap-2">
                        {profileAlert.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                        <span>{profileAlert.message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={dismissAlert}
                        className="rounded-full p-1 text-current transition hover:bg-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                        aria-label={t('profile.alert.dismiss', 'Tutup notifikasi')}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
            <section className="overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/90 shadow-lg shadow-emerald-500/10 backdrop-blur">
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-400 px-6 py-8 text-white">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="h-20 w-20 overflow-hidden rounded-full bg-white/20 shadow-xl">
                                    {savedAvatarUrl ? (
                                        <img src={savedAvatarUrl} alt={displayName} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-white/90">
                                            <User size={42} className="opacity-90" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleOpenEditModal}
                                    disabled={!canEditProfile}
                                    aria-label={t('profile.edit_button.label', 'Edit profil')}
                                    className="absolute -right-1 -bottom-1 inline-flex items-center justify-center rounded-full bg-white/90 p-1.5 text-emerald-600 shadow-lg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Edit3 size={14} />
                                </button>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold leading-tight">{displayName}</h2>
                                <p className="mt-1 text-sm text-white/80">{displayEmail}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
                    <InfoChip icon={<Mail size={16} />} label={t('profile.email_label', 'Email')} value={displayEmail} />
                    <InfoChip icon={<ShieldCheck size={16} />} label={t('profile.status_label', 'Status')} value={t('profile.status_active', 'Akun aktif')} />
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <ProfileItem
                    icon={<Settings size={20} />}
                    label={t('profile.cards.account.title', 'Pengaturan Akun')}
                    description={t('profile.cards.account.description', 'Kelola preferensi login dan pengaturan keamanan.')}
                    ctaLabel={cardCta}
                    onClick={goToAccountSettings}
                />
                <ProfileItem
                    icon={<User size={20} />}
                    label={t('profile.cards.personal.title', 'Informasi Pribadi')}
                    description={t('profile.cards.personal.description', 'Perbarui nama lengkap dan detail profil lainnya.')}
                    ctaLabel={cardCta}
                    onClick={handleOpenEditModal}
                />
                <LanguagePreferenceCard />
                <DisplayPreferenceCard />
            </section>

            <section>
                <button
                    onClick={() => setShowLogoutConfirm(true)}
                    disabled={isLoggingOut}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    <LogOut size={18} />
                    {isLoggingOut ? t('profile.logout.processing', 'Keluar...') : t('profile.logout.button', 'Keluar')}
                </button>
            </section>

            <EditProfileModal
                isOpen={showEditModal}
                onClose={handleCloseEditModal}
                formData={editForm}
                onInputChange={handleEditInputChange}
                onSubmit={handleProfileSubmit}
                errors={formErrors}
                isSaving={isSavingProfile}
                isPristine={isEditPristine}
                copy={editModalCopy}
                generalError={modalError}
                avatarPreview={avatarPreview}
                onAvatarPick={handleAvatarPick}
                onAvatarReset={handleAvatarReset}
                avatarInputRef={avatarInputRef}
                isAvatarDirty={isAvatarDirty}
                savedAvatarUrl={savedAvatarUrl}
            />

            <ConfirmModal
                isOpen={showLogoutConfirm}
                title={t('modals.logout.title', 'Konfirmasi Logout')}
                description={t('modals.logout.description', 'Apakah Anda yakin ingin keluar dari akun Chronos?')}
                confirmText={t('modals.logout.confirm', 'Keluar')}
                cancelText={t('modals.logout.cancel', 'Batal')}
                processingText={t('common.processing', 'Memproses...')}
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutConfirm(false)}
                isConfirming={isLoggingOut}
                variant="danger"
            />

            <div className="py-4 text-center text-xs text-gray-400">
                {t('app.version', 'Chronos v1.0')}
            </div>
        </div>
    );
}

function EditProfileModal({
    isOpen,
    onClose,
    formData,
    onInputChange,
    onSubmit,
    errors,
    isSaving,
    isPristine,
    copy,
    generalError,
    avatarPreview,
    onAvatarPick,
    onAvatarReset,
    avatarInputRef,
    isAvatarDirty,
    savedAvatarUrl,
}) {
    if (!isOpen) {
        return null;
    }

    const firstError = (value) => {
        if (!value) {
            return null;
        }

        return Array.isArray(value) ? value[0] : value;
    };

    const previewSource = avatarPreview ?? savedAvatarUrl;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed"
                    aria-label={copy.cancel}
                >
                    <X size={16} />
                </button>

                <form onSubmit={onSubmit} className="space-y-5 px-6 py-8">
                    <div>
                        <p className="text-xl font-semibold text-gray-900">{copy.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{copy.description}</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{copy.nameLabel}</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(event) => onInputChange('name', event.target.value)}
                            placeholder={copy.namePlaceholder}
                            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                            required
                        />
                        {firstError(errors?.name) && (
                            <p className="text-xs font-semibold text-red-600">{firstError(errors?.name)}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{copy.emailLabel}</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(event) => onInputChange('email', event.target.value)}
                            placeholder={copy.emailPlaceholder}
                            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                            required
                        />
                        {firstError(errors?.email) && (
                            <p className="text-xs font-semibold text-red-600">{firstError(errors?.email)}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{copy.photoLabel}</label>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">
                                {previewSource ? (
                                    <img src={previewSource} alt={copy.photoLabel} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-emerald-400">
                                        <User size={32} />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col gap-2 text-xs text-gray-500">
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        disabled={isSaving}
                                        className="inline-flex items-center justify-center rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed"
                                    >
                                        {copy.photoUpload}
                                    </button>
                                    {isAvatarDirty && (
                                        <button
                                            type="button"
                                            onClick={onAvatarReset}
                                            disabled={isSaving}
                                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-200 disabled:cursor-not-allowed"
                                        >
                                            {copy.photoReset}
                                        </button>
                                    )}
                                </div>
                                <p>{copy.photoHint}</p>
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={avatarInputRef}
                            onChange={onAvatarPick}
                            className="hidden"
                        />
                        {firstError(errors?.avatar) && (
                            <p className="text-xs font-semibold text-red-600">{firstError(errors?.avatar)}</p>
                        )}
                    </div>

                    {generalError && (
                        <div className="rounded-2xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">
                            {generalError}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed"
                        >
                            {copy.cancel}
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || isPristine}
                            className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSaving ? copy.processing : copy.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ProfileItem({ icon, label, description, ctaLabel, onClick }) {
    return (
        <button type="button" onClick={onClick} className="flex h-full flex-col justify-between rounded-3xl border border-emerald-100/60 bg-white/85 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
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
                <span>{ctaLabel}</span>
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

