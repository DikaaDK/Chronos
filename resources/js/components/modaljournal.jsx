import React, { useEffect, useMemo, useState } from "react";
import { X, NotebookPen } from "lucide-react";

export default function Modaljournal({
    isOpen,
    onClose,
    onSubmit,
    initialValues = { title: "", content: "", startDate: "", endDate: "", progress: 0 },
    heading = "Tambah Jurnal",
    submitLabel = "Simpan",
}) {
    const [titleValue, setTitleValue] = useState(initialValues.title ?? "");
    const [contentValue, setContentValue] = useState(initialValues.content ?? "");
    const [startDateValue, setStartDateValue] = useState(initialValues.startDate ?? initialValues.start_date ?? "");
    const [endDateValue, setEndDateValue] = useState(initialValues.endDate ?? initialValues.end_date ?? "");
    const [progressValue, setProgressValue] = useState(normalizeProgress(initialValues.progress));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contentLength, setContentLength] = useState(0);
    const defaultStartDateValue = useMemo(() => getTodayForInput(), []);

    useEffect(() => {
        if (isOpen) {
            setTitleValue(initialValues.title ?? "");
            setContentValue(initialValues.content ?? "");
            setContentLength((initialValues.content ?? "").length);
            const incomingStart = initialValues.startDate ?? initialValues.start_date ?? "";
            const normalizedStart = incomingStart ? normalizeDateInput(incomingStart) : getTodayForInput();
            const incomingEnd = initialValues.endDate ?? initialValues.end_date ?? incomingStart ?? "";
            const normalizedEnd = incomingEnd ? normalizeDateInput(incomingEnd) : normalizedStart;
            setStartDateValue(normalizedStart);
            setEndDateValue(normalizedEnd);
            setProgressValue(normalizeProgress(initialValues.progress));
        }
    }, [isOpen, initialValues.title, initialValues.content, initialValues.startDate, initialValues.start_date, initialValues.endDate, initialValues.end_date, initialValues.progress]);

    useEffect(() => {
        if (!startDateValue) {
            return;
        }

        if (!endDateValue || endDateValue < startDateValue) {
            setEndDateValue(startDateValue);
        }
    }, [startDateValue, endDateValue]);

    const handleClose = () => {
        if (!isSubmitting) {
            onClose?.();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!onSubmit || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const result = await onSubmit({
                title: titleValue.trim(),
                content: contentValue.trim(),
                startDate: startDateValue || getTodayForInput(),
                endDate: endDateValue || startDateValue || getTodayForInput(),
                progress: normalizeProgress(progressValue),
            });

            if (result === false) {
                return;
            }

            setTitleValue("");
            setContentValue("");
            setContentLength(0);
            setStartDateValue(defaultStartDateValue);
            setEndDateValue(defaultStartDateValue);
            setProgressValue(0);
            onClose?.();
        } catch (error) {
            console.error("Gagal menyimpan jurnal:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
            <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-emerald-100 bg-white/95 shadow-2xl transition-all">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl" />
                <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-emerald-100/60 blur-3xl" />

                <div className="relative flex items-center justify-between gap-3 px-6 py-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-500/10 via-white to-white">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                            <NotebookPen size={22} />
                        </span>
                
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">{heading}</h2>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        disabled={isSubmitting}
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="relative px-6 py-5 space-y-5">
                    <div className="grid gap-4 rounded-2xl bg-emerald-50/60 p-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-emerald-900">Mulai</label>
                            <input
                                type="date"
                                value={startDateValue || defaultStartDateValue}
                                onChange={(event) => setStartDateValue(event.target.value)}
                                className="w-full rounded-xl border border-emerald-200 bg-white/80 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-emerald-900">Selesai</label>
                            <input
                                type="date"
                                value={endDateValue || startDateValue || defaultStartDateValue}
                                onChange={(event) => setEndDateValue(event.target.value)}
                                className="w-full rounded-xl border border-emerald-200 bg-white/80 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                min={startDateValue || defaultStartDateValue}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 rounded-2xl bg-white/70 p-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-emerald-900">Progress</label>
                            <span className="text-sm font-semibold text-emerald-600">{normalizeProgress(progressValue)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={normalizeProgress(progressValue)}
                            onChange={(event) => setProgressValue(Number(event.target.value))}
                            className="w-full accent-emerald-500"
                            disabled={isSubmitting}
                        />
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={normalizeProgress(progressValue)}
                            onChange={(event) => setProgressValue(Number(event.target.value))}
                            className="w-full rounded-xl border border-emerald-200 bg-white/80 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700">Judul</label>    
                        </div>
                        <input
                            type="text"
                            value={titleValue}
                            onChange={(event) => setTitleValue(event.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            placeholder="Judul jurnal kamu..."
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700">Isi</label>
                            <span className="text-xs text-gray-400">{contentLength} karakter</span>
                        </div>
                        <textarea
                            rows="6"
                            value={contentValue}
                            onChange={(event) => {
                                setContentValue(event.target.value);
                                setContentLength(event.target.value.length);
                            }}
                            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            placeholder="Tulis ceritamu di sini..."
                            required
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    <div className="flex items-center justify-end gap-2 rounded-2xl bg-gray-50 px-4 py-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                            disabled={isSubmitting}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={
                                isSubmitting ||
                                titleValue.trim().length === 0 ||
                                contentValue.trim().length === 0 ||
                                !startDateValue ||
                                !endDateValue
                            }
                        >
                            {isSubmitting ? "Menyimpan..." : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function getTodayForInput() {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().slice(0, 10);
}

function normalizeDateInput(value) {
    if (!value) {
        return getTodayForInput();
    }

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return getTodayForInput();
    }

    parsed.setMinutes(parsed.getMinutes() - parsed.getTimezoneOffset());
    return parsed.toISOString().slice(0, 10);
}

function normalizeProgress(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return 0;
    }

    if (numeric < 0) {
        return 0;
    }

    if (numeric > 100) {
        return 100;
    }

    return Math.round(numeric);
}
