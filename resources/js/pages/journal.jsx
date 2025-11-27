import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, CalendarDays, Archive, Sparkles } from 'lucide-react';
import Modaljournal from '../components/modaljournal';
import JournalDetailModal from '../components/journalDetailModal';

export default function Journal() {
    const navigate = useNavigate();
    const [journals, setJournals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingJournal, setEditingJournal] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdatingJournal, setIsUpdatingJournal] = useState(false);
    const [isDeletingJournal, setIsDeletingJournal] = useState(false);
    const token = localStorage.getItem('token');

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

                    throw new Error(`Gagal memuat data (${res.status})`);
                }

                const data = await res.json();
                setJournals(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Gagal mengambil data:', err);
            }
        };

        if (token) fetchJournals();
    }, [token]);

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
                throw new Error('Gagal menyimpan jurnal');
            }

            const savedJournal = await res.json();
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

            const updatedJournal = await res.json();
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

    const handleDeleteJournal = async (journal) => {
        if (!journal || isDeletingJournal) {
            return;
        }

        const confirmDelete = window.confirm('Yakin ingin menghapus jurnal ini?');
        if (!confirmDelete) {
            return;
        }

        const authToken = localStorage.getItem('token');
        if (!authToken) {
            navigate('/login');
            return;
        }

        try {
            setIsDeletingJournal(true);

            const res = await fetch(`http://localhost:8000/api/journals/${journal.id}`, {
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

                await res.json().catch(() => ({}));
                return;
            }

            setJournals((prevJournals) => {
                const previous = Array.isArray(prevJournals) ? prevJournals : [];
                return previous.filter((item) => item.id !== journal.id);
            });
            setSelectedJournal(null);
            setEditingJournal(null);
            setIsDetailOpen(false);
        } catch (error) {
            console.error('Gagal menghapus jurnal:', error);
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

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4 rounded-3xl border border-emerald-100/70 bg-white/85 p-6 shadow-md shadow-emerald-500/5 backdrop-blur md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        <Archive size={14} />
                        <span>Arsip pribadi</span>
                    </div>
                    <h1 className="mt-3 text-2xl font-bold text-emerald-800 md:text-3xl">Jurnal Harian</h1>
                    <p className="mt-2 text-sm text-gray-600 md:max-w-xl">
                        Jelajahi catatan yang sudah kamu tulis, edit seperlunya, dan pantau progres emosimu dari hari ke hari.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="grid grid-cols-2 gap-3 sm:w-52">
                        <StatBadge label="Total jurnal" value={totalJournals} />
                        <StatBadge label="Hari aktif" value={journalDays} />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-700"
                    >
                        <PlusCircle size={18} />
                        <span>Tulis Jurnal</span>
                    </button>
                </div>
            </header>

            {totalJournals > 0 ? (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-4">
                        {journals.map((journal) => {
                            const progress = computeJournalProgress(journal);

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
                                aria-label={`Lihat detail jurnal ${journal.title}`}
                                className="group flex items-start justify-between gap-6 rounded-3xl border border-transparent bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                            >
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-700">{journal.title}</h3>
                                    <p className="mt-2 line-clamp-3 text-sm text-gray-500">{journal.content}</p>
                                    {progress && (
                                        <div className="mt-4">
                                            <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                <span>{progress.label}</span>
                                                <span>{progress.percent}%</span>
                                            </div>
                                            <JournalProgressBar percent={progress.percent} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-xs font-semibold text-emerald-600">
                                    <CalendarDays size={16} />
                                    <span>{formatJournalPeriodForDisplay(
                                        journal.start_date ?? journal.startDate,
                                        journal.end_date ?? journal.endDate,
                                        journal.date
                                    )}</span>
                                </div>
                            </article>
                            );
                        })}
                    </div>

                    <aside className="space-y-4 rounded-3xl border border-emerald-100/70 bg-white/85 p-5 shadow-lg shadow-emerald-500/5 backdrop-blur">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-600">
                            <p className="text-xs uppercase tracking-wide text-gray-400">Terakhir ditulis</p>
                            <p className="mt-2 font-semibold text-gray-800">{latestJournal?.title ?? 'Belum ada jurnal'}</p>
                            <p className="text-xs text-gray-500">{latestJournal ? formatJournalPeriodForDisplay(
                                latestJournal.start_date ?? latestJournal.startDate,
                                latestJournal.end_date ?? latestJournal.endDate,
                                latestJournal.date
                            ) : '-'}</p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 text-sm text-emerald-700">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                                <Sparkles size={14} />
                                <span>Tips cepat</span>
                            </div>
                            <p className="mt-3 leading-relaxed">
                                Gunakan modal detail untuk mengedit atau menghapus jurnal tanpa meninggalkan halaman ini.
                            </p>
                        </div>
                    </aside>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/70 px-6 py-16 text-center text-sm text-emerald-700">
                    <CalendarDays size={42} className="mb-4 text-emerald-500" />
                    <p className="max-w-sm text-base text-gray-600">
                        Belum ada jurnal yang tersimpan. Awali cerita pertamamu dengan menekan tombol "Tulis Jurnal".
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        type="button"
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
                    >
                        <PlusCircle size={18} />
                        <span>Tulis Jurnal</span>
                    </button>
                </div>
            )}

            <JournalDetailModal
                isOpen={isDetailOpen}
                journal={selectedJournal}
                onClose={closeDetailModal}
                onEdit={handleEditRequest}
                onDelete={handleDeleteJournal}
                isDeleting={isDeletingJournal}
            />

            <Modaljournal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddJournal}
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
                heading="Edit Jurnal"
                submitLabel="Perbarui"
            />
        </div>
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

function computeJournalProgress(journal) {
    if (!journal || typeof journal !== 'object') {
        return null;
    }

    if (journal.progress != null && !Number.isNaN(Number(journal.progress))) {
        const percent = clampPercent(journal.progress);
        const label = percent >= 100 ? 'Selesai' : percent <= 0 ? 'Belum dimulai' : 'Sedang berlangsung';
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
            label: finished ? 'Selesai' : 'Belum dimulai',
        };
    }

    const clampedTime = Math.min(Math.max(today.getTime(), start.getTime()), end.getTime());
    const progressValue = Math.round(((clampedTime - start.getTime()) / total) * 100);
    const percent = Math.max(0, Math.min(100, progressValue));
    const label = percent >= 100 ? 'Selesai' : percent <= 0 ? 'Belum dimulai' : 'Sedang berlangsung';

    return { percent, label };
}

function JournalProgressBar({ percent }) {
    const safePercent = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));

    return (
        <div className="h-2 w-full rounded-full bg-emerald-100/60">
            <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-400 transition-all"
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

function formatJournalPeriodForDisplay(startValue, endValue, fallbackValue) {
    const start = parseJournalDateValue(startValue) || parseJournalDateValue(fallbackValue);
    const end = parseJournalDateValue(endValue) || start;

    if (!start) {
        return fallbackValue ?? '-';
    }

    if (!end || end.getTime() === start.getTime() || end.getTime() < start.getTime()) {
        return formatDateForHuman(start);
    }

    return `${formatDateForHuman(start)} - ${formatDateForHuman(end)}`;
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

function formatDateForHuman(date) {
    return date.toLocaleDateString('id-ID', {
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
