import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    AtSign,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Sparkles,
} from "lucide-react";
import { useLocalization } from "../context/LocalizationContext";

const REMEMBER_EMAIL_KEY = "chronos-remember-email";
const TRAVEL_HIGHLIGHT_ENTRIES = [
    {
        icon: Sparkles,
        key: "auth.login.highlights.itinerary",
        fallback: "Template itinerary adaptif untuk city break, road trip, atau slow travel.",
    },
    {
        icon: Sparkles,
        key: "auth.login.highlights.destinations",
        fallback: "Simpan highlight destinasi favorit dan tandai mood tiap lokasi.",
    },
    {
        icon: Sparkles,
        key: "auth.login.highlights.mood",
        fallback: "Mood journaling harian dengan insight perjalanan otomatis tersusun.",
    },
];

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { applyUserLocale, t } = useLocalization();

    const loginCopy = useMemo(() => ({
        badge: {
            left: t("auth.login.badge.left", "Chronos Login"),
        },
        hero: {
            title: t("auth.login.hero.title", "Masuk untuk mulai menulis cerita perjalananmu."),
        },
        form: {
            emailLabel: t("auth.login.form.email_label", "Email"),
            emailPlaceholder: t("auth.login.form.email_placeholder", "Chronos@gmail.com"),
            passwordLabel: t("auth.login.form.password_label", "Password"),
            passwordPlaceholder: t("auth.login.form.password_placeholder", "••••••••"),
            remember: t("auth.login.form.remember", "Ingat saya"),
            forgot: t("auth.login.form.forgot", "Lupa password?"),
            submit: t("auth.login.form.submit", "Masuk sekarang"),
            processing: t("auth.login.form.processing", "Memproses..."),
        },
        togglePassword: {
            show: t("auth.login.form.show_password", "Tampilkan password"),
            hide: t("auth.login.form.hide_password", "Sembunyikan password"),
        },
        errors: {
            validation: t("auth.login.errors.validation", "Lengkapi semua form dengan benar."),
            credentials: t("auth.login.errors.credentials", "Email atau password salah."),
            server: t("auth.login.errors.server", "Terjadi kesalahan server."),
        },
        footer: {
            question: t("auth.login.footer.question", "Belum punya akun?"),
            cta: t("auth.login.footer.cta", "Daftar gratis sekarang"),
        },
    }), [t]);

    const travelHighlights = useMemo(() => (
        TRAVEL_HIGHLIGHT_ENTRIES.map(({ icon, key, fallback }) => ({
            icon,
            text: t(key, fallback),
        }))
    ), [t]);

    useEffect(() => {
        const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (event) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/login", {
                email,
                password,
            });

            const { user, token } = response.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            if (rememberMe) {
                localStorage.setItem(REMEMBER_EMAIL_KEY, email);
            } else {
                localStorage.removeItem(REMEMBER_EMAIL_KEY);
            }

            await applyUserLocale(user?.locale);
            window.location.href = "/home";
        } catch (err) {
            const validationErrors = err.response?.data?.errors;
            if (validationErrors && typeof validationErrors === "object") {
                const firstKey = Object.keys(validationErrors)[0];
                const firstMessage = Array.isArray(validationErrors[firstKey]) ? validationErrors[firstKey][0] : null;
                setError(firstMessage ?? loginCopy.errors.validation);
            } else if (err.response?.status === 401) {
                setError(loginCopy.errors.credentials);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(loginCopy.errors.server);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-scree px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <div className="mx-auto w-full max-w-xl rounded-3xl border border-emerald-100 bg-white/95 p-8 shadow-xl shadow-emerald-900/5 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/90">
                <div className="mb-8 space-y-3 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                        <Sparkles size={12} /> {loginCopy.badge.left}
                    </span>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{loginCopy.hero.title}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-300">{loginCopy.hero.description}</p>
                </div>

                <form className="space-y-5" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                            {loginCopy.form.emailLabel}
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                <AtSign size={16} />
                            </span>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="Chronos@gmail.com"
                                className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 pl-12 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                            {loginCopy.form.passwordLabel}
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                <Lock size={16} />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder={loginCopy.form.passwordPlaceholder}
                                className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 pl-12 pr-12 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-emerald-500 dark:text-slate-300"
                                aria-label={showPassword ? loginCopy.togglePassword.hide : loginCopy.togglePassword.show}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-300">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(event) => setRememberMe(event.target.checked)}
                                className="h-4 w-4 rounded border-emerald-200 text-emerald-600 focus:ring-emerald-400 dark:border-slate-600"
                            />
                            {loginCopy.form.remember}
                        </label>
                        <a
                            href="/forgot-password"
                            className="font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-300"
                        >
                            {loginCopy.form.forgot}
                        </a>
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-100">
                            {error}
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
                                {loginCopy.form.processing}
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                {loginCopy.form.submit}
                                <ArrowRight size={16} />
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-8 space-y-4 text-center text-xs text-slate-500 dark:text-slate-300">
                    <p>
                        {loginCopy.footer.question}
                        <a href="/register" className="ml-1 font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-300">
                            {loginCopy.footer.cta}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
