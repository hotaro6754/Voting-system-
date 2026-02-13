# Deployment Guide: Digital Election Platform

This platform is designed to be easily deployed to **Vercel**, **Render**, or **Firebase**.

## 1. Vercel Deployment (Recommended)

### Option A: Monorepo Deployment (One Project)
1. Push your code to a GitHub repository.
2. Import the repository in Vercel.
3. Vercel should detect the root `vercel.json` and configure the builds.
4. **Environment Variables:** Add the following in Vercel Dashboard:
   - `FIREBASE_SERVICE_ACCOUNT`: (Your Firebase JSON string)
   - `JWT_SECRET`: (A strong random string)
   - `ADMIN_PASSWORD`: (Password for the seed admin)
   - `VITE_API_URL`: (Leave empty or set to `/` if using monorepo)

### Option B: Separate Deployment (More Robust)
1. **Backend (Server):**
   - Import the `server` directory as a new Vercel project (Set Root Directory to `server`).
   - Add Env Vars.
   - Note the Backend URL (e.g., `https://election-api.vercel.app`).
2. **Frontend (Client):**
   - Import the `client` directory as a new Vercel project (Set Root Directory to `client`).
   - Set `VITE_API_URL` to your Backend URL.

## 2. Firebase Deployment
- Use **Firebase Hosting** for the `client`.
- Use **Firebase Cloud Functions** (with Express) for the `server`.
- Update `firebase.json` to route `/api` to the function.

## 3. Database Setup (Firestore)
1. Create a Firebase Project at [firebase.google.com](https://firebase.google.com).
2. Enable **Firestore Database**.
3. Go to **Project Settings > Service Accounts**.
4. Click **Generate New Private Key**.
5. Copy the JSON content and use it for the `FIREBASE_SERVICE_ACCOUNT` environment variable.

## 4. Initializing Admin
Once deployed, you can seed the admin user by running:
```bash
cd server
export ADMIN_PASSWORD=your_secure_password
export FIREBASE_SERVICE_ACCOUNT='...'
node models/seed.js
```
Or trigger an internal endpoint if you add a temporary route for it.

## 5. Security Checklist
- [ ] Ensure `JWT_SECRET` is unique and long.
- [ ] Set `NODE_ENV=production`.
- [ ] Use HTTPS (Vercel/Render handles this automatically).
- [ ] Regularly check Audit Logs in Firestore.

## 6. Render Deployment (Blueprint)

This repository includes a `render.yaml` file for one-click deployment.

1. Create a new **Blueprint** on [Render](https://dashboard.render.com/blueprints).
2. Connect your GitHub repository.
3. Render will automatically detect the configuration and propose creating two services:
   - **election-platform-api** (Web Service)
   - **election-platform-ui** (Static Site)
4. **Configuration:**
   - The `VITE_API_URL` will be automatically linked between services.
   - You must manually add the following Environment Variables to the **election-platform-api** service in the Render dashboard:
     - `FIREBASE_SERVICE_ACCOUNT`: The JSON string of your Firebase service account.
     - `ADMIN_PASSWORD`: The desired password for the initial admin.
5. Once the API is live, don't forget to run the seeding script (see section 4).

## 7. Render Unified Deployment (Alternative)

If you prefer to deploy everything as a single Web Service:

1. Create a new **Web Service** on Render.
2. Connect your repository.
3. Render will detect the root `package.json`.
4. Set the **Build Command** to: `npm run build`
5. Set the **Start Command** to: `npm start`
6. Add the required Environment Variables (`FIREBASE_SERVICE_ACCOUNT`, etc.) and ensure `NODE_ENV` is set to `production`.
7. The server will build the frontend and serve it automatically.
