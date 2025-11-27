import React, { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function JournalCalendarModal({ isOpen, onClose, dateCounts = {} }) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md sm:max-w-lg md:max-w-xl relative animate-[scaleIn_0.25s_ease-out]">
                <div className="flex items-center justify-between px-5 py-4 md:px-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Kalender Jurnal</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-5 py-5 md:px-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="rounded-full p-2 text-emerald-600 hover:bg-emerald-50 transition"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="text-base font-semibold text-gray-700">
                            {monthLabel} {yearLabel}
                        </div>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="rounded-full p-2 text-emerald-600 hover:bg-emerald-50 transition"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        {DAY_LABELS.map((label) => (
                            <div key={label} className="text-center">{label}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2 md:gap-1.5">
                        {calendarDays.map((day) => {
                            const dateKey = formatDateKey(day.date);
                            const hasJournal = day.inCurrentMonth && Boolean(dateCounts[dateKey]);
                            const isToday = dateKey === todayKey;
                            const dayNumber = day.date.getDate();

                            let cellClasses = 'flex items-center justify-center aspect-square rounded-xl text-sm transition select-none';

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
                                <div key={`${dateKey}-${day.inCurrentMonth ? 'in' : 'out'}`} className="relative">
                                    <div className={cellClasses}>{dayNumber}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-xl border-2 border-emerald-500 bg-emerald-50" />
                            <span>Hari dengan jurnal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-xl border border-emerald-300 bg-emerald-50" />
                            <span>Hari ini</span>
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
