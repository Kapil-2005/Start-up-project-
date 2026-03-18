import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { endpoints } from '../config/api';
import { FileText, BarChart2, ExternalLink } from 'lucide-react';

export default function AllResponses() {
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
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Responses</h1>
                    <p className="text-slate-500">Select a form to view its responses.</p>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : forms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-slate-200 rounded-xl bg-white p-8">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                            <BarChart2 size={32} />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">No forms yet</h2>
                        <p className="text-slate-500 max-w-sm mb-8">
                            You need to create a form before you can collect responses.
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
                                style={{ animationDelay: `${index * 100}ms`, borderTop: `4px solid ${form.theme?.color || '#10b981'}` }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: form.theme?.color || '#10b981' }}>
                                        <BarChart2 size={20} />
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                        {new Date(form.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mb-2 truncate group-hover:text-primary transition-colors">{form.title}</h3>
                                <p className="text-sm text-slate-500 mb-6">{form.fields?.length || 0} questions</p>

                                <div className="pt-4 border-t border-slate-100/50">
                                    <Link
                                        to={`/form/${form.id}/responses`}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-lg active:scale-95"
                                        style={{ backgroundColor: form.theme?.color || '#10b981' }}
                                    >
                                        View Responses <ArrowRightIcon className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

// Simple Arrow Right Icon component for internal use
const ArrowRightIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);
