import React from "react";
import { Share2, Link2, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url, description }) => {
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch {
        // User cancelled
      }
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground font-medium mr-1">Share:</span>

      {typeof navigator !== "undefined" && navigator.share && (
        <Button variant="ghost" size="sm" onClick={handleNativeShare} className="h-8 w-8 p-0 rounded-full">
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </Button>
      )}

      <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" asChild>
          <span><Twitter className="h-4 w-4" /><span className="sr-only">Share on Twitter</span></span>
        </Button>
      </a>

      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" asChild>
          <span><Linkedin className="h-4 w-4" /><span className="sr-only">Share on LinkedIn</span></span>
        </Button>
      </a>

      <Button variant="ghost" size="sm" onClick={copyLink} className="h-8 w-8 p-0 rounded-full">
        <Link2 className="h-4 w-4" />
        <span className="sr-only">Copy link</span>
      </Button>
    </div>
  );
};
