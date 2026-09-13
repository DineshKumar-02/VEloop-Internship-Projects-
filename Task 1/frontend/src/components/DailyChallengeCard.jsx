import React, { useState, useEffect } from 'react';
import { useTap } from '../context/TapContext';
import tapApi from '../api/tapApi';
import confetti from 'canvas-confetti';
import { X, Calendar, Gift, CheckCircle2, Trophy } from 'lucide-react';

const DailyChallengeCard = () => {
  const { activeDrawer, setActiveDrawer, refreshState, triggerHaptic } = useTap();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (activeDrawer === 'daily') {
      loadChallenge();
    }
  }, [activeDrawer]);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      const res = await tapApi.getDailyChallenge();
      if (res.success) {
        setChallenge(res.challenge);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (activeDrawer !== 'daily') return null;

  const handleClaim = async () => {
    if (claiming) return;
    try {
      setClaiming(true);
      triggerHaptic('heavy');
      const res = await tapApi.claimDailyChallenge();
      if (res.success) {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
        setFeedback({ type: 'success', message: res.message });
        await loadChallenge();
        await refreshState();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Claim failed' });
    } finally {
      setClaiming(false);
    }
  };

  const progress = challenge?.progress || 0;
  const target = challenge?.targetTaps || 250;
  const pct = Math.min(100, Math.floor((progress / target) * 100));

  return (
    <div className="drawer-backdrop" onClick={() => setActiveDrawer(null)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F59E0B'
            }}>
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>{challenge?.title || 'Daily Tap Blitz'}</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>Resets at midnight • Guaranteed token & SVE rewards</p>
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

        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(22, 24, 39, 0.6) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '14px',
          padding: '18px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#E2E8F0', marginBottom: '4px' }}>
            {challenge?.description || 'Reach 250 accepted taps today'}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            margin: '14px 0'
          }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '14px',
              fontWeight: 800,
              color: '#93C5FD'
            }}>
              +{challenge?.rewardTokens || 200} Tokens
            </div>
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '14px',
              fontWeight: 800,
              color: '#FDE68A'
            }}>
              +{challenge?.rewardSVE || 10} SVE
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ textAlign: 'left', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
              <span>Progress</span>
              <span style={{ color: '#FFF', fontWeight: 700 }}>{progress} / {target} Taps ({pct}%)</span>
            </div>
            <div style={{
              height: '10px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: '999px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #F59E0B, #FBBF24)',
                borderRadius: '999px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Claim Button */}
          {challenge?.claimed ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid #10B981',
              color: '#34D399',
              borderRadius: '10px',
              padding: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={16} /> Claimed Today! Check back tomorrow.
            </div>
          ) : challenge?.completed ? (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <Gift size={16} /> {claiming ? 'Claiming...' : 'Claim Daily Challenge Reward'}
            </button>
          ) : (
            <div style={{ fontSize: '12px', color: '#94A3B8', padding: '8px' }}>
              Tap in the arena to complete today’s milestone!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyChallengeCard;
