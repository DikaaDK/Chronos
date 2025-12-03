import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Users, PlusCircle, KeyRound, Sparkles } from "lucide-react";
import { useLocalization } from "../context/LocalizationContext";
import Footer from "../components/Footer";

export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const navigate = useNavigate();
    const { t } = useLocalization();

    const groupCopy = useMemo(() => ({
        header: {
            badge: t('group.header.badge', 'Kolaborasi'),
            title: t('group.header.title', 'Kelola Group'),
            description: t('group.header.description', 'Bangun tim produktif untuk menulis jurnal bersama. Buat group baru atau masukkan kode undangan untuk bergabung.'),
        },
        stats: {
            totalLabel: t('group.stats.total_label', 'Total group aktif'),
            helper: t('group.stats.total_helper', 'Termasuk group yang kamu kelola dan ikuti.'),
        },
        forms: {
            create: {
                title: t('group.forms.create.title', 'Buat Group Baru'),
                description: t('group.forms.create.description', 'Susun komunitas menulis bersama temanmu.'),
                nameLabel: t('group.forms.create.name_label', 'Nama Group'),
                namePlaceholder: t('group.forms.create.name_placeholder', 'Contoh: Squad Produktif'),
                descriptionLabel: t('group.forms.create.description_label', 'Deskripsi'),
                descriptionPlaceholder: t('group.forms.create.description_placeholder', 'Tuliskan tujuan group atau aturan singkat.'),
                submit: t('group.forms.create.submit', 'Buat Group'),
            },
            join: {
                title: t('group.forms.join.title', 'Masuk dengan Kode'),
                description: t('group.forms.join.description', 'Masukkan kode undangan yang kamu terima.'),
                inviteLabel: t('group.forms.join.invite_label', 'Kode Undangan'),
                invitePlaceholder: t('group.forms.join.invite_placeholder', 'Masukkan kode'),
                submit: t('group.forms.join.submit', 'Bergabung'),
            },
        },
        list: {
            title: t('group.list.title', 'Group Kamu'),
            countLabel: t('group.list.count_label', ':count group aktif'),
            empty: t('group.list.empty', 'Belum ada group yang kamu ikuti. Kamu bisa membuat group baru atau masuk dengan kode undangan.'),
        },
        card: {
            noDescription: t('group.card.no_description', 'Belum ada deskripsi.'),
            viewDetail: t('group.card.view_detail', 'Lihat detail group'),
        },
    }), [t]);

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
        <>
            <div className="space-y-8">
                <header className="rounded-3xl border border-emerald-100/70 bg-white/85 p-6 text-center shadow-md shadow-emerald-500/5 backdrop-blur md:text-left">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                            <Users size={14} />
                            <span>{groupCopy.header.badge}</span>
                        </div>
                        <h1 className="mt-3 text-2xl font-bold text-emerald-800 md:text-3xl">{groupCopy.header.title}</h1>
                        <p className="mt-2 text-sm text-gray-600 md:max-w-2xl">
                            {groupCopy.header.description}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 px-5 py-4 text-left text-sm text-emerald-700">
                        <p className="text-xs font-semibold uppercase tracking-wide">{groupCopy.stats.totalLabel}</p>
                        <p className="mt-2 text-2xl font-bold text-emerald-800">{groups.length}</p>
                        <p className="text-xs text-emerald-600">{groupCopy.stats.helper}</p>
                    </div>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                <form
                    onSubmit={createGroup}
                    className="flex h-full flex-col gap-4 rounded-3xl border border-emerald-100/70 bg-white/85 p-6 shadow-md shadow-emerald-500/5 backdrop-blur"
                >
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{groupCopy.forms.create.title}</h2>
                        <p className="mt-1 text-sm text-gray-500">{groupCopy.forms.create.description}</p>
                    </div>

                    <label className="text-sm font-medium text-gray-700">
                        {groupCopy.forms.create.nameLabel}
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={groupCopy.forms.create.namePlaceholder}
                            className="mt-1 w-full rounded-2xl border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            required
                        />
                    </label>

                    <label className="text-sm font-medium text-gray-700">
                        {groupCopy.forms.create.descriptionLabel}
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={groupCopy.forms.create.descriptionPlaceholder}
                            rows="3"
                            className="mt-1 w-full rounded-2xl border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                    </label>

                    <button
                        type="submit"
                        className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-700"
                    >
                        <PlusCircle size={18} />
                        <span>{groupCopy.forms.create.submit}</span>
                    </button>
                </form>

                <form
                    onSubmit={joinGroup}
                    className="flex h-full flex-col gap-4 rounded-3xl border border-emerald-100/70 bg-white/85 p-6 shadow-md shadow-emerald-500/5 backdrop-blur"
                >
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{groupCopy.forms.join.title}</h2>
                        <p className="mt-1 text-sm text-gray-500">{groupCopy.forms.join.description}</p>
                    </div>

                    <label className="text-sm font-medium text-gray-700">
                        {groupCopy.forms.join.inviteLabel}
                        <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-3 py-2 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
                            <KeyRound size={18} className="text-emerald-500" />
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder={groupCopy.forms.join.invitePlaceholder}
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
                        <span>{groupCopy.forms.join.submit}</span>
                    </button>
                </form>
            </div>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">{groupCopy.list.title}</h2>
                    {groups.length > 0 && (
                        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                            {groupCopy.list.countLabel.replace(':count', groups.length)}
                        </span>
                    )}
                </div>

                {groups.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/70 px-6 py-12 text-center text-sm text-emerald-700">
                        {groupCopy.list.empty}
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
                                        <p className="mt-1 text-sm text-gray-500">{g.description || groupCopy.card.noDescription}</p>
                                    </div>
                                    <span className="rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1 text-xs font-semibold text-emerald-600">
                                        {g.invite_code}
                                    </span>
                                </div>
                                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-500">
                                    <Users size={16} />
                                    <span>{groupCopy.card.viewDetail}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </section>
            </div>
            <Footer />
        </>
    );
}
