# Render Deployment Guide

To ensure a successful deployment on Render, you must configure the following environment variables in the Render Dashboard.

## Required Environment Variables

| Variable | Description | Example / Format |
| :--- | :--- | :--- |
| `FIREBASE_SERVICE_ACCOUNT` | The full JSON string of your Firebase Service Account key. | `{"type": "service_account", ...}` |
| `JWT_SECRET` | A secure string for signing JSON Web Tokens. | `your_super_secret_jwt_key` |
| `ADMIN_PASSWORD` | The password for the admin account. | `secure_admin_password` |
| `NODE_ENV` | The environment mode. | `production` |

## How to add `FIREBASE_SERVICE_ACCOUNT`

1. Go to your Firebase Console -> Project Settings -> Service Accounts.
2. Click **Generate new private key**. This downloads a `.json` file.
3. Open the `.json` file and copy the **entire content**.
4. In the Render Dashboard, go to your Web Service -> **Environment**.
5. Add a new variable named `FIREBASE_SERVICE_ACCOUNT`.
6. Paste the entire JSON content into the value field.
   *Note: Our server handles the escaped newlines (`\n`) in the private key automatically.*

## Deployment Configuration

* **Runtime:** Node.js
* **Build Command:** `npm install && cd client && npm install && npm run build` (or as per your project structure)
* **Start Command:** `cd server && npm start`
* **Port:** Render automatically sets the `PORT` variable. Our app is configured to bind to `0.0.0.0` on that port.

## Stability Features

- **No Local Files:** The app does not require `serviceAccountKey.json` to be present on the server.
- **Loop Prevention:** If environment variables are missing, the server will log a critical error but **will not crash**. This prevents Render from entering an infinite restart loop.
- **Graceful Failure:** If Firebase fails to initialize, API requests will return a `503 Service Unavailable` with a JSON message explaining that the database is not initialized.
