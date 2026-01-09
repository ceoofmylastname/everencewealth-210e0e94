import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const ExplainerVideo: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section id="explainer-video" className="py-24 bg-landing-navy relative overflow-hidden">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl lg:text-4xl font-serif text-white mb-16">
                    See How We Work
                </h2>

                <div className="relative max-w-5xl mx-auto aspect-video rounded-xl overflow-hidden bg-black/20 shadow-2xl group cursor-pointer" onClick={() => setIsOpen(true)}>
                    {/* Thumbnail / Placeholder */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80')] bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <div className="w-16 h-16 bg-landing-gold rounded-full flex items-center justify-center shadow-lg pl-1">
                                <Play className="text-white fill-white" size={32} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <button onClick={() => window.dispatchEvent(new CustomEvent('openLeadForm'))} className="text-white/80 hover:text-white border-b border-white/30 hover:border-white pb-1 transition-colors">
                        Ready to Start?
                    </button>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-6xl p-0 bg-black border-none overflow-hidden aspect-video">
                    <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 z-50 text-white/50 hover:text-white p-2 bg-black/50 rounded-full">
                        <X size={24} />
                    </button>
                    <div className="w-full h-full flex items-center justify-center text-white/50">
                        {/* Replace with actual video embed/iframe */}
                        <div className="text-center">
                            <p>Video Player Placeholder</p>
                            <p className="text-sm">(Embed YouTube/Vimeo/Self-hosted here)</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default ExplainerVideo;
