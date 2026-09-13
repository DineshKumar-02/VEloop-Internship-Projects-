import React from 'react';
import { TapProvider, useTap } from './context/TapContext';
import TapEarnPage from './components/TapEarnPage';
import TapLeaguePage from './components/TapLeaguePage';
import BottomNav from './components/BottomNav';
import { RefreshCw, AlertCircle } from 'lucide-react';

const AppContent = () => {
  const { loading, error, activeTab, refreshState } = useTap();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#161827',
        color: '#FFF',
        gap: '16px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '4px solid #23283E',
          borderTopColor: '#F59E0B',
          animation: 'spin 0.8s linear infinite'
        }} />
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#FBBF24' }}>
          Connecting to VELoop Rewards Engine...
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#161827',
        color: '#FFF',
        padding: '24px',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Backend Connection Required</h2>
        <p style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '340px', marginBottom: '24px', lineHeight: 1.5 }}>
          Ensure the VELoop MERN backend is running on port 5000. Error details: {error}
        </p>
        <button
          onClick={refreshState}
          className="btn-primary"
          style={{ padding: '12px 24px' }}
        >
          <RefreshCw size={16} /> Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="app-viewport">
      {activeTab === 'league' ? <TapLeaguePage /> : <TapEarnPage />}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <TapProvider>
      <AppContent />
    </TapProvider>
  );
}
