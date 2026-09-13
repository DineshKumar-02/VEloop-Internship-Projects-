import React, { useState, useEffect } from 'react';
import { useTap } from '../context/TapContext';
import tapApi from '../api/tapApi';
import { X, Database, Clock, Zap, CheckCircle2 } from 'lucide-react';

const EnergyBankModal = () => {
  const { activeDrawer, setActiveDrawer, tapState, balances, refreshState, triggerHaptic } = useTap();
  const [purchasing, setPurchasing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  const bank = tapState?.energyBank;
  const isBankActive = bank?.active && new Date(bank.expiresAt).getTime() > Date.now();

  useEffect(() => {
    if (!isBankActive) {
      setTimeLeft('');
      return;
    }

    const calcTime = () => {
      const ms = new Date(bank.expiresAt).getTime() - Date.now();
      if (ms <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const days = Math.floor(ms / (24 * 60 * 60 * 1000));
      const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
      setTimeLeft(`${days}d ${hours}h ${mins}m`);
    };

    calcTime();
    const interval = setInterval(calcTime, 30000);
    return () => clearInterval(interval);
  }, [isBankActive, bank?.expiresAt]);

  if (activeDrawer !== 'bank') return null;

  const handlePurchaseBank = async () => {
    if (purchasing) return;
    try {
      setPurchasing(true);
      setFeedback(null);
      triggerHaptic('heavy');

      const res = await tapApi.purchaseEnergyBank();
      if (res.success) {
        setFeedback({ type: 'success', message: 'Energy Bank successfully active!' });
        await refreshState();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Purchase failed' });
    } finally {
      setPurchasing(false);
    }
  };

  const purchasesCount = bank?.purchasesCount || 0;
  const nextCost = purchasesCount === 0 ? 100 : 500;
  const canBuyMore = purchasesCount < 2;

  return (
    <div className="drawer-backdrop" onClick={() => setActiveDrawer(null)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981'
            }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>3-Day Energy Bank</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>Dedicated reserve consumed before normal energy</p>
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

        {/* Current Active Status */}
        {isBankActive && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#6EE7B7', fontWeight: 700, textTransform: 'uppercase' }}>
                Bank Reserve Active
              </span>
              <span style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Expires in: {timeLeft}
              </span>
            </div>

            <div style={{ fontSize: '24px', fontWeight: 900, color: '#FFF', marginTop: '6px' }}>
              {bank.current} <span style={{ fontSize: '14px', color: '#6EE7B7' }}>/ {bank.capacity} Energy</span>
            </div>

            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
              ⚡ Recharges +20 Energy every 120 minutes while active.
            </div>
          </div>
        )}

        {/* Purchase Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>
            {purchasesCount === 0 ? 'Purchase 3-Day Energy Bank' : 'Stack Additional +500 Capacity'}
          </div>

          <ul style={{ fontSize: '12px', color: '#CBD5E1', paddingLeft: '18px', marginBottom: '16px', lineHeight: 1.6 }}>
            <li>Provides an independent 500 Energy reserve pool</li>
            <li>Consumed with priority before your normal Energy tank</li>
            <li>Valid for 3 full days (72 hours)</li>
            <li>Second purchase adds another 500 capacity (up to 1,000 total)</li>
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Price</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#F59E0B' }}>
                {nextCost} VE
              </div>
            </div>

            {canBuyMore ? (
              <button
                onClick={handlePurchaseBank}
                disabled={purchasing || (balances.ve || 0) < nextCost}
                className="btn-primary"
              >
                {purchasing ? 'Purchasing...' : `Purchase (${nextCost} VE)`}
              </button>
            ) : (
              <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Max Purchases Reached (2/2)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyBankModal;
