import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, Clock, BarChart2, Download, Filter, LayoutGrid, List } from 'lucide-react';
import { cn } from '../utils/cn';
import { endpoints } from '../config/api';

export default function Responses() {
    const { id } = useParams();
    const [data, setData] = useState({ responses: [], form: null });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('individual'); // 'summary' or 'individual'
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

    useEffect(() => {
        fetch(endpoints.responses(id))
            .then((res) => res.json())
            .then((jsonData) => {
                setData(jsonData);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    const { form, responses } = data;
    const themeColor = form?.theme?.color || '#6366f1';
    const fontFamily = form?.theme?.font || 'font-sans';

    // Analytics Logic
    const getFieldAnalytics = (field) => {
        if (!['dropdown', 'checkbox', 'radio'].includes(field.type)) return null;

        const total = responses.length;
        if (total === 0) return null;

        const counts = {};
        responses.forEach(r => {
            const val = r.data[field.label] || 'No Answer';
            counts[val] = (counts[val] || 0) + 1;
        });

        return Object.entries(counts).map(([label, count]) => ({
            label,
            count,
            percentage: Math.round((count / total) * 100)
        })).sort((a, b) => b.count - a.count);
    };

    // Sorting Logic
    const sortedResponses = [...responses].sort((a, b) => {
        const dateA = new Date(a.submittedAt);
        const dateB = new Date(b.submittedAt);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Export to CSV
    const downloadCSV = () => {
        if (!responses.length) return;

        const headers = ['Submitted At', ...form.fields.map(f => f.label)];
        const csvContent = [
            headers.join(','),
            ...sortedResponses.map(r => [
                new Date(r.submittedAt).toLocaleString(),
                ...form.fields.map(f => `"${(r.data[f.label] || '').replace(/"/g, '""')}"`)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${form.title}_responses.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header Section */}
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <Link to="/forms" className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                                <span>Forms</span>
                                <span className="text-slate-300">/</span>
                                <span>Responses</span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800">{form?.title || 'Form Responses'}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg border border-slate-200 p-1 flex">
                            <button
                                onClick={() => setActiveTab('individual')}
                                className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2", activeTab === 'individual' ? "bg-slate-100 text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            >
                                <LayoutGrid size={16} /> Individual
                            </button>
                            <button
                                onClick={() => setActiveTab('summary')}
                                className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2", activeTab === 'summary' ? "bg-slate-100 text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            >
                                <BarChart2 size={16} /> Analytics
                            </button>
                        </div>

                        <button
                            onClick={downloadCSV}
                            disabled={responses.length === 0}
                            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </header>

                {responses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-white border-2 border-dashed border-slate-200 rounded-xl p-12">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                            <BarChart2 size={32} />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">No responses yet</h2>
                        <p className="text-slate-500 max-w-sm mb-6">Share your form link with others to start collecting responses.</p>
                        <div className="flex gap-4">
                            <Link to="/dashboard" className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                                Back to Dashboard
                            </Link>
                            <Link to="/forms" className="btn-primary">
                                View All Forms
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'summary' ? (
                            <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
                                {/* Key Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="text-slate-500 text-sm font-medium mb-1">Total Responses</div>
                                        <div className="text-3xl font-bold text-slate-800">{responses.length}</div>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="text-slate-500 text-sm font-medium mb-1">Latest Submission</div>
                                        <div className="text-lg font-semibold text-slate-800">
                                            {new Date(sortedResponses[0]?.submittedAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(sortedResponses[0]?.submittedAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center">
                                        <button onClick={downloadCSV} className="text-primary font-medium hover:underline text-sm flex items-center gap-1">
                                            Download Reports <Download size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Field Visualization */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-slate-800 px-1">Response Analytics</h3>
                                    {form.fields.map((field) => {
                                        const analytics = getFieldAnalytics(field);
                                        if (!analytics) return null;

                                        return (
                                            <div key={field.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">{field.label}</h4>
                                                <div className="space-y-4">
                                                    {analytics.map((item, idx) => (
                                                        <div key={idx}>
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-slate-600 font-medium">{item.label}</span>
                                                                <span className="text-slate-400">{item.count} ({item.percentage}%)</span>
                                                            </div>
                                                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                                <div
                                                                    className="h-2.5 rounded-full transition-all duration-1000 ease-out"
                                                                    style={{ width: `${item.percentage}%`, backgroundColor: themeColor }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Fallback for fields without analytics */}
                                    {form.fields.every(f => !['dropdown', 'checkbox', 'radio'].includes(f.type)) && (
                                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                                            <p className="text-slate-500">Visual analytics are available for Dropdown, Checkbox, and Radio fields.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-slide-up">
                                <div className="flex justify-end mb-4">
                                    <div className="relative inline-block text-left">
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                            <Filter size={14} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                                    {sortedResponses.map((resp, index) => (
                                        <div
                                            key={resp.id}
                                            className={cn("glass-card overflow-hidden animate-slide-up", fontFamily)}
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="px-6 py-4 border-b border-white/20 bg-slate-50/30 flex justify-between items-center backdrop-blur-sm">
                                                <span className="text-sm font-bold text-slate-700">Response #{index + 1}</span>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <Clock size={14} />
                                                    <span>{new Date(resp.submittedAt).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="p-8 space-y-6">
                                                <div style={{ paddingBottom: '1rem', borderBottom: `2px solid ${themeColor}20` }}>
                                                    <h3 className="text-xl font-bold" style={{ color: themeColor }}>{form.title}</h3>
                                                </div>

                                                {form.fields.map((field) => {
                                                    const answer = resp.data[field.label];
                                                    return (
                                                        <div key={field.id} className="group">
                                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                                                {field.label}
                                                            </label>

                                                            {['text', 'email', 'number', 'phone', 'text', 'date'].includes(field.type) && (
                                                                <input
                                                                    disabled
                                                                    type={field.type === 'phone' ? 'tel' : field.type}
                                                                    value={answer || ''}
                                                                    placeholder="No answer provided"
                                                                    className="w-full bg-slate-50/50 border border-slate-200/60 rounded-lg px-3 py-2 text-sm text-slate-600 placeholder:text-slate-400 italic"
                                                                />
                                                            )}

                                                            {field.type === 'dropdown' && (
                                                                <div className="relative">
                                                                    <select
                                                                        disabled
                                                                        value={answer || ''}
                                                                        className="w-full bg-slate-50/50 border border-slate-200/60 rounded-lg px-3 py-2 text-sm text-slate-600 appearance-none"
                                                                    >
                                                                        <option value="" disabled>{answer ? '' : 'No option selected'}</option>
                                                                        {field.options.map((opt, idx) => (
                                                                            <option key={idx} value={opt}>{opt}</option>
                                                                        ))}
                                                                    </select>
                                                                    {!answer && <div className="absolute inset-0 flex items-center px-3 text-sm text-slate-400 italic pointer-events-none">No option selected</div>}
                                                                </div>
                                                            )}

                                                            {field.type === 'checkbox' && (
                                                                <div className="flex items-center gap-2 p-2 bg-slate-50/50 border border-slate-200/60 rounded-lg">
                                                                    <input
                                                                        disabled
                                                                        type="checkbox"
                                                                        checked={answer === 'Yes'}
                                                                        className="rounded border-slate-300 text-slate-400"
                                                                    />
                                                                    <span className={cn("text-sm", !answer && "text-slate-400 italic")}>
                                                                        {answer || "Not checked"}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {field.type === 'file' && (
                                                                <div className="flex items-center gap-2 bg-slate-50/50 border border-slate-200/60 rounded-lg px-3 py-2 text-sm text-slate-600">
                                                                    <span className={cn(!answer && "text-slate-400 italic")}>
                                                                        {answer || "No file uploaded"}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
