import React from 'react';
import { useTap } from '../context/TapContext';
import { TrendingUp, Award, Zap, ChevronRight } from 'lucide-react';

const TapMultiplierCard = () => {
  const { tapState, setActiveDrawer } = useTap();

  const multitap = tapState?.multitap || { multiplier: 1, tier: 'x1.0' };
  const efficiency = tapState?.efficiency || { multiplier: 1.0, tier: 'x1.0' };
  const boost = tapState?.boost;

  return (
    <div style={{
      margin: '8px 16px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px'
    }}>
      {/* Multitap Status Tile */}
      <div 
        onClick={() => setActiveDrawer('upgrades')}
        className="fintech-card"
        style={{
          padding: '12px 14px',
          background: 'linear-gradient(135deg, #1C2237 0%, #171A29 100%)',
          cursor: 'pointer',
          border: multitap.multiplier > 1 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
            <TrendingUp size={13} color="#F59E0B" /> Multitap
          </div>
          <ChevronRight size={13} color="#64748B" />
        </div>
        <div style={{ marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>
            {multitap.multiplier}x
          </span>
          <span style={{ fontSize: '11px', color: '#FBBF24', fontWeight: 700 }}>
            {multitap.tier}
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
          {multitap.multiplier > 1 ? 'Active (7 Days)' : 'Tap to Upgrade'}
        </div>
      </div>

      {/* Tap Efficiency Status Tile */}
      <div 
        onClick={() => setActiveDrawer('upgrades')}
        className="fintech-card"
        style={{
          padding: '12px 14px',
          background: 'linear-gradient(135deg, #1A2338 0%, #151B2C 100%)',
          cursor: 'pointer',
          border: efficiency.multiplier > 1.0 ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
            <Award size={13} color="#60A5FA" /> Tap Efficiency
          </div>
          <ChevronRight size={13} color="#64748B" />
        </div>
        <div style={{ marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>
            {efficiency.multiplier.toFixed(1)}x
          </span>
          <span style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 700 }}>
            {efficiency.tier}
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
          {efficiency.multiplier > 1.0 ? 'Season Boosted' : 'Tap to Upgrade'}
        </div>
      </div>
    </div>
  );
};

export default TapMultiplierCard;
