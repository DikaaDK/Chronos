import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, CalendarDays, Archive, Sparkles } from 'lucide-react';
import Modaljournal from '../components/modaljournal';
import JournalDetailModal from '../components/journalDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import Footer from '../components/Footer';
import { useLocalization } from '../context/LocalizationContext';

export default function Journal() {
    const navigate = useNavigate();
    const { t, locale } = useLocalization();
    const [journals, setJournals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingJournal, setEditingJournal] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdatingJournal, setIsUpdatingJournal] = useState(false);
    const [isDeletingJournal, setIsDeletingJournal] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [journalPendingDeletion, setJournalPendingDeletion] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const token = localStorage.getItem('token');

    const journalCopy = useMemo(() => ({
        header: {
            badge: t('journal.header.badge', 'Arsip pribadi'),
            title: t('journal.header.title', 'Jurnal Harian'),
            description: t('journal.header.description', 'Jelajahi catatan yang sudah kamu tulis, edit seperlunya, dan pantau progres harianmu.'),
        },
        stats: {
            totalLabel: t('journal.stats.total_label', 'Total jurnal'),
        },
        actions: {
            write: t('journal.actions.write', 'Tulis Jurnal'),
        },
        sidebar: {
            lastWrittenLabel: t('journal.sidebar.last_written_label', 'Terakhir ditulis'),
            lastWrittenEmpty: t('journal.sidebar.last_written_empty', 'Belum ada jurnal'),
            tipsTitle: t('journal.sidebar.tips_title', 'Tips cepat'),
            tipsDescription: t('journal.sidebar.tips_description', 'Gunakan modal detail untuk mengedit atau menghapus jurnal tanpa meninggalkan halaman ini.'),
        },
        emptyState: {
            title: t('journal.empty_state.title', 'Belum ada jurnal yang tersimpan.'),
            description: t('journal.empty_state.description', 'Awali cerita pertamamu dengan menekan tombol "Tulis Jurnal".'),
            cta: t('journal.empty_state.cta', 'Tulis Jurnal'),
        },
        accessibility: {
            viewJournal: t('journal.accessibility.view_journal', 'Lihat detail jurnal :title'),
        },
        card: {
            overdueBadge: t('journal.card.overdue_badge', 'Lewat batas waktu'),
        },
        progressLabels: {
            completed: t('journal.progress.completed', 'Selesai'),
            notStarted: t('journal.progress.not_started', 'Belum dimulai'),
            inProgress: t('journal.progress.in_progress', 'Sedang berlangsung'),
        },
        modals: {
            createTitle: t('journal.create_modal.title', 'Tambah Jurnal'),
            createSubmit: t('journal.create_modal.submit', 'Simpan'),
            editTitle: t('journal.edit_modal.title', 'Edit Jurnal'),
            editSubmit: t('journal.edit_modal.submit', 'Perbarui'),
            deleteTitle: t('journal.delete_modal.title', 'Hapus jurnal?'),
            deleteDescriptionWithTitle: t('journal.delete_modal.description_with_title', 'Jurnal ":title" akan dihapus permanen.'),
            deleteDescription: t('journal.delete_modal.description', 'Jurnal ini akan dihapus permanen.'),
            deleteConfirm: t('journal.delete_modal.confirm', 'Hapus'),
            deleteCancel: t('journal.delete_modal.cancel', 'Batal'),
        },
        deleteErrors: {
            generic: t('journal.delete_modal.error_generic', 'Gagal menghapus jurnal.'),
            network: t('journal.delete_modal.error_network', 'Terjadi kesalahan jaringan. Coba lagi.'),
        },
        errors: {
            loadFailed: t('journal.errors.load_failed', 'Gagal memuat data (:status)'),
            genericLoad: t('journal.errors.generic_load', 'Tidak dapat memuat jurnal.'),
            userFetch: t('journal.errors.user_fetch_failed', 'Gagal mengambil user'),
            saveFailed: t('journal.errors.save_failed', 'Gagal menyimpan jurnal.'),
        },
    }), [t]);

    useEffect(() => {
        const fetchJournals = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/journals', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        navigate('/login');
                        return;
                    }

                    throw new Error(journalCopy.errors.loadFailed.replace(':status', res.status));
                }

                const data = await res.json();
                setJournals(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Gagal mengambil data:', err);
            }
        };

        if (token) fetchJournals();
    }, [token, navigate, journalCopy.errors.loadFailed]);

    useEffect(() => {
        const tokenValue = localStorage.getItem('token');
        if (!tokenValue) {
            navigate('/login');
            return;
        }

        let isMounted = true;

        fetch('http://localhost:8000/api/user', {
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
                'Accept': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('token');
                        navigate('/login');
                        return null;
                    }

                    throw new Error(journalCopy.errors.userFetch);
                }

                return response.json();
            })
            .then((data) => {
                if (data && isMounted) {
                    setCurrentUserId(data.id);
                }
            })
            .catch((error) => {
                console.error('Gagal memuat user:', error);
            });

        return () => {
            isMounted = false;
        };
    }, [navigate, journalCopy.errors.userFetch]);

    useEffect(() => {
        if (!currentUserId) {
            return undefined;
        }

        const tokenValue = localStorage.getItem('token');
        const getEchoInstance = typeof window !== 'undefined' ? window.getEchoInstance : null;

        if (!tokenValue || typeof getEchoInstance !== 'function') {
            return undefined;
        }

        const echo = getEchoInstance(tokenValue);

        if (!echo) {
            return undefined;
        }

        const channelName = `journals.${currentUserId}`;
        const privateChannelName = `private-${channelName}`;
        const channel = echo.private(channelName);

        const handleRealtimeChange = (payload) => {
            setJournals((prev) => applyRealtimeJournalChange(prev, payload));
        };

        channel.listen('.JournalUpdated', handleRealtimeChange);

        return () => {
            channel.stopListening('.JournalUpdated');
            echo.leave(privateChannelName);
        };
    }, [currentUserId]);

    const handleAddJournal = async ({ title, content, startDate, endDate, progress }) => {
        const normalizedStartDate = normalizeDateForApi(startDate);
        const normalizedEndDate = normalizeDateForApi(endDate || startDate);
        const effectiveEndDate = normalizedEndDate < normalizedStartDate ? normalizedStartDate : normalizedEndDate;
        const payload = {
            title,
            content,
            start_date: normalizedStartDate,
            end_date: effectiveEndDate,
            date: normalizedStartDate,
            progress: clampPercent(progress ?? 0),
        };

        const authToken = localStorage.getItem('token');
        if (!authToken) {
            navigate('/login');
            return false;
        }

        try {
            const res = await fetch('http://localhost:8000/api/journals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    navigate('/login');
                    return false;
                }
                throw new Error(journalCopy.errors.saveFailed);
            }

            const savedJournal = ensureProgressValue(await res.json(), payload.progress);
            setJournals((prevJournals) => {
                const previous = Array.isArray(prevJournals) ? prevJournals : [];
                const withoutDuplicate = savedJournal && savedJournal.id != null
                    ? previous.filter((journal) => journal.id !== savedJournal.id)
                    : previous;
                return [savedJournal, ...withoutDuplicate];
            });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const handleJournalClick = (journal) => {
        if (!journal) {
            return;
        }

        setSelectedJournal(journal);
        setIsDetailOpen(true);
    };

    const closeDetailModal = () => {
        if (isDeletingJournal) {
            return;
        }

        setIsDetailOpen(false);
        setSelectedJournal(null);
    };

    const handleEditRequest = (journal) => {
        if (!journal) {
            return;
        }

        setSelectedJournal(journal);
        setEditingJournal(journal);
        setIsDetailOpen(false);
        setIsEditModalOpen(true);
    };

    const handleUpdateJournal = async ({ title, content, startDate, endDate, progress }) => {
        if (!editingJournal || isUpdatingJournal) {
            return false;
        }

        const authToken = localStorage.getItem('token');
        if (!authToken) {
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
            progress: clampPercent(progress ?? editingJournal.progress ?? 0),
        };

        try {
            setIsUpdatingJournal(true);

            const res = await fetch(`http://localhost:8000/api/journals/${editingJournal.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
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

            const updatedJournal = ensureProgressValue(await res.json(), payload.progress);
            setJournals((prevJournals) => {
                const previous = Array.isArray(prevJournals) ? prevJournals : [];
                return previous.map((journal) => (journal.id === updatedJournal.id ? updatedJournal : journal));
            });
            setSelectedJournal(updatedJournal);
            setEditingJournal(null);
            setIsEditModalOpen(false);
            setIsDetailOpen(true);
            return true;
        } catch (error) {
            console.error('Gagal memperbarui jurnal:', error);
            return false;
        } finally {
            setIsUpdatingJournal(false);
        }
    };

    const requestDeleteJournal = (journal) => {
        if (!journal) {
            return;
        }

        setDeleteError('');
        setJournalPendingDeletion(journal);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (isDeletingJournal) {
            return;
        }

        setIsDeleteModalOpen(false);
        setJournalPendingDeletion(null);
    };

    const handleDeleteJournal = async () => {
        if (!journalPendingDeletion || isDeletingJournal) {
            return;
        }

        const authToken = localStorage.getItem('token');
        if (!authToken) {
            navigate('/login');
            return;
        }

        try {
            setIsDeletingJournal(true);
            setDeleteError('');

            const res = await fetch(`http://localhost:8000/api/journals/${journalPendingDeletion.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    navigate('/login');
                }

                const errorBody = await res.json().catch(() => ({}));
                const backendMessage = typeof errorBody?.message === 'string' && errorBody.message.trim()
                    ? errorBody.message
                    : journalCopy.deleteErrors.generic;
                setDeleteError(backendMessage);
                return;
            }

            setJournals((prevJournals) => {
                const previous = Array.isArray(prevJournals) ? prevJournals : [];
                return previous.filter((item) => item.id !== journalPendingDeletion.id);
            });
            setSelectedJournal(null);
            setEditingJournal(null);
            setIsDetailOpen(false);
            setIsDeleteModalOpen(false);
            setJournalPendingDeletion(null);
        } catch (error) {
            console.error('Gagal menghapus jurnal:', error);
            setDeleteError(journalCopy.deleteErrors.network);
        } finally {
            setIsDeletingJournal(false);
        }
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);

        if (editingJournal) {
            setSelectedJournal(editingJournal);
            setIsDetailOpen(true);
        }

        setEditingJournal(null);
    };

    const totalJournals = Array.isArray(journals) ? journals.length : 0;
    const journalDays = useMemo(() => {
        const set = new Set();
        if (Array.isArray(journals)) {
            journals.forEach((entry) => {
                const parsed = parseJournalDateValue(entry.start_date ?? entry.startDate ?? entry.date);
                if (parsed) {
                    set.add(parsed.toDateString());
                }
            });
        }
        return set.size;
    }, [journals]);

    const latestJournal = totalJournals > 0 ? journals[0] : null;

    useEffect(() => {
        if (!selectedJournal || !Array.isArray(journals)) {
            return;
        }

        const fresh = journals.find((journal) => journal.id === selectedJournal.id);
        if (fresh && fresh !== selectedJournal) {
            setSelectedJournal(fresh);
            return;
        }

        if (!fresh) {
            setSelectedJournal(null);
            setIsDetailOpen(false);
        }
    }, [journals, selectedJournal]);

    return (
        <>
            <div className="space-y-8">
                <header className="flex flex-col gap-4 rounded-3xl border border-emerald-100/70 bg-white/85 p-6 shadow-md shadow-emerald-500/5 backdrop-blur md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        <Archive size={14} />
                        <span>{journalCopy.header.badge}</span>
                    </div>
                    <h1 className="mt-3 text-2xl font-bold text-emerald-800 md:text-3xl">{journalCopy.header.title}</h1>
                    <p className="mt-2 text-sm text-gray-600 md:max-w-xl">
                        {journalCopy.header.description}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="grid grid-cols-1 gap-3 sm:w-40">
                        <StatBadge label={journalCopy.stats.totalLabel} value={totalJournals} />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-700"
                    >
                        <PlusCircle size={18} />
                        <span>{journalCopy.actions.write}</span>
                    </button>
                </div>
            </header>

            {totalJournals > 0 ? (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-4">
                        {journals.map((journal) => {
                            const progress = computeJournalProgress(journal, journalCopy.progressLabels);
                            const isOverdue = isJournalOverdue(journal);

                            return (
                            <article
                                key={journal.id}
                                onClick={() => handleJournalClick(journal)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        handleJournalClick(journal);
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={journalCopy.accessibility.viewJournal.replace(':title', journal.title ?? '')}
                                className={`group flex items-start justify-between gap-6 rounded-3xl border ${isOverdue ? 'border-red-200 bg-red-50/90 shadow-md shadow-red-200/70' : 'border-transparent bg-white/90'} p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400`}
                            >
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-700">{journal.title}</h3>
                                    <p className="mt-2 line-clamp-3 text-sm text-gray-500">{journal.content}</p>
                                    {progress && (
                                        <div className="mt-4">
                                            <div className={`mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                                                <span>{isOverdue ? journalCopy.card.overdueBadge : progress.label}</span>
                                                <span>{progress.percent}%</span>
                                            </div>
                                            <JournalProgressBar percent={progress.percent} isOverdue={isOverdue} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-xs font-semibold text-emerald-600">
                                    <CalendarDays size={16} />
                                    <span>{formatJournalPeriodForDisplay(
                                        journal.start_date ?? journal.startDate,
                                        journal.end_date ?? journal.endDate,
                                        journal.date,
                                        locale
                                    )}</span>
                                </div>
                            </article>
                            );
                        })}
                    </div>

                    <aside className="space-y-4 rounded-3xl border border-emerald-100/70 bg-white/85 p-5 shadow-lg shadow-emerald-500/5 backdrop-blur">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-600">
                            <p className="text-xs uppercase tracking-wide text-gray-400">{journalCopy.sidebar.lastWrittenLabel}</p>
                            <p className="mt-2 font-semibold text-gray-800">{latestJournal?.title ?? journalCopy.sidebar.lastWrittenEmpty}</p>
                            <p className="text-xs text-gray-500">{latestJournal ? formatJournalPeriodForDisplay(
                                latestJournal.start_date ?? latestJournal.startDate,
                                latestJournal.end_date ?? latestJournal.endDate,
                                latestJournal.date,
                                locale
                            ) : '-'}</p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 text-sm text-emerald-700">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                                <Sparkles size={14} />
                                <span>{journalCopy.sidebar.tipsTitle}</span>
                            </div>
                            <p className="mt-3 leading-relaxed">
                                {journalCopy.sidebar.tipsDescription}
                            </p>
                        </div>
                    </aside>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/70 px-6 py-16 text-center text-sm text-emerald-700">
                    <CalendarDays size={42} className="mb-4 text-emerald-500" />
                    <p className="max-w-sm text-base text-gray-600">
                        {journalCopy.emptyState.description}
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        type="button"
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
                    >
                        <PlusCircle size={18} />
                        <span>{journalCopy.emptyState.cta}</span>
                    </button>
                </div>
            )}

            <JournalDetailModal
                isOpen={isDetailOpen}
                journal={selectedJournal}
                onClose={closeDetailModal}
                onEdit={handleEditRequest}
                onDelete={requestDeleteJournal}
                isDeleting={isDeletingJournal}
            />

            <Modaljournal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddJournal}
                heading={journalCopy.modals.createTitle}
                submitLabel={journalCopy.modals.createSubmit}
            />

            <Modaljournal
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                onSubmit={handleUpdateJournal}
                initialValues={editingJournal ? {
                    title: editingJournal.title ?? '',
                    content: editingJournal.content ?? '',
                    startDate: editingJournal.start_date ?? editingJournal.startDate ?? editingJournal.date,
                    endDate: editingJournal.end_date ?? editingJournal.endDate ?? editingJournal.start_date ?? editingJournal.startDate ?? editingJournal.date,
                    progress: editingJournal.progress ?? 0,
                } : undefined}
                heading={journalCopy.modals.editTitle}
                submitLabel={journalCopy.modals.editSubmit}
            />

                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    title={journalCopy.modals.deleteTitle}
                    description={
                        journalPendingDeletion?.title
                            ? journalCopy.modals.deleteDescriptionWithTitle.replace(':title', journalPendingDeletion.title)
                            : journalCopy.modals.deleteDescription
                    }
                    confirmText={journalCopy.modals.deleteConfirm}
                    cancelText={journalCopy.modals.deleteCancel}
                    processingText={t('common.processing', 'Memproses...')}
                    onConfirm={handleDeleteJournal}
                    onCancel={closeDeleteModal}
                    isConfirming={isDeletingJournal}
                    errorMessage={deleteError}
                    variant="danger"
                />
            </div>
            <Footer />
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

function computeJournalProgress(journal, labels = {}) {
    if (!journal || typeof journal !== 'object') {
        return null;
    }

    const labelCopy = {
        completed: labels.completed ?? 'Selesai',
        notStarted: labels.notStarted ?? 'Belum dimulai',
        inProgress: labels.inProgress ?? 'Sedang berlangsung',
    };

    if (journal.progress != null && !Number.isNaN(Number(journal.progress))) {
        const percent = clampPercent(journal.progress);
        const label = percent >= 100 ? labelCopy.completed : percent <= 0 ? labelCopy.notStarted : labelCopy.inProgress;
        return { percent, label };
    }

    const start = parseJournalDateValue(journal.start_date ?? journal.startDate ?? journal.date);
    if (!start) {
        return null;
    }

    const endCandidate = parseJournalDateValue(journal.end_date ?? journal.endDate);
    const end = endCandidate && endCandidate.getTime() >= start.getTime() ? endCandidate : start;

    const today = new Date();
    const total = end.getTime() - start.getTime();

    if (total <= 0) {
        const finished = today.getTime() >= end.getTime();
        return {
            percent: finished ? 100 : 0,
            label: finished ? labelCopy.completed : labelCopy.notStarted,
        };
    }

    const clampedTime = Math.min(Math.max(today.getTime(), start.getTime()), end.getTime());
    const progressValue = Math.round(((clampedTime - start.getTime()) / total) * 100);
    const percent = Math.max(0, Math.min(100, progressValue));
    const label = percent >= 100 ? labelCopy.completed : percent <= 0 ? labelCopy.notStarted : labelCopy.inProgress;

    return { percent, label };
}

function JournalProgressBar({ percent, isOverdue = false }) {
    const safePercent = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));

    return (
        <div className={`h-2 w-full rounded-full ${isOverdue ? 'bg-red-100/60' : 'bg-emerald-100/60'}`}>
            <div
                className={`h-full rounded-full transition-all ${isOverdue ? 'bg-gradient-to-r from-red-500 via-red-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-400'}`}
                style={{ width: `${safePercent}%` }}
            />
        </div>
    );
}

function StatBadge({ label, value }) {
    return (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500">{label}</p>
            <p className="text-lg font-semibold text-emerald-700">{value}</p>
        </div>
    );
}

function formatJournalPeriodForDisplay(startValue, endValue, fallbackValue, locale = 'id-ID') {
    const start = parseJournalDateValue(startValue) || parseJournalDateValue(fallbackValue);
    const end = parseJournalDateValue(endValue) || start;
    const safeLocale = typeof locale === 'string' && locale.trim() ? locale : 'id-ID';

    if (!start) {
        return fallbackValue ?? '-';
    }

    if (!end || end.getTime() === start.getTime() || end.getTime() < start.getTime()) {
        return formatDateForHuman(start, safeLocale);
    }

    return `${formatDateForHuman(start, safeLocale)} - ${formatDateForHuman(end, safeLocale)}`;
}

function parseJournalDateValue(value) {
    if (!value && value !== 0) {
        return null;
    }

    if (value instanceof Date) {
        const time = value.getTime();
        return Number.isNaN(time) ? null : new Date(value);
    }

    if (typeof value === 'number') {
        const dateFromNumber = new Date(value);
        return Number.isNaN(dateFromNumber.getTime()) ? null : dateFromNumber;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return null;
        }

        const direct = new Date(trimmed);
        if (!Number.isNaN(direct.getTime())) {
            return direct;
        }
    }

    return null;
}

function formatDateForHuman(input, locale = 'id-ID') {
    const date = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    const safeLocale = typeof locale === 'string' && locale.trim() ? locale : 'id-ID';

    return date.toLocaleDateString(safeLocale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function clampPercent(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round(numeric)));
}

function isJournalOverdue(journal) {
    if (!journal || typeof journal !== 'object') {
        return false;
    }

    const rawProgress = journal.progress;
    if (rawProgress == null || Number.isNaN(Number(rawProgress))) {
        return false;
    }

    const end = parseJournalDateValue(
        journal.end_date ??
        journal.endDate ??
        journal.finish_date ??
        journal.finishDate ??
        journal.start_date ??
        journal.startDate ??
        journal.date
    );

    if (!end) {
        return false;
    }

    const now = new Date();
    if (now.getTime() <= end.getTime()) {
        return false;
    }

    return clampPercent(rawProgress) < 100;
}

function ensureProgressValue(journal, fallbackProgress) {
    if (!journal || typeof journal !== 'object') {
        return journal;
    }

    if (journal.progress == null && fallbackProgress != null) {
        return { ...journal, progress: clampPercent(fallbackProgress) };
    }

    return journal;
}

function applyRealtimeJournalChange(previousList, payload) {
    const action = payload?.action;
    const journalData = payload?.journal;

    const current = Array.isArray(previousList) ? [...previousList] : [];

    if (!action || !journalData) {
        return current;
    }

    if (action === 'deleted') {
        if (journalData.id == null) {
            return current;
        }

        return current.filter((item) => item?.id !== journalData.id);
    }

    if (journalData.id == null) {
        return current;
    }

    const normalized = ensureProgressValue(journalData, journalData.progress ?? 0);
    const withoutTarget = current.filter((item) => item?.id !== normalized.id);

    return sortJournalsByIdDesc([normalized, ...withoutTarget]);
}

function sortJournalsByIdDesc(list) {
    return [...(Array.isArray(list) ? list : [])].sort((first = {}, second = {}) => {
        const firstId = typeof first.id === 'number' ? first.id : 0;
        const secondId = typeof second.id === 'number' ? second.id : 0;
        return secondId - firstId;
    });
}
