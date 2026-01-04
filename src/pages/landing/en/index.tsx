import React from 'react';
import LandingLayout from '@/components/landing/LandingLayout';
import translations from '@/translations/landing/en.json';

const LandingPageEn: React.FC = () => {
    return <LandingLayout language="en" translations={translations} />;
};

export default LandingPageEn;
