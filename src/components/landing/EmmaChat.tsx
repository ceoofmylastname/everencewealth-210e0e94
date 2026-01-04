import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/utils/landing/analytics';
import { MessageSquare, ClipboardList, Home, Send, X } from 'lucide-react';
import { LanguageCode } from '@/utils/landing/languageDetection';

interface EmmaChatProps {
    content: {
        headline: string;
        subheadline: string;
        status: string;
        greeting: string;
        quickActions: {
            question: string;
            criteria: string;
            explore: string;
        };
        placeholder: string;
    };
    language: LanguageCode;
}

const EmmaChat: React.FC<EmmaChatProps> = ({ content, language }) => {
    const [isOpen, setIsOpen] = useState(false); // For mobile overlay or just minimized state
    // In the design, it's a section on the page, but simulates a chat interface. 
    // We'll implement the inline version as per design specs but maybe make it interactive.

    const handleQuickAction = (action: string) => {
        trackEvent('quick_action_click', {
            category: 'Engagement',
            action_type: action,
            language
        });
        // Logic to open lead form or scroll to properties
        if (action === 'explore') {
            document.getElementById('properties-section')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Trigger lead form for other actions
            // Dispatches a custom event that the parent page listens to, or we could pass a prop
            window.dispatchEvent(new CustomEvent('openLeadForm', { detail: { interest: action } }));
        }
    };

    return (
        <section id="emma-section" className="py-20 bg-[#F5F5F5]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif text-[#1A2332] mb-4">
                        {content.headline}
                    </h2>
                    <p className="text-[#2C3E50]/80 text-lg">
                        {content.subheadline}
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Chat Header */}
                    <div className="bg-white p-6 border-b border-gray-100 flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#C4A053]">
                                {/* Placeholder for Emma's Avatar - using a generic professional woman image if available or a placeholder */}
                                <img src="/images/emma-avatar.jpg" alt="Emma" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://ui-avatars.com/api/?name=Emma&background=C4A053&color=fff'} />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-[#1A2332]">Emma</h3>
                            <p className="text-sm text-green-600 font-medium">{content.status}</p>
                        </div>
                    </div>

                    {/* Chat Body */}
                    <div className="p-6 md:p-8 bg-gray-50/50 min-h-[300px] flex flex-col gap-6">
                        {/* Emma's Message */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
                                <img src="/images/emma-avatar.jpg" alt="Emma" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://ui-avatars.com/api/?name=Emma&background=C4A053&color=fff'} />
                            </div>
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[80%]">
                                <p className="text-[#2C3E50]">{content.greeting}</p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-auto">
                            <Button
                                onClick={() => handleQuickAction('question')}
                                variant="outline"
                                className="h-auto py-3 justify-start gap-3 bg-white hover:bg-gray-50 hover:border-[#C4A053] transition-colors text-left"
                            >
                                <MessageSquare className="w-5 h-5 text-[#C4A053]" />
                                <span className="text-[#2C3E50]">{content.quickActions.question}</span>
                            </Button>

                            <Button
                                onClick={() => handleQuickAction('criteria')}
                                variant="outline"
                                className="h-auto py-3 justify-start gap-3 bg-white hover:bg-gray-50 hover:border-[#C4A053] transition-colors text-left"
                            >
                                <ClipboardList className="w-5 h-5 text-[#C4A053]" />
                                <span className="text-[#2C3E50]">{content.quickActions.criteria}</span>
                            </Button>

                            <Button
                                onClick={() => handleQuickAction('explore')}
                                variant="outline"
                                className="h-auto py-3 justify-start gap-3 bg-white hover:bg-gray-50 hover:border-[#C4A053] transition-colors text-left"
                            >
                                <Home className="w-5 h-5 text-[#C4A053]" />
                                <span className="text-[#2C3E50]">{content.quickActions.explore}</span>
                            </Button>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-100 bg-white flex gap-3">
                        <input
                            type="text"
                            placeholder={content.placeholder}
                            className="flex-1 bg-gray-100 border-none rounded-full px-6 py-3 focus:ring-2 focus:ring-[#C4A053]/50 outline-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleQuickAction('manual_message');
                                }
                            }}
                        />
                        <Button
                            size="icon"
                            className="rounded-full bg-[#C4A053] hover:bg-[#D4B063] w-12 h-12 flex-shrink-0"
                            onClick={() => handleQuickAction('manual_message')}
                        >
                            <Send className="w-5 h-5 text-white" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EmmaChat;
