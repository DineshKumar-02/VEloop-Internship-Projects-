import React, { useState } from 'react';
import { useTap } from '../context/TapContext';
import tapApi from '../api/tapApi';
import { X, BatteryCharging, TrendingUp, Zap, Award, Check } from 'lucide-react';

const UpgradeDrawer = () => {
  const { activeDrawer, setActiveDrawer, tapState, balances, refreshState, triggerHaptic } = useTap();
  const [tab, setTab] = useState('capacity'); // 'capacity' | 'multitap' | 'recharge' | 'efficiency'
  const [purchasing, setPurchasing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (activeDrawer !== 'upgrades') return null;

  const handlePurchase = async (type, tier = null) => {
    if (purchasing) return;
    try {
      setPurchasing(true);
      setFeedback(null);
      triggerHaptic('heavy');

      const res = await tapApi.purchaseUpgrade(type, tier);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Upgrade successfully activated!' });
        await refreshState();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Purchase failed' });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={() => setActiveDrawer(null)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>Upgrades & Enhancers</h3>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>Expand capacities, boost rewards and accelerate recharge</p>
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

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          background: 'rgba(0,0,0,0.25)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '16px'
        }}>
          {[
            { id: 'capacity', label: 'Capacity', icon: <BatteryCharging size={13} /> },
            { id: 'multitap', label: 'Multitap', icon: <TrendingUp size={13} /> },
            { id: 'recharge', label: 'Speed', icon: <Zap size={13} /> },
            { id: 'efficiency', label: 'Efficiency', icon: <Award size={13} /> }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setFeedback(null); }}
              style={{
                background: tab === t.id ? 'var(--bg-surface-elevated)' : 'transparent',
                border: tab === t.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                color: tab === t.id ? '#FFF' : '#94A3B8',
                borderRadius: '8px',
                padding: '8px 4px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Feedback Alert */}
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

        {/* TAB 1: Energy Storage Capacity */}
        {tab === 'capacity' && (
          <div>
            <div style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '12px' }}>
              Current Max Capacity: <strong style={{ color: '#FFF' }}>{tapState?.maxEnergy || 500} Energy</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { cap: 600, cost: 100 },
                { cap: 700, cost: 150 },
                { cap: 800, cost: 210 },
                { cap: 900, cost: 280 },
                { cap: 1000, cost: 360 }
              ].map((tier) => {
                const isCurrent = (tapState?.maxEnergy || 500) >= tier.cap;
                const isNext = (tapState?.maxEnergy || 500) < tier.cap && (!tier.prev || (tapState?.maxEnergy || 500) >= tier.prev);

                return (
                  <div key={tier.cap} style={{
                    background: isCurrent ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.03)',
                    border: isCurrent ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
                        {tier.cap} Max Energy
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                        Permanent storage capacity expansion
                      </div>
                    </div>

                    {isCurrent ? (
                      <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePurchase('capacity')}
                        disabled={purchasing || (balances.ve || 0) < tier.cost}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        {tier.cost} VE
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Multitap (7 Days) */}
        {tab === 'multitap' && (
          <div>
            <div style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '12px' }}>
              Current Multitap: <strong style={{ color: '#FBBF24' }}>{tapState?.multitap?.multiplier || 1}x ({tapState?.multitap?.tier || 'x1.0'})</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { tier: 'x1.1', multiplier: 2, cost: 1000, desc: '1 Physical Tap = 2 Effective Taps (Consumes 2 Energy)' },
                { tier: 'x1.2', multiplier: 3, cost: 1300, desc: '1 Physical Tap = 3 Effective Taps (Consumes 3 Energy)' }
              ].map((item) => (
                <div key={item.tier} style={{
                  background: tapState?.multitap?.tier === item.tier ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: tapState?.multitap?.tier === item.tier ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
                      {item.multiplier}x Multitap ({item.tier})
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                    <div style={{ fontSize: '10px', color: '#FBBF24', marginTop: '3px' }}>
                      Duration: 7 Days
                    </div>
                  </div>

                  {tapState?.multitap?.tier === item.tier ? (
                    <span style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 700 }}>
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePurchase('multitap', item.tier)}
                      disabled={purchasing || (balances.sve || 0) < item.cost}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {item.cost} SVE
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Recharge Speed */}
        {tab === 'recharge' && (
          <div>
            <div style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '12px' }}>
              Current Speed: <strong style={{ color: '#60A5FA' }}>+{tapState?.rechargeRate || 20} Energy / 20 mins</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { rate: 22, cost: 2000, tier: 2 },
                { rate: 24, cost: 3500, tier: 3 },
                { rate: 27, cost: 5000, tier: 4 },
                { rate: 30, cost: 7500, tier: 5 }
              ].map((tier) => {
                const isCurrent = (tapState?.rechargeRate || 20) >= tier.rate;

                return (
                  <div key={tier.rate} style={{
                    background: isCurrent ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.03)',
                    border: isCurrent ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>
                        +{tier.rate} Energy / 20m
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                        Accelerated timestamp regeneration
                      </div>
                    </div>

                    {isCurrent ? (
                      <span style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePurchase('rechargeSpeed')}
                        disabled={purchasing || (balances.tokens || 0) < tier.cost}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        {tier.cost} Tokens
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Tap Efficiency */}
        {tab === 'efficiency' && (
          <div>
            <div style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '12px' }}>
              Current Efficiency: <strong style={{ color: '#A78BFA' }}>{tapState?.efficiency?.toFixed(1) || '1.0'}x</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { tier: 'x1.1', mult: 1.1, cost: 1.1, desc: '+10% reward yield bonus' },
                { tier: 'x1.2', mult: 1.2, cost: 1.2, desc: '+20% reward yield bonus' },
                { tier: 'x1.3', mult: 1.3, cost: 1.5, desc: '+30% reward yield bonus' }
              ].map((item) => (
                <div key={item.tier} style={{
                  background: tapState?.efficiencyTier === item.tier ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: tapState?.efficiencyTier === item.tier ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
                      {item.mult}x Efficiency ({item.tier})
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                    <div style={{ fontSize: '10px', color: '#A78BFA', marginTop: '3px' }}>
                      Valid: Current Season 1
                    </div>
                  </div>

                  {tapState?.efficiencyTier === item.tier ? (
                    <span style={{ fontSize: '12px', color: '#A78BFA', fontWeight: 700 }}>
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePurchase('efficiency', item.tier)}
                      disabled={purchasing || (balances.sve || 0) < item.cost}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {item.cost} SVE
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradeDrawer;
