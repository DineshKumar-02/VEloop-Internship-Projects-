import React, { useState, useEffect } from 'react';
import { useTap } from '../context/TapContext';
import tapApi from '../api/tapApi';
import { X, History, ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react';

const RewardHistoryDrawer = () => {
  const { activeDrawer, setActiveDrawer } = useTap();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeDrawer === 'history') {
      loadHistory();
    }
  }, [activeDrawer]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await tapApi.getAdminLedger();
      if (res.success) {
        setHistory(res.ledger);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (activeDrawer !== 'history') return null;

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
              <History size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>Auditable Reward Ledger</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>Authoritative cryptographic log of economic actions</p>
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
            Fetching verified ledger records...
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
            No transaction records found yet. Tap to start recording!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((tx) => {
              const isCredit = tx.type === 'credit';
              const dateStr = new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <div
                  key={tx._id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: isCredit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCredit ? '#10B981' : '#EF4444'
                    }}>
                      {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>
                        {tx.notes || tx.source.replace('_', ' ').toUpperCase()}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>
                        {dateStr} • Ref: {tx.referenceId ? tx.referenceId.slice(0, 14) + '...' : 'System'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: isCredit ? '#10B981' : '#F87171'
                    }}>
                      {isCredit ? '+' : '-'}{tx.amount} {tx.currency?.toUpperCase()}
                    </div>
                    {tx.balanceAfter !== undefined && (
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                        Bal: {tx.balanceAfter}
                      </div>
                    )}
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

export default RewardHistoryDrawer;
