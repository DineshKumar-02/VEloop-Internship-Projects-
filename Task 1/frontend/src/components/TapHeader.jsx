import React from 'react';
import { useTap } from '../context/TapContext';
import { Shield, Zap, Sparkles, Trophy, Settings, RefreshCw } from 'lucide-react';

const TapHeader = () => {
  const { user, balances, tapState, setActiveDrawer, setActiveTab, refreshState } = useTap();

  return (
    <header style={{
      padding: '16px 18px',
      background: 'linear-gradient(180deg, #1C2033 0%, rgba(22, 24, 39, 0.95) 100%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backdropFilter: 'blur(10px)'
    }}>
      {/* Top Row: User identity & platform controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2D334D, #1E2235)',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <img 
              src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=veloop'} 
              alt="Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#F59E0B',
              color: '#111422',
              fontSize: '10px',
              fontWeight: 800,
              padding: '1px 4px',
              borderTopLeftRadius: '6px'
            }}>
              Lv.{user?.level || 1}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#FFF' }}>
                {user?.displayName || 'VELoop Tapper'}
              </span>
              {tapState?.energyShield?.active && (
                <span title="Energy Shield Active" style={{ color: '#10B981', display: 'flex' }}>
                  <Shield size={14} />
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94A3B8' }}>
              <span style={{ color: '#FBBF24', fontWeight: 600 }}>Season 1</span>
              <span>•</span>
              <span style={{ color: '#60A5FA' }}>{(tapState?.totalPhysicalTaps || 0).toLocaleString()} Total Taps</span>
            </div>
          </div>
        </div>

        {/* Action icons: Refresh & Admin Dashboard */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={refreshState}
            title="Sync with Server"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94A3B8',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={() => setActiveDrawer('admin')}
            title="Admin Control Center"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#FBBF24',
              borderRadius: '10px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer'
            }}
          >
            <Settings size={14} />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Bottom Currency Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px'
      }}>
        {/* VE Balance */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '8px',
          padding: '4px 6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', color: '#FBBF24', fontWeight: 600 }}>VE COIN</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
            {(balances.ve || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </div>
        </div>

        {/* SVE Balance */}
        <div style={{
          background: 'rgba(251, 191, 36, 0.08)',
          border: '1px solid rgba(251, 191, 36, 0.2)',
          borderRadius: '8px',
          padding: '4px 6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', color: '#FDE68A', fontWeight: 600 }}>SVE</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
            {(balances.sve || 0).toLocaleString()}
          </div>
        </div>

        {/* Tokens */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '8px',
          padding: '4px 6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', color: '#93C5FD', fontWeight: 600 }}>TOKENS</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
            {(balances.tokens || 0).toLocaleString()}
          </div>
        </div>

        {/* Gems / Spins */}
        <div 
          onClick={() => setActiveDrawer('lucky')}
          style={{
            background: 'rgba(236, 72, 153, 0.08)',
            border: '1px solid rgba(236, 72, 153, 0.25)',
            borderRadius: '8px',
            padding: '4px 6px',
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '10px', color: '#F472B6', fontWeight: 600 }}>SPINS</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
            {balances.spins || 0} 🎯
          </div>
        </div>
      </div>
    </header>
  );
};

export default TapHeader;
