import React from 'react';
import LandingLayout from '@/components/landing/LandingLayout';
import translations from '@/translations/landing/da.json';

const LandingPageDa: React.FC = () => {
    return <LandingLayout language="da" translations={translations} />;
};

export default LandingPageDa;
