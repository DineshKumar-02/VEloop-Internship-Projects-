# VELoop Rewards — Tap & Earn (Production MERN Full-Stack)

A production-grade, authoritative Tap-to-Earn fintech module for the **VELoop Rewards** platform built strictly according to the **19-Page Internship Specification**.

Designed with VELoop's **`#161827`** fintech design language, tactile micro-animations, server-authoritative reward calculation, timestamp-based energy regeneration, multi-layered anti-bot security, real-time economy governance, and Top 100 Tap League leaderboards.

---

## 🌟 Key Architectural Features

### 1. Authoritative Server Architecture (Zero Trust Client)
- **Zero Client-Side Math**: Clients never dictate reward amounts, energy deductions, or leaderboard positions.
- **Server-Side Reward Rolls**: Configurable weighted probability distribution (60% SVE, 20% VE [0.6–1.7], 2% Spin, 5% Gems, 13% Tokens).
- **Atomic Balance Updates & Audit Ledger**: Every credit, debit, upgrade, and claim writes an immutable record to `RewardLedger`.

### 2. Timestamp-Driven Energy Engine (PDF §5 & §41.4)
- **No Periodic Polling**: Energy regeneration (+20 per 20 minutes) is calculated mathematically from timestamps elapsed since `lastEnergyAt`.
- **3-Day Energy Bank**: 500 reserve capacity (+500 stacked up to 1000) valid for 72 hours, consumed with priority before normal energy.
- **30-Second Energy Shield**: 90% zero-energy tap protection with server-side roll validation and 5-minute cooldown.

### 3. Comprehensive Anti-Bot & Replay Defense (PDF §31)
- **200 ms Minimum Interval Lock**: Enforced server-side via timestamp differentials; clients faster than 200 ms are rejected.
- **Unique Request ID (`requestId`)**: Prevents replay attacks and double-awarded actions.
- **Sliding Window Burst Limiter**: Detects rapid click macro bursts (> 6 taps/second) and logs violations to `antiBotService`.

### 4. Tap League & Season Progression (PDF §22 & §41.13)
- **Top 100 Leaderboard**: Live ranking powered by compound indexes (`acceptedTapCount` desc, `updatedAt` asc).
- **Top 3 Distinct Podium**: Gold, Silver, and Bronze champion treatments.
- **Sticky "My Rank" Bar**: Pinned at the bottom showing user's live position, score, and season payout tier.
- **Season Rollover Engine**: 1-click rollover freezing active scores, awarding Top 100 prizes, archiving season, and resetting seasonal efficiency.

### 5. Admin Control Center & Real-Time Config Governance (PDF §43)
- **Dynamic Config Tuning**: Edit reward probabilities, upgrade curves, and ad windows without code redeployment.
- **Audited Configuration Logs**: All admin changes record admin identity, changed keys, old/new values, and justification in `ConfigAudit`.
- **Real-Time Analytics**: Monitor accepted/rejected taps, active tappers, energy consumption, and total currency issuance.

---

## 📁 Repository Structure

```
Task 1/
├── Tap_Earn_Page_task_Full_Stack.pdf   # 19-Page Specification
├── README.md                           # Documentation & API Spec
├── backend/
│   ├── config/
│   │   ├── db.js                       # MongoDB Mongoose connection
│   │   └── tapEconomy.js               # Single Source of Truth Economy Config
│   ├── controllers/
│   │   ├── tapController.js            # /api/tap, state, history, boost
│   │   ├── upgradeController.js        # Upgrades, Energy Bank, Shield
│   │   ├── missionController.js        # Daily/Season Missions & Daily Challenge
│   │   ├── luckyController.js          # Lucky Spin 300-tap gating & wheel roll
│   │   ├── leagueController.js         # Top 100 leaderboard + My Rank
│   │   ├── seasonController.js         # Season state & rollover engine
│   │   ├── adminController.js          # Live config editor, analytics & bot logs
│   │   ├── adController.js             # Modular demo ad provider & claims
│   │   └── authController.js           # VELoop user session & demo profiles
│   ├── middleware/
│   │   └── auth.js                     # VELoop user identity injection
│   ├── models/                         # 15 Complete Mongoose Schemas
│   │   ├── User.js, TapState.js, TapEvent.js, Upgrade.js, Boost.js,
│   │   ├── Mission.js, UserMission.js, DailyChallenge.js, UserDailyChallenge.js,
│   │   ├── Spin.js, TapSeason.js, TapLeagueScore.js, RewardLedger.js,
│   │   ├── AdEvent.js, ConfigAudit.js
│   │   └── index.js
│   ├── routes/
│   │   ├── tapRoutes.js, adminRoutes.js, authRoutes.js
│   ├── services/
│   │   ├── energyService.js, tapRewardService.js, upgradeService.js,
│   │   ├── leaderboardService.js, rewardLedgerService.js, antiBotService.js,
│   │   └── adService.js
│   ├── scripts/
│   │   └── seed.js                     # Populates Season 1, Top 100 users, missions
│   ├── tests/
│   │   ├── energyAndTap.test.js        # 200ms lock, replay, timestamp regeneration
│   │   └── economyAndLeaderboard.test.js # Probability distributions & rank rewards
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/tapApi.js               # API client with auto requestId generation
    │   ├── context/TapContext.jsx      # Global live state, 200ms lock & haptics
    │   ├── components/
    │   │   ├── TapEarnPage.jsx         # Hero layout orchestrator
    │   │   ├── TapHeader.jsx           # User profile & multi-currency chips
    │   │   ├── BalanceCard.jsx         # Hero balance & VE Fragments
    │   │   ├── EnergyCard.jsx          # Live energy bar & countdown timer
    │   │   ├── TapMultiplierCard.jsx   # Multitap & Tap Efficiency cards
    │   │   ├── BoostCard.jsx           # 30s velocity boost activation
    │   │   ├── TapCircle.jsx           # Central 3D VE coin with ripples & press physics
    │   │   ├── TapRewardFloat.jsx      # Floating reward text animations
    │   │   ├── TapShortcuts.jsx        # Quick access hub
    │   │   ├── UpgradeDrawer.jsx       # Multi-tab upgrade shop
    │   │   ├── EnergyBankModal.jsx     # 3-day reserve purchase modal
    │   │   ├── EnergyShieldModal.jsx   # 30-second shield activation
    │   │   ├── MissionPanel.jsx        # Daily & seasonal missions with confetti
    │   │   ├── DailyChallengeCard.jsx  # Daily tap blitz claim
    │   │   ├── LuckyTapModal.jsx       # 300-tap progression tracker
    │   │   ├── SpinWheel.jsx           # Interactive lucky wheel with server sync
    │   │   ├── TapLeaguePage.jsx       # Top 100 Leaderboard, podium & sticky My Rank
    │   │   ├── RewardHistoryDrawer.jsx # Auditable transaction ledger
    │   │   ├── DemoAdModal.jsx         # Modular demo ad placements & reward verification
    │   │   ├── AdminDashboard.jsx      # Live economy governance & analytics center
    │   │   ├── WalletDrawer.jsx        # Fintech payout gateway (Paytm, PayPal, Crypto)
    │   │   └── BottomNav.jsx           # Platform navigation (Home, Tap & Earn, Mine, Wallet, Profile)
    │   ├── index.css                   # #161827 fintech design system & tokens
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ or v24+
- **MongoDB**: v6+ or v8+ running on `mongodb://127.0.0.1:27017`

### 1. Backend Setup & Seeding

```bash
cd "Task 1/backend"
npm install

# Seed the database with Season 1, Top 100 Leaderboard, Missions, and Demo User:
npm run seed

# Run automated tests:
npm test

# Start backend server:
npm start
# Server listens on http://127.0.0.1:4500
```

### 2. Frontend Setup

```bash
cd "Task 1/frontend"
npm install

# Start Vite dev server:
npm run dev
# Access UI on http://localhost:3000 (or http://localhost:3001)
```

---

## 📡 REST API Surface (PDF §29)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tap/state` | Returns complete current Tap & Earn state, balances, countdowns & economy config |
| `POST` | `/api/tap` | Validates anti-bot, consumes energy, rolls reward, atomically updates balances |
| `GET` | `/api/tap/history` | Returns recent validated tap events for auditability |
| `POST` | `/api/tap/boost/activate` | Activates 30-second 2x Velocity Boost window |
| `POST` | `/api/tap/upgrade` | Purchases capacity, multitap, recharge speed, or seasonal efficiency |
| `POST` | `/api/tap/energy-bank/purchase` | Purchases 3-day Energy Bank reserve (up to 1,000 capacity) |
| `POST` | `/api/tap/shield/purchase` | Purchases 30-second Energy Shield (90% energy immunity) |
| `GET` | `/api/tap/missions` | Returns active daily and seasonal missions with user progress |
| `POST` | `/api/tap/missions/:id/claim` | Atomically claims completed mission reward (single claim guaranteed) |
| `GET` | `/api/tap/daily-challenge` | Returns today's tap blitz challenge progress |
| `POST` | `/api/tap/daily-challenge/claim` | Atomically claims daily challenge rewards |
| `GET` | `/api/tap/lucky` | Returns 300-tap milestone threshold progress & eligibility |
| `POST` | `/api/tap/lucky/spin` | Executes server-authoritative lucky wheel roll |
| `GET` | `/api/tap/league` | Returns Top 100 leaderboard + sticky My Rank row + tie-breakers |
| `GET` | `/api/tap/season` | Returns active season metadata and reset countdown |
| `POST` | `/api/tap/season/rollover` | Executes season rollover, payouts, archiving & next season activation |
| `GET` | `/api/admin/config` | Fetches centralized economy configuration |
| `PUT` | `/api/admin/config` | Modifies configuration keys in real time with audit logging |
| `GET` | `/api/admin/analytics` | Aggregates tap volumes, active tappers, energy, and currency issuance |
| `GET` | `/api/admin/bot-logs` | Retrieves anti-bot rate violations and suspicious activity logs |
| `GET` | `/api/admin/ledger` | Searchable financial transaction ledger |

---

## 🧪 Testing Verification (PDF §39)

Run the backend test suite:
```bash
cd "Task 1/backend"
npm test
```

### Verified Test Suites:
- ✅ **Energy Timestamp-Based Regeneration**: Computes +20 energy every 20 minutes across single and long offline intervals without polling.
- ✅ **Max Energy Cap**: Enforces max capacity ceiling across offline periods.
- ✅ **200 ms Interval Enforcement**: Strictly rejects requests sent faster than 200 ms with `TAP_TOO_FAST`.
- ✅ **Replay Attack Defense**: Rejects duplicate `requestId` submissions immediately.
- ✅ **Temporary Upgrades Expiry**: Validates 30s boost expiry, 7-day multitap expiry, and seasonal efficiency expiry.
- ✅ **Energy Shield Protection**: Validates 90% zero-energy tap protection across simulated samples.
- ✅ **Lucky Tap 300-Tap Gating**: Verifies eligibility lock before reaching 300 accepted taps.
- ✅ **Probability Distributions**: Validates 10,000 rolls matching 60% SVE, 20% VE, 13% Tokens, 5% Gems, 2% Spins.
- ✅ **VE Currency Precision**: Enforces exactly 1 decimal place discrete values between 0.6 and 1.7.
- ✅ **Season Leaderboard Rewards**: Verifies accurate payout mapping for all ranks.

---

## 🎨 Fintech Design System Tokens

- **Base Platform Color**: `#161827`
- **Surface Elevation**: `#1E2235` / `#262B44`
- **Primary Accent**: VE Gold (`#F59E0B` / `#FBBF24`)
- **Interactive Accent**: Electric Blue (`#3B82F6` / `#60A5FA`)
- **Success / Energy**: Emerald (`#10B981` / `#34D399`)
- **Rare Gems & Spins**: Magenta (`#EC4899` / `#8B5CF6`)
- **Typography**: Google Fonts Outfit & Poppins
