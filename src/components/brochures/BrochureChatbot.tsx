import React from 'react';

interface BrochureChatbotProps {
  cityName: string;
  isOpen: boolean;
  onToggle: () => void;
  language?: string;
}

// Chat functionality removed — component kept as empty shell to avoid breaking imports
export const BrochureChatbot: React.FC<BrochureChatbotProps> = () => {
  return null;
};
