
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface PrePropertiesActionProps {
    onOpenChat: () => void;
}

const PrePropertiesAction: React.FC<PrePropertiesActionProps> = ({ onOpenChat }) => {
    const { t } = useTranslation('landing');

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <Button
                        onClick={onOpenChat}
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-lg shadow-xl text-lg h-auto"
                    >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        {t('preProperties.cta')}
                    </Button>

                    <p className="text-sm text-gray-600">
                        {t('preProperties.micro')}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PrePropertiesAction;
