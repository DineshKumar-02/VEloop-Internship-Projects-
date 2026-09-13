import React, { useState, useEffect } from 'react';
import { useTap } from '../context/TapContext';
import tapApi from '../api/tapApi';
import { Trophy, Medal, Clock, ChevronLeft, Award, Sparkles, UserCheck } from 'lucide-react';

const TapLeaguePage = () => {
  const { setActiveTab } = useTap();
  const [leagueData, setLeagueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  useEffect(() => {
    loadLeague();
  }, []);

  const loadLeague = async () => {
    try {
      setLoading(true);
      const res = await tapApi.getLeague();
      if (res.success) {
        setLeagueData(res);
      }
    } catch (err) {
      console.error('[League fetch failed]:', err);
    } finally {
      setLoading(false);
    }
  };

  const season = leagueData?.season;
  const top100 = leagueData?.top100 || [];
  const myRank = leagueData?.myRank;

  // Podium top 3
  const rank1 = top100[0];
  const rank2 = top100[1];
  const rank3 = top100[2];
  const restOfTop100 = top100.slice(3);

  return (
    <div style={{ paddingBottom: '70px', minHeight: '100vh', position: 'relative' }}>
      {/* Top Header Navigation */}
      <div style={{
        padding: '14px 16px',
        background: 'linear-gradient(180deg, #1C2033 0%, rgba(22, 24, 39, 0.95) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('tap')}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: '#FFF',
              display: 'flex',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#FFF' }}>Tap League</h2>
            <div style={{ fontSize: '11px', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{season?.name || 'Season 1: Genesis Tap'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowRewardsModal(!showRewardsModal)}
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '8px',
            padding: '6px 10px',
            color: '#FBBF24',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer'
          }}
        >
          <Award size={14} /> Rewards
        </button>
      </div>

      {/* Rewards Preview Drawer / Banner */}
      {showRewardsModal && (
        <div style={{
          margin: '12px 16px',
          background: 'rgba(30, 34, 53, 0.95)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '14px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FBBF24', marginBottom: '8px' }}>
            Season 1 Payout Table (Distributed at Rollover):
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
            <div>🥇 <strong>#1:</strong> 10k VEs + 5 Spins</div>
            <div>🥈 <strong>#2:</strong> 5k VEs + 3 Spins</div>
            <div>🥉 <strong>#3:</strong> 1.5k VEs + 1 Spin</div>
            <div>🎖️ <strong>#4-10:</strong> 500 VE + 2.5k Tokens</div>
            <div>💎 <strong>#11-25:</strong> 5k SVE + 1k Tokens</div>
            <div>🔮 <strong>#26-50:</strong> 2.5k SVE + 10 Gems</div>
          </div>
        </div>
      )}

      {/* Season Countdown Banner */}
      <div style={{
        margin: '12px 16px 8px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '10px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px'
      }}>
        <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Clock size={14} color="#60A5FA" /> Season Reset In:
        </span>
        <span style={{ color: '#FFF', fontWeight: 700 }}>
          {season ? `${Math.floor(season.timeRemainingSeconds / 86400)} days remaining` : 'Calculating...'}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94A3B8' }}>
          Loading Tap League rankings...
        </div>
      ) : (
        <>
          {/* Top 3 Podium (PDF §23: "Special rank cards/rows for #1, #2, #3 with premium treatment") */}
          <div style={{
            margin: '12px 16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr 1fr',
            gap: '8px',
            alignItems: 'flex-end'
          }}>
            {/* Rank 2 (Silver) */}
            {rank2 && (
              <div style={{
                background: 'linear-gradient(180deg, rgba(148, 163, 184, 0.15) 0%, rgba(22, 24, 39, 0.8) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.4)',
                borderRadius: '12px',
                padding: '12px 8px',
                textAlign: 'center',
                height: '150px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '20px' }}>🥈</div>
                <img src={rank2.avatar} alt="Avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', margin: '4px 0' }} />
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                  {rank2.username}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', marginTop: '2px' }}>
                  {rank2.acceptedTapCount.toLocaleString()}
                </div>
              </div>
            )}

            {/* Rank 1 (Gold Hero Podium) */}
            {rank1 && (
              <div style={{
                background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.25) 0%, rgba(22, 24, 39, 0.9) 100%)',
                border: '2px solid rgba(245, 158, 11, 0.7)',
                borderRadius: '14px',
                padding: '16px 8px',
                textAlign: 'center',
                height: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 0 25px rgba(245, 158, 11, 0.2)'
              }}>
                <div style={{ fontSize: '24px' }}>👑</div>
                <img src={rank1.avatar} alt="Avatar" style={{ width: '46px', height: '46px', borderRadius: '50%', border: '2px solid #F59E0B', margin: '4px 0' }} />
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                  {rank1.username}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#FBBF24', marginTop: '2px' }}>
                  {rank1.acceptedTapCount.toLocaleString()}
                </div>
                <span style={{ fontSize: '9px', color: '#FDE68A', background: 'rgba(245,158,11,0.2)', padding: '1px 5px', borderRadius: '4px', marginTop: '3px' }}>
                  CHAMPION
                </span>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {rank3 && (
              <div style={{
                background: 'linear-gradient(180deg, rgba(217, 119, 6, 0.15) 0%, rgba(22, 24, 39, 0.8) 100%)',
                border: '1px solid rgba(217, 119, 6, 0.4)',
                borderRadius: '12px',
                padding: '12px 8px',
                textAlign: 'center',
                height: '140px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '20px' }}>🥉</div>
                <img src={rank3.avatar} alt="Avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', margin: '4px 0' }} />
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                  {rank3.username}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#F59E0B', marginTop: '2px' }}>
                  {rank3.acceptedTapCount.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Rows 4–100 Compact Leaderboard List (PDF §23) */}
          <div style={{ margin: '8px 16px 80px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {restOfTop100.map((player) => (
              <div
                key={player.rank}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#94A3B8',
                    width: '26px'
                  }}>
                    #{player.rank}
                  </span>
                  <img src={player.avatar} alt="User" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>
                      {player.username}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748B' }}>
                      Lv.{player.level} • {player.rewardPreview || 'In League'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#60A5FA' }}>
                    {player.acceptedTapCount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>taps</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sticky "My Rank" Row at Bottom (PDF §22 & §23) */}
      {myRank && (
        <div style={{
          position: 'fixed',
          bottom: '60px',
          left: 0,
          right: 0,
          maxWidth: '520px',
          margin: '0 auto',
          background: 'linear-gradient(180deg, #242B45 0%, #1A1F35 100%)',
          borderTop: '2px solid #F59E0B',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -8px 25px rgba(0,0,0,0.5)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 45
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: '#F59E0B',
              color: '#111422',
              fontWeight: 900,
              fontSize: '12px',
              padding: '3px 8px',
              borderRadius: '6px'
            }}>
              #{myRank.rank}
            </span>
            <img src={myRank.avatar} alt="You" style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid #F59E0B' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {myRank.username} <UserCheck size={12} color="#10B981" />
              </div>
              <div style={{ fontSize: '11px', color: '#FBBF24' }}>
                {myRank.rewardPreview}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#FFF' }}>
              {myRank.acceptedTapCount.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8' }}>Effective Taps</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TapLeaguePage;
