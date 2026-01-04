import React from 'react';
import LandingLayout from '@/components/landing/LandingLayout';
import translations from '@/translations/landing/no.json';

const LandingPageNo: React.FC = () => {
    return <LandingLayout language="no" translations={translations} />;
};

export default LandingPageNo;
