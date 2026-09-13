import React, { useState, useRef } from 'react';
import { useTap } from '../context/TapContext';
import { Target, Zap, Sparkles } from 'lucide-react';

const TapCircle = () => {
  const { handleTap, tapState, precisionTarget, combo, streak } = useTap();
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [rejectFeedback, setRejectFeedback] = useState(null);

  const coinRef = useRef(null);

  // Trigger ripple effect on coin surface
  const addRipple = (e) => {
    if (!coinRef.current) return;
    const rect = coinRef.current.getBoundingClientRect();
    const x = (e.clientX || (rect.left + rect.width / 2)) - rect.left;
    const y = (e.clientY || (rect.top + rect.height / 2)) - rect.top;

    const rippleId = `rip_${Date.now()}_${Math.random()}`;
    setRipples(prev => [...prev.slice(-4), { id: rippleId, x, y }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 600);
  };

  const onPointerDown = async (e, isPrecision = false) => {
    e.preventDefault();
    setIsPressed(true);
    addRipple(e);

    const result = await handleTap(e, isPrecision);

    if (result && !result.success) {
      // Subtle rejection feedback per §3: "Show subtle feedback such as 'Too fast' or 'Energy empty' without a disruptive modal"
      let msg = 'Tap ignored';
      if (result.reason === 'TOO_FAST') msg = '⚡ Too fast (200ms lock)';
      else if (result.reason === 'NO_ENERGY') msg = '⚡ Energy depleted';
      else msg = result.reason;

      setRejectFeedback(msg);
      setTimeout(() => setRejectFeedback(null), 1200);
    }
  };

  const onPointerUp = () => {
    setIsPressed(false);
  };

  const isBoostActive = tapState?.boost?.active;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '12px 0 16px',
      position: 'relative'
    }}>
      {/* Dynamic Streak & Combo Layer above coin */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px',
        height: '28px'
      }}>
        {combo > 1 && (
          <div style={{
            background: combo >= 25 
              ? 'linear-gradient(135deg, #EF4444, #F59E0B)' 
              : 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.15))',
            color: combo >= 25 ? '#FFF' : '#FBBF24',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: combo >= 25 ? '0 0 14px rgba(245, 158, 11, 0.6)' : 'none',
            animation: 'bounceIn 0.2s ease'
          }}>
            <Sparkles size={12} /> COMBO x{combo}
          </div>
        )}

        {streak > 2 && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60A5FA',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            🔥 Streak {streak}
          </div>
        )}
      </div>

      {/* Subtle feedback message when rejected */}
      {rejectFeedback && (
        <div style={{
          position: 'absolute',
          top: '35px',
          background: 'rgba(239, 68, 68, 0.9)',
          color: '#FFF',
          fontSize: '11px',
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: '999px',
          zIndex: 30,
          animation: 'fadeIn 0.15s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}>
          {rejectFeedback}
        </div>
      )}

      {/* Outer ambient glow ring */}
      <div style={{
        position: 'relative',
        width: '260px',
        height: '260px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: isBoostActive 
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, rgba(245, 158, 11, 0.15) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 75%)',
          animation: 'pulseRing 2.5s infinite ease-in-out',
          pointerEvents: 'none'
        }} />

        {/* Central VE Coin */}
        <div
          ref={coinRef}
          onPointerDown={(e) => onPointerDown(e, false)}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          style={{
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #2A314E 0%, #171A2A 60%, #111422 100%)',
            border: '6px solid #23283E',
            outline: isBoostActive ? '3px solid #EF4444' : '3px solid rgba(245, 158, 11, 0.5)',
            boxShadow: isPressed
              ? '0 4px 12px rgba(0,0,0,0.8), inset 0 6px 14px rgba(0,0,0,0.7)'
              : '0 14px 40px rgba(0,0,0,0.65), 0 0 35px rgba(245, 158, 11, 0.2), inset 0 2px 6px rgba(255,255,255,0.15)',
            transform: isPressed ? 'scale(0.94) translateY(4px)' : 'scale(1)',
            transition: 'transform 0.08s cubic-bezier(0.1, 0.9, 0.2, 1), box-shadow 0.08s ease',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            touchAction: 'manipulation'
          }}
        >
          {/* Inner Golden Border Ring */}
          <div style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            border: '2px dashed rgba(245, 158, 11, 0.35)',
            pointerEvents: 'none'
          }} />

          {/* VE Emblem */}
          <div style={{
            width: '82px',
            height: '82px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 70%, #B45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
            marginBottom: '6px',
            pointerEvents: 'none'
          }}>
            <span style={{
              fontSize: '34px',
              fontWeight: 900,
              color: '#111422',
              letterSpacing: '-1px'
            }}>
              VE
            </span>
          </div>

          <div style={{
            fontSize: '13px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#FBBF24',
            pointerEvents: 'none'
          }}>
            TAP TO EARN
          </div>

          <div style={{
            fontSize: '10px',
            color: '#94A3B8',
            marginTop: '2px',
            pointerEvents: 'none'
          }}>
            {tapState?.multitap?.multiplier > 1 ? `x${tapState.multitap.multiplier} Multiplier Active` : '1 Tap = 1 Energy'}
          </div>

          {/* Ripple Overlays */}
          {ripples.map(r => (
            <span
              key={r.id}
              style={{
                position: 'absolute',
                left: `${r.x}px`,
                top: `${r.y}px`,
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 80%)',
                transform: 'translate(-50%, -50%)',
                animation: 'rippleAnim 0.55s ease-out forwards',
                pointerEvents: 'none'
              }}
            />
          ))}

          {/* Precision Target Popup (PDF §10) */}
          {precisionTarget && (
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                onPointerDown(e, true);
              }}
              style={{
                position: 'absolute',
                left: `${precisionTarget.x}%`,
                top: `${precisionTarget.y}%`,
                transform: 'translate(-50%, -50%)',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                border: '2px solid #93C5FD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.8)',
                cursor: 'pointer',
                animation: 'pulseDot 0.8s infinite',
                zIndex: 25
              }}
            >
              <Target size={24} />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes rippleAnim {
          0% { width: 0; height: 0; opacity: 1; }
          100% { width: 240px; height: 240px; opacity: 0; }
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(0.98); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TapCircle;
