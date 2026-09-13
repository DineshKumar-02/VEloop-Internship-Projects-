import React, { useState } from 'react';
import tapApi from '../api/tapApi';
import { useTap } from '../context/TapContext';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy } from 'lucide-react';

const SLICES = [
  { id: 'tokens_50', label: '50 Tokens', color: '#3B82F6' },
  { id: 've_20', label: '20 VEs', color: '#F59E0B' },
  { id: 'spins_2', label: '2 Spins', color: '#8B5CF6' },
  { id: 'gems_10', label: '10 Gems', color: '#EC4899' },
  { id: 'sve_100', label: '100 SVEs', color: '#FBBF24' },
  { id: 'sve_50', label: '50 SVEs', color: '#D97706' },
  { id: 'better_luck', label: 'Better Luck', color: '#64748B' },
  { id: 'energy_15', label: '+15 Energy', color: '#10B981' }
];

const SpinWheel = ({ onComplete }) => {
  const { refreshState, triggerHaptic } = useTap();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);

  const handleSpin = async () => {
    if (spinning) return;
    try {
      setSpinning(true);
      setResult(null);
      triggerHaptic('heavy');

      // Execute server-authoritative spin
      const res = await tapApi.spinWheel();

      if (res.success) {
        // Find slice index
        let sliceIndex = SLICES.findIndex(s => s.id === res.outcome.id);
        if (sliceIndex === -1) sliceIndex = 0;

        // Calculate degrees so needle lands on slice
        const sliceAngle = 360 / SLICES.length;
        // Pointer is at top (270 deg or 0 deg), adjust target angle
        const targetDeg = 360 * 5 + (360 - sliceIndex * sliceAngle - sliceAngle / 2);

        setRotation(targetDeg);

        // Wait for spin animation (3.2s)
        setTimeout(() => {
          setSpinning(false);
          setResult(res.outcome);
          triggerHaptic('heavy');

          if (res.outcome.outcome !== 'none') {
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          }

          refreshState();
          if (onComplete) onComplete(res.outcome);
        }, 3200);
      }
    } catch (err) {
      alert(err.message || 'Spin failed');
      setSpinning(false);
    }
  };

  const sliceAngle = 360 / SLICES.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Outer Wheel Container */}
      <div style={{
        position: 'relative',
        width: '260px',
        height: '260px',
        margin: '10px 0 20px'
      }}>
        {/* Needle Indicator at Top */}
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '0',
          height: '0',
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderTop: '20px solid #F59E0B',
          zIndex: 20,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))'
        }} />

        {/* Rotating Wheel Disc */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '6px solid #282E47',
          boxShadow: '0 0 25px rgba(0,0,0,0.7), inset 0 0 15px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          position: 'relative',
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? 'transform 3.2s cubic-bezier(0.15, 0.95, 0.2, 1)' : 'none',
          background: '#1A1D2D'
        }}>
          {SLICES.map((slice, i) => {
            const startAngle = i * sliceAngle;

            return (
              <div
                key={slice.id}
                style={{
                  position: 'absolute',
                  width: '50%',
                  height: '50%',
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0% 0%',
                  transform: `rotate(${startAngle}deg) skewY(${90 - sliceAngle}deg)`,
                  background: slice.color,
                  opacity: 0.88,
                  border: '1px solid rgba(0,0,0,0.2)'
                }}
              />
            );
          })}

          {/* Labels Layer */}
          {SLICES.map((slice, i) => {
            const angle = i * sliceAngle + sliceAngle / 2;
            return (
              <div
                key={`lbl_${slice.id}`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '110px',
                  transformOrigin: '0% 0%',
                  transform: `rotate(${angle}deg) translate(28px, -50%)`,
                  color: '#FFF',
                  fontSize: '10px',
                  fontWeight: 800,
                  textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                {slice.label}
              </div>
            );
          })}

          {/* Center Hub */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2D334D, #161827)',
            border: '3px solid #F59E0B',
            boxShadow: '0 0 10px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FBBF24',
            zIndex: 10
          }}>
            <Sparkles size={18} />
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid #F59E0B',
          borderRadius: '10px',
          padding: '8px 16px',
          fontSize: '15px',
          fontWeight: 800,
          color: '#FFF',
          marginBottom: '14px',
          textAlign: 'center'
        }}>
          🎉 Result: <span style={{ color: result.color || '#FBBF24' }}>{result.label}</span>
        </div>
      )}

      {/* Spin Trigger Button */}
      <button
        onClick={handleSpin}
        disabled={spinning}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '16px',
          letterSpacing: '1px'
        }}
      >
        {spinning ? 'Spinning...' : 'SPIN WHEEL NOW'}
      </button>
    </div>
  );
};

export default SpinWheel;
