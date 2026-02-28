import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Lock, Unlock, ExternalLink } from 'lucide-react';
import YouTube, { YouTubeProps } from 'react-youtube';

interface BriefingPlayerProps {
    videoUrl?: string;
}

export const BriefingPlayer: React.FC<BriefingPlayerProps> = ({
    videoUrl = 'https://www.youtube.com/watch?v=kY31w0M4yK8',
}) => {
    const playerRef = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showControls, setShowControls] = useState(true);

    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        playerRef.current = event.target;
        if (isMuted) {
            event.target.mute();
        }
    };

    const extractVideoId = (url: string) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
        const match = regex.exec(url);
        return match ? match[1] : url;
    };

    const videoId = extractVideoId(videoUrl);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && playerRef.current) {
            interval = setInterval(async () => {
                const currentTime = await playerRef.current.getCurrentTime();
                const duration = await playerRef.current.getDuration();
                if (duration > 0) {
                    const pct = (currentTime / duration) * 100;
                    setProgress(pct);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handleStateChange: YouTubeProps['onStateChange'] = (event) => {
        if (event.data === 1) { // Playing
            setIsPlaying(true);
            setShowControls(false);
        } else if (event.data === 2 || event.data === 0) { // Paused or Ended
            setIsPlaying(false);
            setShowControls(true);
        }
    };

    const togglePlay = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const toggleMute = () => {
        if (!playerRef.current) return;
        if (isMuted) {
            playerRef.current.unMute();
            setIsMuted(false);
        } else {
            playerRef.current.mute();
            setIsMuted(true);
        }
    };

    const opts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0,
            controls: 0,
            showinfo: 0,
            rel: 0,
            modestbranding: 1
        },
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Video container */}
            <div
                className="relative rounded-2xl overflow-hidden aspect-video group"
                style={{
                    background: 'linear-gradient(145deg, rgba(18, 28, 22, 0.95), rgba(5, 5, 5, 0.98))',
                    border: '1px solid rgba(212, 175, 55, 0.12)',
                    boxShadow: '0 0 100px rgba(0,0,0,0.5), 0 0 40px rgba(212, 175, 55, 0.05)',
                }}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(isPlaying ? false : true)}
            >
                {/* Video element */}
                {videoId ? (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
                        <YouTube
                            videoId={videoId}
                            opts={{
                                height: '100%',
                                width: '100%',
                                playerVars: {
                                    autoplay: 0,
                                    controls: 0,
                                    showinfo: 0,
                                    rel: 0,
                                    modestbranding: 1,
                                    playsinline: 1,
                                },
                            }}
                            onReady={onPlayerReady}
                            onStateChange={handleStateChange}
                            onError={(e) => console.error('YT Player Error:', e)}
                            className="absolute inset-0 w-full h-full object-cover"
                            iframeClassName="w-full h-full"
                        />

                        {/* Custom Large Play overlay (hides native YT interface & handles click) */}
                        {!isPlaying && (
                            <div
                                className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 cursor-pointer backdrop-blur-sm transition-all hover:bg-black/20"
                                onClick={togglePlay}
                            >
                                <div className="text-center group-hover:scale-105 transition-transform duration-500">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl border border-[#D4AF37]/30 flex items-center justify-center bg-[#121C16]/80 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.15)] group-hover:shadow-[0_0_50px_rgba(212,175,55,0.3)] transition-all">
                                        <Play className="w-8 h-8 text-[#D4AF37] ml-1 opacity-90 group-hover:opacity-100 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                                    </div>
                                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37]/80 font-semibold drop-shadow-md">
                                        Access Briefing
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Placeholder when no video is set */
                    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl border border-[#D4AF37]/20 flex items-center justify-center bg-[#D4AF37]/5">
                                <Play className="w-8 h-8 text-[#D4AF37]/60 ml-1" />
                            </div>
                            <p className="text-[10px] tracking-[0.3em] uppercase text-[#E2E8F0]/30 font-semibold">
                                Classified Briefing
                            </p>
                            <p className="text-[9px] tracking-[0.2em] uppercase text-[#E2E8F0]/15 mt-1">
                                Video content loading...
                            </p>
                        </div>
                    </div>
                )}

                {/* HUD Overlay — top corners */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] font-mono tracking-wider text-[#E2E8F0]/40 uppercase">
                        Classified
                    </span>
                </div>
                <div className="absolute top-4 right-4">
                    <span className="text-[9px] font-mono tracking-wider text-[#D4AF37]/40">
                        {Math.round(progress)}% VIEWED
                    </span>
                </div>

                {/* Controls overlay */}
                <motion.div
                    className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
                    animate={{ opacity: showControls ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Progress bar */}
                    <div className="w-full h-1 bg-[#E2E8F0]/10 rounded-full mb-3 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${progress}%`,
                                background: 'linear-gradient(90deg, #D4AF37, #F5D76E)',
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={togglePlay}
                                className="w-10 h-10 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex items-center justify-center hover:bg-[#D4AF37]/15 transition-colors"
                            >
                                {isPlaying ? (
                                    <Pause className="w-4 h-4 text-[#D4AF37]" />
                                ) : (
                                    <Play className="w-4 h-4 text-[#D4AF37] ml-0.5" />
                                )}
                            </button>
                            <button
                                onClick={toggleMute}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#E2E8F0]/40 hover:text-[#E2E8F0]/80 transition-colors"
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
