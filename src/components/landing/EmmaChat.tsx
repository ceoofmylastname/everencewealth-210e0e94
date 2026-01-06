import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, ListChecks, Home, MoreHorizontal, X } from 'lucide-react';
import { LanguageCode } from '@/utils/landing/languageDetection';
import { trackEvent } from '@/utils/landing/analytics';

interface EmmaChatProps {
    content: any;
    language: LanguageCode;
    isOpen: boolean;
    onClose: () => void;
}

const EmmaChat: React.FC<EmmaChatProps> = ({ content, language, isOpen, onClose }) => {
    const [message, setMessage] = useState('');

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSend = () => {
        if (!message.trim()) return;

        trackEvent('chat_interaction', {
            category: 'Engagement',
            action: 'send_message',
            label: message,
            language
        });

        // Open lead form as fallback/next step
        const event = new CustomEvent('openLeadForm', { detail: { interest: 'chat', message } });
        window.dispatchEvent(event);
        setMessage('');
        onClose(); // Optional: close chat modal after sending? Or keep open? "Start with Emma" usually implies starting a flow. Let's keep it open or close it? The lead form opens on top. Better to close this one or let the lead form take over.
        // User pattern: Click send -> Lead Form (capture details) -> Success.
        // Lead capture form is another modal. Having two modals might be messy.
        // The previous logic opened lead form. Let's stick to that pattern.
        // Probably best to close this chat modal when the lead form opens to avoid double backdrop.
        onClose();
    };

    const handleQuickAction = (action: string) => {
        trackEvent('chat_interaction', {
            category: 'Engagement',
            action: 'quick_action',
            label: action,
            language
        });

        const event = new CustomEvent('openLeadForm', { detail: { interest: action } });
        window.dispatchEvent(event);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center md:justify-end p-4 bg-black/20 backdrop-blur-sm">
            {/* Modal - not fullscreen on mobile */}
            <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:w-[400px] max-h-[80vh] md:max-h-[600px] shadow-2xl flex flex-colanimate-fade-in-up transform transition-all duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h3 className="font-semibold text-lg">{content.title || "Emma"}</h3>
                        <p className="text-sm text-gray-600">{content.subtitle || "Your Property Assistant"}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Static Intro Text */}
                <div className="p-6 bg-gray-50 border-b">
                    <p className="text-sm text-gray-700">
                        {content.intro || "Emma answers your questions and prepares a clear overview of your criteria for our team."}
                    </p>
                </div>

                {/* Chat Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Emma 'Message' */}
                    <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[90%]">
                        <p className="text-[#2C3E50] text-sm md:text-base leading-relaxed">
                            {content.greeting}
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2.5">
                        <button
                            className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-100 hover:border-[#C4A053]/30 rounded-lg text-[#2C3E50] text-sm font-medium transition-all flex items-center gap-3 shadow-sm hover:shadow-md group"
                            onClick={() => handleQuickAction('question')}
                        >
                            <div className="w-8 h-8 rounded-full bg-[#f8f5ee] flex items-center justify-center group-hover:bg-[#C4A053] transition-colors">
                                <MessageCircle className="w-4 h-4 text-[#C4A053] group-hover:text-white transition-colors" />
                            </div>
                            <span>{content.quickActions.question}</span>
                        </button>
                        <button
                            className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-100 hover:border-[#C4A053]/30 rounded-lg text-[#2C3E50] text-sm font-medium transition-all flex items-center gap-3 shadow-sm hover:shadow-md group"
                            onClick={() => handleQuickAction('criteria')}
                        >
                            <div className="w-8 h-8 rounded-full bg-[#f8f5ee] flex items-center justify-center group-hover:bg-[#C4A053] transition-colors">
                                <ListChecks className="w-4 h-4 text-[#C4A053] group-hover:text-white transition-colors" />
                            </div>
                            <span>{content.quickActions.criteria}</span>
                        </button>
                        <button
                            className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-100 hover:border-[#C4A053]/30 rounded-lg text-[#2C3E50] text-sm font-medium transition-all flex items-center gap-3 shadow-sm hover:shadow-md group"
                            onClick={() => handleQuickAction('explore')}
                        >
                            <div className="w-8 h-8 rounded-full bg-[#f8f5ee] flex items-center justify-center group-hover:bg-[#C4A053] transition-colors">
                                <Home className="w-4 h-4 text-[#C4A053] group-hover:text-white transition-colors" />
                            </div>
                            <span>{content.quickActions.explore}</span>
                        </button>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-2">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={content.placeholder}
                            className="flex-1 border-gray-200 focus-visible:ring-[#C4A053] bg-gray-50 text-base"
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            autoFocus={isOpen}
                        />
                        <Button
                            size="icon"
                            className="bg-[#C4A053] hover:bg-[#B39043] rounded-full w-10 h-10 shadow-md transition-transform active:scale-95"
                            onClick={handleSend}
                        >
                            <Send className="w-4 h-4 text-white" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmmaChat;
