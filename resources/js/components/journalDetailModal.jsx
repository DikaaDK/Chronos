import React, { useMemo } from 'react';
import { X, CalendarDays, Pencil, Trash2 } from 'lucide-react';

export default function JournalDetailModal({
    isOpen,
    journal,
    onClose,
    onEdit,
    onDelete,
    isDeleting = false,
}) {
    const periodLabel = useMemo(() => formatJournalPeriodForDisplay(
        journal?.start_date ?? journal?.startDate,
        journal?.end_date ?? journal?.endDate,
        journal?.date
    ), [journal]);

    const startLabel = useMemo(() => formatDateForHuman(journal?.start_date ?? journal?.startDate ?? journal?.date), [journal]);
    const endLabel = useMemo(() => formatDateForHuman(journal?.end_date ?? journal?.endDate ?? journal?.start_date ?? journal?.startDate ?? journal?.date), [journal]);
    const createdLabel = useMemo(() => formatDateTimeForHuman(journal?.created_at), [journal]);
    const updatedLabel = useMemo(() => formatDateTimeForHuman(journal?.updated_at), [journal]);
    const progressSummary = useMemo(() => computeProgressSummary(journal), [journal]);
    const progressPercent = progressSummary?.percent ?? 0;
    const progressLabel = progressSummary?.label ?? 'Belum dimulai';
    const isOverdue = useMemo(() => isJournalOverdue(journal), [journal]);

    if (!isOpen || !journal) {
        return null;
    }

    const handleEditClick = () => {
        onEdit?.(journal);
    };

    const handleDeleteClick = () => {
        onDelete?.(journal);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative animate-[scaleIn_0.25s_ease-out]">
                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-1 line-clamp-2">{journal.title}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <CalendarDays size={16} className="text-emerald-500" />
                            <span>{periodLabel}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                        aria-label="Tutup detail jurnal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-6">
                    <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400">Mulai</p>
                                <p className="font-semibold text-gray-700">{startLabel}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-gray-400">Selesai</p>
                                <p className="font-semibold text-gray-700">{endLabel}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-2xl border p-4 space-y-3 ${isOverdue ? 'border-red-100 bg-red-50/80' : 'border-emerald-100 bg-emerald-50/70'}`}>
                        <div className="flex items-center justify-between">
                            <p className={`text-xs font-semibold uppercase tracking-wide ${isOverdue ? 'text-red-500' : 'text-emerald-500'}`}>{isOverdue ? 'Lewat batas waktu' : 'Progress'}</p>
                            <span className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-emerald-600'}`}>{progressPercent}%</span>
                        </div>
                        <div className={`h-2 w-full rounded-full ${isOverdue ? 'bg-red-100/60' : 'bg-emerald-100/60'}`}>
                            <div
                                className={`h-full rounded-full transition-all ${isOverdue ? 'bg-gradient-to-r from-red-500 via-red-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-400'}`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isOverdue ? 'text-red-500' : 'text-emerald-500'}`}>{isOverdue ? 'Segera perbarui progres' : progressLabel}</p>
                        <p className={`text-xs ${isOverdue ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isOverdue ? 'Progres belum selesai padahal sudah melewati tanggal selesai.' : 'Gunakan tombol Edit untuk memperbarui progres.'}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase text-gray-400 mb-2">Catatan</p>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">
                            {journal.content}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400">
                        <div>
                            <span className="font-medium uppercase">Dibuat</span>
                            <p>{createdLabel}</p>
                        </div>
                        <div>
                            <span className="font-medium uppercase">Diperbarui</span>
                            <p>{updatedLabel}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-white transition"
                    >
                        Tutup
                    </button>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleEditClick}
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-2"
                        >
                            <Pencil size={16} />
                            <span>Edit</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                            className="px-4 py-2 rounded-lg bg-red-100 text-red-600 text-sm font-medium hover:bg-red-200 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Trash2 size={16} />
                            <span>{isDeleting ? 'Menghapus...' : 'Hapus'}</span>
                        </button>
                    </div>
                </div>
            </div>
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

function computeProgressSummary(journal) {
    if (!journal || typeof journal !== 'object') {
        return null;
    }

    if (journal.progress != null && !Number.isNaN(Number(journal.progress))) {
        const percent = clampPercent(journal.progress);
        return {
            percent,
            label: getProgressLabel(percent),
        };
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
        const percent = finished ? 100 : 0;
        return {
            percent,
            label: getProgressLabel(percent),
        };
    }

    const clampedTime = Math.min(Math.max(today.getTime(), start.getTime()), end.getTime());
    const rawPercent = Math.round(((clampedTime - start.getTime()) / total) * 100);
    const percent = Math.max(0, Math.min(100, rawPercent));

    return {
        percent,
        label: getProgressLabel(percent),
    };
}

function clampPercent(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round(numeric)));
}

function getProgressLabel(percent) {
    if (percent >= 100) {
        return 'Selesai';
    }

    if (percent <= 0) {
        return 'Belum dimulai';
    }

    return 'Sedang berlangsung';
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

function formatDateForHuman(value) {
    const parsed = parseJournalDateValue(value);
    if (!parsed) {
        return '-';
    }

    return parsed.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function formatDateTimeForHuman(value) {
    const parsed = parseJournalDateValue(value);
    if (!parsed) {
        return '-';
    }

    return parsed.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
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
