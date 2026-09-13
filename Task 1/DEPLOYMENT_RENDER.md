# Step-by-Step Guide: Deploying VELoop Tap & Earn on Render

This guide walks you through deploying both the **Backend Web Service** and **Frontend Static Site** on [Render.com](https://render.com) using your GitHub repository.

---

## Step 1: Set Up Free Cloud MongoDB (MongoDB Atlas)

Because Render is in the cloud, it cannot reach `localhost:27017` on your personal machine. You need a free MongoDB Atlas database:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account (or log in).
2. Click **Create a Deployment** -> Select **M0 (Free)**.
3. Under **Security Quickstart**:
   - Create a Username & Password (e.g. `veloop_admin` and a strong password). Note them down!
   - In **IP Access List**, select **Allow Access from Anywhere** (`0.0.0.0/0`) so Render can connect.
4. Click **Database** -> Click **Connect** -> Choose **Drivers (Node.js)**.
5. Copy your connection string. It looks like:
   ```
   mongodb+srv://veloop_admin:<password>@cluster0.abcde.mongodb.net/veloop_tap_earn?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your actual password).*

---

## Step 2: Deploy to Render

### Method A: 1-Click Render Blueprint (Recommended)

1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository: `DineshKumar-02/VEloop-Internship-Projects-`.
4. Render will read [`render.yaml`](file:///m:/VEloop%20Internship%20Program/render.yaml) automatically.
5. When prompted, fill in the environment variable:
   - `MONGO_URI`: Paste your MongoDB Atlas connection string from Step 1.
6. Click **Apply**. Render will automatically build and deploy both services!

---

### Method B: Manual Deployment

#### 1. Deploy the Backend (Web Service):
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select your repository: `DineshKumar-02/VEloop-Internship-Projects-`.
3. Configure the following settings:
   - **Name**: `veloop-tap-backend`
   - **Region**: Closest to you (e.g., Singapore / Oregon / Frankfurt)
   - **Root Directory**: `Task 1/backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `mongodb+srv://...` (Your MongoDB Atlas connection string)
5. Click **Create Web Service**.
6. Once deployed, note down your backend URL:
   `https://veloop-tap-backend.onrender.com`

#### 2. Deploy the Frontend (Static Site):
1. In Render Dashboard, click **New +** -> **Static Site**.
2. Select the same repository: `DineshKumar-02/VEloop-Internship-Projects-`.
3. Configure the settings:
   - **Name**: `veloop-tap-frontend`
   - **Root Directory**: `Task 1/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://veloop-tap-backend.onrender.com/api`
     *(Replace with your actual backend URL from the previous step).*
5. Under **Redirects/Rewrites**:
   - Add a rewrite rule:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`
6. Click **Create Static Site**.

---

## Step 3: Seed Initial Data on Render (Optional)

To populate Season 1, Top 100 leaderboard players, and missions on your cloud MongoDB Atlas database:

You can run the seed script locally pointing to your cloud MongoDB:
```bash
cd "Task 1/backend"
# Set your MongoDB Atlas URI in environment:
$env:MONGO_URI="your_mongodb_atlas_connection_string"
npm run seed
```
This will instantly populate your live cloud database with all initial data!

---

## ✅ Verification Checklist
- Visit your frontend Render URL (e.g. `https://veloop-tap-frontend.onrender.com`).
- Verify the `#161827` theme loads.
- Tap the central VE coin and observe real-time balances, haptics, and reward chips.
- Open **Tap League** to see the live Top 100 leaderboard.
