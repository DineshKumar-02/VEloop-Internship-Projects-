import React from 'react';
import { useTap } from '../context/TapContext';

const TapRewardFloat = () => {
  const { floatingRewards } = useTap();

  if (!floatingRewards || floatingRewards.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 80,
      overflow: 'hidden'
    }}>
      {floatingRewards.map((item) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: `${item.x}px`,
            top: `${item.y}px`,
            transform: 'translate(-50%, -50%)',
            background: 'rgba(22, 24, 39, 0.85)',
            border: `1px solid ${item.color}55`,
            color: item.color,
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '15px',
            fontWeight: 800,
            boxShadow: `0 4px 14px ${item.color}40`,
            backdropFilter: 'blur(4px)',
            animation: 'floatUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            whiteSpace: 'nowrap'
          }}
        >
          {item.label}
          {item.bonus && (
            <span style={{ fontSize: '11px', color: '#10B981', marginLeft: '4px' }}>
              (BONUS!)
            </span>
          )}
        </div>
      ))}

      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translate(-50%, 0) scale(0.85);
          }
          40% {
            opacity: 1;
            transform: translate(-50%, -30px) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -75px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
};

export default TapRewardFloat;
