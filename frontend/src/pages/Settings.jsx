
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { User, Lock, Bell, Moon, Sun, Save, Shield } from 'lucide-react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState({
        name: 'User',
        email: 'user@example.com',
        bio: 'Professional user on SmartForm'
    });

    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setProfile({
                    name: user.name || 'User',
                    email: user.email || 'user@example.com',
                    bio: 'Professional user on SmartForm'
                });
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }, []);
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        marketing: false
    });
    const [theme, setTheme] = useState('light');

    const handleSave = () => {
        // Logic to save settings to backend
        alert('Settings saved successfully!');
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                    <p className="text-slate-500">Manage your account preferences and application settings.</p>
                </header>

                <div className="flex gap-8 max-w-6xl">
                    {/* Settings Sidebar */}
                    <div className="w-64 flex-shrink-0 space-y-2">
                        {[
                            { id: 'profile', label: 'Profile Settings', icon: User },
                            { id: 'security', label: 'Password & Security', icon: Shield },
                            { id: 'notifications', label: 'Notifications', icon: Bell },
                            { id: 'appearance', label: 'Appearance', icon: Moon },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                                        ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                                        : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="glass-card p-8 animate-fade-in relative overflow-hidden">
                            {/* Content based on active tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <User size={24} className="text-primary" /> Public Profile
                                    </h2>

                                    <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                                        <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500 uppercase">
                                            {profile.name.charAt(0)}
                                        </div>
                                        <div>
                                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                                Change Avatar
                                            </button>
                                            <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                            <input
                                                type="text"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Bio</label>
                                            <textarea
                                                value={profile.bio}
                                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                                rows={4}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <Shield size={24} className="text-primary" /> Security
                                    </h2>

                                    <div className="space-y-4 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Current Password</label>
                                            <input type="password" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder="••••••••" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">New Password</label>
                                            <input type="password" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder="••••••••" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                                            <input type="password" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder="••••••••" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <Bell size={24} className="text-primary" /> Notification Preferences
                                    </h2>

                                    <div className="space-y-4">
                                        {[
                                            { key: 'email', label: 'Email Notifications', desc: 'Receive emails about your account activity.' },
                                            { key: 'push', label: 'Push Notifications', desc: 'Receive push notifications on your device.' },
                                            { key: 'marketing', label: 'Marketing Emails', desc: 'Receive emails about new features and offers.' }
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div>
                                                    <h4 className="font-semibold text-slate-800">{item.label}</h4>
                                                    <p className="text-sm text-slate-500">{item.desc}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notifications[item.key]}
                                                        onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none ring-4 ring-transparent rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'appearance' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <Moon size={24} className="text-primary" /> Appearance
                                    </h2>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <div className="w-full h-24 bg-white border border-slate-200 rounded-lg shadow-sm"></div>
                                            <span className="font-semibold text-slate-700 flex items-center gap-2"><Sun size={18} /> Light Mode</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <div className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg shadow-sm"></div>
                                            <span className="font-semibold text-slate-700 flex items-center gap-2"><Moon size={18} /> Dark Mode</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    className="btn-primary flex items-center gap-2 px-6 py-2.5"
                                >
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
