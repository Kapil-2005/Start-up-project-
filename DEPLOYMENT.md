# Deploying SmartForm to Production

This guide will help you deploy your SmartForm application to the web.

## Prerequisites
1.  **GitHub Account**: Ensure your code is pushed to a GitHub repository.
2.  **MongoDB Atlas Account**: You need a cloud database. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
3.  **Vercel Account**: For deploying the Frontend (Client).
4.  **Render Account**: For deploying the Backend (Server).

---

## Step 1: Set up MongoDB Atlas (Database)
1.  Create a Cluster on MongoDB Atlas.
2.  Create a Database User (Username/Password).
3.  Network Access: Allow Access from Anywhere (0.0.0.0/0).
4.  Get your **Connection String**. It looks like:
    `mongodb+srv://<username>:<password>@cluster0.mongodb.net/smartform?retryWrites=true&w=majority`
    *Replace `<password>` with your actual password.*

---

## Step 2: Deploy Backend to Render (Server)
1.  Log in to [Render](https://render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Root Directory**: `server` (Important! This tells Render where the backend code is).
    *   **Runtime**: Node
    *   **Build Command**: `cd server && npm install` (If `Root Directory` is set, just `npm install` might work, but safer to be specific if unsure). *Actually, if Root Directory is `server`, then just `npm install` is fine.*
    *   **Start Command**: `node index.js`
5.  **Environment Variables**:
    *   Add `MONGO_URI`: (Paste your MongoDB Atlas connection string from Step 1).
    *   Add `PORT`: `10000` (Render uses this port by default).
    *   Add `CLIENT_URL`: `https://your-frontend-url.vercel.app` (You will get this after Step 3, come back to update it later).
6.  Click **Create Web Service**.
7.  Wait for deployment. Copy your **Backend URL** (e.g., `https://smartform-api.onrender.com`).

---

## Step 3: Deploy Frontend to Vercel (Client)
1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure Project**:
    *   **Root Directory**: Click "Edit" and select `client`.
    *   **Framework Preset**: Vite (should be auto-detected).
    *   **Build Command**: `npm run build` (or `vite build`).
    *   **Output Directory**: `dist`.
5.  **Environment Variables**:
    *   Add `VITE_API_URL`: (Paste your **Backend URL** from Step 2, e.g., `https://smartform-api.onrender.com`). *Do not add a trailing slash.*
6.  Click **Deploy**.
7.  Once deployed, copy your **Frontend URL** (e.g., `https://smartform-app.vercel.app`).

---

## Step 4: Final Connection
1.  Go back to **Render Dashboard** -> Your Web Service -> **Environment**.
2.  Update/Add `CLIENT_URL` with your new **Frontend URL**.
3.  Top of the page -> **Manual Deploy** -> **Deploy latest commit** (to restart the server with new env vars).

**🎉 Done! Your SmartForm is now live!**
