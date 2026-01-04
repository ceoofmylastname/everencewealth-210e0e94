import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl?: string; // Optional URL, default to a placeholder or embedded video
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ" }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] p-0 bg-black border-none text-white overflow-hidden">
                <div className="relative pt-[56.25%]">
                    <iframe
                        src={`${videoUrl}?autoplay=1&mute=0`}
                        className="absolute top-0 left-0 w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Intro Video"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VideoModal;
