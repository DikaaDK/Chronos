import React, { useState } from 'react';
import { PlusCircle, CalendarDays, X } from 'lucide-react';

export default function Journal() {
    const [journals, setJournals] = useState([
        {
            id: 1,
            title: 'Pagi yang Produktif',
            content: 'Hari ini aku bangun lebih awal dan menyelesaikan banyak hal penting...',
            date: '10 Okt 2025',
        },
        {
            id: 2,
            title: 'Jalan Sore Menyenangkan',
            content: 'Jalan-jalan keliling taman sambil denger lagu bikin pikiran segar...',
            date: '9 Okt 2025',
        },
        {
            id: 3,
            title: 'Refleksi Diri',
            content: 'Aku mulai menyadari hal-hal kecil yang ternyata penting banget...',
            date: '8 Okt 2025',
        },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleAddJournal = (e) => {
        e.preventDefault();
        const newJournal = {
            id: journals.length + 1,
            title,
            content,
            date: new Date().toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }),
        };
        setJournals([newJournal, ...journals]);
        setTitle('');
        setContent('');
        setIsModalOpen(false);
    };

    return (
        <div className="px-4 pt-10 pb-24 max-w-3xl mx-auto bg-gradient-to-b from-emerald-50 to-white min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-emerald-700">Journal Harian</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:from-emerald-700 hover:to-emerald-600 transition-all duration-200 active:scale-95"
                >
                    <PlusCircle
                        size={18}
                        className="transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110"
                    />
                    <span>Tambah</span>
                </button>
            </div>

            {journals.length > 0 ? (
                <div className="space-y-4">
                    {journals.map((journal) => (
                        <div
                            key={journal.id}
                            className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition flex justify-between items-start border border-gray-100 hover:-translate-y-1"
                        >
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">{journal.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{journal.content}</p>
                            </div>
                            <div className="flex flex-col items-end text-right text-xs text-gray-400">
                                <CalendarDays size={14} className="mb-1" />
                                <span>{journal.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
                    <CalendarDays size={40} className="mb-3 text-emerald-500" />
                    <p className="text-center">Belum ada jurnal yang ditulis. Yuk mulai nulis ceritamu </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-emerald-700 transition"
                    >
                        Tambah Jurnal
                    </button>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative animate-[scaleIn_0.25s_ease-out]">
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800">Tambah Jurnal</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddJournal} className="px-5 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Judul jurnal kamu..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Isi</label>
                                <textarea
                                    rows="5"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Tulis ceritamu di sini..."
                                    required
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition font-medium"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
