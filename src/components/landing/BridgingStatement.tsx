
import React from 'react';
import { useTranslation } from 'react-i18next';

const BridgingStatement: React.FC = () => {
    const { t } = useTranslation('landing');

    return (
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 to-blue-50">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-light">
                        {t('bridging.statement')}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default BridgingStatement;
