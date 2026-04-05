
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ListOrdered, FileText, Settings, CreditCard, LogOut, Layout } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Sidebar() {
    const menuItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Layout, label: 'Templates', path: '/templates' },
        { icon: FileText, label: 'My Forms', path: '/forms' },
        { icon: ListOrdered, label: 'Responses', path: '/responses' },
    ];

    const bottomItems = [
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: LogOut, label: 'Log Out', path: '/logout' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 glass-card rounded-none border-r border-slate-200/60 flex flex-col p-6 z-50">
            {/* Brand */}
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                    <span className="text-xl">S</span>
                </div>
                <span className="font-bold text-xl text-slate-800 tracking-tight">SmartForm</span>
            </div>

            {/* Main Menu */}
            <div className="flex-1 space-y-1">
                <div className="px-3 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Main</div>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                            isActive
                                ? "bg-primary text-white shadow-md shadow-primary/25"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <item.icon size={20} className="relative z-10" />
                        <span className="relative z-10">{item.label}</span>
                    </NavLink>
                ))}
            </div>

            {/* Footer Menu */}
            <div className="mt-auto space-y-2">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-4"></div>
                {bottomItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                {/* User Profile */}
                <div className="flex items-center gap-3 mt-6 p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                        JD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-slate-900">John Doe</p>
                        <p className="text-xs text-slate-400 truncate">john@example.com</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
