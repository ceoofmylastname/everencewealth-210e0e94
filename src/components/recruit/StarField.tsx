import React, { useEffect, useRef } from 'react';

export const StarField: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        // Create stars
        const STAR_COUNT = 180;
        const stars: { x: number; y: number; z: number; size: number; opacity: number; speed: number; color: string }[] = [];

        for (let i = 0; i < STAR_COUNT; i++) {
            const isGold = Math.random() < 0.15;
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                z: Math.random() * 3,
                size: 0.3 + Math.random() * 1.8,
                opacity: 0.1 + Math.random() * 0.6,
                speed: 0.02 + Math.random() * 0.08,
                color: isGold ? '#D4AF37' : '#E2E8F0',
            });
        }

        // Connection lines
        const MAX_DISTANCE = 120;

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Update and draw stars
            stars.forEach((star, i) => {
                // Slow drift
                star.y -= star.speed;
                star.x += Math.sin(Date.now() * 0.0001 + i) * 0.05;

                // Wrap around
                if (star.y < -10) {
                    star.y = height + 10;
                    star.x = Math.random() * width;
                }
                if (star.x < -10) star.x = width + 10;
                if (star.x > width + 10) star.x = -10;

                // Pulsing opacity
                const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.001 + i * 0.5);
                const finalOpacity = star.opacity * (0.6 + 0.4 * pulse);

                // Glow
                ctx.beginPath();
                const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
                gradient.addColorStop(0, star.color.replace(')', `, ${finalOpacity * 0.8})`).replace('rgb', 'rgba').replace('#D4AF37', `rgba(212, 175, 55, ${finalOpacity * 0.8})`).replace('#E2E8F0', `rgba(226, 232, 240, ${finalOpacity * 0.3})`));
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                if (star.color === '#D4AF37') {
                    ctx.fillStyle = `rgba(212, 175, 55, ${finalOpacity})`;
                } else {
                    ctx.fillStyle = `rgba(226, 232, 240, ${finalOpacity * 0.7})`;
                }
                ctx.fill();
            });

            // Draw connection lines between nearby stars
            for (let i = 0; i < stars.length; i++) {
                for (let j = i + 1; j < stars.length; j++) {
                    const dx = stars[i].x - stars[j].x;
                    const dy = stars[i].y - stars[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < MAX_DISTANCE) {
                        const opacity = (1 - dist / MAX_DISTANCE) * 0.06;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(stars[i].x, stars[i].y);
                        ctx.lineTo(stars[j].x, stars[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
};
