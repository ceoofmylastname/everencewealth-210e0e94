import React from 'react';
import LandingLayout from '@/components/landing/LandingLayout';
import translations from '@/translations/landing/de.json';

const LandingPageDe: React.FC = () => {
    return <LandingLayout language="de" translations={translations} />;
};

export default LandingPageDe;
