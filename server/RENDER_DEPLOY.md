# Render Deployment Guide for PocketJob Backend

This guide walks you through deploying the **PocketJob backend** to [Render](https://render.com) for free.

---

## Prerequisites Checklist

1. [GitHub](https://github.com) account with this repo pushed (`ajithrajesh/Pocketjob-project`).
2. [Render](https://render.com) account.
3. [MongoDB Atlas](https://cloud.mongodb.com) cluster with network access enabled for anywhere (`0.0.0.0/0`).

---

## ⚠️ Critical Step 1: MongoDB Atlas IP Access

Render uses dynamic IP addresses, which means MongoDB Atlas will block requests unless you allow access from all IPs:

1. Log into [MongoDB Atlas](https://cloud.mongodb.com).
2. Under **Security**, click **Network Access**.
3. Click **Add IP Address**.
4. Click **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Confirm**.

---

## Deployment Option A: Automatic Deployment via Render Blueprint (Recommended)

Because this repository now includes `render.yaml`:

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository: `Pocketjob-project`.
4. Render will read `render.yaml` and prompt you for the required environment variables.
5. Fill in the values (see the Environment Variables list below).
6. Click **Apply**. Render will automatically build and deploy!

---

## Deployment Option B: Manual Web Service Setup

If you prefer setting it up manually:

1. In [Render Dashboard](https://dashboard.render.com/), click **New +** > **Web Service**.
2. Select **Build and deploy from a Git repository** and connect `Pocketjob-project`.
3. Configure the following fields:
   - **Name:** `pocketjob-backend` (or your preferred name)
   - **Region:** Choose the region closest to you or your MongoDB Atlas region (e.g., Singapore, Frankfurt, Oregon)
   - **Branch:** `main`
   - **Root Directory:** `server` *(Important)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Expand **Advanced** and set:
   - **Health Check Path:** `/health`
5. Click **Add Environment Variable** and add the variables listed below.
6. Click **Create Web Service**.

---

## Environment Variables to Add in Render

| Key | Description | Example / Source |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Web service port | `10000` (Render sets process.env.PORT automatically) |
| `MONGODB_URI` | MongoDB Atlas Connection string | `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/workforce` |
| `JWT_SECRET` | Secret key for JWT signing | Any strong secret string (e.g. `your_strong_secret_key`) |
| `CLIENT_URL` | Deployed Frontend URL (for CORS and email links) | `https://your-frontend.vercel.app` (or `http://localhost:5173` during testing) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | Found in Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Found in Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | Found in Cloudinary dashboard |
| `EMAIL_USER` | Gmail address for sending emails | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail 16-character App Password | Generated from Google Account > Security > App Passwords |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | Found in Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | Found in Razorpay dashboard |

---

## Verifying the Deployment

Once Render finishes deploying:
1. Render will provide a live URL, e.g.: `https://pocketjob-backend.onrender.com`.
2. Visit `https://pocketjob-backend.onrender.com/health` in your browser. You should see:
   ```json
   {
     "status": "ok",
     "uptime": 12,
     "timestamp": "2026-10-24T..."
   }
   ```
3. Visit `https://pocketjob-backend.onrender.com/` to verify API root:
   ```json
   {
     "success": true,
     "message": "Welcome to PocketJob / WorkConnect API",
     "status": "healthy"
   }
   ```

---

## Connecting Your Frontend

In your frontend application (`client`):
1. Set the API environment variables in your frontend deployment (e.g. on Vercel or Netlify):
   ```env
   VITE_API_BASE_URL=https://pocketjob-backend.onrender.com/api
   VITE_SOCKET_URL=https://pocketjob-backend.onrender.com
   ```
2. In your Render backend's `CLIENT_URL` environment variable, add your frontend URL so CORS requests are allowed:
   ```env
   CLIENT_URL=https://your-frontend.vercel.app
   ```

---

## Keeping the Free Tier Active (Optional)

Render's free tier spins down after 15 minutes of inactivity. To prevent cold starts:
- Set up a free monitor at [UptimeRobot.com](https://uptimerobot.com) or [Cron-job.org](https://cron-job.org) to ping your `/health` endpoint every 10–14 minutes:
  `https://pocketjob-backend.onrender.com/health`
