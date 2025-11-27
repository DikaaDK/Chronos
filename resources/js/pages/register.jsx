import React, { useState } from "react";
import axios from "axios";
import {
    ArrowRight,
    AtSign,
    CheckCircle2,
    Compass,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Sparkles,
    User,
} from "lucide-react";

const REGISTER_HIGHLIGHTS = [
    {
        icon: CheckCircle2,
        title: "Checklist sinkron",
        description: "Bagikan packing list dan tugas tim yang selalu ter-update real-time.",
    },
    {
        icon: Compass,
        title: "Itinerary adaptif",
        description: "Susun perjalanan cerdas dengan pengingat aktivitas dan waktu istirahat.",
    },
    {
        icon: Sparkles,
        title: "Jurnal refleksi",
        description: "Catat highlight dan mood perjalanan agar mudah dibaca ulang kapan saja.",
    },
];

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage("");
        setLoading(true);

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/register", {
                name,
                email,
                password,
                password_confirmation: confirmPassword,
            });

            localStorage.setItem("token", response.data.token);
            setSuccessMessage("Pendaftaran berhasil! Kamu akan diarahkan ke halaman login...");

            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
        } catch (err) {
            const validationErrors = err.response?.data?.errors;
            if (validationErrors) {
                setError(validationErrors);
            } else {
                setError({ general: ["Terjadi kesalahan. Coba kembali sebentar lagi."] });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),rgba(15,23,42,0.95))]" />
            <div className="pointer-events-none absolute -top-28 right-[15%] h-80 w-80 rounded-full bg-indigo-500/25 blur-[150px]" />
            <div className="pointer-events-none absolute -bottom-40 left-[10%] h-96 w-96 rounded-full bg-sky-500/18 blur-[170px]" />

            <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
                <section className="relative w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_55px_140px_-70px_rgba(37,99,235,0.55)] backdrop-blur">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                    <div className="relative grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className="hidden flex-col justify-between border-b border-white/10 bg-gradient-to-br from-blue-700/80 via-indigo-600/65 to-slate-900/85 p-10 text-slate-50 lg:flex">
                            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-100/85">
                                <span className="flex items-center gap-2">
                                    <Sparkles size={15} /> Chronos Onboarding
                                </span>
                                <span className="text-blue-100/75">Durasi ±3 menit</span>
                            </div>

                            <div className="space-y-6">
                                <h1 className="text-3xl font-semibold leading-snug">Registrasi ringkas untuk mengatur perjalanan bersama tim.</h1>
                                <p className="text-sm text-blue-100/80">
                                    Aktifkan akses ke itinerary kolaboratif, pengingat energi, serta jurnal perjalanan yang siap diakses kapan saja.
                                </p>
                                <div className="space-y-4">
                                    {REGISTER_HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
                                        <div
                                            key={title}
                                            className="rounded-2xl border border-white/20 bg-white/10 p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-400/20 text-sky-100">
                                                    <Icon size={16} />
                                                </span>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{title}</p>
                                                    <p className="text-xs text-blue-100/80">{description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-blue-100/80">
                                <Sparkles size={14} /> 14.700 traveler sudah memulai
                            </div>
                        </aside>

                        <div className="flex flex-col gap-8 p-7 sm:p-10">
                            <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-200">
                                <span className="flex items-center gap-2 text-sky-200">
                                    <Sparkles size={14} /> Chronos Access
                                </span>
                                <span className="text-[10px] font-medium text-slate-400/80">Versi 2.5 · Stabil</span>
                            </div>

                            <header className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300/80">Mulai sekarang</p>
                                <h2 className="text-3xl font-semibold text-white">Bangun akun Chronos untuk perjalanan yang lebih mindful.</h2>
                                <p className="text-sm text-slate-400">
                                    Dengan satu akun kamu dapat menyimpan itinerary, membagi checklist tim, dan merekam refleksi perjalanan secara terstruktur.
                                </p>
                            </header>

                            {successMessage && (
                                <div className="rounded-2xl border border-sky-400/40 bg-sky-500/15 px-4 py-3 text-sm font-medium text-sky-100">
                                    {successMessage}
                                </div>
                            )}

                            {error?.general && (
                                <div className="rounded-2xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-200">
                                    {error.general[0]}
                                </div>
                            )}

                            <form className="space-y-5" onSubmit={handleRegister}>
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Nama lengkap
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300">
                                            <User size={16} />
                                        </span>
                                        <input
                                            id="name"
                                            type="text"
                                            placeholder="Nama lengkap"
                                            value={name}
                                            onChange={(event) => setName(event.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-12 text-sm text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/30"
                                            autoComplete="name"
                                            required
                                        />
                                    </div>
                                    {error?.name && <p className="text-xs text-red-300">{error.name[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300">
                                            <AtSign size={16} />
                                        </span>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="kamu@chronos.app"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-12 text-sm text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/30"
                                            autoComplete="email"
                                            required
                                        />
                                    </div>
                                    {error?.email && <p className="text-xs text-red-300">{error.email[0]}</p>}
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
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Minimal 8 karakter"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-12 pr-12 text-sm text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/30"
                                            autoComplete="new-password"
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
                                    {error?.password && <p className="text-xs text-red-300">{error.password[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Konfirmasi password
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300">
                                            <Lock size={16} />
                                        </span>
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Masukkan ulang password"
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-12 pr-12 text-sm text-white outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/30"
                                            autoComplete="new-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-sky-200"
                                            aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {error?.password_confirmation && (
                                        <p className="text-xs text-red-300">{error.password_confirmation[0]}</p>
                                    )}
                                </div>

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
                                            Daftar & mulai
                                            <ArrowRight size={16} />
                                        </span>
                                    )}
                                </button>
                            </form>

                            <footer className="text-center text-xs text-slate-400">
                                Sudah punya akun?
                                <a href="/" className="ml-1 font-semibold text-sky-300 hover:text-sky-200">
                                    Masuk sekarang
                                </a>
                            </footer>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

