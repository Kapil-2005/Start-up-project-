
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { endpoints } from '../config/api';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function FormView() {
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({});

    // Typeform Style State
    const [currentStep, setCurrentStep] = useState(0);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                // Using the provided endpoint modification
                const response = await fetch(endpoints.forms.replace('/api/forms', `/api/forms/${id}`));
                const data = await response.json();

                if (response.ok) {
                    setForm(data);
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

    const handleNext = (e) => {
        if (e) e.preventDefault();

        // Basic validation
        const field = form.fields[currentStep];
        if (field.required && !formData[field.label]) {
            alert('Please fill this field');
            return;
        }

        // Logic check
        const nextStepIndex = getNextStep(currentStep, formData[field.label]);

        if (nextStepIndex !== -1) {
            setAnimating(true);
            setTimeout(() => {
                setCurrentStep(nextStepIndex);
                setAnimating(false);
            }, 300);
        } else {
            handleSubmit();
        }
    };

    const getNextStep = (currentIndex, answer) => {
        const field = form.fields[currentIndex];

        // Check if there's logic for this answer
        if (field.logic && field.logic.length > 0) {
            const rule = field.logic.find(r => r.ifValue === answer);
            if (rule) {
                if (rule.jumpTo === 'end') return -1; // Submit
                const targetIndex = form.fields.findIndex(f => f.id.toString() === rule.jumpTo.toString());
                if (targetIndex !== -1) return targetIndex;
            }
        }

        // Default: Go to next index
        if (currentIndex < form.fields.length - 1) {
            return currentIndex + 1;
        }
        return -1; // End of form
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setAnimating(false);
            }, 300);
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(endpoints.submit(id), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                alert('Failed to submit form');
            }
        } catch (err) {
            console.error(err);
            alert('Error submitting form');
        }
    };

    // Render Field Helper
    const renderField = (field) => {
        const value = formData[field.label] || '';

        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'phone':
                return (
                    <input
                        type={field.type === 'phone' ? 'tel' : field.type}
                        className="w-full bg-transparent border-b-2 border-slate-300 py-4 text-3xl text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-800 transition-colors font-light"
                        style={{ borderColor: formData[field.label] ? form.theme?.color : undefined }}
                        onChange={(e) => handleChange(field.label, e.target.value)}
                        value={value}
                        placeholder="Type here..."
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleNext(e); }}
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        className="w-full bg-transparent border-b-2 border-slate-300 py-4 text-2xl text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-800 transition-colors font-light resize-none h-40"
                        style={{ borderColor: formData[field.label] ? form.theme?.color : undefined }}
                        onChange={(e) => handleChange(field.label, e.target.value)}
                        value={value}
                        placeholder="Type here..."
                        autoFocus
                    />
                );
            case 'dropdown':
                return (
                    <div className="space-y-3">
                        {field.options.map((opt, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    handleChange(field.label, opt);
                                    setTimeout(() => handleNext(), 200); // Auto advance
                                }}
                                className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center justify-between group ${value === opt ? 'bg-slate-50 border-slate-800' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                                style={{
                                    borderColor: value === opt ? form.theme?.color : undefined,
                                    backgroundColor: value === opt ? `${form.theme?.color}10` : undefined
                                }}
                            >
                                <span className="text-xl text-slate-700 font-medium flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center text-sm text-slate-400 group-hover:border-slate-400">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    {opt}
                                </span>
                                {value === opt && <CheckCircle size={20} color={form.theme?.color || '#6366f1'} />}
                            </div>
                        ))}
                    </div>
                );
            case 'radio': // Treat radio same as dropdown for visual style
                return (
                    <div className="space-y-3">
                        {field.options.map((opt, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    handleChange(field.label, opt);
                                    setTimeout(() => handleNext(), 200);
                                }}
                                className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center justify-between group ${value === opt ? 'bg-slate-50 border-slate-800' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                                style={{
                                    borderColor: value === opt ? form.theme?.color : undefined,
                                    backgroundColor: value === opt ? `${form.theme?.color}10` : undefined
                                }}
                            >
                                <span className="text-xl text-slate-700 font-medium flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-slate-400">
                                        {value === opt && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form.theme?.color }}></div>}
                                    </span>
                                    {opt}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            case 'checkbox':
                return (
                    <label className={`flex items-center gap-4 p-6 border-2 rounded-xl cursor-pointer transition-all ${value === 'Yes' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}
                        style={{ borderColor: value === 'Yes' ? form.theme?.color : undefined }}
                    >
                        <input
                            type="checkbox"
                            checked={value === 'Yes'}
                            onChange={(e) => handleChange(field.label, e.target.checked ? 'Yes' : 'No')}
                            className="w-8 h-8 rounded text-primary focus:ring-primary"
                            style={{ color: form.theme?.color }}
                        />
                        <span className="text-2xl font-medium text-slate-700">Yes, I agree</span>
                    </label>
                );
            default:
                return null;
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

    if (error) return <div className="flex justify-center items-center h-screen text-red-500 font-medium">⚠️ {error}</div>;

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="text-center animate-scale-in">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800 mb-4">Thank You!</h1>
                    <p className="text-lg text-slate-500 max-w-md mx-auto">Your response has been successfully recorded. You may close this tab now.</p>
                </div>
            </div>
        );
    }

    const currentField = form.fields[currentStep];
    const progress = ((currentStep + 1) / form.fields.length) * 100;

    return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 bg-slate-50`}>
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200 z-50">
                <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%`, backgroundColor: form.theme?.color || '#6366f1' }}
                ></div>
            </div>

            {/* Navigation Header */}
            <div className="fixed top-6 right-6 z-40 flex items-center gap-4">
                <div className="text-sm font-medium px-3 py-1 bg-black/5 rounded-full text-slate-500">
                    {currentStep + 1} <span className="opacity-50">/</span> {form.fields.length}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full">
                <div className={`w-full transition-all duration-500 transform ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

                    {/* Question Number */}
                    <div className="flex items-center gap-3 mb-6 text-slate-500 font-semibold uppercase tracking-wider text-sm">
                        <span>Question {currentStep + 1}</span>
                        {currentField.required && <span className="text-red-500">* Required</span>}
                    </div>

                    {/* Question Label */}
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 md:mb-12 leading-tight">
                        {currentField.label}
                    </h1>

                    {/* Description (Optional) */}
                    {/* <p className="text-xl text-slate-500 mb-8 font-light">Description here if applicable...</p> */}

                    {/* Input Area */}
                    <div className="mb-12">
                        {renderField(currentField)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleNext}
                            className="group px-8 py-4 rounded-xl text-white font-bold text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                            style={{ backgroundColor: form.theme?.color || '#6366f1' }}
                        >
                            {currentStep === form.fields.length - 1 ? 'Submit' : 'OK'}
                            {currentStep < form.fields.length - 1 && <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />}
                            {currentStep === form.fields.length - 1 && <CheckCircle size={24} />}
                        </button>

                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="px-6 py-4 rounded-xl text-slate-500 font-bold text-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft size={20} /> Back
                            </button>
                        )}

                        <span className="text-sm text-slate-400 hidden md:inline-block ml-4">
                            press <strong>Enter ↵</strong>
                        </span>
                    </div>

                </div>
            </div>

            {/* Branding Footer */}
            <div className="p-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 text-xs font-semibold text-slate-500">
                    <span>Powered by</span>
                    <span className="text-slate-800">SmartForm</span>
                </div>
            </div>
        </div>
    );
}
