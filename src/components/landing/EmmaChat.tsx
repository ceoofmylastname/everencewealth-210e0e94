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

        const event = new CustomEvent('openLeadForm', { detail: { interest: 'chat', message } });
        window.dispatchEvent(event);
        setMessage('');
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
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`
                fixed z-[70] bg-white shadow-2xl flex flex-col transition-transform duration-300
                
                /* Mobile: Bottom sheet */
                bottom-0 left-0 right-0 rounded-t-3xl max-h-[85vh]
                md:hidden
                ${isOpen ? 'translate-y-0' : 'translate-y-full'}

                /* Desktop: Right-side panel */
                md:top-0 md:right-0 md:bottom-0 md:left-auto md:rounded-none md:max-h-none
                md:w-[450px] lg:w-[500px] md:translate-y-0
                md:block
                ${isOpen ? 'md:translate-x-0' : 'md:translate-x-full'}
            `}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-primary/5">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                            {content.title || "Emma"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {content.subtitle || "Your Property Assistant"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Static Intro */}
                <div className="p-6 bg-gray-50 border-b">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {content.intro || "Emma answers your questions and prepares a clear overview of your criteria for our team."}
                    </p>
                </div>

                {/* Chat Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                    {/* Emma 'Message' */}
                    <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[90%]">
                        <p className="text-[#2C3E50] text-sm md:text-base leading-relaxed">
                            {content.greeting}
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
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
                <div className="p-6 border-t border-gray-100 bg-white">
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
        </>
    );
};

export default EmmaChat;
