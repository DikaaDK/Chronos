import React, { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const MONTH_LABELS = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function JournalCalendarModal({ isOpen, onClose, dateJournalMap = {} }) {
    const [viewDate, setViewDate] = useState(() => new Date());

    useEffect(() => {
        if (isOpen) {
            setViewDate(new Date());
        }
    }, [isOpen]);

    const todayKey = useMemo(() => formatDateKey(new Date()), []);

    const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
    const monthLabel = MONTH_LABELS[viewDate.getMonth()];
    const yearLabel = viewDate.getFullYear();
    const monthJournals = useMemo(() => collectMonthJournals(dateJournalMap, viewDate), [dateJournalMap, viewDate]);

    const handlePrevMonth = () => {
        setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-3">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md sm:max-w-lg md:max-w-2xl relative animate-[scaleIn_0.2s_ease-out]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Kalender Jurnal</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-4 py-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="sm:w-[55%] lg:w-1/2">
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="rounded-full p-1.5 text-emerald-600 hover:bg-emerald-50 transition"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="text-sm font-semibold text-gray-700">
                                    {monthLabel} {yearLabel}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="rounded-full p-1.5 text-emerald-600 hover:bg-emerald-50 transition"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1.5 text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                                {DAY_LABELS.map((label) => (
                                    <div key={label} className="text-center">{label}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1.5">
                                {calendarDays.map((day) => {
                                    const dateKey = formatDateKey(day.date);
                                    const dateData = day.inCurrentMonth ? dateJournalMap[dateKey] : undefined;
                                    const hasJournal = Boolean(dateData?.count);
                                    const journalTitles = dateData?.journals ?? [];
                                    const isToday = dateKey === todayKey;
                                    const dayNumber = day.date.getDate();

                                    let cellClasses = 'flex flex-col items-center justify-start aspect-square rounded-lg text-[11px] transition select-none p-0.5';

                                    if (day.inCurrentMonth) {
                                        cellClasses += ' bg-white text-gray-700';
                                    } else {
                                        cellClasses += ' bg-gray-50 text-gray-300';
                                    }

                                    if (hasJournal) {
                                        cellClasses += ' border-2 border-emerald-500 text-emerald-600 font-semibold bg-emerald-50 shadow-sm';
                                    } else if (isToday) {
                                        cellClasses += ' border border-emerald-300 text-emerald-600 font-semibold bg-emerald-50';
                                    } else {
                                        cellClasses += ' border border-transparent';
                                    }

                                    return (
                                        <div
                                            key={`${dateKey}-${day.inCurrentMonth ? 'in' : 'out'}`}
                                            className="relative"
                                        >
                                            <div className={cellClasses}>
                                                <span className="text-[11px] font-semibold leading-none">{dayNumber}</span>
                                                {hasJournal && (
                                                    <div className="mt-0.5 w-full text-center text-[9px] font-medium leading-tight text-emerald-700">
                                                        {journalTitles.slice(0, 2).map((journal, index) => (
                                                            <div key={`${dateKey}-${journal.id ?? index}`} className="truncate">
                                                                {journal.title}
                                                            </div>
                                                        ))}
                                                        {journalTitles.length > 2 && (
                                                            <div className="text-[8px] text-emerald-500">
                                                                +{journalTitles.length - 2} lainnya
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 sm:flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Jurnal bulan ini</p>
                                    <p className="text-sm font-semibold text-gray-800">{monthLabel} {yearLabel}</p>
                                </div>
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                                    {monthJournals.length} jurnal
                                </span>
                            </div>

                            <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto pr-1">
                                {monthJournals.length ? (
                                    monthJournals.map((journal) => (
                                        <div
                                            key={`month-${journal.id}`}
                                            className="flex items-start gap-2 px-1.5 py-0.5"
                                        >
                                            <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-gray-800">{journal.title}</p>
                                                <div className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-500">
                                                    <CalendarDays size={10} className="text-emerald-500" />
                                                    <span>{formatJournalPeriodForDisplay(journal.startDate, journal.endDate, journal.fallbackDate)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed border-gray-200 bg-white px-3 py-4 text-center text-xs text-gray-500">
                                        Belum ada jurnal pada bulan ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function buildCalendarDays(anchorDate) {
    const year = anchorDate.getFullYear();
    const month = anchorDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const firstWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    if (firstWeekday > 0) {
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let index = firstWeekday - 1; index >= 0; index -= 1) {
            const dayNumber = prevMonthLastDay - index;
            days.push({
                date: new Date(year, month - 1, dayNumber),
                inCurrentMonth: false,
            });
        }
    }

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
        days.push({
            date: new Date(year, month, dayNumber),
            inCurrentMonth: true,
        });
    }

    while (days.length < 42) {
        const lastDate = days[days.length - 1].date;
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + 1);
        days.push({
            date: nextDate,
            inCurrentMonth: false,
        });
    }

    return days;
}

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

function collectMonthJournals(dateJournalMap, anchorDate) {
    if (!anchorDate || !(anchorDate instanceof Date)) {
        return [];
    }

    const targetYear = anchorDate.getFullYear();
    const targetMonth = anchorDate.getMonth();
    const unique = new Map();

    Object.entries(dateJournalMap).forEach(([key, data]) => {
        if (!data || !Array.isArray(data.journals) || data.journals.length === 0) {
            return;
        }

        const [yearStr, monthStr] = key.split('-');
        const year = parseInt(yearStr, 10);
        const monthIndex = parseInt(monthStr, 10) - 1;

        if (year !== targetYear || monthIndex !== targetMonth) {
            return;
        }

        data.journals.forEach((journal) => {
            if (!journal) {
                return;
            }

            const existing = unique.get(journal.id);
            if (!existing) {
                unique.set(journal.id, journal);
            }
        });
    });

    return Array.from(unique.values());
}
