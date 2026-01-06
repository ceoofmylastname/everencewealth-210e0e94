import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LanguageCode } from '@/utils/landing/languageDetection';
import LeadForm from './LeadForm';

interface LeadCaptureFormProps {
    isOpen: boolean;
    onClose: () => void;
    language: LanguageCode;
    translations: any; // Using any to match JSON
    propertyId?: string;
    source?: string;
}

const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
    isOpen,
    onClose,
    language,
    translations,
    propertyId,
    source = 'landing_page_modal'
}) => {
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSuccess = () => {
        setIsSuccess(true);
        setTimeout(() => {
            onClose();
            setTimeout(() => setIsSuccess(false), 300);
        }, 3000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-serif text-[#1A2332]">
                        {isSuccess ? 'Success!' : translations.title}
                    </DialogTitle>
                    {isSuccess && <DialogDescription className="text-green-600 font-medium">{translations.success}</DialogDescription>}
                </DialogHeader>

                {!isSuccess && (
                    <LeadForm
                        language={language}
                        translations={translations}
                        propertyId={propertyId}
                        source={source}
                        onSuccess={handleSuccess}
                        className="mt-4"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default LeadCaptureForm;
