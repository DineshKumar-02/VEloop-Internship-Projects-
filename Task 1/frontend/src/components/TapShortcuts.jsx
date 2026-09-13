import React from 'react';
import { useTap } from '../context/TapContext';
import { 
  Calendar, 
  CheckCircle2, 
  Disc3, 
  ArrowUpCircle, 
  Trophy, 
  History, 
  ShieldCheck,
  Zap
} from 'lucide-react';

const TapShortcuts = () => {
  const { setActiveDrawer, setActiveTab, tapState, balances } = useTap();

  const isLuckyReady = (tapState?.luckyWindowTaps || 0) >= 300 || (balances?.spins > 0);

  const shortcuts = [
    {
      id: 'daily',
      label: 'Daily Blitz',
      subtext: 'Today’s Quest',
      icon: <Calendar size={18} color="#F59E0B" />,
      action: () => setActiveDrawer('daily'),
      badge: 'ACTIVE'
    },
    {
      id: 'missions',
      label: 'Missions',
      subtext: 'Daily & Season',
      icon: <CheckCircle2 size={18} color="#10B981" />,
      action: () => setActiveDrawer('missions'),
      badge: null
    },
    {
      id: 'lucky',
      label: 'Lucky Spin',
      subtext: `${tapState?.luckyWindowTaps || 0}/300 Taps`,
      icon: <Disc3 size={18} color="#EC4899" />,
      action: () => setActiveDrawer('lucky'),
      badge: isLuckyReady ? 'SPIN!' : null,
      highlight: isLuckyReady
    },
    {
      id: 'upgrades',
      label: 'Upgrades',
      subtext: 'Multi & Speed',
      icon: <ArrowUpCircle size={18} color="#3B82F6" />,
      action: () => setActiveDrawer('upgrades'),
      badge: null
    },
    {
      id: 'league',
      label: 'Tap League',
      subtext: 'Top 100 Arena',
      icon: <Trophy size={18} color="#FBBF24" />,
      action: () => setActiveTab('league'),
      badge: 'Top 100'
    },
    {
      id: 'history',
      label: 'History',
      subtext: 'Reward Ledger',
      icon: <History size={18} color="#94A3B8" />,
      action: () => setActiveDrawer('history'),
      badge: null
    }
  ];

  return (
    <div style={{ margin: '8px 16px 14px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Quick Hub & Boosters
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px'
      }}>
        {shortcuts.map((s) => (
          <div
            key={s.id}
            onClick={s.action}
            style={{
              background: s.highlight 
                ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.15))' 
                : 'var(--bg-surface)',
              border: s.highlight 
                ? '1px solid rgba(236, 72, 153, 0.4)' 
                : '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '12px 10px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform 0.12s ease, border-color 0.12s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            {s.badge && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                background: s.highlight ? '#EC4899' : '#F59E0B',
                color: '#111422',
                fontSize: '9px',
                fontWeight: 800,
                padding: '2px 5px',
                borderRadius: '6px'
              }}>
                {s.badge}
              </span>
            )}

            <div style={{ marginBottom: '8px' }}>
              {s.icon}
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF', lineHeight: 1.2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
                {s.subtext}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TapShortcuts;
