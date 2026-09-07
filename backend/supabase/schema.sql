-- CivicConnect database schema for Supabase (PostgreSQL)
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run

-- ============================================================
-- 1. USERS (profile table, linked to Supabase Auth users)
-- ============================================================
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  role text not null default 'citizen' check (role in ('citizen', 'admin')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  created_at timestamptz not null default now()
);

insert into categories (name, description) values
  ('Road Damage', 'Potholes, broken roads, damaged pavements'),
  ('Garbage/Waste', 'Uncollected garbage, overflowing bins'),
  ('Streetlight', 'Non-functional or damaged streetlights'),
  ('Water Leakage', 'Pipeline leaks, water logging'),
  ('Sanitation', 'Drainage, sewage, cleanliness issues'),
  ('Traffic Signal', 'Broken or malfunctioning traffic signals'),
  ('Fallen Tree', 'Fallen or hazardous trees'),
  ('Other', 'Any other civic issue')
on conflict (name) do nothing;

-- ============================================================
-- 3. COMPLAINTS
-- ============================================================
create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  category_id uuid not null references categories(id),
  title text not null,
  description text not null,
  image_url text,
  resolution_image_url text,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  status text not null default 'Submitted'
    check (status in ('Submitted', 'In Progress', 'Resolved', 'Verified', 'Reopened')),
  department text not null default 'Unassigned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_complaints_user_id on complaints(user_id);
create index if not exists idx_complaints_status on complaints(status);
create index if not exists idx_complaints_category_id on complaints(category_id);

-- ============================================================
-- 4. COMPLAINT_UPDATES (status history)
-- ============================================================
create table if not exists complaint_updates (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  status text not null,
  remarks text,
  updated_by uuid references users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_updates_complaint_id on complaint_updates(complaint_id);

-- ============================================================
-- 5. FEEDBACK
-- ============================================================
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null unique references complaints(id) on delete cascade,
  user_id uuid not null references users(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- The Express backend uses the service_role key, which bypasses RLS
-- entirely -- so these policies matter mainly if the frontend ever
-- talks to Supabase directly. Enabling them now is still good practice.
-- ============================================================
alter table users enable row level security;
alter table complaints enable row level security;
alter table complaint_updates enable row level security;
alter table feedback enable row level security;
alter table categories enable row level security;

create policy "Users can view their own profile"
  on users for select using (auth.uid() = id);

create policy "Anyone can read categories"
  on categories for select using (true);

create policy "Citizens can view their own complaints"
  on complaints for select using (auth.uid() = user_id);

create policy "Citizens can insert their own complaints"
  on complaints for insert with check (auth.uid() = user_id);

create policy "Citizens can view updates on their own complaints"
  on complaint_updates for select using (
    exists (select 1 from complaints c where c.id = complaint_id and c.user_id = auth.uid())
  );

create policy "Citizens can view their own feedback"
  on feedback for select using (auth.uid() = user_id);

create policy "Citizens can insert their own feedback"
  on feedback for insert with check (auth.uid() = user_id);

-- Note: admin-wide access (viewing/updating ALL complaints) is handled by the
-- Express backend using the service_role key, which bypasses these policies.
