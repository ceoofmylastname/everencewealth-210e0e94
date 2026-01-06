import React from 'react';

interface AuthorBylineProps {
    datePublished: string;
    dateModified?: string;
    context: 'blog' | 'qa';
}

const AuthorByline: React.FC<AuthorBylineProps> = ({
    datePublished,
    dateModified,
    context
}) => {
    const photoUrl = context === 'blog'
        ? '/images/hans-blog.jpg'
        : '/images/hans-qa.jpg';

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="flex items-center gap-4 py-6 border-y border-gray-200">
            {/* Author Photo */}
            <img
                src={photoUrl}
                alt="Hans Beeckman - Senior Real Estate Advisor"
                className="w-16 h-16 rounded-full object-cover"
            />

            {/* Author Info */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">Hans Beeckman</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">Senior Real Estate Advisor</span>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <time dateTime={datePublished}>
                        Published {formatDate(datePublished)}
                    </time>

                    {dateModified && dateModified !== datePublished && (
                        <>
                            <span>•</span>
                            <time dateTime={dateModified}>
                                Updated {formatDate(dateModified)}
                            </time>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthorByline;
