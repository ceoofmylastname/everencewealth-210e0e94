import React from 'react';
import LandingLayout from '@/components/landing/LandingLayout';
import translations from '@/translations/landing/fi.json';

const LandingPageFi: React.FC = () => {
    return <LandingLayout language="fi" translations={translations} />;
};

export default LandingPageFi;
