import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { endpoints } from '../config/api';
import { CheckCircle, ArrowRight, Sun, Moon, Sparkles, Download, Share2, Mail } from 'lucide-react';

export default function FormView() {
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({});
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const response = await fetch(endpoints.forms.replace('/api/forms', `/api/forms/${id}`));
                const data = await response.json();

                if (response.ok) {
                    setForm(data);
                    document.title = `${data.title} | ${data.theme?.sponsor || 'SmartForm'}`;
                } else {
                    setError(data.message || 'Form not found');
                }
            } catch {
                setError('Failed to load form');
            } finally {
                setLoading(false);
            }
        };

        fetchForm();
    }, [id]);

    const handleChange = (label, value) => {
        setFormData({
            ...formData,
            [label]: value
        });
    };

    const visibleFields = form?.fields?.filter(field => {
        if (!field.logic?.dependentFieldId) return true;
        const depField = form.fields.find(f => f.id === field.logic.dependentFieldId);
        if (!depField) return true;
        return formData[depField.label] === field.logic.dependentValue;
    }) || [];

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        // Validation check
        const missingRequired = visibleFields.find(f => f.required && !formData[f.label]);
        if (missingRequired) {
            alert(`Please answer the required field: ${missingRequired.label}`);
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(endpoints.submit(id), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert('Failed to submit form');
            }
        } catch (err) {
            console.error(err);
            alert('Error submitting form');
        } finally {
            setSubmitting(false);
        }
    };

    const getUserName = () => {
        const nameKey = Object.keys(formData).find(k => k.toLowerCase().includes('name'));
        return nameKey ? formData[nameKey] : '';
    };

    const interpolateText = (text) => {
        if (!text) return text;
        return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const cleanKey = key.trim().toLowerCase();
            let val = formData[key.trim()];
            if (val) return val;
            const foundField = Object.keys(formData).find(k => k.toLowerCase().includes(cleanKey));
            if (foundField && formData[foundField]) return formData[foundField];
            if (cleanKey === 'name') {
                const n = getUserName();
                if (n) return n;
            }
            return match;
        });
    };

    const renderField = (field, index) => {
        const value = formData[field.label] || '';
        const inputBaseClass = `w-full bg-transparent border-b-2 py-4 text-2xl placeholder:opacity-40 focus:outline-none transition-all font-light ${isDarkMode ? 'border-gray-700 text-white focus:border-white' : 'border-slate-300 text-slate-800 focus:border-slate-800'}`;

        return (
            <div key={field.id} className="mb-16 animate-fade-in">
                <div className={`flex items-center gap-3 mb-4 font-semibold uppercase tracking-widest text-xs ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    <span>Question {index + 1}</span>
                    {field.required && <span className="text-red-500 ml-4">* Required</span>}
                </div>
                <h2 className="text-3xl font-bold mb-8 leading-tight tracking-tight">
                    {interpolateText(field.label)}
                </h2>
                
                <div className="min-h-[60px]">
                    {field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'phone' ? (
                        <input
                            type={field.type === 'phone' ? 'tel' : field.type}
                            className={inputBaseClass}
                            style={{ borderColor: formData[field.label] ? form.theme?.color : undefined }}
                            onChange={(e) => handleChange(field.label, e.target.value)}
                            value={value}
                            placeholder="Type your answer here..."
                        />
                    ) : field.type === 'textarea' ? (
                        <textarea
                            className={`${inputBaseClass} resize-none h-32 text-xl`}
                            style={{ borderColor: formData[field.label] ? form.theme?.color : undefined }}
                            onChange={(e) => handleChange(field.label, e.target.value)}
                            value={value}
                            placeholder="Type your answer here..."
                        />
                    ) : (field.type === 'dropdown' || field.type === 'radio') ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {field.options.map((opt, idx) => {
                                const isSelected = value === opt;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleChange(field.label, opt)}
                                        className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between group border ${isSelected ? (isDarkMode ? 'bg-white/20 border-white/50 shadow-lg' : 'bg-black/5 border-slate-800 shadow-md') : (isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/40 border-slate-200 hover:bg-white/60')}`}
                                        style={{
                                            borderColor: isSelected ? form.theme?.color : undefined,
                                            backgroundColor: isSelected ? `${form.theme?.color}15` : undefined
                                        }}
                                    >
                                        <span className={`text-lg font-medium flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                                            <span className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-colors ${isSelected ? 'border-current' : (isDarkMode ? 'border-white/30 text-white/50' : 'border-slate-300 text-slate-400')}`} style={{ borderColor: isSelected ? form.theme?.color : undefined, color: isSelected ? form.theme?.color : undefined }}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            {opt}
                                        </span>
                                        {isSelected && <CheckCircle size={24} color={form.theme?.color || (isDarkMode ? '#fff' : '#000')} />}
                                    </div>
                                );
                            })}
                        </div>
                    ) : field.type === 'checkbox' ? (
                        <label className={`flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer transition-all ${value === 'Yes' ? (isDarkMode ? 'bg-white/10 border-white/50' : 'bg-black/5 border-black/20') : (isDarkMode ? 'border-white/10 hover:border-white/30' : 'border-slate-200 hover:border-slate-300')}`}
                            style={{ borderColor: value === 'Yes' ? form.theme?.color : undefined }}
                        >
                            <input
                                type="checkbox"
                                checked={value === 'Yes'}
                                onChange={(e) => handleChange(field.label, e.target.checked ? 'Yes' : 'No')}
                                className="w-8 h-8 rounded text-primary focus:ring-primary focus:ring-offset-0"
                                style={{ color: form.theme?.color }}
                            />
                            <span className={`text-2xl font-medium ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>Yes, I agree</span>
                        </label>
                    ) : null}
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
            <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${isDarkMode ? 'border-white' : 'border-indigo-600'}`}></div>
        </div>
    );

    if (error) return (
        <div className={`flex justify-center items-center min-h-screen font-medium text-xl ${isDarkMode ? 'bg-gray-900 text-red-400' : 'bg-slate-50 text-red-500'}`}>
            ⚠️ {error}
        </div>
    );

    if (submitted) {
        const userName = getUserName();
        const earnedPoints = Object.values(formData).filter(v => v !== '').length * 50;
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
                <div className={`w-full max-w-2xl p-12 rounded-3xl text-center border shadow-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'}`}>
                    <div className="text-6xl mb-6">🎉</div>
                    <h1 className="text-4xl font-bold mb-4">{userName ? `Thank you, ${userName}!` : 'Submission Successful!'}</h1>
                    <p className="text-slate-500 mb-8 text-lg">Your responses have been recorded securely.</p>
                    <div className={`inline-block px-8 py-4 rounded-2xl border font-bold text-xl ${isDarkMode ? 'bg-indigo-900/30 border-indigo-500 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                        You earned {earnedPoints} XP! ⭐
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col ${form.theme?.font || 'font-sans'} transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-inherit border-b border-white/10 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">S</div>
                    <span className="font-bold text-lg">{form.theme?.sponsor || 'SmartForm'}</span>
                </div>
                <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2 rounded-full border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-yellow-400' : 'bg-white border-slate-200 text-slate-700'}`}
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </header>

            {/* Form Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-16">
                <div className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight" style={{ color: form.theme?.color }}>
                        {form.title}
                    </h1>
                    <p className="text-xl text-slate-500 font-medium italic">Please answer all questions below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {visibleFields.map((field, index) => renderField(field, index))}

                    <div className="pt-10 border-t border-slate-200/50">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full md:w-auto px-12 py-5 rounded-2xl text-white font-bold text-2xl shadow-xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
                            style={{ backgroundColor: form.theme?.color || '#6366f1' }}
                        >
                            {submitting ? 'Submitting...' : 'Submit Form'}
                        </button>
                    </div>
                </form>
            </main>

            {/* Footer */}
            <footer className="p-10 text-center opacity-40 text-sm font-medium">
                &copy; {new Date().getFullYear()} {form.theme?.sponsor || 'SmartForm'}. Created with passion.
            </footer>
        </div>
    );
}
