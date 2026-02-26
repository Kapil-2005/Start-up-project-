import React, { useState } from 'react';
import {
    Type, Mail, Hash, List, Trash2, Save, FileText,
    Settings, Eye, MoreHorizontal, ArrowLeft,
    ChevronDown, Phone, Upload, CheckSquare, Calendar, Image as ImageIcon,
    GitBranch
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { cn } from '../utils/cn';

import { useLocation } from 'react-router-dom';
import { endpoints } from '../config/api';

export default function Dashboard() {
    const location = useLocation();
    const [formTitle, setFormTitle] = useState(location.state?.template?.title || 'New Smart Form');
    const [fields, setFields] = useState(location.state?.template?.fields || []);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('elements'); // 'elements' | 'design'
    const [themeColor, setThemeColor] = useState(location.state?.template?.theme?.color || '#6366f1');
    const [fontFamily, setFontFamily] = useState(location.state?.template?.theme?.font || 'font-sans');

    // Logic State
    const [activeLogicField, setActiveLogicField] = useState(null);

    const DraggableElement = ({ type, icon: Icon, label }) => (
        <div
            onClick={() => addField(type)}
            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-primary hover:shadow-md transition-all group"
        >
            <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Icon size={18} />
            </div>
            <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
    );

    const addField = (type) => {
        const newField = {
            id: Date.now(),
            type,
            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            placeholder: '',
            required: false,
            options: type === 'dropdown' || type === 'radio' ? ['Option 1', 'Option 2'] : [],
            logic: [] // Array of { ifValue: '', jumpTo: fieldId }
        };
        setFields([...fields, newField]);
    };

    const removeField = (id) => {
        setFields(fields.filter(field => field.id !== id));
    };

    const updateField = (id, key, value) => {
        setFields(fields.map(field =>
            field.id === id ? { ...field, [key]: value } : field
        ));
    };

    const handleOptionChange = (id, index, value) => {
        setFields(fields.map(field => {
            if (field.id === id) {
                const newOptions = [...field.options];
                newOptions[index] = value;
                return { ...field, options: newOptions };
            }
            return field;
        }));
    };

    const addOption = (id) => {
        setFields(fields.map(field => {
            if (field.id === id) {
                return { ...field, options: [...field.options, `Option ${field.options.length + 1}`] };
            }
            return field;
        }));
    };

    // Logic Handlers
    const addLogicRule = (fieldId) => {
        setFields(fields.map(field => {
            if (field.id === fieldId) {
                return {
                    ...field,
                    logic: [...(field.logic || []), { ifValue: '', jumpTo: '' }]
                };
            }
            return field;
        }));
    };

    const updateLogicRule = (fieldId, index, key, value) => {
        setFields(fields.map(field => {
            if (field.id === fieldId) {
                const newLogic = [...(field.logic || [])];
                newLogic[index] = { ...newLogic[index], [key]: value };
                return { ...field, logic: newLogic };
            }
            return field;
        }));
    };

    const saveForm = async () => {
        setLoading(true);
        try {
            const response = await fetch(endpoints.forms, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formTitle,
                    fields,
                    theme: { color: themeColor, font: fontFamily }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setShareLink(`${window.location.origin}/form/${data.id}`);
                setShowShareModal(true);
            } else {
                alert('Failed to save form: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving form:', error);
            alert('Error saving form');
        } finally {
            setLoading(false);
        }
    };

    const colors = [
        '#6366f1', // Indigo
        '#ec4899', // Pink
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#3b82f6', // Blue
        '#1e293b', // Slate
    ];

    const fonts = [
        { label: 'Outfit (Sans)', value: 'font-sans' },
        { label: 'Playfair (Serif)', value: 'font-serif' },
        { label: 'Roboto (Mono)', value: 'font-mono' },
        { label: 'Montserrat', value: 'font-montserrat' },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">

            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">

                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40">
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                                <span>Form Builder</span>
                                <span className="text-slate-300">/</span>
                                <span>General</span>
                            </div>
                            <input
                                className="text-lg font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0 w-64 placeholder:text-slate-300"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <Eye size={18} /> Preview Form
                        </button>

                        <button
                            onClick={saveForm}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm"
                            style={{ backgroundColor: themeColor }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </header>

                {/* Builder Workspace */}
                <div className="flex flex-1 overflow-hidden h-full">

                    {/* Left Panel: Tabs */}
                    <div className="w-80 glass-panel flex flex-col overflow-y-auto z-10 animate-slide-in-left">
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => setActiveTab('elements')}
                                className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'elements' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700")}
                            >
                                Elements
                            </button>
                            <button
                                onClick={() => setActiveTab('design')}
                                className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'design' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700")}
                            >
                                Design
                            </button>
                        </div>

                        <div className="p-4 space-y-6">

                            {activeTab === 'elements' ? (
                                <>
                                    {/* Section: Basic Fields */}
                                    <div className="animate-fade-in delay-100">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">Common Fields</h4>
                                        <div className="space-y-2">
                                            {/* Draggable items now have hover-scale */}
                                            <DraggableElement type="text" icon={Type} label="Text Block" />
                                            <DraggableElement type="email" icon={Mail} label="Email Address" />
                                            <DraggableElement type="number" icon={Hash} label="Number Input" />
                                            <DraggableElement type="dropdown" icon={List} label="Dropdown" />
                                        </div>
                                    </div>

                                    {/* Section: Advanced Fields */}
                                    <div className="animate-fade-in delay-200">
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">Advanced</h4>
                                        <div className="space-y-2">
                                            <DraggableElement type="phone" icon={Phone} label="Phone Number" />
                                            <DraggableElement type="date" icon={Calendar} label="Date Picker" />
                                            <DraggableElement type="file" icon={Upload} label="File Upload" />
                                            <DraggableElement type="checkbox" icon={CheckSquare} label="Single Checkbox" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-6 animate-scale-in">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Theme Color</label>
                                        <div className="grid grid-cols-6 gap-2">
                                            {colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setThemeColor(color)}
                                                    className={cn(
                                                        "w-8 h-8 rounded-full border-2 transition-all shadow-sm hover:scale-110",
                                                        themeColor === color ? "border-slate-800 scale-110 ring-2 ring-offset-2 ring-slate-200" : "border-transparent"
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="relative overflow-hidden w-10 h-10 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                <input
                                                    type="color"
                                                    value={themeColor}
                                                    onChange={(e) => setThemeColor(e.target.value)}
                                                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0"
                                                />
                                            </div>
                                            <span className="text-sm text-slate-500 font-mono bg-white px-2 py-1 rounded border border-slate-100">{themeColor}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Typography</label>
                                        <div className="space-y-2">
                                            {fonts.map((font) => (
                                                <button
                                                    key={font.value}
                                                    onClick={() => setFontFamily(font.value)}
                                                    className={cn(
                                                        "w-full text-left px-4 py-3 rounded-xl border transition-all text-sm flex items-center justify-between group",
                                                        fontFamily === font.value
                                                            ? "border-primary bg-primary/5 text-primary font-medium shadow-sm"
                                                            : "border-slate-100 hover:border-slate-300 text-slate-600 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <span className={font.value}>{font.label}</span>
                                                    {fontFamily === font.value && <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Center Panel: Canvas */}
                    <div className="flex-1 bg-slate-50/50 p-8 overflow-y-auto relative">
                        {/* Background decorative elements */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float"></div>
                            <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-float delay-500"></div>
                        </div>

                        <div
                            className={cn("max-w-3xl mx-auto min-h-[600px] bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 relative transition-all duration-300 animate-scale-in", fontFamily)}
                            style={{ borderTop: `6px solid ${themeColor}` }}
                        >

                            {fields.length === 0 ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl m-2 border-2 border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                        <FileText size={32} className="text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-700">Start Building Your Form</h3>
                                    <p className="text-slate-500 max-w-sm mt-2 mb-6">Drag and drop elements from the left sidebar to this area to start building your form structure.</p>
                                    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                                        <button onClick={() => addField('text')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-primary hover:text-primary transition-colors text-sm font-medium text-slate-600 shadow-sm">
                                            Add Text Block
                                        </button>
                                        <button onClick={() => addField('email')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-primary hover:text-primary transition-colors text-sm font-medium text-slate-600 shadow-sm">
                                            Add Email Field
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Form Header within Canvas */}
                                    <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        <h2 className="text-2xl font-bold mb-2" style={{ color: themeColor }}>{formTitle}</h2>
                                        <p className="text-slate-500 text-sm">Fill out the details below.</p>
                                    </div>

                                    {fields.map((field, index) => (
                                        <div key={field.id} className="group relative bg-white border border-transparent hover:border-primary/20 rounded-lg p-4 transition-all hover:shadow-sm">

                                            {/* Hover Actions */}
                                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white shadow-sm border border-slate-100 rounded-md p-1 z-10">
                                                <button
                                                    onClick={() => setActiveLogicField(activeLogicField === field.id ? null : field.id)}
                                                    className={cn("p-1.5 rounded hover:bg-slate-50", activeLogicField === field.id ? "text-primary bg-primary/10" : "text-slate-400 hover:text-primary")}
                                                    title="Add Logic"
                                                >
                                                    <GitBranch size={14} />
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-primary rounded hover:bg-slate-50">
                                                    <Settings size={14} />
                                                </button>
                                                <button onClick={() => removeField(field.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-50">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Top Label Edit */}
                                            <div className="mb-2">
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => updateField(field.id, 'label', e.target.value)}
                                                    className={cn("font-medium bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-slate-300", fontFamily)}
                                                    style={{ color: '#334155' }}
                                                />
                                            </div>

                                            {/* Field Render */}
                                            {['text', 'email', 'number', 'phone', 'date', 'file', 'checkbox'].includes(field.type) && (
                                                <input disabled type={field.type === 'phone' ? 'tel' : field.type === 'checkbox' ? 'checkbox' : field.type} placeholder={field.placeholder || "Enter answer"} className={cn("bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-opacity-20", field.type !== 'checkbox' ? "w-full" : "ml-2")} style={{ '--tw-ring-color': themeColor }} />
                                            )}

                                            {['dropdown', 'radio'].includes(field.type) && (
                                                <div className="space-y-2">
                                                    <select disabled className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-500">
                                                        <option>Select an option</option>
                                                    </select>

                                                    {/* Options Editor */}
                                                    <div className="pl-3 border-l-2 py-1" style={{ borderColor: `${themeColor}40` }}>
                                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Options</label>
                                                        {field.options.map((opt, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 mb-1">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                                <input
                                                                    value={opt}
                                                                    onChange={(e) => handleOptionChange(field.id, idx, e.target.value)}
                                                                    className="text-sm bg-transparent border-none p-0 focus:ring-0 text-slate-600 w-full"
                                                                />
                                                            </div>
                                                        ))}
                                                        <button onClick={() => addOption(field.id)} className="text-xs font-medium mt-1 hover:underline" style={{ color: themeColor }}>+ Add Option</button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-2 flex items-center gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                                        style={{ color: themeColor }}
                                                    />
                                                    <span className="text-xs text-slate-500">Required</span>
                                                </label>
                                            </div>

                                            {/* Logic Editor Panel */}
                                            {activeLogicField === field.id && (
                                                <div className="mt-4 p-3 bg-slate-50 border border-indigo-100 rounded-lg animate-fade-in relative z-20">
                                                    <div className="flex items-center gap-2 mb-2 text-primary text-xs font-semibold uppercase tracking-wider">
                                                        <GitBranch size={12} /> Logic Rules
                                                    </div>

                                                    {field.logic?.length === 0 && (
                                                        <p className="text-xs text-slate-400 italic mb-2">No rules added yet.</p>
                                                    )}

                                                    {field.logic?.map((rule, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 mb-2 text-sm">
                                                            <span className="text-slate-500 whitespace-nowrap">If answer is</span>
                                                            <select
                                                                className="bg-white border text-xs border-slate-200 rounded px-2 py-1 flex-1"
                                                                value={rule.ifValue}
                                                                onChange={(e) => updateLogicRule(field.id, idx, 'ifValue', e.target.value)}
                                                            >
                                                                <option value="">Select Value</option>
                                                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                            </select>
                                                            <span className="text-slate-500 whitespace-nowrap">Jump to</span>
                                                            <select
                                                                className="bg-white border text-xs border-slate-200 rounded px-2 py-1 flex-1"
                                                                value={rule.jumpTo}
                                                                onChange={(e) => updateLogicRule(field.id, idx, 'jumpTo', e.target.value)}
                                                            >
                                                                <option value="">Next Question</option>
                                                                {fields.map((f, i) => {
                                                                    if (i > index) return <option key={f.id} value={f.id}>Q{i + 1}: {f.label}</option>
                                                                    return null;
                                                                })}
                                                                <option value="end">Submit Form</option>
                                                            </select>
                                                        </div>
                                                    ))}

                                                    <button
                                                        onClick={() => addLogicRule(field.id)}
                                                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        + Add Rule
                                                    </button>
                                                </div>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </main>

            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckSquare size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Form Published!</h2>
                            <p className="text-slate-500 mt-1">Your form is ready to collect responses.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Share Link</label>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={shareLink}
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 font-mono"
                                        onClick={(e) => e.target.select()}
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(shareLink);
                                            alert('Copied!'); // Could make this a toast
                                        }}
                                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium text-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Close
                                </button>
                                <a
                                    href={shareLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors text-center"
                                >
                                    View Form
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
