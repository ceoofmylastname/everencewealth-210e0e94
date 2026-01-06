
import React from 'react';
import { useTranslation } from 'react-i18next';

const ExplainerVideo: React.FC = () => {
    const { t } = useTranslation('landing');

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-6">
                    <h3 className="text-2xl md:text-3xl font-serif text-gray-900">
                        {t('video.heading')}
                    </h3>
                </div>

                {/* Video Placeholder - Replace with actual video component or embed */}
                <div className="max-w-4xl mx-auto aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-lg flex items-center justify-center relative group cursor-pointer">
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                    {/* Play Button Placeholder */}
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
                        <svg className="w-8 h-8 text-primary fill-current translate-x-1" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                    {/* Image Placeholder */}
                    <img src="/lovable-uploads/271a74d2-0351-408d-a411-925232770258.png" alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover -z-10" />
                </div>

                <p className="text-sm text-gray-600 text-center mt-4 max-w-lg mx-auto">
                    {t('video.subtext')}
                </p>
            </div>
        </section>
    );
};

export default ExplainerVideo;
