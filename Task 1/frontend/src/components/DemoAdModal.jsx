import React, { useState, useEffect } from 'react';
import { useTap } from '../context/TapContext';
import tapApi from '../api/tapApi';
import { Film, Zap, X, ShieldAlert, Award } from 'lucide-react';

const DemoAdModal = () => {
  const { pendingAd, setPendingAd, refreshState, triggerHaptic } = useTap();
  const [adState, setAdState] = useState('ready'); // 'ready' | 'playing' | 'completed'
  const [countdown, setCountdown] = useState(5);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (pendingAd) {
      // Record 'opportunity' and 'shown' events
      tapApi.trackEvent({
        placement: pendingAd.placement || 'video',
        eventType: 'shown',
        optionalRewardReference: pendingAd.adId
      });
      setAdState('ready');
      setCountdown(5);
    }
  }, [pendingAd]);

  if (!pendingAd) return null;

  const startAd = () => {
    setAdState('playing');
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdState('completed');
          // Track completed event
          tapApi.trackEvent({
            placement: pendingAd.placement || 'video',
            eventType: 'completed',
            optionalRewardReference: pendingAd.adId
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleClaimReward = async (benefitType) => {
    if (claiming) return;
    try {
      setClaiming(true);
      triggerHaptic('heavy');
      const res = await tapApi.claimAdReward(benefitType);
      if (res.success) {
        await refreshState();
        setPendingAd(null);
      }
    } catch (err) {
      alert(err.message || 'Reward claim failed');
    } finally {
      setClaiming(false);
    }
  };

  const handleSkip = () => {
    tapApi.trackEvent({
      placement: pendingAd.placement || 'video',
      eventType: 'skipped',
      optionalRewardReference: pendingAd.adId
    });
    setPendingAd(null);
  };

  return (
    <div className="drawer-backdrop" style={{ zIndex: 120 }}>
      <div style={{
        background: '#161827',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '420px',
        width: '90%',
        margin: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        position: 'relative'
      }}>
        {/* Demo Tag per Section 42 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px'
        }}>
          <span style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #EF4444',
            color: '#F87171',
            fontSize: '10px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            [DEMO AD SYSTEM • NON-PRODUCTION]
          </span>

          <button
            onClick={handleSkip}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={14} />
          </button>
        </div>

        {adState === 'ready' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              color: '#FFF'
            }}>
              <Film size={28} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>
              Rewarded Sponsor Opportunity
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: '8px 0 20px', lineHeight: 1.5 }}>
              Triggered randomly within the 15–40 tap window. Watch a quick 5-second simulated ad to receive instant energy or a 30s boost!
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSkip}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Skip
              </button>
              <button
                onClick={startAd}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                Watch Demo (5s)
              </button>
            </div>
          </div>
        )}

        {adState === 'playing' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              background: '#0B0D17',
              borderRadius: '12px',
              padding: '30px 20px',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#60A5FA' }}>
                {countdown}s
              </div>
              <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px' }}>
                Simulating Partner Video Placement...
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Server verifies completion before authorizing reward.
            </div>
          </div>
        )}

        {adState === 'completed' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: '#10B981'
            }}>
              <Award size={26} />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FFF' }}>
              Ad Completed! Choose Your Reward:
            </h3>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '18px' }}>
              Select which verified economic benefit you want to claim.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handleClaimReward('energy')}
                disabled={claiming}
                className="btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                <Zap size={16} /> Claim +50 Energy Refill
              </button>
              <button
                onClick={() => handleClaimReward('boost')}
                disabled={claiming}
                className="btn-secondary"
                style={{ width: '100%', padding: '12px', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#FBBF24' }}
              >
                Claim 30s Velocity Boost (2x)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoAdModal;
