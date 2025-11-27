import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import BottomBar from './components/BottomBar';
import Navbar from './components/navbar';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/home';
import Journal from './pages/journal';
import Profile from './pages/profile';
import Group from './pages/group';
import GroupDetail from "./pages/groupdetail";

function Layout({ children }) {
    const location = useLocation();
    const isAuthPage = location.pathname === '/' || location.pathname === '/register';
    const isAuthenticated = !!localStorage.getItem("token");

    if (!isAuthenticated && !isAuthPage) {
        return <Navigate to="/" replace />;
    }

    if (isAuthPage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400">
                <main className="flex min-h-screen items-center justify-center px-4 py-10">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-emerald-50/60">
            <Navbar />
            <BottomBar />

            <div className="flex">
                <div className="hidden md:block w-64 shrink-0" aria-hidden="true" />
                <main className="flex-1 px-4 pt-20 pb-28 md:px-10 lg:px-16">
                    <div className="mx-auto w-full max-w-5xl lg:max-w-6xl space-y-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/home" element={<Home />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/add" element={<div>➕ Tambah Journal</div>} />
                    <Route path="/group" element={<Group />} />
                    <Route path="/groups/:id" element={<GroupDetail />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
