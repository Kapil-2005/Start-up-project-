import React, { useState } from 'react';
import {
    Type, Mail, Hash, List, Trash2, Save, FileText,
    Settings, Eye, ArrowLeft, GripVertical, CheckSquare, Calendar, Phone, Upload, GitBranch, Share2, Plus, Palette, LayoutTemplate
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { cn } from '../utils/cn';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { endpoints } from '../config/api';

// DndKit Imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable, useDroppable } from '@dnd-kit/core';

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

const DraggableSidebarElement = ({ type, icon: Icon, label, onClick }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-${type}`,
        data: { type, isSidebarElement: true, label, icon: Icon }
    });
    
    return (
        <div
            className={cn(
                "flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all group",
                isDragging ? "opacity-50 ring-2 ring-primary border-primary" : ""
            )}
        >
            <div 
                ref={setNodeRef}
                {...listeners}
                {...attributes}
                className="flex-1 flex items-center gap-3 cursor-grab"
            >
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-sm">
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-semibold text-slate-700 select-none">{label}</span>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onClick(type); }}
                className="p-2 text-slate-300 hover:text-primary hover:bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                title="Click to add"
            >
                <Plus size={18} />
            </button>
        </div>
    );
};

const CanvasDropZone = ({ children, themeColor, fontFamily, isEmpty }) => {
    const { setNodeRef, isOver } = useDroppable({ id: 'form-canvas' });
    
    return (
         <div 
             ref={setNodeRef} 
             className={cn(
                 "max-w-3xl mx-auto min-h-[700px] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border p-8 relative transition-all duration-300", 
                 fontFamily, 
                 isOver && !isEmpty ? "ring-4 ring-primary/20 border-primary scale-[1.01]" : "border-white/50"
             )}
             style={{ borderTop: `6px solid ${themeColor}` }}
         >
             {children}
         </div>
    );
};

const SortableField = (props) => {
    const { field, index, themeColor, fontFamily, updateField, removeField, handleOptionChange, addOption, addLogicRule, updateLogicRule, activeLogicField, setActiveLogicField, fields } = props;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={cn("group relative bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-6 mb-5 shadow-sm hover:shadow-md transition-all", isDragging && "shadow-xl border-primary ring-2 ring-primary/20")}>
            
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="absolute left-[-20px] top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-white border border-slate-200 shadow-sm rounded-lg" style={{ width: 40, height: 40 }}>
                <GripVertical size={20} />
            </div>

            {/* Hover Actions */}
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-white shadow-md border border-slate-100 rounded-lg p-1.5 z-10">
                <button
                    onClick={() => setActiveLogicField(activeLogicField === field.id ? null : field.id)}
                    className={cn("p-1.5 rounded-md flex items-center gap-1.5 text-xs font-semibold px-2 transition-colors", activeLogicField === field.id ? "text-primary bg-primary/10" : "text-slate-500 hover:text-primary hover:bg-slate-50")}
                    title="Add Conditional Logic"
                >
                    <GitBranch size={14} /> Logic
                </button>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <button onClick={() => removeField(field.id)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 transition-colors">
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Top Label Edit */}
            <div className="mb-4 pr-32">
                <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(field.id, 'label', e.target.value)}
                    className={cn("text-lg font-semibold bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-slate-300 transition-colors hover:text-primary focus:text-primary", fontFamily)}
                    style={{ color: '#1e293b' }}
                />
            </div>

            {/* Field Render Wrapper */}
            <div className="mt-2">
                {['text', 'email', 'number', 'phone', 'date', 'file', 'checkbox'].includes(field.type) && (
                    <input disabled type={field.type === 'phone' ? 'tel' : field.type === 'checkbox' ? 'checkbox' : field.type} placeholder={field.placeholder || "Users will enter their answer here..."} className={cn("bg-slate-50 border border-slate-200 shadow-inner rounded-lg px-4 py-3 text-sm focus:ring-0 text-slate-500 w-full", field.type === 'checkbox' ? "!w-auto !ml-2 h-5 w-5" : "")} />
                )}

                {['dropdown', 'radio'].includes(field.type) && (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-inner">
                        <select disabled className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-500 shadow-sm">
                            <option>Select an option (Preview)</option>
                        </select>

                        {/* Options Editor */}
                        <div className="mt-4 pt-3 border-t border-slate-200/60">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Configure Options</label>
                            <div className="space-y-2">
                                {field.options.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-md border border-slate-200 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary w-full max-w-md">
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 ml-1"></div>
                                        <input
                                            value={opt}
                                            onChange={(e) => handleOptionChange(field.id, idx, e.target.value)}
                                            className="text-sm bg-transparent border-none p-0 focus:ring-0 text-slate-700 w-full font-medium"
                                        />
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addOption(field.id)} className="text-sm font-semibold mt-3 hover:underline flex items-center gap-1" style={{ color: themeColor }}>
                                <Plus size={14} /> Add Option
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Field Settings Footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                        className="rounded border-slate-300 shadow-sm focus:ring-2 focus:ring-offset-1 w-4 h-4 transition-colors cursor-pointer"
                        style={{ color: themeColor, focusRingColor: themeColor }}
                    />
                    <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Required Field</span>
                </label>
            </div>

            {/* Logic Editor Panel */}
            {activeLogicField === field.id && (
                <div className="mt-4 p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl animate-scale-in relative z-20 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold uppercase tracking-wide text-xs">
                        <GitBranch size={14} /> Conditional Logic Rules
                    </div>

                    {field.logic?.length === 0 && (
                        <p className="text-sm text-slate-500 mb-3 bg-white p-3 border border-slate-200 rounded-lg shadow-sm">When users select specific options, direct them to different questions.</p>
                    )}

                    {field.logic?.map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-3 mb-3 text-sm bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <span className="font-medium text-slate-600 whitespace-nowrap">If answer is</span>
                            <select
                                className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 flex-1 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
                                value={rule.ifValue}
                                onChange={(e) => updateLogicRule(field.id, idx, 'ifValue', e.target.value)}
                            >
                                <option value="">Select Option...</option>
                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <span className="font-medium text-slate-600 whitespace-nowrap px-2">then jump to</span>
                            <select
                                className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 flex-1 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
                                value={rule.jumpTo}
                                onChange={(e) => updateLogicRule(field.id, idx, 'jumpTo', e.target.value)}
                            >
                                <option value="">Next Question (Default)</option>
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
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1.5 mt-2 bg-indigo-100/50 px-3 py-1.5 rounded-md transition-colors"
                    >
                        <Plus size={14} /> Add New Rule
                    </button>
                </div>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// MAIN DASHBOARD COMPONENT
// ----------------------------------------------------------------------

export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Core state
    const [formTitle, setFormTitle] = useState(location.state?.template?.title || 'Untitled Form');
    const [fields, setFields] = useState(location.state?.template?.fields || []);
    const [activeTab, setActiveTab] = useState('elements'); // 'elements' | 'design'
    const [loading, setLoading] = useState(false);
    
    // Theme State
    const [themeColor, setThemeColor] = useState(location.state?.template?.theme?.color || '#6366f1');
    const [fontFamily, setFontFamily] = useState(location.state?.template?.theme?.font || 'font-sans');
    const [themeStyle] = useState('glass'); // 'flat' | 'glass' | 'elegant'
    
    // UI State
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [activeLogicField, setActiveLogicField] = useState(null);
    const [activeDragId, setActiveDragId] = useState(null);

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const addField = (type, index = null) => {
        const newField = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            type,
            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
            placeholder: '',
            required: false,
            options: type === 'dropdown' || type === 'radio' ? ['Option A', 'Option B'] : [],
            logic: [] 
        };
        
        if (index !== null) {
            const newFields = [...fields];
            newFields.splice(index, 0, newField);
            setFields(newFields);
        } else {
            setFields([...fields, newField]);
        }
    };

    const handleDragStart = (event) => {
        setActiveDragId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragId(null);
        if (!over) return;

        // Dropped a new element from sidebar into the canvas
        if (active.data.current?.isSidebarElement) {
            if (over.id === 'form-canvas') {
                addField(active.data.current.type);
            } else if (over.data.current?.sortable) {
                // Determine drop index if dropped over a specific field
                const overIndex = fields.findIndex(f => f.id === over.id);
                // Depending on the Y coordinate, you might drop above or below. We'll simply drop it after.
                addField(active.data.current.type, overIndex + 1);
            }
            return;
        }

        // Reordering existing fields
        if (active.id !== over.id) {
            setFields((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const removeField = (id) => setFields(fields.filter(field => field.id !== id));
    
    const updateField = (id, key, value) => {
        setFields(fields.map(field => field.id === id ? { ...field, [key]: value } : field));
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
                return { ...field, logic: [...(field.logic || []), { ifValue: '', jumpTo: '' }] };
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
                    theme: { color: themeColor, font: fontFamily, style: themeStyle }
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

    // Design Tokens
    const accentColors = [
        { name: 'Indigo', hex: '#6366f1' },
        { name: 'Rose', hex: '#f43f5e' },
        { name: 'Emerald', hex: '#10b981' },
        { name: 'Amber', hex: '#f59e0b' },
        { name: 'Sky', hex: '#0ea5e9' },
        { name: 'Violet', hex: '#8b5cf6' },
        { name: 'Slate', hex: '#334155' },
        { name: 'Midnight', hex: '#0f172a' },
    ];

    const typographyOptions = [
        { name: 'Outfit', class: 'font-sans', description: 'Modern & Clean' },
        { name: 'Playfair Display', class: 'font-serif', description: 'Elegant & Classic' },
        { name: 'Roboto', class: 'font-mono', description: 'Structured' },
        { name: 'Montserrat', class: 'font-montserrat', description: 'Bold & Geometric' },
        { name: 'Inter', class: 'font-inter', description: 'Clean & Professional' },
        { name: 'Poppins', class: 'font-poppins', description: 'Friendly & Rounded' },
        { name: 'Lato', class: 'font-lato', description: 'Warm & Sleek' },
        { name: 'Oswald', class: 'font-oswald', description: 'Strong & Condensed' },
        { name: 'Quicksand', class: 'font-quicksand', description: 'Soft & Quirky' },
    ];

    const isDraggingSidebarItem = activeDragId?.toString().startsWith('sidebar-');

    return (
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex min-h-screen bg-slate-50/50 font-sans text-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white">

                <Sidebar />

                <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
                    {/* Top App Bar */}
                    <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-8 shrink-0 z-40 shadow-sm">
                        <div className="flex items-center gap-5">
                            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-0.5 ml-1">Form Builder</span>
                                <input
                                    className="text-xl font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0 w-80 placeholder:text-slate-300 ml-1 transition-colors focus:bg-slate-50 rounded px-2 -mx-2 h-8"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                                <Eye size={18} /> Preview Form
                            </button>

                            <button
                                onClick={saveForm}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                                style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}40` }}
                            >
                                {loading ? 'Saving...' : <><Share2 size={18} /> Publish Form</>}
                            </button>
                        </div>
                    </header>

                    {/* Builder Workspace */}
                    <div className="flex flex-1 overflow-hidden h-full">

                        {/* Left Side Panel */}
                        <div className="w-80 bg-white/60 backdrop-blur-lg border-r border-slate-200/80 flex flex-col overflow-y-auto z-10 shadow-sm">
                            
                            {/* Tabs */}
                            <div className="flex border-b border-slate-200/80 p-2 gap-2 bg-slate-50/50">
                                <button
                                    onClick={() => setActiveTab('elements')}
                                    className={cn("flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 justify-center", activeTab === 'elements' ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700")}
                                >
                                    <LayoutTemplate size={16} /> Elements
                                </button>
                                <button
                                    onClick={() => setActiveTab('design')}
                                    className={cn("flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 justify-center", activeTab === 'design' ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700")}
                                >
                                    <Palette size={16} /> Theme
                                </button>
                            </div>

                            <div className="p-5 h-full overflow-y-auto custom-scrollbar pb-24">
                                {activeTab === 'elements' ? (
                                    <div className="space-y-8 animate-fade-in">
                                        <div>
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Basic Questions
                                            </h4>
                                            <div className="space-y-2.5">
                                                <DraggableSidebarElement onClick={addField} type="text" icon={Type} label="Short Answer" />
                                                <DraggableSidebarElement onClick={addField} type="email" icon={Mail} label="Email Address" />
                                                <DraggableSidebarElement onClick={addField} type="number" icon={Hash} label="Number Input" />
                                                <DraggableSidebarElement onClick={addField} type="dropdown" icon={List} label="Multiple Choice" />
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Advanced Fields
                                            </h4>
                                            <div className="space-y-2.5">
                                                <DraggableSidebarElement onClick={addField} type="phone" icon={Phone} label="Phone Number" />
                                                <DraggableSidebarElement onClick={addField} type="date" icon={Calendar} label="Date Picker" />
                                                <DraggableSidebarElement onClick={addField} type="file" icon={Upload} label="File Upload" />
                                                <DraggableSidebarElement onClick={addField} type="checkbox" icon={CheckSquare} label="Consent Checkbox" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-scale-in">
                                        {/* Theme Colors */}
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-inner">
                                            <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                Brand Color
                                            </h4>
                                            <div className="grid grid-cols-4 gap-3">
                                                {accentColors.map((color) => (
                                                    <button
                                                        key={color.hex}
                                                        onClick={() => setThemeColor(color.hex)}
                                                        className="group flex flex-col items-center gap-1.5 outline-none"
                                                    >
                                                        <div 
                                                            className={cn(
                                                                "w-10 h-10 rounded-full border-2 transition-all shadow-sm hover:scale-110 flex items-center justify-center",
                                                                themeColor === color.hex ? "scale-110 border-white ring-2 ring-offset-2" : "border-transparent"
                                                            )}
                                                            style={{ 
                                                                backgroundColor: color.hex,
                                                                ringColor: color.hex
                                                            }}
                                                        >
                                                            {themeColor === color.hex && <div className="w-2.5 h-2.5 bg-white rounded-full mx-auto" />}
                                                        </div>
                                                        <span className="text-[10px] font-medium text-slate-500 group-hover:text-slate-700">{color.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            
                                            <div className="mt-5 pt-5 border-t border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative overflow-hidden w-12 h-12 rounded-xl shadow-sm border border-slate-200">
                                                        <input
                                                            type="color"
                                                            value={themeColor}
                                                            onChange={(e) => setThemeColor(e.target.value)}
                                                            className="absolute -top-4 -left-4 w-24 h-24 cursor-pointer border-0 p-0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Custom Hex</label>
                                                        <span className="text-sm text-slate-700 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm inline-block">{themeColor.toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Typography */}
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-inner">
                                            <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                Typography
                                            </h4>
                                            <div className="space-y-3">
                                                {typographyOptions.map((font) => (
                                                    <button
                                                        key={font.class}
                                                        onClick={() => setFontFamily(font.class)}
                                                        className={cn(
                                                            "w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all group flex items-start justify-between bg-white shadow-sm",
                                                            fontFamily === font.class
                                                                ? "border-primary ring-1 ring-primary/20"
                                                                : "border-transparent hover:border-slate-300"
                                                        )}
                                                    >
                                                        <div>
                                                            <div className={cn("text-base font-medium text-slate-800 mb-0.5", font.class)}>{font.name}</div>
                                                            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{font.description}</div>
                                                        </div>
                                                        
                                                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-colors", fontFamily === font.class ? "border-primary" : "border-slate-200")}>
                                                            {fontFamily === font.class && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Center Canvas Area */}
                        <div className="flex-1 bg-slate-100/30 p-10 overflow-y-auto relative custom-scrollbar">
                            
                            {/* Decorative Blurs */}
                            <div className="fixed top-20 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
                            <div className="fixed bottom-20 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none z-0 opacity-40" style={{ backgroundColor: themeColor }}></div>

                            <CanvasDropZone themeColor={themeColor} fontFamily={fontFamily} isEmpty={fields.length === 0}>
                                {fields.length === 0 ? (
                                    <div className={cn("absolute inset-0 flex flex-col items-center justify-center p-10 text-center rounded-2xl m-3 border-2 border-dashed transition-all duration-300", isDraggingSidebarItem ? "border-primary bg-primary/5 shadow-inner" : "border-slate-300/80 bg-slate-50/50")}>
                                        <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-6 transition-all duration-500", isDraggingSidebarItem ? "bg-primary text-white scale-110 shadow-primary/30" : "bg-white text-slate-300")}>
                                            <Upload strokeWidth={1.5} size={36} className={isDraggingSidebarItem ? "animate-bounce" : ""} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                            {isDraggingSidebarItem ? 'Drop Element Here' : 'Canvas is Empty'}
                                        </h3>
                                        <p className="text-slate-500 max-w-sm mt-3 mb-8 text-sm leading-relaxed">
                                            {isDraggingSidebarItem ? 'Release your mouse to add the element to the form structure.' : 'Drag & drop form elements from the left sidebar to start building your brilliant form.'}
                                        </p>
                                        
                                        {!isDraggingSidebarItem && (
                                            <div className="flex flex-wrap justify-center gap-3">
                                                <button onClick={() => addField('text')} className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-md transition-all text-sm font-bold text-slate-600 shadow-sm flex items-center gap-2">
                                                    <Type size={16} /> Add First Text Field
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="mb-10 px-2 group relative">
                                            <input
                                                value={formTitle}
                                                onChange={(e) => setFormTitle(e.target.value)}
                                                className="text-4xl font-extrabold mb-3 bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-slate-200 focus:bg-slate-50/50 transition-colors rounded-lg -mx-4 px-4 py-2"
                                                style={{ color: themeColor }}
                                            />
                                            <p className="text-slate-500 text-lg ml-1 font-medium">Please fill out the questions below.</p>
                                        </div>

                                        <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                            <div className="min-h-[200px]">
                                                {fields.map((field, index) => (
                                                    <SortableField 
                                                        key={field.id}
                                                        field={field}
                                                        index={index}
                                                        themeColor={themeColor}
                                                        fontFamily={fontFamily}
                                                        updateField={updateField}
                                                        removeField={removeField}
                                                        handleOptionChange={handleOptionChange}
                                                        addOption={addOption}
                                                        addLogicRule={addLogicRule}
                                                        updateLogicRule={updateLogicRule}
                                                        activeLogicField={activeLogicField}
                                                        setActiveLogicField={setActiveLogicField}
                                                        fields={fields}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                        
                                        {/* Submit Button Preview */}
                                        <div className="mt-8 pt-8 border-t border-slate-200/50 flex justify-end px-2">
                                            <button disabled className="px-8 py-3 rounded-xl text-white font-bold text-base shadow-lg opacity-80" style={{ backgroundColor: themeColor }}>
                                                Submit Form
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </CanvasDropZone>
                        </div>
                    </div>
                </main>

                {/* --- Modals and Overlays --- */}
                {showShareModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                                    <CheckSquare strokeWidth={2.5} size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Publish Successful!</h2>
                                <p className="text-slate-500 mt-2 font-medium text-sm">Your form is live and ready to collect responses.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Share Link</label>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            value={shareLink}
                                            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-600 font-mono shadow-sm focus:ring-primary focus:border-primary"
                                            onClick={(e) => e.target.select()}
                                        />
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(shareLink); alert('Copied!'); }}
                                            className="px-5 py-2.5 bg-slate-800 text-white rounded-lg font-bold text-sm hover:bg-slate-700 transition-colors shadow-sm"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowShareModal(false)}
                                        className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors"
                                    >
                                        Back to Editor
                                    </button>
                                    <a
                                        href={shareLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors text-center shadow-lg shadow-primary/30"
                                        style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}40` }}
                                    >
                                        Open Form
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Drag Overlay for smooth preview while dragging */}
                <DragOverlay dropAnimation={defaultDropAnimationSideEffects({ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' })}>
                    {activeDragId ? (
                        <div className="opacity-90 scale-105 transition-transform">
                            {/* Simple visual representation */}
                            <div className="p-4 bg-white border-2 border-primary rounded-xl shadow-2xl flex items-center gap-3 w-64">
                                <List className="text-primary" />
                                <span className="font-bold text-slate-700">Moving Item...</span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>

            </div>
        </DndContext>
    );
}
