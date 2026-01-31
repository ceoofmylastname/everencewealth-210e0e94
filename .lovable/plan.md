
# Add Modern Creative Play Button to Retargeting Video Section

## Overview

Add a visually striking, always-visible play button overlay on the video thumbnail in the retargeting pages. This makes it immediately clear to users that the content is playable video, encouraging engagement.

## Design Concept

The new play button will feature:
- **Large, prominent circular button** with a semi-transparent frosted glass effect
- **Pulsing animation ring** around the button for visual attention
- **Smooth scale hover effect** for interactivity feedback
- **Always visible** on the thumbnail until the video starts playing
- **Modern gradient and shadow styling** matching the luxury brand aesthetic

## Technical Changes

### File: `src/components/retargeting/RetargetingAutoplayVideo.tsx`

**Change 1: Update the play button overlay with modern creative design (Lines 99-115)**

Replace the current simple play button with an enhanced design:

```text
{/* Modern Creative Play Button Overlay */}
<button
  onClick={togglePlayPause}
  className="absolute inset-0 flex items-center justify-center cursor-pointer group"
>
  {/* Visible until user interacts or when paused */}
  <div className={`relative transition-all duration-500 ${isPlaying && hasInteracted ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
    
    {/* Outer pulsing ring */}
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full bg-white/30"
    />
    
    {/* Secondary glow ring */}
    <motion.div
      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      className="absolute inset-0 w-28 h-28 md:w-36 md:h-36 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full bg-landing-gold/20"
    />
    
    {/* Main play button with frosted glass effect */}
    <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full 
      bg-gradient-to-br from-white/95 via-white/90 to-white/80 
      backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] 
      flex items-center justify-center 
      group-hover:scale-110 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]
      transition-all duration-300 ease-out
      border border-white/50"
    >
      {/* Inner gradient accent */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-landing-gold/10 to-transparent" />
      
      {/* Play/Pause icon */}
      {isPlaying ? (
        <Pause className="w-8 h-8 md:w-10 md:h-10 text-landing-navy relative z-10" />
      ) : (
        <Play className="w-8 h-8 md:w-10 md:h-10 text-landing-navy ml-1 relative z-10" />
      )}
    </div>
  </div>
</button>
```

**Visual Features of the New Design:**

| Feature | Description |
|---------|-------------|
| **Pulsing outer ring** | Animated white ring that scales and fades to draw attention |
| **Gold glow ring** | Secondary animated ring with brand gold color for luxury feel |
| **Frosted glass button** | Main button with backdrop blur and gradient for depth |
| **Shadow depth** | Multi-layer shadow that intensifies on hover |
| **Border accent** | Subtle white border for definition against any background |
| **Smooth transitions** | 300ms scale and shadow animation on hover |

**Visibility Logic:**
- **Initially visible**: Play button shows prominently on the thumbnail
- **Fades on play**: Once user has interacted and video is playing, button fades out
- **Reappears on pause**: Button becomes visible again when video is paused or user hovers

## Files Modified

| File | Changes |
|------|---------|
| `src/components/retargeting/RetargetingAutoplayVideo.tsx` | Replace play button with modern animated design |

## Expected Result

After the changes:
- Users will see a prominent, animated play button centered on the video thumbnail
- The pulsing ring effect draws immediate attention
- Hovering the button shows a smooth scale-up effect
- The design matches the luxury Costa del Sol brand aesthetic
- Clear visual indication that the content is video
