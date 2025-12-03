import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PlusCircle, BookOpen, CalendarDays } from 'lucide-react';
import Modaljournal from '../components/modaljournal';
import JournalCalendarModal from '../components/journalCalendar';
import JournalDetailModal from '../components/journalDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import Footer from '../components/Footer';
import { useLocalization } from '../context/LocalizationContext';

export default function Home() {
    const navigate = useNavigate();
    const { t, locale } = useLocalization();
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [journals, setJournals] = useState([]);
    const [isLoadingJournals, setIsLoadingJournals] = useState(false);
    const [journalsError, setJournalsError] = useState(null);
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingJournal, setEditingJournal] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdatingJournal, setIsUpdatingJournal] = useState(false);
    const [isDeletingJournal, setIsDeletingJournal] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [journalPendingDeletion, setJournalPendingDeletion] = useState(null);
    const [deleteError, setDeleteError] = useState('');

    const fetchJournals = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }

        try {
            setIsLoadingJournals(true);
            setJournalsError(null);

            const res = await fetch('http://localhost:8000/api/journals', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    throw new Error(t('home.errors.session_expired', 'Sesi berakhir, silakan login ulang.'));
                }

                throw new Error(
                    t('home.errors.load_failed', 'Gagal memuat jurnal (:status)').replace(':status', res.status)
                );
            }

            const data = await res.json();
            setJournals(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Gagal mengambil jurnal:', error);
            setJournalsError(error.message || t('home.errors.generic_load', 'Tidak dapat memuat jurnal.'));
        } finally {
            setIsLoadingJournals(false);
        }
    }, [navigate, t]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        axios
            .get("http://127.0.0.1:8000/api/user", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setUser(res.data);
                fetchJournals();
            })
            .catch((err) => {
                console.error("Gagal ambil data user:", err);
                localStorage.removeItem("token");
                navigate("/login");
            });
    }, [navigate, fetchJournals]);

    useEffect(() => {
        if (!user?.id) {
            return undefined;
        }

        const token = localStorage.getItem('token');
        const getEchoInstance = typeof window !== 'undefined' ? window.getEchoInstance : null;

        if (!token || typeof getEchoInstance !== 'function') {
            return undefined;
        }

        const echo = getEchoInstance(token);

        if (!echo) {
            return undefined;
        }

        const channelKey = `journals.${user.id}`;
        const privateChannelKey = `private-${channelKey}`;
        const channel = echo.private(channelKey);

        const handleRealtimeChange = (payload) => {
            setJournals((prev) => applyRealtimeJournalChange(prev, payload));
        };

        channel.listen('.JournalUpdated', handleRealtimeChange);

        return () => {
            channel.stopListening('.JournalUpdated');
            echo.leave(privateChannelKey);
        };
    }, [user?.id]);

    const untitledJournalLabel = t('home.defaults.untitled_journal', 'Jurnal tanpa judul');
    const deleteGenericErrorMessage = t('home.delete_modal.error_generic', 'Gagal menghapus jurnal.');
    const deleteNetworkErrorMessage = t('home.delete_modal.error_network', 'Terjadi kesalahan jaringan. Coba lagi.');
    const journalDateMap = useMemo(
        () => buildJournalDateMap(journals, untitledJournalLabel),
        [journals, untitledJournalLabel]
    );

    const handleAddJournal = async ({ title, content, startDate, endDate, progress }) => {
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
            progress: clampPercent(progress ?? 0),
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

            const savedJournal = ensureProgressValue(await res.json(), payload.progress);
            setJournals((prevJournals) => {
                const previous = Array.isArray(prevJournals) ? prevJournals : [];
                const withoutDuplicate = savedJournal && savedJournal.id != null
                    ? previous.filter((journal) => journal.id !== savedJournal.id)
                    : previous;
                return [savedJournal, ...withoutDuplicate];
            });
            await fetchJournals();
            return true;
        } catch (error) {
            console.error('Gagal menambahkan jurnal:', error);
            return false;
        } finally {
            setIsSubmitting(false);
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
            progress: clampPercent(progress ?? editingJournal.progress ?? 0),
        };

        try {
            setIsUpdatingJournal(true);

            const res = await fetch(`http://localhost:8000/api/journals/${editingJournal.id}`, {
                method: 'PUT',
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

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setIsDeletingJournal(true);
            setDeleteError('');

            const res = await fetch(`http://localhost:8000/api/journals/${journalPendingDeletion.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
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
                    : deleteGenericErrorMessage;
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
            setDeleteError(deleteNetworkErrorMessage);
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
            setIsDetailOpen(false);
            setSelectedJournal(null);
        }
    }, [journals, selectedJournal]);

    return (
        <>
            <div className="space-y-10 pb-24">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-emerald-700 tracking-tight">{t('app.name', 'Chronos')}</h1>
                <div className="inline-block px-4 py-1 mt-2 mb-3 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                    {user
                        ? t('home.hero.welcome_user', 'Selamat datang, :name 👋').replace(':name', user.name ?? '')
                        : t('home.hero.welcome_generic', 'Selamat datang')}
                </div>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">
                    {t('home.hero.subtitle', 'Catat cerita harianmu dengan tenang')}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-12">
                <ButtonOption
                    icon={<PlusCircle size={30} />}
                    label={t('home.actions.add', 'Tambah')}
                    color="emerald"
                    onClick={() => setIsModalOpen(true)}
                />
                <ButtonOption
                    icon={<BookOpen size={30} />}
                    label={t('home.actions.journal', 'Jurnal')}
                    color="emerald"
                    onClick={() => navigate('/journal')}
                />
                <ButtonOption
                    icon={<CalendarDays size={30} />}
                    label={t('home.actions.calendar', 'Kalender')}
                    color="emerald"
                    onClick={() => setIsCalendarOpen(true)}
                />
            </div>

            <section className="mb-12">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{t('home.sections.latest.title', 'Jurnal Terbaru')}</h2>
                    {journals.length > 0 && (
                        <button
                            type="button"
                            onClick={() => navigate('/journal')}
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
                        >
                            {t('home.sections.latest.view_all', 'Lihat semua')}
                        </button>
                    )}
                </div>

                {journalsError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {journalsError}
                    </div>
                )}

                {isLoadingJournals ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className="h-20 rounded-xl bg-white shadow animate-pulse"
                            />
                        ))}
                    </div>
                ) : journals.length > 0 ? (
                    <div className="space-y-4">
                        {journals.slice(0, 5).map((journal) => {
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
                                aria-label={t('home.accessibility.view_journal', 'Lihat detail jurnal :title').replace(':title', journal.title ?? '')}
                                className={`rounded-xl p-4 shadow hover:shadow-lg transition flex justify-between items-start border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${isOverdue ? 'bg-red-50/80 border-red-200 shadow-red-100' : 'bg-white border-gray-100'}`}
                            >
                                <div className="pr-3">
                                    <h3 className={`font-semibold mb-1 line-clamp-1 ${isOverdue ? 'text-red-700' : 'text-gray-800'}`}>{journal.title}</h3>
                                    <p className={`text-sm line-clamp-3 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>{journal.content}</p>
                                </div>
                                <div className={`flex flex-col items-end text-right text-xs ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                                    <CalendarDays size={14} className={`mb-1 ${isOverdue ? 'text-red-500' : 'text-emerald-500'}`} />
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
                ) : (
                    <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 px-5 py-8 text-center text-sm text-emerald-600">
                        <p className="font-semibold">{t('home.sections.latest.empty.title', 'Tidak ada journal yang tersimpan.')}</p>
                        <p className="mt-1 text-emerald-600">{t('home.sections.latest.empty.description', 'Mulai tulis cerita pertamamu!')}</p>
                    </div>
                )}
            </section>

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
                heading={t('home.edit_modal.title', 'Edit Jurnal')}
                submitLabel={t('home.edit_modal.submit', 'Perbarui')}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title={t('home.delete_modal.title', 'Hapus jurnal?')}
                description={
                    journalPendingDeletion?.title
                        ? t('home.delete_modal.description_with_title', 'Jurnal ":title" akan dihapus permanen.').replace(':title', journalPendingDeletion.title)
                        : t('home.delete_modal.description', 'Jurnal ini akan dihapus permanen.')
                }
                confirmText={t('home.delete_modal.confirm', 'Hapus')}
                cancelText={t('home.delete_modal.cancel', 'Batal')}
                processingText={t('common.processing', 'Memproses...')}
                onConfirm={handleDeleteJournal}
                onCancel={closeDeleteModal}
                isConfirming={isDeletingJournal}
                errorMessage={deleteError}
                variant="danger"
            />

            <JournalCalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                dateJournalMap={journalDateMap}
            />
            </div>
            <Footer />
        </>
    );
}

function ButtonOption({ icon, label, color, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 active:scale-95`}
        >
            <div
                className={`text-${color}-600 bg-${color}-50 rounded-full p-2 mb-1 flex items-center justify-center`}
            >
                {icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </button>
    );
}

function applyRealtimeJournalChange(previousList, payload) {
    const action = payload?.action;
    const journalData = payload?.journal;

    if (!action || !journalData) {
        return previousList;
    }

    const current = Array.isArray(previousList) ? [...previousList] : [];

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
    return [...list].sort((first = {}, second = {}) => {
        const firstId = typeof first.id === 'number' ? first.id : 0;
        const secondId = typeof second.id === 'number' ? second.id : 0;
        return secondId - firstId;
    });
}

function buildJournalDateMap(journalList, untitledLabel = 'Jurnal tanpa judul') {
    const map = {};

    if (!Array.isArray(journalList)) {
        return map;
    }

    for (const journal of journalList) {
        const range = extractJournalDateRange(journal);
        if (!range) {
            continue;
        }

        const start = stripTime(range.start);
        const end = stripTime(range.end);
        const startValue = journal.start_date ?? journal.startDate ?? journal.date ?? formatDateKey(start);
        const endValue = journal.end_date ?? journal.endDate ?? journal.finish_date ?? journal.finishDate ?? startValue ?? formatDateKey(end);
        const journalInfo = {
            id: journal.id ?? journal.slug ?? `${journal.title ?? 'journal'}-${formatDateKey(start)}`,
            title: (journal.title ?? untitledLabel).trim() || untitledLabel,
            startDate: startValue,
            endDate: endValue,
            fallbackDate: journal.date ?? startValue,
        };

        for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
            const key = formatDateKey(cursor);
            if (!map[key]) {
                map[key] = { count: 0, journals: [] };
            }
            map[key].count += 1;
            map[key].journals.push(journalInfo);
        }
    }

    return map;
}

function extractJournalDateRange(journal) {
    if (!journal || typeof journal !== 'object') {
        return null;
    }

    const start = findFirstValidDate([
        journal.start_date,
        journal.startDate,
        journal.date,
        journal.journal_date,
        journal.entry_date,
        journal.created_at,
    ]);

    if (!start) {
        return null;
    }

    const end = findFirstValidDate([
        journal.end_date,
        journal.endDate,
        journal.finish_date,
        journal.finishDate,
        journal.date,
        journal.updated_at,
    ]) || start;

    if (end.getTime() < start.getTime()) {
        return { start, end: start };
    }

    return { start, end };
}

function findFirstValidDate(candidates) {
    if (!Array.isArray(candidates)) {
        return null;
    }

    for (const candidate of candidates) {
        const parsed = parseJournalDateValue(candidate);
        if (parsed) {
            return parsed;
        }
    }

    return null;
}

function stripTime(input) {
    const date = new Date(input);
    date.setHours(0, 0, 0, 0);
    return date;
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

        const normalized = trimmed.replace(/,/g, '');
        const parts = normalized.split(/\s+/);

        if (parts.length >= 3) {
            const dayCandidate = parseInt(parts[0], 10);
            const monthCandidate = getMonthIndex(parts[1]);
            const yearCandidate = parseInt(parts[2], 10);

            if (
                !Number.isNaN(dayCandidate) &&
                typeof monthCandidate === 'number' &&
                !Number.isNaN(yearCandidate)
            ) {
                const parsed = new Date(yearCandidate, monthCandidate, dayCandidate);
                if (!Number.isNaN(parsed.getTime())) {
                    return parsed;
                }
            }
        }
    }

    return null;
}

function getMonthIndex(token) {
    if (!token) {
        return undefined;
    }

    const cleaned = token
        .toString()
        .toLowerCase()
        .replace(/\./g, '');

    return MONTH_ALIASES[cleaned];
}

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const MONTH_ALIASES = {
    jan: 0,
    januari: 0,
    january: 0,
    feb: 1,
    februari: 1,
    february: 1,
    mar: 2,
    maret: 2,
    march: 2,
    apr: 3,
    april: 3,
    mei: 4,
    may: 4,
    jun: 5,
    juni: 5,
    june: 5,
    jul: 6,
    juli: 6,
    july: 6,
    agu: 7,
    agt: 7,
    agustus: 7,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    okt: 9,
    oct: 9,
    oktober: 9,
    october: 9,
    nov: 10,
    november: 10,
    des: 11,
    dec: 11,
    desember: 11,
    december: 11,
};

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

function formatJournalPeriodForDisplay(startValue, endValue, fallbackValue, locale = 'id-ID') {
    const start = parseJournalDateValue(startValue) || parseJournalDateValue(fallbackValue);
    const end = parseJournalDateValue(endValue) || start;
    const safeLocale = typeof locale === 'string' && locale.trim() ? locale : 'id-ID';

    if (!start) {
        return fallbackValue ?? '-';
    }

    if (!end || end.getTime() === start.getTime()) {
        return formatDateForHuman(start, safeLocale);
    }

    if (end.getTime() < start.getTime()) {
        return formatDateForHuman(start, safeLocale);
    }

    return `${formatDateForHuman(start, safeLocale)} - ${formatDateForHuman(end, safeLocale)}`;
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

function ensureProgressValue(journal, fallbackProgress) {
    if (!journal || typeof journal !== 'object') {
        return journal;
    }

    if (journal.progress == null && fallbackProgress != null) {
        return { ...journal, progress: clampPercent(fallbackProgress) };
    }

    return journal;
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
