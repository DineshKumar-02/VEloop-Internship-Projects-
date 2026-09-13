import React from 'react';
import { useTap } from '../context/TapContext';
import { Wallet, Sparkles, ChevronRight, Gem, Layers } from 'lucide-react';

const BalanceCard = () => {
  const { balances, setActiveDrawer } = useTap();

  return (
    <div className="fintech-card" style={{
      margin: '14px 16px 8px',
      background: 'linear-gradient(135deg, #1F253E 0%, #171A2B 100%)',
      border: '1px solid rgba(245, 158, 11, 0.25)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 70%)',
        pointerEvents: 'none'
      }} />

      {/* Primary Balance Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#FBBF24',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} /> Total VE Balance
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.15,
            marginTop: '4px',
            letterSpacing: '-0.5px'
          }}>
            {(balances.ve || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            <span style={{ fontSize: '18px', color: '#F59E0B', marginLeft: '6px', fontWeight: 800 }}>VE</span>
          </div>
        </div>

        {/* Quick Wallet Action */}
        <button
          onClick={() => setActiveDrawer('wallet')}
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '8px 12px',
            color: '#FFF',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
        >
          <Wallet size={14} color="#60A5FA" />
          <span>Wallet</span>
          <ChevronRight size={14} color="#94A3B8" />
        </button>
      </div>

      {/* Secondary Resources: VE Fragments & Rare Gems (PDF §20) */}
      <div style={{
        marginTop: '14px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px'
      }}>
        {/* VE Fragments */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} color="#A78BFA" />
          <span style={{ color: '#94A3B8' }}>VE Fragments:</span>
          <span style={{ color: '#DDD6FE', fontWeight: 700 }}>{balances.fragments || 0}</span>
          <span style={{ fontSize: '10px', color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.15)', padding: '1px 5px', borderRadius: '4px' }}>
            Collectible
          </span>
        </div>

        {/* Rare Gems */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Gem size={14} color="#F472B6" />
          <span style={{ color: '#94A3B8' }}>Gems:</span>
          <span style={{ color: '#FBCFE8', fontWeight: 700 }}>{(balances.gems || 0).toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
