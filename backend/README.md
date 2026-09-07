# CivicConnect backend — setup guide

This is the Node.js + Express API that connects your React frontend to Supabase
(PostgreSQL database, Auth, and Storage), matching sections 10–16 of the project plan.

## 1. Create your Supabase project

1. Go to https://supabase.com and sign in (free tier is enough for an MCA project).
2. Click **New project**. Choose a name (e.g. `civicconnect`), a database password
   (save this somewhere safe), and a region close to you.
3. Wait 1–2 minutes for the project to finish provisioning.

## 2. Run the database schema

1. In your Supabase project, open **SQL Editor** (left sidebar) → **New query**.
2. Paste the entire contents of `supabase/schema.sql` (included alongside this backend)
   and click **Run**.
3. Confirm under **Table Editor** that you now see: `users`, `categories`, `complaints`,
   `complaint_updates`, `feedback`.

## 3. Create the storage bucket for photos

1. Go to **Storage** in the sidebar → **New bucket**.
2. Name it exactly `complaint-images` (or pick your own name and update `.env`).
3. Set it to **Public** (so `getPublicUrl()` returns a viewable link for photos in the app).

## 4. Collect the values you need to give me / put in `.env`

Go to **Project Settings → API** in Supabase. You need three values:

| Value | Where to find it | Goes in |
|---|---|---|
| **Project URL** | Settings → API → Project URL | `SUPABASE_URL` |
| **anon public key** | Settings → API → Project API keys → `anon` `public` | `SUPABASE_ANON_KEY` |
| **service_role key** | Settings → API → Project API keys → `service_role` | `SUPABASE_SERVICE_ROLE_KEY` |

**Important:** the `service_role` key has full admin access to your database — it must
stay only in this backend's `.env` file, and must never be sent to the frontend or
committed to GitHub.

## 5. Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in the four values from step 4, plus:
- `SUPABASE_STORAGE_BUCKET` — the bucket name from step 3 (default `complaint-images`)
- `CLIENT_ORIGIN` — the URL your React frontend runs on (e.g. `http://localhost:5173` for Vite)

## 6. Install and run

```bash
npm install
npm run dev
```

The API starts on `http://localhost:5000`. Check it's alive:

```bash
curl http://localhost:5000/api/health
```

## 7. How authentication works here

- `POST /api/auth/register` creates a Supabase Auth user **and** a row in the `users`
  profile table (with `role: citizen` or `role: admin`).
- `POST /api/auth/login` returns an `access_token`. Your React app stores this
  (e.g. in memory or `AuthContext`, per the folder structure in the project doc) and
  sends it on every future request as:
  ```
  Authorization: Bearer <access_token>
  ```
- Every protected route (complaints, feedback, admin actions) checks this token via
  `middleware/authMiddleware.js`, which asks Supabase "who is this token for?" and
  loads their profile/role before continuing.

## 8. API endpoints (matches section 16 of the project doc)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register citizen or admin |
| POST | `/api/auth/login` | — | Log in, get access token |
| GET | `/api/auth/me` | citizen/admin | Get current user profile |
| GET | `/api/complaints` | citizen/admin | List complaints (own for citizen, all for admin); supports `?status=&category=&department=&search=` |
| GET | `/api/complaints/:id` | citizen/admin | Get one complaint with history + feedback |
| POST | `/api/complaints` | citizen | Create complaint (multipart form, field `photo`) |
| PUT | `/api/complaints/:id` | admin | Assign department, moves status to In Progress |
| POST | `/api/complaints/:id/status` | citizen/admin | Add a status update (Resolved with `photo`, Verified, Reopened) |
| POST | `/api/complaints/:id/feedback` | citizen | Submit 1–5 rating + comment after Verified |
| GET | `/api/complaints/stats` | admin | Dashboard counts + category breakdown |
| GET | `/api/categories` | — | List categories |
| POST | `/api/categories` | admin | Create a category |

## 9. Connecting this to the React frontend

In `frontend/src/services/api.js`, set up Axios with a base URL and an interceptor
that attaches the stored token:

```js
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

Then replace the mock `complaints` state in the UI prototype with real calls, e.g.
`api.get("/complaints")`, `api.post("/complaints", formData)` for the report form
(use `FormData` since photo upload is multipart), etc.
