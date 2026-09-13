import React, { useState, useEffect } from 'react';
import { useTap } from '../context/TapContext';
import tapApi from '../api/tapApi';
import { Flame, Clock, Zap } from 'lucide-react';

const BoostCard = () => {
  const { tapState, setTapState, refreshState, triggerHaptic } = useTap();
  const [activating, setActivating] = useState(false);
  const [remainingSec, setRemainingSec] = useState(0);

  const boost = tapState?.boost;
  const isBoostActive = boost?.active && new Date(boost.expiresAt).getTime() > Date.now();

  useEffect(() => {
    if (!isBoostActive) {
      setRemainingSec(0);
      return;
    }

    const updateTimer = () => {
      const msLeft = new Date(boost.expiresAt).getTime() - Date.now();
      const sec = Math.max(0, Math.ceil(msLeft / 1000));
      setRemainingSec(sec);
      if (sec === 0) {
        refreshState();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isBoostActive, boost?.expiresAt, refreshState]);

  const handleActivateBoost = async () => {
    if (isBoostActive || activating) return;
    try {
      setActivating(true);
      triggerHaptic('heavy');
      const res = await tapApi.activateBoost();
      if (res.success) {
        setTapState(prev => ({ ...prev, boost: res.boost }));
        setRemainingSec(res.durationSeconds || 30);
      }
    } catch (err) {
      alert(err.message || 'Could not activate boost');
    } finally {
      setActivating(false);
    }
  };

  return (
    <div style={{ margin: '4px 16px 10px' }}>
      {isBoostActive ? (
        <div style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '12px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'pulseGlow 1.5s infinite alternate'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={20} color="#EF4444" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#F87171' }}>
                🔥 2x VELOCITY BOOST ACTIVE!
              </div>
              <div style={{ fontSize: '11px', color: '#FCA5A5' }}>
                Double VE, SVE & Token reward yields
              </div>
            </div>
          </div>
          <div style={{
            background: '#EF4444',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '14px',
            padding: '4px 10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Clock size={13} /> {remainingSec}s
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '12px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="#F59E0B" />
            <span style={{ fontSize: '12px', color: '#CBD5E1', fontWeight: 600 }}>
              Velocity Surge (30s 2x Boost)
            </span>
          </div>
          <button
            onClick={handleActivateBoost}
            disabled={activating}
            style={{
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#111422',
              fontWeight: 800,
              fontSize: '11px',
              padding: '5px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {activating ? 'Igniting...' : 'ACTIVATE'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BoostCard;
