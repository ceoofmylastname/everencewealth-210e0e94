import React from 'react';

interface StickyActionButtonProps {
    onOpenChat: () => void;
    language: string;
}

// Chat button removed — component kept as empty shell to avoid breaking imports
const StickyActionButton: React.FC<StickyActionButtonProps> = () => {
    return null;
};

export default StickyActionButton;
