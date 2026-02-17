import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import EmmaChat from '@/components/landing/EmmaChat';

interface BlogEmmaChatProps {
  language: string;
}

const BlogEmmaChat: React.FC<BlogEmmaChatProps> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [propertyContext, setPropertyContext] = useState<{
    propertyRef?: string;
    propertyPrice?: string;
    propertyType?: string;
  } | null>(null);
  
  // Listen for external open triggers (from CTA buttons, etc.)
  useEffect(() => {
    const handleOpenChatbot = (e: Event) => {
      const customEvent = e as CustomEvent;
      // Capture property context if passed from property page
      if (customEvent.detail) {
        setPropertyContext({
          propertyRef: customEvent.detail.propertyRef,
          propertyPrice: customEvent.detail.propertyPrice,
          propertyType: customEvent.detail.propertyType
        });
        console.log('📍 BlogEmmaChat: Property context received:', customEvent.detail);
      }
      setIsOpen(true);
    };
    
    // Listen for both event names for compatibility
    window.addEventListener('openChatbot', handleOpenChatbot);
    window.addEventListener('openEmmaChat', handleOpenChatbot);
    return () => {
      window.removeEventListener('openChatbot', handleOpenChatbot);
      window.removeEventListener('openEmmaChat', handleOpenChatbot);
    };
  }, []);
  
  return (
    <>
      {/* Floating Button - Branded icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Chat with Everence AI"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#1A4D3E] shadow-2xl flex items-center justify-center transition-transform group-hover:scale-110">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
        </button>
      )}

      {/* Emma Chat Component - Same as landing pages */}
      <EmmaChat 
        isOpen={isOpen} 
        onClose={() => {
          setIsOpen(false);
          setPropertyContext(null); // Clear context on close
        }} 
        language={language}
        propertyContext={propertyContext}
      />
    </>
  );
};

export default BlogEmmaChat;
