
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LeadForm from '@/components/landing/LeadForm';
import { LanguageCode, detectUserLanguage } from '@/utils/landing/languageDetection';
import enTranslations from '@/translations/landing/en.json';
import nlTranslations from '@/translations/landing/nl.json';
import frTranslations from '@/translations/landing/fr.json';
import deTranslations from '@/translations/landing/de.json';
import daTranslations from '@/translations/landing/da.json';
import fiTranslations from '@/translations/landing/fi.json';
import plTranslations from '@/translations/landing/pl.json';
import huTranslations from '@/translations/landing/hu.json';
import svTranslations from '@/translations/landing/sv.json';
import noTranslations from '@/translations/landing/no.json';

const translationsMap: Record<string, any> = {
    en: enTranslations,
    nl: nlTranslations,
    fr: frTranslations,
    de: deTranslations,
    da: daTranslations,
    fi: fiTranslations,
    pl: plTranslations,
    hu: huTranslations,
    sv: svTranslations,
    no: noTranslations
};

const OptInPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const projectInterest = searchParams.get('project');
    const [language, setLanguage] = useState<LanguageCode>('en');
    const [translations, setTranslations] = useState<any>(enTranslations);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const detectedLang = detectUserLanguage();
        setLanguage(detectedLang);
        setTranslations(translationsMap[detectedLang] || enTranslations);
    }, []);

    const handleSuccess = () => {
        setIsSuccess(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-serif text-gray-900">
                    {isSuccess ? 'Thank You!' : (translations.form?.title || translations.hero?.emmaCTA || "Get Information")}
                </h2>
                {projectInterest && !isSuccess && (
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Inquiring about: <span className="font-semibold text-primary">{projectInterest.replace(/-/g, ' ')}</span>
                    </p>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {isSuccess ? (
                        <div className="text-center space-y-4">
                            <div className="text-green-600 font-medium text-lg">
                                {translations.form?.success || "We will contact you shortly."}
                            </div>
                            <p className="text-gray-500">
                                You can close this window now.
                            </p>
                            <a href="/" className="inline-block mt-4 text-primary hover:underline">
                                Return to Home
                            </a>
                        </div>
                    ) : (
                        <LeadForm
                            language={language}
                            translations={translations.form}
                            propertyId={projectInterest || undefined}
                            source="optin_page"
                            onSuccess={handleSuccess}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default OptInPage;
