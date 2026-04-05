
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { endpoints } from '../config/api';
import { FileText, PlusCircle, ArrowRight, ExternalLink, BarChart2 } from 'lucide-react';

export default function MyForms() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(endpoints.forms)
            .then(res => res.json())
            .then(data => {
                setForms(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching forms:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">My Forms</h1>
                        <p className="text-slate-500">Manage your existing forms and view responses.</p>
                    </div>
                    <Link to="/dashboard" className="btn-primary">
                        <PlusCircle size={18} /> Create New Form
                    </Link>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : forms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-slate-200 rounded-xl bg-white p-8">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                            <FileText size={32} />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">No forms created yet</h2>
                        <p className="text-slate-500 max-w-sm mb-8">
                            Start building your first form to collect responses from your audience.
                        </p>
                        <Link to="/dashboard" className="btn-primary">
                            Create Your First Form
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forms.map((form, index) => (
                            <div
                                key={form.id}
                                className="glass-card p-6 group animate-scale-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: form.theme?.color || '#6366f1' }}>
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                        {new Date(form.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mb-2 truncate group-hover:text-primary transition-colors">{form.title}</h3>
                                <p className="text-sm text-slate-500 mb-6">{form.fields?.length || 0} fields</p>

                                <div className="flex items-center gap-2 pt-4 border-t border-slate-100/50">
                                    <Link
                                        to={`/form/${form.id}/responses`}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        <BarChart2 size={16} /> Responses
                                    </Link>
                                    <a
                                        href={`/form/${form.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 text-slate-400 hover:text-white rounded-xl transition-colors shadow-sm"
                                        style={{ backgroundColor: 'transparent' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = form.theme?.color || '#6366f1'; e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                                        title="Open Live Form"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
