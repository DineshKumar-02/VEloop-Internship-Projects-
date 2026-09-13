import React, { useState, useEffect } from 'react';
import { useTap } from '../context/TapContext';
import tapApi from '../api/tapApi';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, Gift, Clock, Sparkles } from 'lucide-react';

const MissionPanel = () => {
  const { activeDrawer, setActiveDrawer, refreshState, triggerHaptic } = useTap();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (activeDrawer === 'missions') {
      loadMissions();
    }
  }, [activeDrawer]);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const res = await tapApi.getMissions();
      if (res.success) {
        setMissions(res.missions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (activeDrawer !== 'missions') return null;

  const handleClaim = async (missionId) => {
    if (claimingId) return;
    try {
      setClaimingId(missionId);
      triggerHaptic('heavy');
      const res = await tapApi.claimMission(missionId);
      if (res.success) {
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
        setFeedback({ type: 'success', message: res.message });
        await loadMissions();
        await refreshState();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Claim failed' });
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={() => setActiveDrawer(null)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>Tap Missions & Bounties</h3>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>Complete challenges to earn bonus Tokens & SVE</p>
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>Loading missions...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {missions.map((m) => {
              const pct = Math.min(100, Math.floor((m.progress / m.target) * 100));

              return (
                <div key={m.missionId} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: m.completed && !m.claimed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: m.type === 'daily' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                          color: m.type === 'daily' ? '#60A5FA' : '#A78BFA'
                        }}>
                          {m.type}
                        </span>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
                          {m.title}
                        </h4>
                      </div>
                      <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px' }}>
                        {m.description}
                      </p>
                    </div>

                    <div style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      color: '#FBBF24',
                      fontWeight: 800,
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}>
                      +{m.reward} {m.rewardType.toUpperCase()}
                    </div>
                  </div>

                  {/* Progress Bar & Claim Action */}
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
                      <span>Progress: {m.progress} / {m.target}</span>
                      <span>{pct}%</span>
                    </div>

                    <div style={{
                      height: '6px',
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: m.completed ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #3B82F6, #60A5FA)',
                        borderRadius: '999px'
                      }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {m.claimed ? (
                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> Claimed
                        </span>
                      ) : m.completed ? (
                        <button
                          onClick={() => handleClaim(m.missionId)}
                          disabled={claimingId === m.missionId}
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '12px' }}
                        >
                          <Gift size={13} /> {claimingId === m.missionId ? 'Claiming...' : 'Claim Reward'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>In Progress</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionPanel;
