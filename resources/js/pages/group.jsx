import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">Groups</h1>

            <form
                onSubmit={createGroup}
                className="mb-6 bg-white/70 backdrop-blur-lg border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2"
            >
                <h2 className="font-semibold mb-2">Create a Group</h2>
                <div className="flex flex-col md:flex-row gap-2">
                    <input
                        type="text"
                        placeholder="Group Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border rounded-lg p-2 flex-1"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="border rounded-lg p-2 flex-1"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 transition"
                    >
                        Create
                    </button>
                </div>
            </form>

            <form
                onSubmit={joinGroup}
                className="mb-8 bg-white/70 backdrop-blur-lg border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2"
            >
                <h2 className="font-semibold mb-2">Join with Invite Code</h2>
                <div className="flex flex-col md:flex-row gap-2">
                    <input
                        type="text"
                        placeholder="Invite Code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        className="border rounded-lg p-2 flex-1"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 transition"
                    >
                        Join
                    </button>
                </div>
            </form>

            <div>
                <h2 className="font-semibold mb-4 text-lg">Your Groups</h2>
                {groups.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                        Belum ada group. Yuk bikin atau join 
                    </p>
                ) : (
                    <div className="grid gap-3">
                        {groups.map((g) => (
                            <div
                                key={g.id}
                                onClick={() => handleGroupClick(g.id)}
                                className="border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer transition hover:shadow-md hover:bg-blue-50/50"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{g.name}</h3>
                                        <p className="text-gray-600 text-sm">{g.description}</p>
                                    </div>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        Code: {g.invite_code}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
