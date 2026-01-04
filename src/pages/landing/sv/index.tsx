import React from 'react';
import LandingLayout from '@/components/landing/LandingLayout';
import translations from '@/translations/landing/sv.json';

const LandingPageSv: React.FC = () => {
    return <LandingLayout language="sv" translations={translations} />;
};

export default LandingPageSv;
