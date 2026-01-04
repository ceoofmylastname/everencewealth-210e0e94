import React from 'react';
import LandingLayout from '@/components/landing/LandingLayout';
import translations from '@/translations/landing/nl.json';

const LandingPageNl: React.FC = () => {
    return <LandingLayout language="nl" translations={translations} />;
};

export default LandingPageNl;
