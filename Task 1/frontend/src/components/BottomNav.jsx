import React from 'react';
import { useTap } from '../context/TapContext';
import { Home, Zap, Pickaxe, Wallet, User } from 'lucide-react';

const BottomNav = () => {
  const { activeTab, setActiveTab, setActiveDrawer } = useTap();

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={20} />, action: () => setActiveTab('tap') },
    { id: 'tap', label: 'Tap & Earn', icon: <Zap size={20} />, action: () => setActiveTab('tap') },
    { id: 'mine', label: 'Mine', icon: <Pickaxe size={20} />, action: () => setActiveDrawer('upgrades') },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={20} />, action: () => setActiveDrawer('wallet') },
    { id: 'profile', label: 'Profile', icon: <User size={20} />, action: () => setActiveDrawer('history') }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      maxWidth: '520px',
      margin: '0 auto',
      background: 'rgba(22, 24, 39, 0.95)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 4px 10px',
      zIndex: 50,
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)'
    }}>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={item.action}
            style={{
              background: 'transparent',
              border: 'none',
              color: isActive ? '#F59E0B' : '#94A3B8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '6px 12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              position: 'relative'
            }}
          >
            {item.icon}
            <span style={{
              fontSize: '11px',
              fontWeight: isActive ? 800 : 500,
              color: isActive ? '#FFF' : '#94A3B8'
            }}>
              {item.label}
            </span>
            {isActive && (
              <span style={{
                position: 'absolute',
                top: 0,
                width: '16px',
                height: '2px',
                background: '#F59E0B',
                borderRadius: '999px',
                boxShadow: '0 0 6px #F59E0B'
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
