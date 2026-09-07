# CivicConnect — full project (run locally)

This is the complete, real project: React frontend + Express backend + Supabase
database/auth/storage. Everything here is fully wired together — no mock data,
no schematic placeholders. Follow these steps in order.

## Prerequisites

- Node.js installed (v18 or newer recommended)
- A Supabase project already set up (tables created via `backend/supabase/schema.sql`,
  storage bucket `complaint-images` created, and your `backend/.env` already filled in
  with your real Supabase keys — you did this in an earlier step)

## 1. Start the backend first

```bash
cd backend
npm install
npm run dev
```

Confirm it's alive: open `http://localhost:5000/api/health` in a browser —
you should see `{"status":"ok"}`. Leave this terminal running.

## 2. Start the frontend

Open a **second** terminal (leave the backend running in the first one):

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Vite will print a local URL, normally `http://localhost:5173`. Open it in your browser.

## 3. Try it for real

1. Click **Report an issue** → fill in the registration form → you're now logged in
   as a real citizen account (created in your actual Supabase `auth.users` +
   `users` table).
2. Go to **Report a new issue** → fill in the form → click **Use my current
   location** → your browser will ask for location permission → allow it →
   your real GPS coordinates appear with a live OpenStreetMap preview.
3. Upload a real photo from your computer, submit the issue.
4. Check your Supabase dashboard: **Table Editor → complaints** should show
   your new row, and **Storage → complaint-images → submitted/** should show
   your uploaded photo.
5. To test the admin side: go to **Table Editor → users** in Supabase, find
   your account's row, and change `role` from `citizen` to `admin`. Refresh
   the frontend and log in again — you'll now land on the admin dashboard,
   see your complaint plotted on the real map, and be able to assign a
   department, resolve it, and see the full status flow.

## Project structure

```
civicconnect/
├── backend/          Express API + Supabase integration (already built)
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── supabase/schema.sql
│   └── .env           <- your real Supabase keys are already here
│
└── frontend/          React + Vite + Tailwind + real Leaflet maps
    ├── src/
    │   ├── pages/citizen/    Report issue, dashboard, my complaints, details
    │   ├── pages/admin/      Dashboard, all complaints, details, categories
    │   ├── components/       Shared UI (Navbar, ComplaintCard, Map, etc.)
    │   ├── services/         Axios calls matching every backend endpoint
    │   ├── context/          Real auth state + token persistence
    │   └── hooks/            Real browser geolocation
    └── .env              <- points at your local backend
```

## If something doesn't work

- **CORS error in the browser console** → check `backend/.env`'s `CLIENT_ORIGIN`
  matches the URL Vite printed (default `http://localhost:5173`).
- **"Network Error" on every request** → the backend isn't running, or
  `frontend/.env`'s `VITE_API_URL` doesn't match where it's running.
- **Photo upload fails** → confirm the `complaint-images` bucket exists in
  Supabase Storage and is set to Public.
- **Location button does nothing** → check your browser didn't block the
  permission prompt; some browsers silently block geolocation on `http://`
  (non-HTTPS) origins other than `localhost` — `localhost` itself is always
  allowed, so this should work as long as you're on `http://localhost:5173`.
- **Map is blank/grey** → this needs an internet connection (it loads real
  OpenStreetMap tiles); check you're online.
