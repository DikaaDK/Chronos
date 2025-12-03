import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    User,
} from "lucide-react";

export default function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setGeneralError("");
        setFieldErrors({});
        setSuccessMessage("");
        setIsSubmitting(true);

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
                navigate("/", { replace: true });
            }, 2000);
        } catch (error) {
            const res = error.response;
            if (res?.data?.errors) {
                setFieldErrors(res.data.errors);
                return;
            }
            setGeneralError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <div className="mx-auto w-full max-w-xl rounded-3xl border border-emerald-100 bg-white/95 p-8 shadow-xl shadow-emerald-900/5 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/90">
                <div className="mb-8 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                        CHRONOS
                    </span>
                    <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">Buat akun Chronos</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-300">Mulai kelola jurnal, kalender, dan grup perjalananmu.</p>
                </div>

                {successMessage && (
                    <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-100">
                        {successMessage}
                    </div>
                )}

                {generalError && (
                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-200">
                        {generalError}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleRegister}>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                        Nama lengkap
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                            <User size={16} />
                                        </span>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Nama lengkap"
                                            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 pl-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                    {fieldErrors.name && (
                                        <p className="text-xs text-red-500 dark:text-red-300">{fieldErrors.name[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                            <Mail size={16} />
                                        </span>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="chronos@email.com"
                                            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 pl-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                    {fieldErrors.email && (
                                        <p className="text-xs text-red-500 dark:text-red-300">{fieldErrors.email[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                            <Lock size={16} />
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 pl-12 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-emerald-500 dark:text-slate-300"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {fieldErrors.password && (
                                        <p className="text-xs text-red-500 dark:text-red-300">{fieldErrors.password[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                                        Konfirmasi password
                                    </label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                            <Lock size={16} />
                                        </span>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Masukkan ulang password"
                                            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 pl-12 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-emerald-500 dark:text-slate-300"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {fieldErrors.password_confirmation && (
                                        <p className="text-xs text-red-500 dark:text-red-300">{fieldErrors.password_confirmation[0]}</p>
                                    )}
                                </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:bg-emerald-500 ${
                            isSubmitting ? "cursor-not-allowed opacity-80" : "hover:bg-emerald-500"
                        }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                Daftar sekarang
                                <ArrowRight size={16} />
                            </span>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-300">
                    Sudah punya akun?
                    <a href="/" className="ml-1 font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-300">
                        Masuk sekarang
                    </a>
                </p>
            </div>
        </div>
    );
}

