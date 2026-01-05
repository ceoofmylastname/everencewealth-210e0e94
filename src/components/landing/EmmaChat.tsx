import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, ListChecks, Home, MoreHorizontal, X } from 'lucide-react';
import { LanguageCode } from '@/utils/landing/languageDetection';
import { trackEvent } from '@/utils/landing/analytics';

interface EmmaChatProps {
    content: any;
    language: LanguageCode;
}

const EmmaChat: React.FC<EmmaChatProps> = ({ content, language }) => {
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(true); // Default open for visual impact as per design

    const handleSend = () => {
        if (!message.trim()) return;

        trackEvent('chat_interaction', {
            category: 'Engagement', // Fixed category
            action: 'send_message',
            label: message,
            language
        });

        // Open lead form as fallback for now
        const event = new CustomEvent('openLeadForm', { detail: { interest: 'chat', message } });
        window.dispatchEvent(event);
        setMessage('');
    };

    const handleQuickAction = (action: string) => {
        trackEvent('chat_interaction', {
            category: 'Engagement',
            action: 'quick_action',
            label: action,
            language
        });

        // Trigger lead form for these actions too
        const event = new CustomEvent('openLeadForm', { detail: { interest: action } });
        window.dispatchEvent(event);
    };

    return (
        <section id="emma-chat" className="relative py-24 min-h-[800px] flex items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/villa-type.png" // Using one of the luxury images
                    alt="Luxury Villa Terrace"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center gap-12">
                {/* Section Header */}
                <div className="text-center space-y-4 max-w-2xl animate-fade-in-up">
                    <h2 className="text-4xl md:text-5xl font-serif text-white tracking-wide leading-tight">
                        {content.headline}
                    </h2>
                    <p className="text-xl text-white/90 font-light">
                        {content.subheadline}
                    </p>
                </div>

                {/* Chat Card Interface */}
                {isOpen && (
                    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in-up delay-200">
                        {/* Chat Header */}
                        <div className="bg-[#FAF9F6] p-4 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src="/images/emma-profile.png"
                                        alt="Emma"
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <h4 className="font-serif font-bold text-[#1A2332]">Emma</h4>
                                    <p className="text-xs text-green-600 font-medium">Online now - Ask me anything!</p>
                                </div>
                            </div>
                            <div className="flex gap-2 text-gray-400">
                                <MoreHorizontal className="w-5 h-5 cursor-pointer hover:text-gray-600" />
                                <X className="w-5 h-5 cursor-pointer hover:text-gray-600" onClick={() => setIsOpen(false)} />
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div className="p-6 bg-[#ffffff] bg-opacity-50 space-y-6">
                            {/* Emma 'Message' */}
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[85%]">
                                <p className="text-[#2C3E50] text-sm md:text-base">
                                    {content.greeting}
                                </p>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-2">
                                <button
                                    className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-lg text-[#2C3E50] text-sm font-medium transition-colors flex items-center gap-3 shadow-sm hover:shadow"
                                    onClick={() => handleQuickAction('question')}
                                >
                                    <MessageCircle className="w-4 h-4 text-[#C4A053]" />
                                    {content.quickActions.question}
                                </button>
                                <button
                                    className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-lg text-[#2C3E50] text-sm font-medium transition-colors flex items-center gap-3 shadow-sm hover:shadow"
                                    onClick={() => handleQuickAction('criteria')}
                                >
                                    <ListChecks className="w-4 h-4 text-[#C4A053]" />
                                    {content.quickActions.criteria}
                                </button>
                                <button
                                    className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-lg text-[#2C3E50] text-sm font-medium transition-colors flex items-center gap-3 shadow-sm hover:shadow"
                                    onClick={() => handleQuickAction('explore')}
                                >
                                    <Home className="w-4 h-4 text-[#C4A053]" />
                                    {content.quickActions.explore}
                                </button>
                            </div>

                            {/* Input Area */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={content.placeholder}
                                    className="flex-1 border-gray-200 focus-visible:ring-[#C4A053] bg-gray-50"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <Button
                                    size="icon"
                                    className="bg-[#C4A053] hover:bg-[#B39043] rounded-full w-10 h-10 shadow-md"
                                    onClick={handleSend}
                                >
                                    <Send className="w-4 h-4 text-white" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default EmmaChat;
