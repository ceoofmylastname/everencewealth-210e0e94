import React, { useRef, useState } from 'react';
import { X, VolumeX } from 'lucide-react';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl?: string; // Make URL dynamic
}

const VideoModal: React.FC<VideoModalProps> = ({
    isOpen,
    onClose,
    videoUrl = "https://storage.googleapis.com/msgsndr/281Nzx90nVL8424QY4Af/media/695c3fa76aaf16223bba7094.mp4"
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleUnmute = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0; // Restart from beginning
            videoRef.current.muted = false;
            setIsMuted(false);
            videoRef.current.play();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-60"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Video Container */}
            <div className="relative w-[90vw] max-w-[1200px] aspect-video">
                <video
                    ref={videoRef}
                    className="w-full h-full rounded-lg"
                    controls={!isMuted}
                    muted={isMuted}
                    autoPlay
                    playsInline
                    onClick={handleUnmute}
                >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Mute Indicator - Elegant floating badge */}
                {isMuted && (
                    <div
                        className="absolute bottom-6 right-6 bg-gradient-to-r from-primary/90 to-primary/70 backdrop-blur-md px-5 py-3 rounded-full flex items-center gap-3 cursor-pointer hover:scale-105 transition-all duration-300 shadow-2xl border border-white/20"
                        onClick={handleUnmute}
                    >
                        <VolumeX className="w-5 h-5 text-white animate-pulse" />
                        <span className="text-white text-sm font-medium tracking-wide">
                            Click to unmute & restart
                        </span>
                    </div>
                )}
            </div>

            {/* Continue Button */}
            <div className="mt-8 flex justify-center">
                <button
                    onClick={() => {
                        onClose();
                        window.location.href = '/thank-you';
                    }}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg rounded-full flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                    Continue
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default VideoModal;
