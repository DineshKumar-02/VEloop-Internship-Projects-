import React from 'react';
import { useTap } from '../context/TapContext';
import { Zap, Shield, PlusCircle, Clock, Database } from 'lucide-react';

const formatSeconds = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const EnergyCard = () => {
  const { tapState, setActiveDrawer } = useTap();

  const energy = tapState?.energy || 0;
  const maxEnergy = tapState?.maxEnergy || 500;
  const rechargeRate = tapState?.rechargeRate || 20;
  const timeUntilRecharge = tapState?.timeUntilRecharge || 0;
  const energyPercent = Math.min(100, Math.max(0, (energy / maxEnergy) * 100));

  const hasShield = tapState?.energyShield?.active;
  const hasBank = tapState?.energyBank?.active;

  return (
    <div className="fintech-card" style={{
      margin: '8px 16px',
      background: 'linear-gradient(135deg, #1A1F35 0%, #151828 100%)',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      {/* Header Row: Energy label, value, and quick recharge trigger */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: hasShield ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: hasShield ? '#10B981' : '#60A5FA'
          }}>
            {hasShield ? <Shield size={16} /> : <Zap size={16} />}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>
              {hasShield ? 'Energy Protected (90%)' : 'Energy Tank'}
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              +{rechargeRate} every 20m
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: energy < 20 ? '#EF4444' : '#FFF' }}>
            {energy} <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>/ {maxEnergy}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
            <Clock size={11} /> Next: {formatSeconds(timeUntilRecharge)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '10px',
        width: '100%',
        backgroundColor: '#0F121F',
        borderRadius: '999px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          height: '100%',
          width: `${energyPercent}%`,
          background: energy < 20 
            ? 'linear-gradient(90deg, #EF4444, #F87171)'
            : 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 70%, #93C5FD 100%)',
          borderRadius: '999px',
          transition: 'width 0.3s ease, background 0.3s ease',
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)'
        }} />
      </div>

      {/* Auxiliary Badges: Energy Bank and Shield Status */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        {hasBank ? (
          <div 
            onClick={() => setActiveDrawer('bank')}
            style={{
              flex: 1,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '5px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#34D399', fontWeight: 600 }}>
              <Database size={12} /> Bank Reserve
            </div>
            <span style={{ color: '#FFF', fontWeight: 700 }}>
              {tapState.energyBank.current} / {tapState.energyBank.capacity}
            </span>
          </div>
        ) : (
          <button
            onClick={() => setActiveDrawer('bank')}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '5px 8px',
              color: '#94A3B8',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={12} /> Activate Energy Bank
          </button>
        )}

        {hasShield ? (
          <div 
            onClick={() => setActiveDrawer('shield')}
            style={{
              flex: 1,
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '8px',
              padding: '5px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            <span style={{ color: '#60A5FA', fontWeight: 700 }}>🛡️ Shield Active</span>
            <span style={{ color: '#93C5FD', fontWeight: 600 }}>90% Free</span>
          </div>
        ) : (
          <button
            onClick={() => setActiveDrawer('shield')}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '5px 8px',
              color: '#94A3B8',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <Shield size={12} /> 30s Energy Shield
          </button>
        )}
      </div>
    </div>
  );
};

export default EnergyCard;
