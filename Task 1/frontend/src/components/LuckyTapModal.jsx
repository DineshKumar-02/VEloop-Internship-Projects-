import React, { useState, useEffect } from 'react';
import { useTap } from '../context/TapContext';
import tapApi from '../api/tapApi';
import SpinWheel from './SpinWheel';
import { X, Disc3, Award, Sparkles, CheckCircle2 } from 'lucide-react';

const LuckyTapModal = () => {
  const { activeDrawer, setActiveDrawer, tapState, balances } = useTap();
  const [luckyStatus, setLuckyStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeDrawer === 'lucky') {
      loadStatus();
    }
  }, [activeDrawer]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await tapApi.getLuckyStatus();
      if (res.success) {
        setLuckyStatus(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (activeDrawer !== 'lucky') return null;

  const threshold = luckyStatus?.threshold || 300;
  const currentTaps = luckyStatus?.currentTaps ?? (tapState?.luckyWindowTaps || 0);
  const pct = Math.min(100, Math.floor((currentTaps / threshold) * 100));
  const canSpin = luckyStatus?.isEligible || (balances?.spins > 0);

  return (
    <div className="drawer-backdrop" onClick={() => setActiveDrawer(null)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(236, 72, 153, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EC4899'
            }}>
              <Disc3 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>Lucky Tap Arena</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>Unlocked after 300 accepted taps in arena</p>
            </div>
          </div>
          <button
            onClick={() => setActiveDrawer(null)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 300 Taps Milestone Tracker */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '12px 14px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
              Lucky Tap Threshold ({threshold} Taps)
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: canSpin ? '#10B981' : '#FFF' }}>
              {currentTaps} / {threshold} Taps
            </span>
          </div>

          <div style={{
            height: '8px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: canSpin ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #EC4899, #F472B6)',
              borderRadius: '999px',
              transition: 'width 0.3s ease'
            }} />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#94A3B8',
            marginTop: '8px'
          }}>
            <span>Inventory Spins: <strong style={{ color: '#F472B6' }}>{balances?.spins || 0}</strong></span>
            <span>{canSpin ? '✨ Ready to Spin!' : `${threshold - currentTaps} taps left to unlock`}</span>
          </div>
        </div>

        {/* Interactive Spin Wheel */}
        {canSpin ? (
          <SpinWheel onComplete={loadStatus} />
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '28px 20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFF' }}>
              Threshold Locked ({currentTaps}/{threshold})
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px', lineHeight: 1.5 }}>
              Per Section 14 specifications, Lucky Tap requires an established threshold of 300 accepted taps before becoming eligible for spins.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LuckyTapModal;
