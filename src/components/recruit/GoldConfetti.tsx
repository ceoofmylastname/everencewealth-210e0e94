import React, { useCallback, useRef } from 'react';

export const GoldConfetti: React.FC<{ trigger: boolean }> = ({ trigger }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hasTriggered = useRef(false);

    const fire = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const PARTICLE_COUNT = 200;
        const particles: {
            x: number; y: number;
            vx: number; vy: number;
            size: number; rotation: number;
            rotSpeed: number; opacity: number;
            color: string; shape: 'rect' | 'circle';
            gravity: number; drag: number;
        }[] = [];

        const goldColors = [
            '#D4AF37', '#F5D76E', '#C5A028', '#FFD700',
            '#B8860B', '#DAA520', '#E8C468', '#FFE4B5',
        ];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const velocity = 8 + Math.random() * 14;
            particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 200,
                y: canvas.height / 2,
                vx: Math.cos(angle) * velocity * (0.3 + Math.random() * 0.7),
                vy: Math.sin(angle) * velocity * (0.3 + Math.random() * 0.7) - 4,
                size: 3 + Math.random() * 8,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.3,
                opacity: 1,
                color: goldColors[Math.floor(Math.random() * goldColors.length)],
                shape: Math.random() > 0.4 ? 'rect' : 'circle',
                gravity: 0.12 + Math.random() * 0.08,
                drag: 0.98 + Math.random() * 0.015,
            });
        }

        let frame = 0;
        const MAX_FRAMES = 300;

        const animate = () => {
            frame++;
            if (frame > MAX_FRAMES) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.vy += p.gravity;
                p.vx *= p.drag;
                p.vy *= p.drag;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotSpeed;
                p.opacity = Math.max(0, 1 - frame / MAX_FRAMES);

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.globalAlpha = p.opacity;

                // Shimmer effect
                const shimmer = 0.7 + 0.3 * Math.sin(frame * 0.1 + p.rotation);
                ctx.globalAlpha *= shimmer;

                if (p.shape === 'rect') {
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                    // Gold edge highlight
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else {
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            });

            requestAnimationFrame(animate);
        };

        animate();
    }, []);

    React.useEffect(() => {
        if (trigger && !hasTriggered.current) {
            hasTriggered.current = true;
            fire();
        }
    }, [trigger, fire]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 9999 }}
        />
    );
};
