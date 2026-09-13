import React, { useState, useEffect } from 'react';
import { useTap } from '../context/TapContext';
import tapApi from '../api/tapApi';
import { 
  X, 
  Settings, 
  BarChart3, 
  ShieldAlert, 
  Sliders, 
  Save, 
  RefreshCw, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const { activeDrawer, setActiveDrawer, refreshState } = useTap();
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'economy' | 'antibot' | 'audits' | 'season'
  const [analytics, setAnalytics] = useState(null);
  const [config, setConfig] = useState(null);
  const [botLogs, setBotLogs] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Form edit states for economy tuning
  const [sveProb, setSveProb] = useState(0.60);
  const [veProb, setVeProb] = useState(0.20);
  const [tokensProb, setTokensProb] = useState(0.13);
  const [gemsProb, setGemsProb] = useState(0.05);
  const [spinProb, setSpinProb] = useState(0.02);

  const [minAdTap, setMinAdTap] = useState(15);
  const [maxAdTap, setMaxAdTap] = useState(40);
  const [editReason, setEditReason] = useState('Admin manual tuning');

  useEffect(() => {
    if (activeDrawer === 'admin') {
      loadAllData();
    }
  }, [activeDrawer]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, configRes, botRes] = await Promise.all([
        tapApi.getAdminAnalytics(),
        tapApi.getAdminConfig(),
        tapApi.getAdminBotLogs()
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes);
      if (configRes.success) {
        setConfig(configRes.config);
        const probs = configRes.config.rewards?.probabilities;
        if (probs) {
          setSveProb(probs.sve);
          setVeProb(probs.ve);
          setTokensProb(probs.tokens);
          setGemsProb(probs.gems);
          setSpinProb(probs.spin);
        }
        if (configRes.config.ads) {
          setMinAdTap(configRes.config.ads.minAdTapThreshold);
          setMaxAdTap(configRes.config.ads.maxAdTapThreshold);
        }
      }
      if (botRes.success) setBotLogs(botRes.violations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (activeDrawer !== 'admin') return null;

  const handleSaveProbabilities = async () => {
    const sum = sveProb + veProb + tokensProb + gemsProb + spinProb;
    if (Math.abs(sum - 1.0) > 0.001) {
      alert(`Probabilities must total exactly 100%! Current sum: ${(sum * 100).toFixed(1)}%`);
      return;
    }

    try {
      setLoading(true);
      await tapApi.updateAdminConfig('rewards.probabilities', {
        sve: sveProb,
        ve: veProb,
        tokens: tokensProb,
        gems: gemsProb,
        spin: spinProb
      }, editReason);

      setStatusMsg('Probabilities successfully updated & audited!');
      await refreshState();
      await loadAllData();
    } catch (err) {
      alert(err.message || 'Config update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAds = async () => {
    try {
      setLoading(true);
      await tapApi.updateAdminConfig('ads.minAdTapThreshold', parseInt(minAdTap), editReason);
      await tapApi.updateAdminConfig('ads.maxAdTapThreshold', parseInt(maxAdTap), editReason);

      setStatusMsg('Ad thresholds successfully updated!');
      await loadAllData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRolloverSeason = async () => {
    if (!window.confirm('Trigger Season Rollover? This will freeze current scores, distribute rewards to Top 100, reset efficiency, and start the next season.')) {
      return;
    }

    try {
      setLoading(true);
      const res = await tapApi.rolloverSeason();
      if (res.success) {
        alert(`Rollover Complete! Distributed rewards to ${res.distributedWinnersCount} players. New Season: ${res.newSeason}`);
        await refreshState();
        await loadAllData();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={() => setActiveDrawer(null)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '92vh' }}>
        {/* Header */}
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
              <Settings size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>Admin Control Center</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>Real-time economy governance & audit system</p>
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

        {/* Tab Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          background: 'rgba(0,0,0,0.3)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '16px'
        }}>
          {[
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={13} /> },
            { id: 'economy', label: 'Economy', icon: <Sliders size={13} /> },
            { id: 'antibot', label: 'Anti-Bot', icon: <ShieldAlert size={13} /> },
            { id: 'season', label: 'Season', icon: <RotateCcw size={13} /> }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setStatusMsg(null); }}
              style={{
                background: activeTab === t.id ? 'var(--bg-surface-elevated)' : 'transparent',
                border: activeTab === t.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                color: activeTab === t.id ? '#FFF' : '#94A3B8',
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

        {statusMsg && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '8px',
            marginBottom: '14px',
            fontSize: '12px',
            fontWeight: 600,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10B981',
            color: '#34D399',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle2 size={14} /> {statusMsg}
          </div>
        )}

        {/* TAB 1: Analytics Dashboard (PDF §43) */}
        {activeTab === 'analytics' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Total Accepted Taps</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#60A5FA' }}>
                  {(analytics?.summary?.totalAcceptedTaps || 0).toLocaleString()}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Total Effective Taps</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#FBBF24' }}>
                  {(analytics?.summary?.totalEffectiveTaps || 0).toLocaleString()}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Active Tappers</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#10B981' }}>
                  {analytics?.summary?.activeTappers || 0}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Energy Consumed</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#EC4899' }}>
                  {(analytics?.summary?.totalEnergyConsumed || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Currency Issuance Breakdown */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '14px'
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>
                Total Currency Issuance (Audited Credits):
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                <div>VE: <strong style={{ color: '#F59E0B' }}>{analytics?.currencyIssuance?.ve || 0}</strong></div>
                <div>SVE: <strong style={{ color: '#FBBF24' }}>{analytics?.currencyIssuance?.sve || 0}</strong></div>
                <div>Tokens: <strong style={{ color: '#60A5FA' }}>{analytics?.currencyIssuance?.tokens || 0}</strong></div>
                <div>Gems: <strong style={{ color: '#EC4899' }}>{analytics?.currencyIssuance?.gems || 0}</strong></div>
                <div>Spins: <strong style={{ color: '#8B5CF6' }}>{analytics?.currencyIssuance?.spins || 0}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Live Economy Config Editor (PDF §41.1 & §43) */}
        {activeTab === 'economy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FBBF24', marginBottom: '10px' }}>
                Tap Reward Probability Distribution (Total Must Equal 100%):
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', color: '#FFF' }}>SVE (60%):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sveProb}
                    onChange={(e) => setSveProb(parseFloat(e.target.value) || 0)}
                    style={{ background: '#0F121F', border: '1px solid #282E47', color: '#FFF', padding: '4px 8px', borderRadius: '6px', width: '80px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', color: '#FFF' }}>VE (20%):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={veProb}
                    onChange={(e) => setVeProb(parseFloat(e.target.value) || 0)}
                    style={{ background: '#0F121F', border: '1px solid #282E47', color: '#FFF', padding: '4px 8px', borderRadius: '6px', width: '80px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', color: '#FFF' }}>Tokens (13%):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tokensProb}
                    onChange={(e) => setTokensProb(parseFloat(e.target.value) || 0)}
                    style={{ background: '#0F121F', border: '1px solid #282E47', color: '#FFF', padding: '4px 8px', borderRadius: '6px', width: '80px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', color: '#FFF' }}>Gems (5%):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={gemsProb}
                    onChange={(e) => setGemsProb(parseFloat(e.target.value) || 0)}
                    style={{ background: '#0F121F', border: '1px solid #282E47', color: '#FFF', padding: '4px 8px', borderRadius: '6px', width: '80px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', color: '#FFF' }}>Spin (2%):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={spinProb}
                    onChange={(e) => setSpinProb(parseFloat(e.target.value) || 0)}
                    style={{ background: '#0F121F', border: '1px solid #282E47', color: '#FFF', padding: '4px 8px', borderRadius: '6px', width: '80px' }}
                  />
                </div>

                <div style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#94A3B8' }}>Audit Reason:</label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    style={{ width: '100%', background: '#0F121F', border: '1px solid #282E47', color: '#FFF', padding: '6px 8px', borderRadius: '6px', marginTop: '3px' }}
                  />
                </div>

                <button
                  onClick={handleSaveProbabilities}
                  disabled={loading}
                  className="btn-primary"
                  style={{ marginTop: '10px' }}
                >
                  <Save size={14} /> Save & Propagate Probabilities
                </button>
              </div>
            </div>

            {/* Ad Frequency Range */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#60A5FA', marginBottom: '8px' }}>
                Ad Opportunity Tap Threshold Range (PDF §42):
              </h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8' }}>Min Taps (15):</label>
                  <input
                    type="number"
                    value={minAdTap}
                    onChange={(e) => setMinAdTap(e.target.value)}
                    style={{ background: '#0F121F', border: '1px solid #282E47', color: '#FFF', padding: '4px 8px', borderRadius: '6px', width: '70px', display: 'block' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8' }}>Max Taps (40):</label>
                  <input
                    type="number"
                    value={maxAdTap}
                    onChange={(e) => setMaxAdTap(e.target.value)}
                    style={{ background: '#0F121F', border: '1px solid #282E47', color: '#FFF', padding: '4px 8px', borderRadius: '6px', width: '70px', display: 'block' }}
                  />
                </div>
                <button
                  onClick={handleSaveAds}
                  className="btn-secondary"
                  style={{ alignSelf: 'flex-end', padding: '6px 12px' }}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Anti-Bot Logs (PDF §31 & §43) */}
        {activeTab === 'antibot' && (
          <div>
            <div style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '10px' }}>
              Real-time Server Anti-Bot & Replay Defense Log:
            </div>

            {botLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                No violations detected. All tap transactions verified legitimate.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {botLogs.map((log, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '11px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#F87171', fontWeight: 700 }}>
                      <span>{log.type}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ color: '#CBD5E1', marginTop: '2px' }}>
                      {log.details}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Season Management (PDF §41.13 & §43) */}
        {activeTab === 'season' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginBottom: '6px' }}>
              Season Rollover Engine (PDF §41.13)
            </h4>
            <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5, marginBottom: '16px' }}>
              Executing rollover triggers the production lifecycle sequence:
              <br />1. Freezes active scoring
              <br />2. Calculates final rankings & tie-breakers
              <br />3. Distributes prizes to Top 100 via RewardLedger
              <br />4. Archives current season & provisions next season
              <br />5. Resets temporary Tap Efficiency multipliers
            </p>

            <button
              onClick={handleRolloverSeason}
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #EF4444, #DC2626)'
              }}
            >
              Trigger Season Rollover & Award Top 100
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
