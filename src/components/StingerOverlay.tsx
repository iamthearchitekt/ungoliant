import { useState, useEffect } from 'react';

export function StingerOverlay({ onComplete }: { onComplete: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Fallback safety: hide after 5 seconds if video fails to call onEnded
        const timer = setTimeout(() => {
            handleEnd();
        }, 6000);
        return () => clearTimeout(timer);
    }, []);

    const handleEnd = () => {
        setIsVisible(false);
        setTimeout(onComplete, 500); // Allow fade out
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#09090b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.5s ease-out',
            opacity: isVisible ? 1 : 0,
            pointerEvents: 'none'
        }}>
            <video
                autoPlay
                muted
                onEnded={handleEnd}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            >
                <source src="./stinger.mp4" type="video/mp4" />
            </video>
        </div>
    );
}
