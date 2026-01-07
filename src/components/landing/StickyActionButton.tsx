import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StickyActionButtonProps {
    onOpenChat: () => void;
    language: string;
}

const stickyButtonTexts = {
    en: "Chat with Emma Now",
    nl: "Chat met Emma Nu",
    fr: "Discutez avec Emma",
    de: "Jetzt mit Emma chatten",
    pl: "Porozmawiaj z Emmą",
    sv: "Chatta med Emma",
    da: "Chat med Emma",
    fi: "Keskustele Emman kanssa",
    hu: "Csevegj Emmával",
    no: "Chat med Emma",
    es: "Chatea con Emma",
    ar: "تحدث مع إيما"
};

const StickyActionButton: React.FC<StickyActionButtonProps> = ({ onOpenChat, language }) => {
    const currentStickyText = stickyButtonTexts[language as keyof typeof stickyButtonTexts] || stickyButtonTexts.en;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 safe-area-inset-bottom">
            <Button
                onClick={onOpenChat}
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white px-6 py-4 shadow-lg hover:shadow-xl transition-all h-auto rounded-xl"
            >
                <div className="flex items-center justify-center gap-2 w-full">
                    <MessageCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold text-base">{currentStickyText}</span>
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse flex-shrink-0" />
                </div>
            </Button>
        </div>
    );
};

export default StickyActionButton;
