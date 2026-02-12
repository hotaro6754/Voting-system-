# Digital Election Platform

A production-ready, scalable CR Election System for educational institutions.

## Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS v4 + Framer Motion
- **Backend:** Node.js + Express
- **Database:** Firebase Firestore
- **Icons:** Lucide React
- **Charts:** Chart.js

## Features
- **Multiple Class Datasets:** Manage student lists and roll numbers.
- **Election Sessions:** Admin-controlled timing with auto-status updates.
- **Secure Voting:** Transaction-based submission to prevent duplicate votes.
- **Anonymous Mode:** Voter identification is stored separately from the actual vote.
- **Audit Logs:** Track all administrative actions (creations, deletions).
- **Dark Mode:** Seamless theme switching for better user experience.
- **Live Analytics:** Real-time results visualization with Chart.js.
- **CSV Export:** Export election results for record-keeping.

## Setup Instructions

### Backend Setup
1. Navigate to `/server`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Set up a Firebase project and obtain the Service Account JSON.
5. Run the seeding script: `node models/seed.js`
6. Start the server: `node index.js`

### Frontend Setup
1. Navigate to `/client`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the development server: `npm run dev`

## Security
- JWT for Admin authentication
- Bcrypt for password hashing
- Helmet for security headers
- Rate limiting for API protection
- CORS protection
- Transactional Firestore updates

## UI/UX Design
- **Professional Palette:** Navy Blue (#0B1F3A) and Teal (#00BFA6).
- **Glassmorphism:** Modern card designs with backdrop filters.
- **Responsive:** Mobile-first design for voting on any device.
- **Accessible:** ARIA labels and high contrast ratios.
