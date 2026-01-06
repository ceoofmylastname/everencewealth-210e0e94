
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StickyActionButtonProps {
    onOpenChat: () => void;
}

const StickyActionButton: React.FC<StickyActionButtonProps> = ({ onOpenChat }) => {
    const { t } = useTranslation('landing');

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl p-4 safe-area-inset-bottom">
            <Button
                onClick={onOpenChat}
                className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between text-left h-auto"
            >
                <div className="flex-1">
                    <div className="text-sm font-semibold">
                        👉 {t('stickyButton.main')}
                    </div>
                    <div className="text-xs opacity-90 mt-1 font-normal">
                        {t('stickyButton.micro')}
                    </div>
                </div>
                <ArrowRight className="w-5 h-5 ml-3 flex-shrink-0" />
            </Button>
        </div>
    );
};

export default StickyActionButton;
