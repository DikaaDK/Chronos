import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Users, PlusCircle, KeyRound, Sparkles } from "lucide-react";

export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://127.0.0.1:8000/api/groups", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGroups(res.data);
        } catch (err) {
            console.error("Failed to fetch groups", err);
        }
    };

    const createGroup = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://127.0.0.1:8000/api/groups",
                { name, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setName("");
            setDescription("");
            fetchGroups();
        } catch (err) {
            console.error("Failed to create group", err);
        }
    };

    const joinGroup = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://127.0.0.1:8000/api/groups/join",
                { invite_code: inviteCode },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setInviteCode("");
            fetchGroups();
        } catch (err) {
            console.error("Failed to join group", err);
        }
    };

    const handleGroupClick = (id) => {
        navigate(`/groups/${id}`);
    };

    return (
        <div className="space-y-8">
            <header className="rounded-3xl border border-emerald-100/70 bg-white/85 p-6 text-center shadow-md shadow-emerald-500/5 backdrop-blur md:text-left">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                            <Users size={14} />
                            <span>Kolaborasi</span>
                        </div>
                        <h1 className="mt-3 text-2xl font-bold text-emerald-800 md:text-3xl">Kelola Group</h1>
                        <p className="mt-2 text-sm text-gray-600 md:max-w-2xl">
                            Bangun tim produktif untuk menulis jurnal bersama. Buat group baru atau masukkan kode undangan untuk bergabung.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 px-5 py-4 text-left text-sm text-emerald-700">
                        <p className="text-xs font-semibold uppercase tracking-wide">Total group aktif</p>
                        <p className="mt-2 text-2xl font-bold text-emerald-800">{groups.length}</p>
                        <p className="text-xs text-emerald-600">Termasuk group yang kamu kelola dan ikuti.</p>
                    </div>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                <form
                    onSubmit={createGroup}
                    className="flex h-full flex-col gap-4 rounded-3xl border border-emerald-100/70 bg-white/85 p-6 shadow-md shadow-emerald-500/5 backdrop-blur"
                >
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Buat Group Baru</h2>
                        <p className="mt-1 text-sm text-gray-500">Susun komunitas menulis bersama temanmu.</p>
                    </div>

                    <label className="text-sm font-medium text-gray-700">
                        Nama Group
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Squad Produktif"
                            className="mt-1 w-full rounded-2xl border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            required
                        />
                    </label>

                    <label className="text-sm font-medium text-gray-700">
                        Deskripsi
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tuliskan tujuan group atau aturan singkat."
                            rows="3"
                            className="mt-1 w-full rounded-2xl border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                    </label>

                    <button
                        type="submit"
                        className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-700"
                    >
                        <PlusCircle size={18} />
                        <span>Buat Group</span>
                    </button>
                </form>

                <form
                    onSubmit={joinGroup}
                    className="flex h-full flex-col gap-4 rounded-3xl border border-emerald-100/70 bg-white/85 p-6 shadow-md shadow-emerald-500/5 backdrop-blur"
                >
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Masuk dengan Kode</h2>
                        <p className="mt-1 text-sm text-gray-500">Masukkan kode undangan yang kamu terima.</p>
                    </div>

                    <label className="text-sm font-medium text-gray-700">
                        Kode Undangan
                        <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-3 py-2 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
                            <KeyRound size={18} className="text-emerald-500" />
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Masukkan kode"
                                className="w-full bg-transparent text-sm text-gray-700 focus:outline-none"
                                required
                            />
                        </div>
                    </label>

                    <button
                        type="submit"
                        className="mt-auto inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50"
                    >
                        <Sparkles size={18} />
                        <span>Bergabung</span>
                    </button>
                </form>
            </div>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Group Kamu</h2>
                    {groups.length > 0 && (
                        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                            {groups.length} group aktif
                        </span>
                    )}
                </div>

                {groups.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/70 px-6 py-12 text-center text-sm text-emerald-700">
                        Belum ada group yang kamu ikuti. Kamu bisa membuat group baru atau masuk dengan kode undangan.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {groups.map((g) => (
                            <button
                                key={g.id}
                                type="button"
                                onClick={() => handleGroupClick(g.id)}
                                className="group flex h-full flex-col justify-between rounded-3xl border border-transparent bg-white/90 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700">{g.name}</h3>
                                        <p className="mt-1 text-sm text-gray-500">{g.description || 'Belum ada deskripsi.'}</p>
                                    </div>
                                    <span className="rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1 text-xs font-semibold text-emerald-600">
                                        {g.invite_code}
                                    </span>
                                </div>
                                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-500">
                                    <Users size={16} />
                                    <span>Lihat detail group</span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
