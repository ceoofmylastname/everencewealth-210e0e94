import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface PrePropertiesActionProps {
    onOpenChat: () => void;
}

const PrePropertiesAction: React.FC<PrePropertiesActionProps> = ({ onOpenChat }) => {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    {/* Heading - HARDCODED */}
                    <h2 className="text-2xl md:text-3xl font-serif text-gray-900">
                        Start with clarity — then explore the right properties
                    </h2>

                    {/* Body Copy - HARDCODED */}
                    <p className="text-gray-700 text-lg">
                        Emma can answer your questions (lifestyle, legal steps, documents) and carefully record your criteria for our team.
                    </p>

                    <Button
                        onClick={onOpenChat}
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-lg shadow-xl text-lg h-auto"
                    >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Get clarity & a personal shortlist with Emma
                    </Button>

                    <p className="text-sm text-gray-600">
                        Ask questions · Share your preferences · No obligation
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PrePropertiesAction;
