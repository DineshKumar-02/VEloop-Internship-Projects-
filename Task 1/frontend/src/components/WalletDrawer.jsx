import React, { useState } from 'react';
import { useTap } from '../context/TapContext';
import { X, Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

const WalletDrawer = () => {
  const { activeDrawer, setActiveDrawer, balances } = useTap();
  const [payoutMethod, setPayoutMethod] = useState('paytm');
  const [payoutRequested, setPayoutRequested] = useState(false);

  if (activeDrawer !== 'wallet') return null;

  const handleRequestPayout = () => {
    setPayoutRequested(true);
    setTimeout(() => {
      setPayoutRequested(false);
      alert('Payout request submitted to VELoop Rewards Finance Gateway!');
      setActiveDrawer(null);
    }, 1500);
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
              <Wallet size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>VELoop Fintech Wallet</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>Verified balances and instant payout channels</p>
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

        {/* Currency Asset Breakdown */}
        <div style={{
          background: 'linear-gradient(135deg, #1E253E 0%, #151828 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Primary Portfolio Value
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#FFF', marginTop: '2px' }}>
            {(balances.ve || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{' '}
            <span style={{ fontSize: '16px', color: '#F59E0B' }}>VE</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '12px'
          }}>
            <div>SVE Balance: <strong style={{ color: '#FBBF24' }}>{(balances.sve || 0).toLocaleString()}</strong></div>
            <div>Tokens: <strong style={{ color: '#60A5FA' }}>{(balances.tokens || 0).toLocaleString()}</strong></div>
            <div>Rare Gems: <strong style={{ color: '#EC4899' }}>{(balances.gems || 0).toFixed(1)}</strong></div>
            <div>VE Fragments: <strong style={{ color: '#A78BFA' }}>{balances.fragments || 0}</strong></div>
          </div>
        </div>

        {/* Payout Options (Paytm, PayPal, Crypto) */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF', marginBottom: '8px' }}>
            Select Instant Withdrawal Channel:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'paytm', label: 'Paytm', icon: '🇮🇳' },
              { id: 'paypal', label: 'PayPal', icon: '🌐' },
              { id: 'crypto', label: 'Crypto (USDT)', icon: '⚡' }
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPayoutMethod(method.id)}
                style={{
                  background: payoutMethod === method.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: payoutMethod === method.id ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: payoutMethod === method.id ? '#FFF' : '#94A3B8',
                  borderRadius: '10px',
                  padding: '10px 6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '18px' }}>{method.icon}</span>
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleRequestPayout}
          disabled={payoutRequested || (balances.ve || 0) < 50}
          className="btn-primary"
          style={{ width: '100%', padding: '14px' }}
        >
          {payoutRequested ? 'Processing Gateway Transfer...' : `Withdraw via ${payoutMethod.toUpperCase()}`}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '11px',
          color: '#64748B',
          marginTop: '10px'
        }}>
          <ShieldCheck size={14} color="#10B981" /> 256-Bit Encrypted Instant Payout Settlement
        </div>
      </div>
    </div>
  );
};

export default WalletDrawer;
