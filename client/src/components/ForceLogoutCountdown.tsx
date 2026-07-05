import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
=======
import { Sparkles, RefreshCw } from 'lucide-react';
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059

interface ForceLogoutCountdownProps {
    onComplete: () => void;
}

const ForceLogoutCountdown: React.FC<ForceLogoutCountdownProps> = ({ onComplete }) => {
    const [count, setCount] = useState(5);

    useEffect(() => {
        if (count <= 0) {
            onComplete();
            return;
        }
        const timer = setTimeout(() => setCount(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [count, onComplete]);

<<<<<<< HEAD
=======
    const radius = 36;
    const circumference = 2 * Math.PI * radius; // ~226.19
    const strokeDashoffset = circumference - (count / 5) * circumference;

>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
<<<<<<< HEAD
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.3s ease',
        }}>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes ring {
          0% { transform: scale(0.95); opacity: 0.7; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>

            <div style={{
                textAlign: 'center',
                padding: '40px 32px',
                borderRadius: '24px',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.12)',
                maxWidth: '340px',
                width: '90%',
            }}>
                {/* Icon */}
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>🔄</div>
=======
            background: 'rgba(5, 5, 8, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse-glow {
                    0%, 100% { filter: drop-shadow(0 0 10px rgba(244, 63, 94, 0.3)); }
                    50% { filter: drop-shadow(0 0 25px rgba(244, 63, 94, 0.6)); }
                }
            `}</style>

            <div style={{
                textAlign: 'center',
                padding: '48px 36px',
                borderRadius: '28px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(244, 63, 94, 0.1)',
                maxWidth: '360px',
                width: '90%',
                animation: 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                {/* Header Icon container */}
                <div style={{
                    position: 'relative',
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                }}>
                    <RefreshCw 
                        className="w-7 h-7 text-rose-500" 
                        style={{ 
                            animation: 'spin-slow 6s linear infinite',
                            color: '#f43f5e'
                        }} 
                    />
                    <Sparkles 
                        className="w-4 h-4 text-amber-400 absolute" 
                        style={{ 
                            top: '8px', 
                            right: '8px',
                            color: '#fbbf24'
                        }} 
                    />
                </div>
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059

                {/* Title */}
                <h2 style={{
                    color: '#fff',
<<<<<<< HEAD
                    fontSize: '20px',
                    fontWeight: 700,
                    margin: '0 0 8px 0',
                    fontFamily: 'system-ui, sans-serif',
                }}>
                    New updates available
=======
                    fontSize: '22px',
                    fontWeight: 800,
                    margin: '0 0 10px 0',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    letterSpacing: '-0.02em',
                }}>
                    New Update Available
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
                </h2>

                {/* Subtitle */}
                <p style={{
<<<<<<< HEAD
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '14px',
                    margin: '0 0 32px 0',
                    lineHeight: 1.5,
                    fontFamily: 'system-ui, sans-serif',
                }}>
                    We're logging you out to apply the latest updates. Your data is safe — just log back in.
                </p>

                {/* Countdown circle */}
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Pulsing ring */}
                    <div style={{
                        position: 'absolute',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 75, 110, 0.6)',
                        animation: 'ring 1s ease-out infinite',
                    }} />
                    {/* Circle */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ff4b6e, #ff6b35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 1s ease-in-out infinite',
                        boxShadow: '0 0 30px rgba(255, 75, 110, 0.4)',
                    }}>
                        <span style={{
                            color: '#fff',
                            fontSize: '32px',
                            fontWeight: 800,
                            fontFamily: 'system-ui, sans-serif',
                            lineHeight: 1,
=======
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontSize: '14px',
                    margin: '0 0 36px 0',
                    lineHeight: 1.6,
                    fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                    We just shipped something new. Reloading so you get the latest version right away.
                </p>

                {/* Circular Progress Countdown */}
                <div style={{ 
                    position: 'relative', 
                    width: '100px', 
                    height: '100px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    animation: 'pulse-glow 2s infinite'
                }}>
                    <svg style={{
                        position: 'absolute',
                        width: '100px',
                        height: '100px',
                        transform: 'rotate(-90deg)',
                    }}>
                        {/* Background circle track */}
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke="rgba(255, 255, 255, 0.05)"
                            strokeWidth="4"
                        />
                        {/* Active moving circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke="#f43f5e"
                            strokeWidth="4"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{
                                transition: 'stroke-dashoffset 1s linear',
                            }}
                        />
                    </svg>
                    
                    {/* Countdown Number */}
                    <div style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.05))',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <span style={{
                            color: '#fff',
                            fontSize: '36px',
                            fontWeight: 900,
                            fontFamily: 'Outfit, Inter, system-ui, sans-serif',
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
                        }}>
                            {count}
                        </span>
                    </div>
                </div>

                {/* Bottom label */}
                <p style={{
<<<<<<< HEAD
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '12px',
                    margin: '20px 0 0 0',
                    fontFamily: 'system-ui, sans-serif',
                    letterSpacing: '0.5px',
                }}>
                    Logging out in {count} second{count !== 1 ? 's' : ''}...
=======
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '12px',
                    margin: '28px 0 0 0',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                }}>
                    Updating in {count} second{count !== 1 ? 's' : ''}
>>>>>>> c345bdeeec9320808b31a52a987c64dd3bc96059
                </p>
            </div>
        </div>
    );
};

export default ForceLogoutCountdown;
