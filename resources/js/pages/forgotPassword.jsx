import axios from "axios";
import { useMemo, useState } from "react";
import { ArrowLeft, AtSign, Loader2, MailCheck } from "lucide-react";
import { useLocalization } from "../context/LocalizationContext";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

export default function ForgotPassword() {
    const { t } = useLocalization();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const copy = useMemo(() => ({
        badge: t("auth.forgot.badge", "Reset akses Chronos"),
        title: t("auth.forgot.title", "Lupa password Chronos?"),
        description: t("auth.forgot.description", "Masukkan email yang kamu gunakan. Kami akan mengirim tautan aman untuk membuat password baru."),
        emailLabel: t("auth.forgot.email_label", "Email terdaftar"),
        emailPlaceholder: t("auth.forgot.email_placeholder", "chronos@gmail.com"),
        submit: t("auth.forgot.submit", "Kirim tautan reset"),
        processing: t("auth.forgot.processing", "Mengirim email..."),
        back: t("auth.forgot.back", "Kembali ke login"),
        success: t("auth.forgot.success", "Kami sudah mengirim tautan reset password. Cek inbox atau folder spam kamu."),
        genericError: t("auth.forgot.error", "Tidak dapat mengirim tautan reset. Coba lagi."),
    }), [t]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            await axios.post(`${apiBaseUrl}/forgot-password`, {
                email,
                redirect_url: `${window.location.origin}/reset-password`,
            });
            setSuccess(copy.success);
        } catch (err) {
            const message = err.response?.data?.message
                ?? err.response?.data?.errors?.email?.[0]
                ?? copy.genericError;
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl rounded-3xl border border-emerald-100 bg-white/95 p-8 text-slate-900 shadow-xl shadow-emerald-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:text-white">
            <div className="mb-8 space-y-3 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                    <MailCheck size={14} /> {copy.badge}
                </span>
                <h1 className="text-2xl font-semibold">{copy.title}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-300">{copy.description}</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        {copy.emailLabel}
                    </label>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                            <AtSign size={16} />
                        </span>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder={copy.emailPlaceholder}
                            required
                            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 pl-12 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-100">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100">
                        {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:bg-emerald-500 ${
                        loading ? "cursor-not-allowed opacity-80" : "hover:bg-emerald-500"
                    }`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {copy.processing}
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            {copy.submit}
                        </span>
                    )}
                </button>
            </form>

            <a
                href="/"
                className="mt-8 inline-flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-300"
            >
                <ArrowLeft size={16} /> {copy.back}
            </a>
        </div>
    );
}
