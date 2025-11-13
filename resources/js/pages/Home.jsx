import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PlusCircle, BookOpen, CalendarDays } from 'lucide-react';
import Modaljournal from '../components/modaljournal';

export default function Home() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        axios
            .get("http://127.0.0.1:8000/api/user", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setUser(res.data))
            .catch((err) => {
                console.error("Gagal ambil data user:", err);
                localStorage.removeItem("token");
                navigate("/login");
            });
    }, [navigate]);

    return (
        <div className="px-4 pt-10 pb-24 max-w-3xl mx-auto bg-gradient-to-b from-emerald-50 to-white min-h-screen">
            <div className="text-center mb-10">
                <div className="inline-block px-4 py-1 mb-3 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                    {user ? `Selamat datang, ${user.name} 👋` : "Selamat datang"}
                </div>
                <h1 className="text-4xl font-extrabold text-emerald-700 tracking-tight">Chronos</h1>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">
                    Catat cerita harianmu dengan tenang, simpan kenangan untuk masa depan
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-12">
                <ButtonOption 
                    icon={<PlusCircle size={30} />} 
                    label="Tambah" 
                    color="emerald" 
                    onClick={() => setIsModalOpen(true)}
                />
                <ButtonOption icon={<BookOpen size={30} />} label="Jurnal" color="emerald" />
                <ButtonOption icon={<CalendarDays size={30} />} label="Kalender" color="emerald" />
            </div>

            <Modaljournal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
            >
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Tambah Jurnal</h2>
                <form className="space-y-3">
                    <input
                        type="text"
                        placeholder="Judul jurnal..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <textarea
                        placeholder="Isi jurnal..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                    ></textarea>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modaljournal>
        </div>
    );
}

function ButtonOption({ icon, label, color, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 active:scale-95`}
        >
            <div
                className={`text-${color}-600 bg-${color}-50 rounded-full p-2 mb-1 flex items-center justify-center`}
            >
                {icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </button>
    );
}
