import React from 'react';
import LandingLayout from '@/components/landing/LandingLayout';
import translations from '@/translations/landing/hu.json';

const LandingPageHu: React.FC = () => {
    return <LandingLayout language="hu" translations={translations} />;
};

export default LandingPageHu;
