import React, { useState, useEffect } from 'react';
import { useTap } from '../context/TapContext';
import tapApi from '../api/tapApi';
import { X, Shield, Clock, AlertTriangle } from 'lucide-react';

const EnergyShieldModal = () => {
  const { activeDrawer, setActiveDrawer, tapState, balances, refreshState, triggerHaptic } = useTap();
  const [purchasing, setPurchasing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [shieldSecLeft, setShieldSecLeft] = useState(0);

  const shield = tapState?.energyShield;
  const isShieldActive = shield?.active && new Date(shield.expiresAt).getTime() > Date.now();
  const isOnCooldown = shield?.cooldownUntil && new Date(shield.cooldownUntil).getTime() > Date.now();

  useEffect(() => {
    if (!isShieldActive) {
      setShieldSecLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const ms = new Date(shield.expiresAt).getTime() - Date.now();
      const s = Math.max(0, Math.ceil(ms / 1000));
      setShieldSecLeft(s);
      if (s === 0) refreshState();
    }, 1000);

    return () => clearInterval(interval);
  }, [isShieldActive, shield?.expiresAt, refreshState]);

  if (activeDrawer !== 'shield') return null;

  const handleActivateShield = async () => {
    if (purchasing || isShieldActive || isOnCooldown) return;
    try {
      setPurchasing(true);
      setFeedback(null);
      triggerHaptic('heavy');

      const res = await tapApi.purchaseShield();
      if (res.success) {
        setFeedback({ type: 'success', message: '30-second Energy Shield activated!' });
        await refreshState();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Activation failed' });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={() => setActiveDrawer(null)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60A5FA'
            }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>30s Energy Shield</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>90% tap energy immunity for 30 seconds</p>
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

        {feedback && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '8px',
            marginBottom: '14px',
            fontSize: '12px',
            fontWeight: 600,
            background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: feedback.type === 'success' ? '1px solid #10B981' : '1px solid #EF4444',
            color: feedback.type === 'success' ? '#34D399' : '#F87171'
          }}>
            {feedback.message}
          </div>
        )}

        {isShieldActive ? (
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            marginBottom: '14px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase' }}>
              🛡️ Shield Currently Active!
            </div>
            <div style={{ fontSize: '36px', fontWeight: 900, color: '#FFF', margin: '6px 0' }}>
              {shieldSecLeft}s
            </div>
            <div style={{ fontSize: '12px', color: '#93C5FD' }}>
              90% of accepted taps consume 0 energy right now. Tap rapidly!
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '14px'
          }}>
            <ul style={{ fontSize: '12px', color: '#CBD5E1', paddingLeft: '18px', marginBottom: '16px', lineHeight: 1.6 }}>
              <li>Protects 90% of taps from consuming any energy for 30s</li>
              <li>Remaining 10% consume normal energy</li>
              <li>Server-authoritative protection calculation</li>
              <li>5-minute cooldown period between activations</li>
            </ul>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Cost</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#F59E0B' }}>
                  100 VE
                </div>
              </div>

              {isOnCooldown ? (
                <span style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> On 5-min Cooldown
                </span>
              ) : (
                <button
                  onClick={handleActivateShield}
                  disabled={purchasing || (balances.ve || 0) < 100}
                  className="btn-primary"
                >
                  {purchasing ? 'Activating...' : 'Activate Shield (100 VE)'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnergyShieldModal;
