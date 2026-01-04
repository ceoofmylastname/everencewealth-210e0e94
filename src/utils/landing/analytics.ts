import { LanguageCode } from './languageDetection';

type AnalyticsEvent = {
    category: string;
    action?: string;
    label?: string;
    value?: number;
    [key: string]: any;
};

// Mocking GA4 and Pixel for now as we don't have the actual SDKs initialized in this file
// In a real app, these would wrap window.gtag and window.fbq

export const trackEvent = (eventName: string, params: AnalyticsEvent) => {
    // Console log for verification
    console.log(`[Analytics] ${eventName}:`, params);

    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, params);
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
        // Map to standard FB events where possible, else CustomEvent
        if (eventName === 'lead_form_submit') {
            (window as any).fbq('track', 'Lead', params);
        } else if (eventName === 'property_view') {
            (window as any).fbq('track', 'ViewContent', params);
        } else {
            (window as any).fbq('trackCustom', eventName, params);
        }
    }
};

export const captureUTM = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get('utm_source') || 'direct',
        utm_medium: params.get('utm_medium') || 'none',
        utm_campaign: params.get('utm_campaign') || 'none',
        utm_content: params.get('utm_content') || 'none',
        utm_term: params.get('utm_term') || 'none'
    };
};

export const trackPageView = (language: LanguageCode) => {
    trackEvent('page_view', {
        category: 'Navigation',
        page_title: `Landing Page - ${language}`,
        page_location: window.location.href,
        page_path: window.location.pathname,
        language
    });
};
