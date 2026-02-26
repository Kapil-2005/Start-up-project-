
import React from 'react';
import Sidebar from '../components/Sidebar';
import { ArrowRight, Layout, PlusCircle, Sparkles, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { endpoints } from '../config/api';

export default function Templates() {
    const templates = [
        {
            id: 1,
            title: 'Contact Us',
            description: 'Simple contact form for websites',
            uses: 1200,
            fields: [
                { id: 1, type: 'text', label: 'Full Name', placeholder: 'John Doe', required: true },
                { id: 2, type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true },
                { id: 3, type: 'text', label: 'Subject', placeholder: 'What is this regarding?', required: true },
                { id: 4, type: 'text', label: 'Message', placeholder: 'Type your message here...', required: true }
            ]
        },
        {
            id: 2,
            title: 'Job Application',
            description: 'Collect resumes and applicant details',
            uses: 850,
            fields: [
                { id: 1, type: 'text', label: 'Full Name', placeholder: 'John Doe', required: true },
                { id: 2, type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true },
                { id: 3, type: 'phone', label: 'Phone Number', placeholder: '+1 234 567 8900', required: true },
                { id: 4, type: 'text', label: 'Portfolio URL', placeholder: 'https://...', required: false },
                { id: 5, type: 'dropdown', label: 'Position Applied For', options: ['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Product Manager'], required: true },
                { id: 6, type: 'text', label: 'Cover Letter', placeholder: 'Tell us why you are a great fit...', required: false },
                { id: 7, type: 'file', label: 'Resume/CV', required: true }
            ]
        },
        {
            id: 3,
            title: 'Event Registration',
            description: 'Register attendees for upcoming events',
            uses: 2300,
            fields: [
                { id: 1, type: 'text', label: 'Name', required: true },
                { id: 2, type: 'email', label: 'Email', required: true },
                { id: 3, type: 'dropdown', label: 'Ticket Type', options: ['General Admission', 'VIP', 'Student'], required: true },
                { id: 4, type: 'number', label: 'Number of Tickets', placeholder: '1', required: true }
            ]
        },
        {
            id: 4,
            title: 'Customer Feedback',
            description: 'Gather insights from your customers',
            uses: 1540,
            fields: [
                { id: 1, type: 'text', label: 'Customer Name', required: false },
                { id: 2, type: 'dropdown', label: 'Satisfaction Rating', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'], required: true },
                { id: 3, type: 'text', label: 'Comments', placeholder: 'Share your experience...', required: false }
            ]
        },
        { id: 5, title: 'Order Request', description: 'Simple order form for services', uses: 420 },
        { id: 6, title: 'Bug Report', description: 'Track software issues efficiently', uses: 600 },
    ];

    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const navigate = useNavigate();

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setGenerating(true);
        try {
            const response = await fetch(endpoints.generate, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await response.json();

            if (response.ok) {
                // Navigate to dashboard with the generated template
                navigate('/dashboard', { state: { template: data } });
            } else {
                alert('Failed to generate form. Please try again.');
            }
        } catch (error) {
            console.error('Error generating form:', error);
            alert('Something went wrong.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Templates & AI Builder</h1>
                    <p className="text-slate-500">Kickstart your form with our pre-built templates or generate one with AI.</p>
                </header>

                {/* AI Generator Section */}
                <div className="mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg animate-fade-in">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="relative z-10 max-w-2xl">
                        <div className="flex items-center gap-2 mb-2 text-indigo-100 font-medium text-sm">
                            <Sparkles size={16} /> AI Powered
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Describe your form, and we'll build it instantly.</h2>
                        <form onSubmit={handleGenerate} className="flex gap-4">
                            <div className="flex-1 relative">
                                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g. A feedback form for my coffee shop with rating..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/30 shadow-sm"
                                    disabled={generating}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={generating || !prompt.trim()}
                                className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {generating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Building...
                                    </>
                                ) : (
                                    <>Generate <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Or choose a template</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div key={template.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow group">
                            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:bg-primary/10 transition-colors">
                                <Layout size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-1">{template.title}</h3>
                            <p className="text-sm text-slate-500 mb-4 h-10">{template.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-xs text-slate-400 font-medium">{template.uses}+ uses</span>
                                <Link
                                    to="/dashboard"
                                    state={{ template: template }}
                                    className="text-sm font-medium text-primary flex items-center gap-1 hover:underline"
                                >
                                    Use Template <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}

                    {/* Create Custom Card */}
                    <Link to="/dashboard" className="bg-white border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-slate-50 transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                            <PlusCircle size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 group-hover:text-primary">Start from Scratch</h3>
                        <p className="text-sm text-slate-500 mt-1">Build a completely custom form</p>
                    </Link>
                </div>
            </main>
        </div>
    );
}
