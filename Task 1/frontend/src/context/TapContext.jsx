import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import tapApi, { generateRequestId } from '../api/tapApi';

const TapContext = createContext();

export const TapProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [user, setUser] = useState(null);
  const [balances, setBalances] = useState({
    ve: 0,
    sve: 0,
    tokens: 0,
    gems: 0,
    spins: 0,
    fragments: 0
  });

  const [tapState, setTapState] = useState({
    energy: 500,
    maxEnergy: 500,
    rechargeRate: 20,
    timeUntilRecharge: 0,
    multitap: { multiplier: 1, tier: 'x1.0', active: true },
    efficiency: { multiplier: 1.0, tier: 'x1.0', active: true },
    streak: 0,
    combo: 0,
    totalPhysicalTaps: 0,
    totalEffectiveTaps: 0,
    luckyWindowTaps: 0,
    energyBank: null,
    energyShield: null,
    boost: null
  });

  const [economyConfig, setEconomyConfig] = useState(null);
  const [floatingRewards, setFloatingRewards] = useState([]);
  const [combo, setCombo] = useState(0);
  const [streak, setStreak] = useState(0);

  // Active Modals / Drawers
  const [activeDrawer, setActiveDrawer] = useState(null); // 'upgrades' | 'bank' | 'shield' | 'missions' | 'lucky' | 'history' | 'admin' | 'wallet'
  const [activeTab, setActiveTab] = useState('tap'); // 'home' | 'tap' | 'mine' | 'wallet' | 'league' | 'admin'

  // Pending Demo Ad Opportunity
  const [pendingAd, setPendingAd] = useState(null);

  // 200 ms Lockout tracker
  const isLockedRef = useRef(false);
  const lastTapTimeRef = useRef(0);

  // Precision Tap state
  const [precisionTarget, setPrecisionTarget] = useState(null);

  // Recharge Countdown Timer (Runs every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setTapState(prev => {
        if (!prev) return prev;
        const remaining = Math.max(0, (prev.timeUntilRecharge || 0) - 1);
        return { ...prev, timeUntilRecharge: remaining };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial full state from backend
  const refreshState = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tapApi.getState();
      if (data.success) {
        setUser(data.user);
        setBalances(data.balances);
        setTapState(data.tapState);
        setCombo(data.tapState.combo || 0);
        setStreak(data.tapState.streak || 0);
        setEconomyConfig(data.economyConfig);
        setError(null);
      }
    } catch (err) {
      console.error('[Failed to load state]:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Haptic feedback helper
  const triggerHaptic = (type = 'tap') => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        if (type === 'tap') navigator.vibrate(12);
        else if (type === 'heavy') navigator.vibrate([20, 30, 20]);
        else if (type === 'bonus') navigator.vibrate([15, 20, 35]);
      } catch (e) {
        // fail silently per spec
      }
    }
  };

  // Process a Tap interaction (Hero Function)
  const handleTap = async (event, isPrecision = false) => {
    const now = Date.now();

    // 1. Enforce 200 ms interaction window locally
    if (now - lastTapTimeRef.current < 200 || isLockedRef.current) {
      return { success: false, reason: 'TOO_FAST' };
    }

    // Check local energy guard
    const totalEnergy = (tapState.energy || 0) + (tapState.energyBank?.active ? tapState.energyBank.current : 0);
    if (totalEnergy <= 0 && (!tapState.energyShield || !tapState.energyShield.active)) {
      return { success: false, reason: 'NO_ENERGY' };
    }

    lastTapTimeRef.current = now;
    isLockedRef.current = true;
    setTimeout(() => {
      isLockedRef.current = false;
    }, 200);

    // Haptic feedback
    triggerHaptic(isPrecision ? 'bonus' : 'tap');

    // Calculate click coordinates for floating reward animation
    let clickX = window.innerWidth / 2;
    let clickY = window.innerHeight / 2 - 40;
    if (event && event.clientX && event.clientY) {
      clickX = event.clientX;
      clickY = event.clientY;
    }

    // Unique requestId per tap
    const requestId = generateRequestId();

    try {
      const res = await tapApi.processTap({
        requestId,
        physicalCount: 1,
        isPrecisionTap: isPrecision
      });

      if (res.success) {
        // Reconcile authoritative state from server
        setBalances(res.balances);
        setTapState(res.tapState);
        setCombo(res.combo);
        setStreak(res.streak);

        // Spawn floating reward
        const floatId = `float_${Date.now()}_${Math.random()}`;
        const newFloat = {
          id: floatId,
          x: clickX + (Math.random() * 40 - 20),
          y: clickY - 20,
          label: res.reward.label,
          color: res.reward.color || '#FBBF24',
          type: res.reward.type,
          bonus: res.reward.mysteryBonus || res.reward.precisionBonus
        };

        setFloatingRewards(prev => [...prev.slice(-12), newFloat]);

        // Auto remove floating reward after 1.2s
        setTimeout(() => {
          setFloatingRewards(prev => prev.filter(f => f.id !== floatId));
        }, 1200);

        // Check if precision target was hit
        if (isPrecision) {
          setPrecisionTarget(null);
        } else {
          // Occasionally roll small precision target
          if (Math.random() < 0.04 && !precisionTarget) {
            setPrecisionTarget({
              x: Math.floor(Math.random() * 60) + 20, // 20% to 80% of coin area
              y: Math.floor(Math.random() * 60) + 20
            });
            // Auto disappear precision target after 3.5 seconds
            setTimeout(() => setPrecisionTarget(null), 3500);
          }
        }

        // Check Demo Ad opportunity
        if (res.adOpportunity && res.adOpportunity.showAd) {
          setPendingAd(res.adOpportunity);
        }

        return { success: true, reward: res.reward };
      }
    } catch (err) {
      console.warn('[Tap Rejected by Server]:', err.message);
      // Re-sync state with server to be authoritative
      refreshState();
      return { success: false, reason: err.message };
    }
  };

  // Value provided to consumers
  const value = {
    loading,
    error,
    user,
    setUser,
    balances,
    setBalances,
    tapState,
    setTapState,
    economyConfig,
    floatingRewards,
    combo,
    streak,
    activeDrawer,
    setActiveDrawer,
    activeTab,
    setActiveTab,
    pendingAd,
    setPendingAd,
    precisionTarget,
    handleTap,
    triggerHaptic,
    refreshState
  };

  return <TapContext.Provider value={value}>{children}</TapContext.Provider>;
};

export const useTap = () => useContext(TapContext);
