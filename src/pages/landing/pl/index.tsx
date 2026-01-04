import React from 'react';
import LandingLayout from '@/components/landing/LandingLayout';
import translations from '@/translations/landing/pl.json';

const LandingPagePl: React.FC = () => {
    return <LandingLayout language="pl" translations={translations} />;
};

export default LandingPagePl;
