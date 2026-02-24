import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wand2, Image as ImageIcon, Sparkles, SlidersHorizontal,
    Download, RotateCcw, Copy, CheckCircle2, UploadCloud,
    X, ExternalLink, ChevronDown, ArrowRight, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STYLE_PRESETS = ['Professional Portrait', 'Corporate Scene', 'Abstract Financial', 'Lifestyle & Wealth', 'Clean Product Shot', 'Architectural'];
const DIMENSIONS = [
    { id: '1:1', label: 'Square 1:1', w: '24px', h: '24px' },
    { id: '16:9', label: 'Landscape 16:9', w: '30px', h: '16px' },
    { id: '9:16', label: 'Portrait 9:16', w: '16px', h: '30px' },
    { id: '4:1', label: 'Banner 4:1', w: '36px', h: '9px' }
];

async function uploadBase64ToStorage(base64Url: string, filename: string): Promise<string | null> {
    try {
        const res = await fetch(base64Url);
        const blob = await res.blob();
        const path = `studio/${Date.now()}-${filename}.png`;
        const { error } = await supabase.storage.from('article-images').upload(path, blob, { contentType: 'image/png', upsert: true });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(path);
        return publicUrl;
    } catch (e) {
        console.error('Upload failed:', e);
        return null;
    }
}

function downloadImage(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

const ImageStudio = () => {
    const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');

    // Generate tab state
    const [prompt, setPrompt] = useState('');
    const [selectedPreset, setSelectedPreset] = useState(0);
    const [activeDimension, setActiveDimension] = useState('1:1');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generatedStorageUrl, setGeneratedStorageUrl] = useState<string | null>(null);

    // Edit tab state
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedStorageUrl, setUploadedStorageUrl] = useState<string | null>(null);
    const [editInstructions, setEditInstructions] = useState('');
    const [editMode, setEditMode] = useState('style');
    const [isEditing, setIsEditing] = useState(false);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [editedStorageUrl, setEditedStorageUrl] = useState<string | null>(null);

    // Comparison Slider
    const [sliderPosition, setSliderPosition] = useState(50);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Advanced Options
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Recent gallery
    const [recentImages, setRecentImages] = useState<{ url: string; name: string }[]>([]);

    const handlePointerDown = () => setIsDragging(true);
    const handlePointerUp = () => setIsDragging(false);

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (!isDragging || !sliderRef.current) return;
            const rect = sliderRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            setSliderPosition((x / rect.width) * 100);
        };
        if (isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging]);

    // Load recent images from storage
    useEffect(() => {
        (async () => {
            const { data } = await supabase.storage.from('article-images').list('studio', { limit: 8, sortBy: { column: 'created_at', order: 'desc' } });
            if (data && data.length > 0) {
                setRecentImages(data.map(f => ({
                    url: supabase.storage.from('article-images').getPublicUrl(`studio/${f.name}`).data.publicUrl,
                    name: f.name
                })));
            }
        })();
    }, [generatedStorageUrl, editedStorageUrl]);

    // Generate image
    const handleGenerate = async () => {
        if (!prompt.trim()) { toast.error('Please enter a prompt'); return; }
        setIsGenerating(true);
        try {
            const fullPrompt = `${prompt}. Style: ${STYLE_PRESETS[selectedPreset]}. Aspect ratio: ${activeDimension}. Ultra high resolution, professional photography, no text, no watermarks.`;
            const { data, error } = await supabase.functions.invoke('generate-image', {
                body: { prompt: fullPrompt }
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            const imageUrl = data?.images?.[0]?.url;
            if (!imageUrl) throw new Error('No image returned');
            setGeneratedImage(imageUrl);
            // Upload to storage
            const storageUrl = await uploadBase64ToStorage(imageUrl, 'generated');
            if (storageUrl) setGeneratedStorageUrl(storageUrl);
            toast.success('Image generated successfully!');
        } catch (e: any) {
            toast.error(e.message || 'Failed to generate image');
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle file upload
    const handleFileSelect = async (file: File) => {
        if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { toast.error('Only PNG, JPG, WEBP allowed'); return; }
        // Preview
        const reader = new FileReader();
        reader.onload = (e) => setUploadedImage(e.target?.result as string);
        reader.readAsDataURL(file);
        // Upload to storage
        const path = `studio/${Date.now()}-upload.${file.name.split('.').pop()}`;
        const { error } = await supabase.storage.from('article-images').upload(path, file, { contentType: file.type, upsert: true });
        if (error) { toast.error('Upload failed'); return; }
        const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(path);
        setUploadedStorageUrl(publicUrl);
        setEditedImage(null);
        setEditedStorageUrl(null);
        toast.success('Image uploaded!');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    // Edit image
    const handleEdit = async () => {
        if (!uploadedStorageUrl) { toast.error('Please upload an image first'); return; }
        if (!editInstructions.trim()) { toast.error('Please enter edit instructions'); return; }
        setIsEditing(true);
        try {
            const modePrefix = editMode === 'style' ? 'Apply style transfer: ' : editMode === 'bg' ? 'Replace the background: ' : 'Enhance the image: ';
            const { data, error } = await supabase.functions.invoke('generate-image', {
                body: { prompt: modePrefix + editInstructions, imageUrl: uploadedStorageUrl }
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            const imageUrl = data?.images?.[0]?.url;
            if (!imageUrl) throw new Error('No edited image returned');
            setEditedImage(imageUrl);
            const storageUrl = await uploadBase64ToStorage(imageUrl, 'edited');
            if (storageUrl) setEditedStorageUrl(storageUrl);
            toast.success('Image edited successfully!');
        } catch (e: any) {
            toast.error(e.message || 'Failed to edit image');
        } finally {
            setIsEditing(false);
        }
    };

    const syneFont = { fontFamily: '"Syne", sans-serif' };
    const dmSansFont = { fontFamily: '"DM Sans", sans-serif' };

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-20 selection:bg-[#C8A96E]/30 selection:text-[#1A4D3E] overflow-hidden" style={dmSansFont}>
            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }} />

            {/* 1. HERO SECTION */}
            <section className="relative pt-24 pb-16 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
                <div className="container mx-auto max-w-6xl relative z-10 flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2 flex flex-col items-start text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C8A96E]/30 bg-[#F7F9F8] mb-6">
                            <Sparkles className="w-4 h-4 text-[#C8A96E]" />
                            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#C8A96E]">AI-Powered Creative Studio</span>
                        </div>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-5xl md:text-6xl font-extrabold text-[#1A4D3E] leading-[1.1] tracking-tight mb-6" style={syneFont}>
                            Generate & Edit Images with AI
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-lg text-gray-500 mb-8 max-w-md leading-relaxed">
                            Create professional visuals for ads, social content, and client materials — instantly.
                        </motion.p>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex gap-3">
                            {['Instant Generation', 'Unlimited Edits', 'Brand-Ready Output'].map(pill => (
                                <div key={pill} className="px-4 py-2 rounded-full bg-[#1A4D3E] text-white text-xs font-semibold tracking-wide border border-[#1A4D3E] shadow-[0_4px_20px_rgba(26,77,62,0.15)] flex items-center gap-2">
                                    <CheckCircle2 size={12} className="text-[#C8A96E]" /> {pill}
                                </div>
                            ))}
                        </motion.div>
                    </div>
                    <div className="lg:w-1/2 w-full perspective-[1000px]">
                        <motion.div animate={{ rotateY: [-8, 0, -8], rotateX: [4, 0, 4], y: [-5, 5, -5] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="relative w-full aspect-[4/3] rounded-2xl bg-white p-2 shadow-[0_24px_64px_rgba(26,77,62,0.14)] transform-gpu border border-gray-100" style={{ transformStyle: 'preserve-3d' }}>
                            <div className="w-full h-full rounded-xl overflow-hidden relative">
                                {generatedImage ? (
                                    <img src={generatedImage} alt="AI Generated" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#2D6B57,#1A4D3E,#0D1F1A)]">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-2 border-[#C8A96E]/20 rotate-45"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-[#C8A96E]/20 blur-3xl rounded-full"></div>
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30 text-xs font-bold text-white uppercase tracking-wider">
                                    AI Generated Visual
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* TOP TABS */}
            <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-y border-gray-100 py-4 shadow-sm mb-12">
                <div className="container mx-auto px-6 max-w-6xl flex justify-center">
                    <div className="bg-[#F7F9F8] p-1.5 rounded-full inline-flex relative shadow-inner border border-gray-200">
                        <motion.div className="absolute top-1.5 bottom-1.5 rounded-full bg-[#1A4D3E] shadow-sm pointer-events-none" animate={{ left: activeTab === 'generate' ? '6px' : '50%', width: 'calc(50% - 6px)' }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                        <button onClick={() => setActiveTab('generate')} className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-colors ${activeTab === 'generate' ? 'text-white' : 'text-gray-500 hover:text-gray-900'} flex items-center gap-2`}>
                            <Wand2 size={16} /> Generate Image
                        </button>
                        <button onClick={() => setActiveTab('edit')} className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-colors ${activeTab === 'edit' ? 'text-white' : 'text-gray-500 hover:text-gray-900'} flex items-center gap-2`}>
                            <ImageIcon size={16} /> Edit Image
                        </button>
                    </div>
                </div>
            </section>

            {/* MAIN STUDIO */}
            <section className="container mx-auto px-6 max-w-6xl">
                <AnimatePresence mode="wait">

                    {/* GENERATE TAB */}
                    {activeTab === 'generate' && (
                        <motion.div key="generate" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Controls */}
                            <div className="lg:col-span-5 bg-white rounded-xl border-l-[4px] border-[#1A4D3E] border border-y-gray-200 border-r-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 md:p-8 flex flex-col gap-8 focus-within:shadow-[0_8px_30px_rgba(200,169,110,0.15)] transition-shadow duration-300">
                                <div>
                                    <h3 className="text-[11px] font-bold text-[#C8A96E] uppercase tracking-[0.15em] mb-3">Describe Your Image</h3>
                                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full min-h-[120px] bg-[#F7F9F8] border border-gray-200 rounded-lg p-4 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:border-transparent transition-all resize-y placeholder:text-gray-400" placeholder="e.g. A confident financial advisor meeting with a family in a modern San Francisco office, warm lighting, professional atmosphere..." />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-900 mb-3" style={syneFont}>Style Presets</h3>
                                    <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-none mask-fade-right">
                                        {STYLE_PRESETS.map((preset, i) => (
                                            <button key={preset} onClick={() => setSelectedPreset(i)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${i === selectedPreset ? 'bg-[#1A4D3E] text-white border-[#1A4D3E]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A4D3E]'}`}>
                                                {preset}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-900 mb-3" style={syneFont}>Image Dimensions</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {DIMENSIONS.map(dim => (
                                            <button key={dim.id} onClick={() => setActiveDimension(dim.id)} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${activeDimension === dim.id ? 'border-[#1A4D3E] bg-[#F7F9F8] shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                                <div className="w-10 h-10 flex items-center justify-center bg-white rounded border border-gray-100 flex-shrink-0">
                                                    <div className="rounded-sm" style={{ width: dim.w, height: dim.h, backgroundColor: activeDimension === dim.id ? '#1A4D3E' : '#D1D5DB' }}></div>
                                                </div>
                                                <span className={`text-xs font-bold ${activeDimension === dim.id ? 'text-[#1A4D3E]' : 'text-gray-600'}`}>{dim.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Advanced Options */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <button onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className="w-full bg-[#F7F9F8] p-4 flex items-center justify-between text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                        <span className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-[#C8A96E]" /> Advanced Options</span>
                                        <ChevronDown size={16} className={`transform transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isAdvancedOpen && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white border-t border-gray-200 space-y-4">
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">Lighting Mode</label>
                                                    <select className="w-full p-2 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:border-[#C8A96E]">
                                                        <option>Natural Lighting (Default)</option>
                                                        <option>Studio / Corporate</option>
                                                        <option>Cinematic / Dramatic</option>
                                                    </select>
                                                </div>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <div className="w-5 h-5 rounded border border-[#C8A96E] bg-[#C8A96E]/10 flex items-center justify-center">
                                                        <CheckCircle2 size={14} className="text-[#C8A96E]" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700">Enforce Everence Brand Colors</span>
                                                </label>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {/* Generate Button */}
                                <button onClick={handleGenerate} disabled={isGenerating} className="relative overflow-hidden w-full bg-[#1A4D3E] text-white py-4 rounded-lg font-bold text-lg shadow-[0_10px_30px_rgba(26,77,62,0.3)] hover:shadow-[0_15px_40px_rgba(26,77,62,0.4)] transition-all group mt-auto disabled:opacity-60 disabled:cursor-not-allowed">
                                    <div className="absolute inset-0 w-full h-full">
                                        <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:animate-shimmer"></div>
                                    </div>
                                    <span className="relative z-10 flex items-center justify-center gap-2" style={syneFont}>
                                        {isGenerating ? <><Loader2 size={20} className="animate-spin" /> Generating...</> : '✦ Generate Image'}
                                    </span>
                                </button>
                            </div>

                            {/* Output */}
                            <div className="lg:col-span-7 bg-[#F7F9F8] rounded-xl border border-[#1A4D3E]/10 p-6 md:p-8 flex flex-col justify-center min-h-[600px] relative overflow-hidden">
                                <div className="w-full h-full flex flex-col items-center">
                                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative group mb-6 border border-gray-200">
                                        {isGenerating ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F7F9F8] gap-4">
                                                <Loader2 size={48} className="animate-spin text-[#1A4D3E]" />
                                                <p className="text-sm font-bold text-gray-500">Generating your image...</p>
                                            </div>
                                        ) : generatedImage ? (
                                            <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#3d8a73_0%,#1A4D3E_50%,#0D1F1A_100%)] transition-transform duration-700 group-hover:scale-105">
                                                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A96E]/40 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <p className="text-white/60 text-sm font-bold">Enter a prompt and click Generate</p>
                                                </div>
                                            </div>
                                        )}
                                        {generatedImage && !isGenerating && (
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-[#C8A96E]/30 flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-[#C8A96E]">
                                                <Sparkles size={12} /> AI Generated
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap items-center justify-center gap-3 w-full mb-8">
                                        <button onClick={() => { if (generatedImage) downloadImage(generatedImage, 'ai-generated.png'); else toast.info('Generate an image first'); }} className="flex-1 min-w-[120px] bg-[#1A4D3E] hover:bg-[#113328] text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
                                            <Download size={16} /> Download
                                        </button>
                                        <button onClick={() => { if (generatedImage) { setUploadedImage(generatedImage); setUploadedStorageUrl(generatedStorageUrl); setActiveTab('edit'); } else toast.info('Generate an image first'); }} className="flex-1 min-w-[120px] bg-white border-2 border-[#C8A96E] text-[#1A4D3E] hover:bg-[#C8A96E]/5 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                            <Wand2 size={16} className="text-[#C8A96E]" /> Edit Image
                                        </button>
                                        <button onClick={handleGenerate} disabled={isGenerating} className="flex-1 min-w-[120px] bg-white border border-[#1A4D3E] text-[#1A4D3E] hover:bg-[#F7F9F8] px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                                            <RotateCcw size={16} /> Regenerate
                                        </button>
                                        <button onClick={() => { if (generatedImage) { navigator.clipboard.writeText(generatedStorageUrl || generatedImage); toast.success('Image URL copied!'); } }} className="px-4 py-2.5 rounded-lg text-gray-500 hover:text-gray-900 border border-transparent hover:bg-gray-100 transition-colors">
                                            <Copy size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* EDIT TAB */}
                    {activeTab === 'edit' && (
                        <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Controls */}
                            <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 flex flex-col gap-8">
                                {/* Upload Dropzone */}
                                <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="w-full h-48 border-2 border-dashed border-[#1A4D3E]/40 rounded-xl bg-[#F7F9F8] hover:bg-[#1A4D3E]/5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors relative group overflow-hidden">
                                    {uploadedImage ? (
                                        <>
                                            <img src={uploadedImage} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white font-bold text-sm">Click to replace</p>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); setUploadedImage(null); setUploadedStorageUrl(null); setEditedImage(null); setEditedStorageUrl(null); }} className="absolute top-2 right-2 z-10 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow"><X size={14} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#C8A96E] group-hover:scale-110 transition-transform">
                                                <UploadCloud size={24} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-gray-900 font-bold" style={syneFont}>Drop your image here</p>
                                                <p className="text-gray-500 text-sm">or click to browse</p>
                                            </div>
                                            <div className="mt-2 px-3 py-1 bg-white rounded-md border border-gray-200 text-[10px] font-bold text-gray-400">
                                                PNG · JPG · WEBP · up to 10MB
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Edit Instructions */}
                                <div>
                                    <h3 className="text-[11px] font-bold text-[#C8A96E] uppercase tracking-[0.15em] mb-3">Edit Instructions</h3>
                                    <textarea value={editInstructions} onChange={(e) => setEditInstructions(e.target.value)} className="w-full min-h-[100px] bg-white border border-gray-200 rounded-lg p-4 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D3E] focus:border-transparent transition-all resize-y placeholder:text-gray-400 shadow-inner" placeholder="e.g. Make the background a modern San Francisco skyline, enhance the lighting..." />
                                </div>

                                {/* Mode */}
                                <div className="space-y-3">
                                    {[
                                        { id: 'style', title: 'Style Transfer', desc: 'Apply a new visual aesthetic' },
                                        { id: 'bg', title: 'Background Swap', desc: 'Replace the background only' },
                                        { id: 'enhance', title: 'Smart Enhance', desc: 'Improve quality + brand alignment' }
                                    ].map(mode => (
                                        <div key={mode.id} onClick={() => setEditMode(mode.id)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-4 ${editMode === mode.id ? 'border-[#1A4D3E] bg-[#1A4D3E]/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                                            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${editMode === mode.id ? 'border-[#1A4D3E]' : 'border-gray-300'}`}>
                                                {editMode === mode.id && <div className="w-2 h-2 bg-[#1A4D3E] rounded-full"></div>}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm leading-none mb-1">{mode.title}</h4>
                                                <p className="text-xs text-gray-500">{mode.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={handleEdit} disabled={isEditing || !uploadedStorageUrl} className="relative overflow-hidden w-full bg-[#1A4D3E] text-white py-4 rounded-lg font-bold text-lg shadow-[0_10px_30px_rgba(26,77,62,0.3)] hover:shadow-[0_15px_40px_rgba(26,77,62,0.4)] transition-all group mt-auto disabled:opacity-60 disabled:cursor-not-allowed">
                                    <div className="absolute inset-0 w-full h-full">
                                        <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:animate-shimmer"></div>
                                    </div>
                                    <span className="relative z-10 flex items-center justify-center gap-2" style={syneFont}>
                                        {isEditing ? <><Loader2 size={20} className="animate-spin" /> Applying Edits...</> : 'Apply AI Edits'}
                                    </span>
                                </button>
                            </div>

                            {/* Comparison Slider */}
                            <div className="lg:col-span-8 bg-[#F7F9F8] rounded-xl border border-gray-200 p-6 md:p-8 flex flex-col justify-center min-h-[600px]">
                                <h3 className="text-center text-xs font-bold text-[#C8A96E] uppercase tracking-[0.2em] mb-6">Before & After</h3>

                                <div ref={sliderRef} className="relative w-full aspect-video md:aspect-[16/10] bg-gray-200 rounded-xl overflow-hidden shadow-xl select-none mx-auto border border-gray-300 touch-none" onPointerDown={handlePointerDown}>
                                    {/* After (background) */}
                                    <div className="absolute inset-0 w-full h-full">
                                        {isEditing ? (
                                            <div className="w-full h-full flex items-center justify-center bg-[#F7F9F8]">
                                                <Loader2 size={48} className="animate-spin text-[#1A4D3E]" />
                                            </div>
                                        ) : editedImage ? (
                                            <img src={editedImage} alt="Edited" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-[conic-gradient(from_90deg_at_50%_50%,#0D1F1A_0%,#1A4D3E_50%,#2D6B57_100%)] flex items-center justify-center">
                                                <p className="text-white/50 text-sm font-bold">Edited result appears here</p>
                                            </div>
                                        )}
                                        {editedImage && !isEditing && (
                                            <div className="absolute top-4 right-4 bg-[#C8A96E] text-white px-3 py-1 rounded shadow-md text-[10px] font-black tracking-widest uppercase">
                                                AI Edited
                                            </div>
                                        )}
                                    </div>

                                    {/* Before (foreground clipped) */}
                                    <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
                                        {uploadedImage ? (
                                            <img src={uploadedImage} alt="Original" className="w-screen max-w-[1000px] h-full object-cover" />
                                        ) : (
                                            <div className="w-screen max-w-[1000px] h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                                                <p className="text-white/50 text-sm font-bold">Upload an image</p>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur text-white px-3 py-1 rounded shadow-md text-[10px] font-black tracking-widest uppercase">
                                            Original
                                        </div>
                                    </div>

                                    {/* Slider Handle */}
                                    <div className="absolute inset-y-0 w-1 bg-[#C8A96E] cursor-ew-resize flex items-center justify-center z-10 hover:w-1.5 transition-[width] shadow-[0_0_10px_rgba(200,169,110,0.5)]" style={{ left: `calc(${sliderPosition}% - 2px)` }}>
                                        <div className="w-8 h-8 rounded-full bg-white border-[3px] border-[#C8A96E] flex items-center justify-center shadow-lg">
                                            <SlidersHorizontal size={14} className="text-[#1A4D3E] rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center mt-6 text-xs text-gray-400 font-bold uppercase tracking-widest">Drag to Compare</div>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                                    <button onClick={() => { if (uploadedImage) downloadImage(uploadedImage, 'original.png'); else toast.info('No original image'); }} className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[#1A4D3E] text-[#1A4D3E] font-bold text-sm hover:bg-[#F7F9F8] transition-colors">
                                        Download Original
                                    </button>
                                    <button onClick={() => { if (editedImage) downloadImage(editedImage, 'edited.png'); else toast.info('No edited image yet'); }} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#1A4D3E] text-white font-bold text-sm hover:bg-[#113328] transition-colors shadow-md">
                                        Download Edited
                                    </button>
                                    <a href="https://launch.yenomai.com/?ref_id=IPxLDDZso3Z1XsmXbpGK2kkf2gn2" target="_blank" rel="noreferrer" className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#C8A96E] text-white font-bold text-sm hover:bg-[#b0935d] transition-colors shadow-md flex items-center justify-center gap-2">
                                        Use in Ad Campaign <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* RECENT GALLERY */}
            <section className="py-24 container mx-auto px-6 max-w-6xl border-t border-gray-100 mt-24">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-[#1A4D3E] mb-2" style={syneFont}>Recent Studio Outputs</h2>
                        <p className="text-gray-500 font-light text-lg">Your latest generated and edited images</p>
                    </div>
                </div>
                <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
                    {recentImages.length > 0 ? recentImages.map((img, i) => {
                        const heights = ['h-64', 'h-48', 'h-80', 'h-56', 'h-72'];
                        return (
                            <div key={img.name} className={`w-full ${heights[i % heights.length]} rounded-xl overflow-hidden relative group break-inside-avoid shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-200`}>
                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-[#0D1F1A]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 border-2 border-transparent group-hover:border-[#C8A96E] rounded-xl box-border">
                                    <button onClick={() => downloadImage(img.url, img.name)} className="w-10 h-10 rounded-full bg-white text-[#1A4D3E] flex items-center justify-center hover:scale-110 transition-transform">
                                        <Download size={18} />
                                    </button>
                                    <button onClick={() => { setUploadedImage(img.url); setUploadedStorageUrl(img.url); setActiveTab('edit'); }} className="w-10 h-10 rounded-full bg-[#C8A96E] text-white flex items-center justify-center hover:scale-110 transition-transform">
                                        <Wand2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full text-center py-16 text-gray-400">
                            <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="font-bold">No images yet</p>
                            <p className="text-sm">Generate or edit an image to see it here</p>
                        </div>
                    )}
                </div>
            </section>

            {/* HOW TO USE */}
            <section className="py-20 bg-[#0D1F1A] border-y border-[#1A4D3E]">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="flex flex-col md:flex-row items-center justify-between relative gap-12 md:gap-4">
                        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] border-t-2 border-dashed border-[#C8A96E]/30 z-0"></div>
                        {[
                            { id: 1, text: 'Choose Your Mode' },
                            { id: 2, text: 'Upload or Describe' },
                            { id: 3, text: 'AI Generates' },
                            { id: 4, text: 'Download & Deploy' }
                        ].map(step => (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-4 group">
                                <div className="w-14 h-14 rounded-full bg-[#1A4D3E] border-2 border-[#C8A96E] flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(200,169,110,0.0)] group-hover:shadow-[0_0_20px_rgba(200,169,110,0.4)] transition-shadow">
                                    {step.id}
                                </div>
                                <div className="text-white font-bold text-sm tracking-wide text-center" style={syneFont}>{step.text}</div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <a href="#" className="text-[#C8A96E] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors border-b border-[#C8A96E]/30 pb-1">Need help?</a>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-[#1A4D3E] relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                                <path d="M25 0 L50 14.4 L50 43.4 L25 57.8 L0 43.4 L0 14.4 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#hexagons)" />
                    </svg>
                </div>
                <div className="container mx-auto px-6 max-w-5xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight" style={syneFont}>
                        Turn Your Images Into Ad Campaigns
                    </h2>
                    <a href="https://launch.yenomai.com/?ref_id=IPxLDDZso3Z1XsmXbpGK2kkf2gn2" target="_blank" rel="noreferrer" className="shrink-0 bg-[#C8A96E] text-[#1A4D3E] px-8 py-4 rounded-full font-black text-lg tracking-wide hover:bg-white transition-colors shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center gap-2">
                        Launch Ad Campaign <ArrowRight size={20} />
                    </a>
                </div>
            </section>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes shimmer {
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer { animation: shimmer 1.5s infinite; }
        .mask-fade-right {
          mask-image: linear-gradient(to right, black 80%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, black 80%, transparent 100%);
        }
      `}} />
        </div>
    );
};

export default ImageStudio;
