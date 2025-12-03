import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import BottomBar from './components/BottomBar';
import Navbar from './components/navbar';
import Login from './pages/login';
import Register from './pages/register';
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';
import Home from './pages/home';
import Journal from './pages/journal';
import Profile from './pages/profile';
import Group from './pages/group';
import GroupDetail from "./pages/groupdetail";
import SettingsProfile from './pages/settingsProfile';
import { LocalizationProvider } from './context/LocalizationContext';
import { DisplayPreferenceProvider, useDisplayPreferences } from './context/DisplayPreferenceContext';

function Layout({ children }) {
    const location = useLocation();
    const { theme } = useDisplayPreferences();
    const isDarkTheme = theme === 'dark';
    const authPages = ['/', '/register', '/forgot-password', '/reset-password'];
    const isAuthPage = authPages.includes(location.pathname);
    const isAuthenticated = !!localStorage.getItem("token");
    const authenticatedBackgroundClass = isDarkTheme
        ? 'bg-slate-950 text-slate-100'
        : 'bg-emerald-50/60 text-gray-900';
    const authBackgroundClass = isDarkTheme
        ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-black'
        : 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400';

    if (!isAuthenticated && !isAuthPage) {
        return <Navigate to="/" replace />;
    }

    if (isAuthPage) {
        return (
            <div className={`min-h-screen ${authBackgroundClass}`}>
                <main className="flex min-h-screen items-center justify-center px-4 py-10">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className={`relative min-h-screen transition-colors duration-300 ${authenticatedBackgroundClass}`}>
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
        <DisplayPreferenceProvider>
            <LocalizationProvider>
                <BrowserRouter>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />

                            <Route path="/home" element={<Home />} />
                            <Route path="/journal" element={<Journal />} />
                            <Route path="/add" element={<div>➕ Tambah Journal</div>} />
                            <Route path="/group" element={<Group />} />
                            <Route path="/groups/:id" element={<GroupDetail />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/settings/profile" element={<SettingsProfile />} />
                        </Routes>
                    </Layout>
                </BrowserRouter>
            </LocalizationProvider>
        </DisplayPreferenceProvider>
    );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
