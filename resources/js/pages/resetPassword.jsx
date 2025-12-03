import axios from "axios";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useLocalization } from "../context/LocalizationContext";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

export default function ResetPassword() {
    const { t } = useLocalization();
    const [searchParams] = useSearchParams();
    const defaultEmail = searchParams.get("email") ?? "";
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const copy = useMemo(() => ({
        badge: t("auth.reset.badge", "Reset password aman"),
        title: t("auth.reset.title", "Buat password baru"),
        description: t("auth.reset.description", "Password baru akan menggantikan akses lama kamu. Gunakan kombinasi yang kuat dan mudah diingat."),
        passwordLabel: t("auth.reset.password_label", "Password baru"),
        confirmLabel: t("auth.reset.confirm_label", "Konfirmasi password"),
        placeholder: t("auth.reset.password_placeholder", "Minimal 8 karakter"),
        submit: t("auth.reset.submit", "Ubah password"),
        processing: t("auth.reset.processing", "Menyimpan password..."),
        success: t("auth.reset.success", "Password berhasil diperbarui. Silakan login kembali."),
        invalidLink: t("auth.reset.invalid", "Tautan reset password tidak valid atau sudah kedaluwarsa."),
    }), [t]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!token || !defaultEmail) {
            setError(copy.invalidLink);
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${apiBaseUrl}/reset-password`, {
                email: defaultEmail,
                token,
                password,
                password_confirmation: passwordConfirmation,
            });
            setSuccess(copy.success);
            setPassword("");
            setPasswordConfirmation("");
        } catch (err) {
            const message = err.response?.data?.message
                ?? err.response?.data?.errors?.password?.[0]
                ?? err.response?.data?.errors?.token?.[0]
                ?? copy.invalidLink;
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl rounded-3xl border border-emerald-100 bg-white/95 p-8 text-slate-900 shadow-xl shadow-emerald-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:text-white">
            <div className="mb-8 space-y-3 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                    <ShieldCheck size={14} /> {copy.badge}
                </span>
                <h1 className="text-2xl font-semibold">{copy.title}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-300">{copy.description}</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        {copy.passwordLabel}
                    </label>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                            <Lock size={16} />
                        </span>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder={copy.placeholder}
                            minLength={8}
                            required
                            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 pl-12 pr-12 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-emerald-500 dark:text-slate-300"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="password_confirmation" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        {copy.confirmLabel}
                    </label>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                            <Lock size={16} />
                        </span>
                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type={showConfirmation ? "text" : "password"}
                            value={passwordConfirmation}
                            onChange={(event) => setPasswordConfirmation(event.target.value)}
                            placeholder={copy.placeholder}
                            minLength={8}
                            required
                            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 pl-12 pr-12 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmation((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-emerald-500 dark:text-slate-300"
                        >
                            {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
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

            <div className="mt-8 flex flex-col items-center gap-3 text-sm">
                <a
                    href="/"
                    className="inline-flex items-center gap-2 font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-300"
                >
                    <ArrowLeft size={16} />
                    {t("auth.reset.back", "Kembali ke login")}
                </a>
                {!token || !defaultEmail ? (
                    <a
                        href="/forgot-password"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-500 dark:text-slate-300"
                    >
                        {t("auth.reset.request_again", "Butuh tautan baru?")} ↗
                    </a>
                ) : null}
            </div>
        </div>
    );
}
