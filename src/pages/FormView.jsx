
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { endpoints } from '../config/api';
import { CheckCircle, ArrowRight, ArrowLeft, Sun, Moon, Sparkles, Download, Share2, Mail } from 'lucide-react';

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
    const [isDarkMode, setIsDarkMode] = useState(false);

    // AI Suggestions State
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [isThinking, setIsThinking] = useState(false);

    // AI Chat Assistant State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { role: 'bot', text: 'Hi! Confused? Ask me what to select from these options! 🧑‍🌾' }
    ]);

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

    const handleNext = (e) => {
        if (e) e.preventDefault();

        // Basic validation
        const field = visibleFields[currentStep];
        if (field.required && !formData[field.label]) {
            alert('Please fill this field');
            return;
        }

        if (currentStep < visibleFields.length - 1) {
            setAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setAnimating(false);
            }, 300);
        } else {
            handleSubmit();
        }
    };

    const handleSendChat = () => {
        if (!chatInput.trim()) return;

        // Add user message
        const newMessages = [...chatMessages, { role: 'user', text: chatInput }];
        setChatMessages([...newMessages, { role: 'bot', text: '...' }]); // loading placeholder
        setChatInput('');

        // Provide conversational context based on current field
        const currentFieldLocal = visibleFields[currentStep];

        setTimeout(() => {
            const contextMsg = currentFieldLocal ? `Regarding "${currentFieldLocal.label}", ` : "As a smart tool, ";
            const inputLower = chatInput.toLowerCase();
            let botReply = `${contextMsg} just pick the option that feels closest. I'll automatically adapt the rest of the form logic based on your answers!`;

            if (inputLower.includes('wheat') || inputLower.includes('rice') || inputLower.includes('cotton')) {
                botReply = `You mentioned a crop! Depending on weather, Wheat is great for cooler 20-25°C temps while Rice loves the rain. Pick the one you are planning to grow.`;
            } else if (inputLower.includes('how') || inputLower.includes('explain') || inputLower.includes('confused')) {
                botReply = `${contextMsg} I can help! If you're unsure what to select, just choose the closest match or type a brief answer. My AI engine will analyze it for you on the next page.`;
            }

            setChatMessages([...newMessages, { role: 'bot', text: botReply }]);
        }, 1200);
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

    // Intelligence System: Auto Suggestions based on Live API Context
    useEffect(() => {
        const field = visibleFields[currentStep];
        if (!field) return;

        const value = formData[field.label];
        setAiSuggestion(null);

        // Keyword trigger check
        const isCropRelated = field.label.toLowerCase().includes('crop') || field.label.toLowerCase().includes('farm') || field.label.toLowerCase().includes('seed');

        if (isCropRelated && value) {
            setIsThinking(true);
            const fetchWeatherIntel = async () => {
                try {
                    // Fetch real-time forecasting info using Open-Meteo (No API Key required)
                    // Latitude/Longitude roughly set to Central India (Agricultural belt)
                    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=21.0&longitude=78.0&daily=temperature_2m_max,precipitation_sum&timezone=auto');
                    const data = await res.json();
                    
                    const temps = data.daily.temperature_2m_max.slice(0, 7);
                    const rains = data.daily.precipitation_sum.slice(0, 7);
                    
                    const avgTemp = Math.round(temps.reduce((a, b) => a + b) / 7);
                    const totalRain = Math.round(rains.reduce((a, b) => a + b));
                    
                    let advice = "";
                    const cropType = value.toLowerCase();

                    if (cropType.includes('wheat') || cropType.includes('gehu')) {
                        advice = `Wheat sowing is optimal at ~20-25°C. The average temp expected for the next 7 days is ${avgTemp}°C. `;
                        advice += avgTemp <= 25 ? "Right now is the perfect time to sow!" : "Consider waiting a bit for cooler weather.";
                    } else if (cropType.includes('rice') || cropType.includes('paddy') || cropType.includes('dhan')) {
                        advice = `Rice cultivation needs abundant water. Expected rainfall next 7 days: ${totalRain}mm. `;
                        advice += totalRain > 20 ? "Good rainfall expected! Nursery preparations can begin." : "Ensure you have adequate irrigation setups ready before sowing.";
                    } else if (cropType.includes('cotton') || cropType.includes('kapas')) {
                        advice = `Cotton grows well with warm temps and moderate rain. Next 7 days avg: ${avgTemp}°C, ${totalRain}mm rain. Looks like a favorable window!`;
                    } else {
                        advice = `Based on live forecast, expect ${avgTemp}°C temps and ${totalRain}mm rainfall over the next 7 days. Plan your farming activities accordingly.`;
                    }

                    setTimeout(() => {
                        setAiSuggestion({
                            title: `Crop Intelligence & Weather Context`,
                            text: advice
                        });
                        setIsThinking(false);
                    }, 500); // Small artificial delay to show thinking UI
                } catch (e) {
                    console.error("Intelligence API failed:", e);
                    setIsThinking(false);
                }
            };
            
            // Debounce the call to avoid hitting the API repeatedly
            if (value.length >= 3 || ['dropdown', 'radio'].includes(field.type)) {
                const timer = setTimeout(() => fetchWeatherIntel(), 700);
                return () => clearTimeout(timer);
            } else {
                setIsThinking(false);
            }
        } else {
            setIsThinking(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, currentStep]);

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

    // Helper to extract Name
    const getUserName = () => {
        const nameKey = Object.keys(formData).find(k => k.toLowerCase().includes('name'));
        return nameKey ? formData[nameKey] : '';
    };

    // Personalization Interpolation System
    const interpolateText = (text) => {
        if (!text) return text;
        return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const cleanKey = key.trim().toLowerCase();
            let val = formData[key.trim()];
            if (val) return val;

            const foundField = Object.keys(formData).find(k => k.toLowerCase().includes(cleanKey));
            if (foundField && formData[foundField]) return formData[foundField];

            // Specific fallback for "name" generic tags
            if (cleanKey === 'name') {
                const n = getUserName();
                if (n) return n;
            }

            return match; // fallback
        });
    };

    // Render Field Helper
    const renderField = (field) => {
        const value = formData[field.label] || '';
        
        const inputBaseClass = `w-full bg-transparent border-b-2 py-4 text-3xl placeholder:opacity-40 focus:outline-none transition-colors font-light ${isDarkMode ? 'border-gray-600 text-white focus:border-white' : 'border-slate-300 text-slate-800 focus:border-slate-800'}`;

        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'phone':
                return (
                    <input
                        type={field.type === 'phone' ? 'tel' : field.type}
                        className={inputBaseClass}
                        style={{ borderColor: formData[field.label] ? form.theme?.color : undefined }}
                        onChange={(e) => handleChange(field.label, e.target.value)}
                        value={value}
                        placeholder="Type your answer here..."
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleNext(e); }}
                    />
                );
            case 'textarea':
                return (
                     <textarea
                        className={`${inputBaseClass} resize-none h-40 text-2xl`}
                        style={{ borderColor: formData[field.label] ? form.theme?.color : undefined }}
                        onChange={(e) => handleChange(field.label, e.target.value)}
                        value={value}
                        placeholder="Type your answer here..."
                        autoFocus
                    />
                );
            case 'dropdown':
            case 'radio':
                return (
                    <div className="space-y-4">
                        {field.options.map((opt, idx) => {
                            const isSelected = value === opt;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        handleChange(field.label, opt);
                                        setTimeout(() => handleNext(), 250); // Auto advance
                                    }}
                                    className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between group backdrop-blur-sm border ${isSelected ? (isDarkMode ? 'bg-white/20 border-white/50 shadow-lg' : 'bg-black/5 border-slate-800 shadow-md') : (isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/40 border-slate-200 hover:bg-white/60 hover:shadow-sm')}`}
                                    style={{
                                        borderColor: isSelected ? form.theme?.color : undefined,
                                        backgroundColor: isSelected ? `${form.theme?.color}15` : undefined
                                    }}
                                >
                                    <span className={`text-xl font-medium flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                                        <span className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-colors ${isSelected ? 'border-current' : (isDarkMode ? 'border-white/30 text-white/50' : 'border-slate-300 text-slate-400')}`} style={{ borderColor: isSelected ? form.theme?.color : undefined, color: isSelected ? form.theme?.color : undefined }}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        {opt}
                                    </span>
                                    {isSelected && <CheckCircle size={24} color={form.theme?.color || (isDarkMode ? '#fff' : '#000')} className="animate-scale-in" />}
                                </div>
                            );
                        })}
                    </div>
                );
            case 'checkbox':
                return (
                    <label className={`flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer transition-all backdrop-blur-sm ${value === 'Yes' ? (isDarkMode ? 'bg-white/10 border-white/50' : 'bg-black/5 border-black/20') : (isDarkMode ? 'border-white/10 hover:border-white/30' : 'border-slate-200 hover:border-slate-300')}`}
                        style={{ borderColor: value === 'Yes' ? form.theme?.color : undefined, backgroundColor: value === 'Yes' ? `${form.theme?.color}10` : undefined }}
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
                );
            default:
                return null;
        }
    };

    if (loading) return (
        <div className={`flex justify-center items-center min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
            <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${isDarkMode ? 'border-white' : 'border-indigo-600'}`}></div>
        </div>
    );

    if (error) return (
        <div className={`flex justify-center items-center min-h-screen font-medium text-xl transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-red-400' : 'bg-slate-50 text-red-500'}`}>
            ⚠️ {error}
        </div>
    );

    if (submitted) {
        const userName = getUserName();
        // Determine personalized suggestion if crop or farm inputs exist
        const cropInput = Object.entries(formData).find(([k]) => k.toLowerCase().includes('crop'));
        const personalizedItem = cropInput ? cropInput[1] : '';

        // Dynamic Analysis Engine (Mock Logic based on user answers)
        const generateProfileAnalysis = () => {
            let profileType = "Explorer";
            let recommended = ["Wheat", "Mustard"];
            let riskLevel = "Medium";
            let score = 75;

            const answers = Object.values(formData).join(' ').toLowerCase();

            if (answers.includes('rice') || answers.includes('cotton') || answers.includes('expert') || answers.includes('large')) {
                profileType = "Advanced Agriculturist";
                recommended = ["Cotton", "Sugarcane"];
                riskLevel = "High";
                score = 92;
            } else if (answers.includes('student') || answers.includes('beginner') || answers.includes('small')) {
                profileType = "Beginner Farmer";
                recommended = ["Vegetables", "Legumes", "Mustard"];
                riskLevel = "Low";
                score = 65;
            }

            return { profileType, recommended, riskLevel, score };
        };

        const analysis = generateProfileAnalysis();
        const earnedPoints = Object.values(formData).filter(v => v !== '').length * 50;
        const rewardBadge = earnedPoints >= 300 ? "Gold Level 🏆" : earnedPoints >= 150 ? "Silver Level 🥈" : "Bronze Level 🥉";

        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 relative overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
                {/* Background Blobs for Submission */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none print:hidden">
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 ${isDarkMode ? 'bg-blue-500' : 'bg-blue-300'} animate-blob`}></div>
                </div>
                
                <div className={`relative z-10 w-full max-w-3xl animate-scale-in p-8 md:p-12 rounded-3xl backdrop-blur-xl border shadow-2xl print:shadow-none print:border-none print:bg-transparent ${isDarkMode ? 'bg-gray-800/60 border-gray-700/50 shadow-black/50 text-white print:text-black' : 'bg-white/80 border-white/50 shadow-indigo-100/50 text-slate-800'}`}>
                    
                    {/* Header with Gamified Banner */}
                    <div className="text-center mb-8">
                        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 shadow-xl animate-bounce border-4 ${isDarkMode ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-yellow-100 border-yellow-200 text-yellow-600'}`}>
                            <span className="text-5xl">🏆</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                            {userName ? `Form Completed, ${userName}! ✅` : 'Form Completed! ✅'}
                        </h1>
                        
                        <div className={`inline-flex flex-col md:flex-row items-center gap-3 px-6 py-4 rounded-2xl border shadow-sm mt-2 mb-4 mx-auto transition-transform hover:scale-105 ${isDarkMode ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
                            <Sparkles className={isDarkMode ? 'text-yellow-400' : 'text-yellow-500'} size={24} />
                            <span className={`text-lg font-bold ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                                You earned <span className={`text-2xl font-black mx-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{earnedPoints} XP</span> points!
                            </span>
                            <span className={`text-sm font-black tracking-widest uppercase px-4 py-1.5 rounded-full md:ml-3 border ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-white text-yellow-700 border-yellow-300 shadow-sm'}`}>
                                {rewardBadge} Unlocked
                            </span>
                        </div>
                    </div>

                    {/* Detailed Result & Analysis Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Score Card */}
                        <div className={`p-6 rounded-3xl flex flex-col items-center justify-center text-center border shadow-sm ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-slate-200'}`}>
                            <div className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">Readiness Score</div>
                            <div className={`text-7xl font-black mb-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{analysis.score}<span className="text-2xl opacity-50 font-medium">/100</span></div>
                            <div className={`text-sm font-bold px-4 py-1.5 rounded-full ${isDarkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
                                Top 15% of users
                            </div>
                        </div>

                        {/* Analysis Details */}
                        <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-center space-y-6 ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-slate-200'}`}>
                            <div>
                                <div className="text-xs uppercase font-bold text-slate-400 mb-1">Your Profile</div>
                                <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{analysis.profileType}</div>
                            </div>
                            <div className="h-px w-full bg-slate-200/20"></div>
                            <div>
                                <div className="text-xs uppercase font-bold text-slate-400 mb-2">Risk Level Estimate</div>
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-4 w-4">
                                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${analysis.riskLevel === 'High' ? 'bg-red-400' : analysis.riskLevel === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
                                      <span className={`relative inline-flex rounded-full h-4 w-4 ${analysis.riskLevel === 'High' ? 'bg-red-500' : analysis.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                    </span>
                                    <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{analysis.riskLevel}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations Block */}
                    <div className={`p-6 md:p-8 rounded-3xl border mb-10 shadow-sm ${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/10 border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-100'}`}>
                        <h3 className={`text-sm uppercase font-bold tracking-widest mb-5 flex items-center gap-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <CheckCircle size={18} /> Recommended Next Steps
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {analysis.recommended.map((item, i) => (
                                <span key={i} className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform hover:-translate-y-1 ${isDarkMode ? 'bg-blue-800/40 text-blue-100 border border-blue-700/50' : 'bg-white text-blue-800 border border-blue-200/60'}`}>
                                    {item}
                                </span>
                            ))}
                            {personalizedItem && (
                                <span className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform hover:-translate-y-1 ${isDarkMode ? 'bg-green-800/40 text-green-100 border border-green-700/50' : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border border-transparent'}`}>
                                    Optimize {personalizedItem} Setup
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 print:hidden">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <button onClick={() => window.print()} className={`flex-1 w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-[15px] transition-all border shadow-sm hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                                <Download size={20} /> Download PDF
                            </button>
                            
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Result link copied to clipboard!');
                                }} 
                                className={`flex-1 w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-[15px] transition-all border shadow-sm hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                            >
                                <Share2 size={20} /> Share Link
                            </button>
                            
                            <button 
                                onClick={() => {
                                    const subject = encodeURIComponent(`Assessment Results for ${userName || 'You'}`);
                                    const body = encodeURIComponent(`I just completed the interactive assessment!\n\nOverall Score: ${analysis.score}/100\nProfile: ${analysis.profileType}\n\nTake the assessment here: ${window.location.href}`);
                                    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                                }} 
                                className={`flex-1 w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-[15px] transition-all border shadow-sm hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                            >
                                <Mail size={20} /> Email Result
                            </button>
                        </div>

                        <div className="text-center mt-6">
                            <button onClick={() => window.location.reload()} className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl active:scale-95 inline-block ${isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                                Start New Assessment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentField = visibleFields[currentStep];
    const progress = ((currentStep + 1) / visibleFields.length) * 100;

    // Safety check if currentStep went out of bounds
    if (!currentField) {
        if (currentStep > 0) setTimeout(() => setCurrentStep(visibleFields.length - 1), 0);
        return null;
    }

    return (
        <div className={`min-h-screen flex flex-col ${form.theme?.font || 'font-sans'} transition-colors duration-700 relative overflow-hidden ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
            
            {/* Animated Ambient Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-40 animate-blob ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-300'}`} style={{ backgroundColor: isDarkMode ? undefined : (form.theme?.color ? `${form.theme.color}40` : undefined)}}></div>
                <div className={`absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-40 animate-blob animation-delay-2000 ${isDarkMode ? 'bg-purple-900' : 'bg-purple-300'}`}></div>
                <div className={`absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-40 animate-blob animation-delay-4000 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-300'}`}></div>
            </div>

            {/* Header: Progress Bar & Dark Mode Toggle */}
            <header className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center pointer-events-none">
                <div className="w-1/3"></div>
                
                {/* Glass Capsule Progress Bar */}
                <div className={`w-1/3 max-w-sm h-3 rounded-full overflow-hidden backdrop-blur-md border shadow-sm pointer-events-auto ${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white/60 border-white/50'}`}>
                    <div
                        className="h-full transition-all duration-700 ease-out rounded-full"
                        style={{ width: `${progress}%`, backgroundColor: form.theme?.color || (isDarkMode ? '#818cf8' : '#6366f1') }}
                    ></div>
                </div>

                <div className="w-1/3 flex justify-end gap-3 pointer-events-auto">
                    {/* Live Gamification XP Tracker */}
                    <div className={`hidden md:flex text-sm font-bold px-4 py-2 rounded-full border shadow-sm backdrop-blur-md items-center gap-2 transition-all ${isDarkMode ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-400' : 'bg-white border-yellow-200 text-yellow-600'}`}>
                        ⭐ {Object.values(formData).filter(v => v !== '').length * 50} XP
                    </div>

                    <div className={`text-sm font-medium px-4 py-2 rounded-full border backdrop-blur-md flex items-center gap-2 ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 text-gray-300' : 'bg-white/50 border-white/50 text-slate-600'}`}>
                        {currentStep + 1} <span className="opacity-40">/</span> {visibleFields.length}
                    </div>
                    
                    <button 
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2.5 rounded-full border backdrop-blur-md transition-transform hover:scale-110 ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 text-yellow-400' : 'bg-white/50 border-white/50 text-slate-700'}`}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center p-6 md:p-12 w-full z-10">
                <div 
                    className={`w-full max-w-3xl mx-auto p-10 md:p-14 rounded-[2rem] backdrop-blur-xl border shadow-2xl transition-all duration-500 ease-in-out ${
                        isDarkMode ? 'bg-gray-800/40 border-white/10 shadow-black/50' : 'bg-white/50 border-white/60 shadow-indigo-900/10'
                    } ${
                        animating ? 'opacity-0 scale-95 translate-y-8' : 'opacity-100 scale-100 translate-y-0'
                    }`}
                >
                    {/* Question Indicator */}
                    <div className={`flex items-center gap-3 mb-8 font-semibold uppercase tracking-widest text-sm ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                            Step {currentStep + 1}
                        </span>
                        {currentField.required && <span className="text-red-500 ml-4 flex items-center gap-1">* Required</span>}
                    </div>

                    {/* Question Label */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-12 leading-tight tracking-tight">
                        {interpolateText(currentField.label)}
                    </h1>

                    {/* Input Area */}
                    <div className="mb-8 min-h-[120px]">
                        {renderField(currentField)}
                    </div>

                    {/* AI / Weather Intelligence Bubble */}
                    <div className={`transition-all duration-500 overflow-hidden ${isThinking || aiSuggestion ? 'mb-8 opacity-100 max-h-[250px]' : 'max-h-0 opacity-0'}`}>
                        {isThinking && !aiSuggestion && (
                            <div className={`p-4 rounded-xl border flex items-center gap-4 shadow-sm ${isDarkMode ? 'bg-indigo-900/40 border-indigo-500/30' : 'bg-indigo-50 border-indigo-100'}`}>
                                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Fetching live API weather parameters...</span>
                            </div>
                        )}
                        
                        {aiSuggestion && !isThinking && (
                            <div className={`p-5 rounded-xl border flex items-start gap-4 animate-scale-in shadow-sm ${isDarkMode ? 'bg-gradient-to-br from-indigo-900/40 to-slate-800/40 border-indigo-500/30' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'}`}>
                                <div className={`p-2 rounded-lg shrink-0 ${isDarkMode ? 'bg-indigo-500/30 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>{aiSuggestion.title}</h4>
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {aiSuggestion.text}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center gap-6 mt-8">
                        <button
                            onClick={handleNext}
                            className="group px-10 py-4 rounded-2xl text-white font-bold text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 active:scale-95"
                            style={{ backgroundColor: form.theme?.color || '#6366f1' }}
                        >
                            {currentStep === visibleFields.length - 1 ? 'Submit' : 'Continue'}
                            {currentStep < visibleFields.length - 1 && <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />}
                            {currentStep === visibleFields.length - 1 && <CheckCircle size={24} className="group-hover:scale-110 transition-transform" />}
                        </button>

                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className={`px-6 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 hover:-translate-x-1 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-black/5'}`}
                            >
                                <ArrowLeft size={20} /> Back
                            </button>
                        )}

                        <span className={`text-sm hidden md:inline-block ml-auto opacity-60 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                            press <strong>Enter ↵</strong>
                        </span>
                    </div>
                </div>
            </main>

            {/* Branding Footer */}
            <div className={`p-6 text-center z-10 transition-opacity duration-300 print:hidden ${animating ? 'opacity-0' : 'opacity-100'}`}>
                <div className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold backdrop-blur-md border shadow-sm transition-transform hover:scale-105 cursor-default ${isDarkMode ? 'bg-gray-800/60 border-gray-700/50 text-gray-400' : 'bg-white/80 border-slate-200/60 text-slate-500'}`}>
                    <span className="opacity-80">Powered by</span>
                    <span 
                        className="text-[13px] px-2 py-0.5 rounded-md text-white shadow-sm flex items-center gap-1.5"
                        style={{ backgroundColor: form.theme?.color || (isDarkMode ? '#4f46e5' : '#1e293b') }}
                    >
                        <Sparkles size={12} className="opacity-80" />
                        {form.theme?.sponsor || 'SmartForm'}
                    </span>
                </div>
            </div>

            {/* AI Assistant Chatbot Widget */}
            <div className="fixed bottom-6 right-6 z-50 print:hidden flex flex-col items-end pointer-events-auto">
                {isChatOpen && (
                    <div className={`w-80 h-96 mb-4 rounded-3xl shadow-2xl border flex flex-col overflow-hidden animate-scale-in origin-bottom-right ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
                        {/* Header */}
                        <div className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'bg-indigo-900 border-indigo-500/30' : 'bg-indigo-600 border-indigo-500'}`}>
                            <div className="flex items-center gap-2 font-bold text-white shadow-sm">
                                <Sparkles size={18} /> Smart Assistant
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="text-white opacity-80 hover:opacity-100 font-bold px-2">&times;</button>
                        </div>
                        
                        {/* Messages Area */}
                        <div className={`flex-1 p-4 overflow-y-auto flex flex-col gap-3 scroll-smooth ${isDarkMode ? 'bg-gray-900/50' : 'bg-slate-50'}`}>
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                                    msg.role === 'user' 
                                        ? `self-end rounded-tr-sm font-medium ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white'}`
                                        : msg.text === '...'
                                            ? `self-start rounded-tl-sm animate-pulse ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-white border border-slate-200 text-gray-400'}`
                                            : `self-start rounded-tl-sm font-medium ${isDarkMode ? 'bg-indigo-900/40 text-indigo-100 border border-indigo-500/30' : 'bg-white border border-slate-200 text-slate-700'}`
                                }`}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                        
                        {/* Input Area */}
                        <div className={`p-3 border-t flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
                            <input 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') handleSendChat();
                                }}
                                type="text" 
                                placeholder="Confused? Ask me..." 
                                className={`flex-1 min-w-0 bg-transparent text-sm font-medium focus:outline-none px-2 ${isDarkMode ? 'text-white placeholder:text-gray-500' : 'text-slate-800 placeholder:text-slate-400'}`}
                            />
                            <button onClick={handleSendChat} className={`p-2.5 rounded-xl transition-all active:scale-95 ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 shadow-sm'}`}>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Float Toggle Button */}
                {!submitted && (
                    <button 
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group relative border-2 ${isDarkMode ? 'bg-gray-800 text-indigo-400 border-indigo-500/50 shadow-indigo-500/20' : 'bg-white text-indigo-600 border-indigo-100 shadow-indigo-600/20'}`}>
                        {/* Teaser Bubble */}
                        {!isChatOpen && (
                            <div className={`absolute right-16 top-1/2 -translate-y-1/2 px-4 py-2 font-bold text-xs whitespace-nowrap rounded-xl rounded-tr-sm shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block border ${isDarkMode ? 'bg-indigo-900 border-indigo-500/50 text-indigo-100' : 'bg-indigo-600 border-indigo-700 text-white'}`}>
                                Need help? Ask AI!
                            </div>
                        )}
                        {isChatOpen ? <span className="font-bold text-2xl rotate-45 transition-transform">+</span> : <Sparkles size={24} />}
                    </button>
                )}
            </div>
        </div>
    );
}
