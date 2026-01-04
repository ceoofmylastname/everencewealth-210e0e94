import React from 'react';
import LandingLayout from '@/components/landing/LandingLayout';
import translations from '@/translations/landing/fr.json';

const LandingPageFr: React.FC = () => {
    return <LandingLayout language="fr" translations={translations} />;
};

export default LandingPageFr;
