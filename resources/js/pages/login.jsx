import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    ArrowRight,
    AtSign,
    Compass,
    Eye,
    EyeOff,
    Facebook,
    Github,
    Loader2,
    Lock,
    MapPin,
    Plane,
    Sparkles,
} from "lucide-react";

const REMEMBER_EMAIL_KEY = "chronos-remember-email";
const TRAVEL_HIGHLIGHTS = [
    {
        icon: Compass,
        text: "Template itinerary adaptif untuk city break, road trip, atau slow travel.",
    },
    {
        icon: MapPin,
        text: "Simpan highlight destinasi favorit dan tandai mood tiap lokasi.",
    },
    {
        icon: Sparkles,
        text: "Mood journaling harian dengan insight perjalanan otomatis tersusun.",
    },
];

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

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

            window.location.href = "/home";
        } catch (err) {
            const validationErrors = err.response?.data?.errors;
            if (validationErrors && typeof validationErrors === "object") {
                const firstKey = Object.keys(validationErrors)[0];
                const firstMessage = Array.isArray(validationErrors[firstKey]) ? validationErrors[firstKey][0] : null;
                setError(firstMessage ?? "Lengkapi semua form dengan benar.");
            } else if (err.response?.status === 401) {
                setError("Email atau password salah.");
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Terjadi kesalahan server.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),rgba(15,23,42,0.96))]" />
            <div className="pointer-events-none absolute -top-32 left-[12%] h-80 w-80 rounded-full bg-sky-500/20 blur-[140px]" />
            <div className="pointer-events-none absolute -bottom-40 right-[14%] h-96 w-96 rounded-full bg-indigo-500/25 blur-[170px]" />

            <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
                <section className="relative w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_55px_140px_-70px_rgba(37,99,235,0.55)] backdrop-blur">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                    <div className="relative grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className="hidden flex-col justify-between border-b border-white/10 bg-gradient-to-br from-blue-700/80 via-indigo-600/65 to-slate-900/85 p-10 text-slate-50 lg:flex">
                            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-100/85">
                                <span className="flex items-center gap-2">
                                    <Plane size={15} /> Chronos Travel
                                </span>
                                <span className="text-blue-100/75">Sejak 2022</span>
                            </div>

                            <div className="space-y-6">
                                <h1 className="text-3xl font-semibold leading-snug">Ruang kerja biru untuk menemani ritme perjalananmu.</h1>
                                <p className="text-sm text-blue-100/80">
                                    Kelola itinerary, mood tracker, dan highlight destinasi favorit dalam satu dashboard yang responsif.
                                </p>
                                <div className="space-y-3 text-sm text-blue-100/90">
                                    {TRAVEL_HIGHLIGHTS.map(({ icon: Icon, text }) => (
                                        <div
                                            key={text}
                                            className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3"
                                        >
                                            <Icon size={16} className="text-sky-200" />
                                            <span>{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-blue-100/80">
                                <Sparkles size={14} /> 2.3k travel writers aktif
                            </div>
                        </aside>

                        <div className="flex flex-col gap-8 p-7 sm:p-10">
                            <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-200">
                                <span className="flex items-center gap-2 text-sky-200">
                                    <Sparkles size={14} /> Chronos Login
                                </span>
                                <span className="text-[10px] font-medium text-slate-400/80">Terproteksi · 24/7</span>
                            </div>

                            <header className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300/80">Selamat datang</p>
                                <h2 className="text-3xl font-semibold text-white">Masuk untuk mulai menulis cerita perjalananmu.</h2>
                                <p className="text-sm text-slate-400">
                                    Pantau itinerary, catatan mood, dan insight destinasi langsung dari dashboard Chronos.
                                </p>
                            </header>

                            <form className="space-y-5" onSubmit={handleLogin}>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300">
                                            <AtSign size={16} />
                                        </span>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            placeholder="kamu@chronos.app"
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-12 text-sm text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/30"
                                            autoComplete="email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300">
                                            <Lock size={16} />
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            placeholder="••••••••"
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-12 pr-12 text-sm text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/30"
                                            autoComplete="current-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-sky-200"
                                            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(event) => setRememberMe(event.target.checked)}
                                            className="h-4 w-4 rounded border-white/20 bg-transparent text-sky-400 focus:ring-sky-400/50"
                                        />
                                        Ingat saya
                                    </label>
                                    <a
                                        href="/forgot-password"
                                        className="font-semibold text-sky-300 transition hover:text-sky-200"
                                    >
                                        Lupa password?
                                    </a>
                                </div>

                                {error && (
                                    <div className="rounded-2xl border border-red-400/40 bg-red-500/12 px-4 py-3 text-sm font-medium text-red-200">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition focus:outline-none focus:ring-4 focus:ring-sky-400/40 ${
                                        loading ? "cursor-not-allowed opacity-80" : "hover:brightness-110"
                                    }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Memproses...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            Masuk sekarang
                                            <ArrowRight size={16} />
                                        </span>
                                    )}
                                </button>
                            </form>

                            <div className="space-y-4 text-xs text-slate-400">
                                <div className="flex items-center gap-3">
                                    <span className="h-px flex-1 bg-white/10" />
                                    atau lanjutkan dengan
                                    <span className="h-px flex-1 bg-white/10" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/10"
                                    >
                                        <Facebook size={16} />
                                        Facebook
                                    </button>
                                    <button
                                        type="button"
                                        className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/10"
                                    >
                                        <Github size={16} />
                                        GitHub
                                    </button>
                                </div>
                            </div>

                            <footer className="text-center text-xs text-slate-400">
                                Belum punya akun?
                                <a href="/register" className="ml-1 font-semibold text-sky-300 hover:text-sky-200">
                                    Daftar gratis sekarang
                                </a>
                            </footer>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
