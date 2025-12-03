import React from "react";
import { AlertTriangle, X } from "lucide-react";

const VARIANT_STYLE = {
    danger: {
        iconWrapper: "bg-red-100 text-red-600",
        confirmButton: "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500",
        confirmText: "text-red-50",
    },
    warning: {
        iconWrapper: "bg-amber-100 text-amber-600",
        confirmButton: "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400",
        confirmText: "text-white",
    },
    info: {
        iconWrapper: "bg-emerald-100 text-emerald-600",
        confirmButton: "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500",
        confirmText: "text-white",
    },
};

export default function ConfirmModal({
    isOpen,
    title = "Konfirmasi",
    description = "Yakin ingin melanjutkan tindakan ini?",
    confirmText = "Ya",
    cancelText = "Batal",
    onConfirm,
    onCancel,
    isConfirming = false,
    variant = "danger",
    errorMessage = "",
    processingText = "Memproses...",
}) {
    if (!isOpen) {
        return null;
    }

    const style = VARIANT_STYLE[variant] ?? VARIANT_STYLE.danger;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                <button
                    type="button"
                    onClick={onCancel}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    aria-label="Tutup konfirmasi"
                    disabled={isConfirming}
                >
                    <X size={16} />
                </button>

                <div className="px-6 pt-6 pb-4 text-center">
                    <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${style.iconWrapper}`}>
                        <AlertTriangle size={28} />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-gray-900">{title}</h2>
                    <p className="mt-2 text-sm text-gray-600">{description}</p>
                    {errorMessage && (
                        <p className="mt-3 text-sm font-semibold text-red-600">{errorMessage}</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:opacity-60"
                        disabled={isConfirming}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-2 ${style.confirmButton}`}
                        disabled={isConfirming}
                    >
                        {isConfirming ? processingText : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
