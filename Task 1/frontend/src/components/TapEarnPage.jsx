import React from 'react';
import TapHeader from './TapHeader';
import BalanceCard from './BalanceCard';
import EnergyCard from './EnergyCard';
import TapMultiplierCard from './TapMultiplierCard';
import BoostCard from './BoostCard';
import TapCircle from './TapCircle';
import TapRewardFloat from './TapRewardFloat';
import TapShortcuts from './TapShortcuts';
import UpgradeDrawer from './UpgradeDrawer';
import EnergyBankModal from './EnergyBankModal';
import EnergyShieldModal from './EnergyShieldModal';
import MissionPanel from './MissionPanel';
import DailyChallengeCard from './DailyChallengeCard';
import LuckyTapModal from './LuckyTapModal';
import RewardHistoryDrawer from './RewardHistoryDrawer';
import DemoAdModal from './DemoAdModal';
import AdminDashboard from './AdminDashboard';
import WalletDrawer from './WalletDrawer';

const TapEarnPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100%' }}>
      {/* 1. Header Profile & Multi-Currency Chips */}
      <TapHeader />

      {/* 2. Hero Balance Card & Quick Wallet */}
      <BalanceCard />

      {/* 3. Live Energy Tank & Timestamps Countdown */}
      <EnergyCard />

      {/* 4. Active Multitap & Efficiency States */}
      <TapMultiplierCard />

      {/* 5. 30s Boost Window */}
      <BoostCard />

      {/* 6. Central VE Tap Circle (Hero Interaction) */}
      <TapCircle />

      {/* 7. Floating Rewards Animation Layer */}
      <TapRewardFloat />

      {/* 8. Feature Shortcuts Hub */}
      <TapShortcuts />

      {/* Modals & Drawers */}
      <UpgradeDrawer />
      <EnergyBankModal />
      <EnergyShieldModal />
      <MissionPanel />
      <DailyChallengeCard />
      <LuckyTapModal />
      <RewardHistoryDrawer />
      <DemoAdModal />
      <AdminDashboard />
      <WalletDrawer />
    </div>
  );
};

export default TapEarnPage;
