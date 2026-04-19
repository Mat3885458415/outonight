-- ============================================================
-- Outonight – Supabase schema
-- Coller dans SQL Editor → Run
-- ============================================================

-- 1. TABLES

create table if not exists bars (
  id          text primary key,
  name        text not null,
  emoji       text default '🍺',
  tag         text,
  description text,
  gradient    text default 'from-violet-500/30 via-fuchsia-500/20 to-indigo-500/20',
  color       text default 'violet',
  distance    text,
  open        boolean default true,
  created_at  timestamptz default now()
);

create table if not exists events (
  id          bigint primary key generated always as identity,
  bar_id      text not null references bars(id) on delete cascade,
  title       text not null,
  time_label  text,        -- ex : "Tonight · 21:00"
  date_label  text,        -- ex : "Friday"
  price       text default 'Free',
  tag         text,
  emoji       text default '🎵',
  gradient    text default 'from-violet-500/30 via-fuchsia-500/20 to-indigo-500/20',
  description text,
  created_at  timestamptz default now()
);

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  bio        text default 'TBU Zlín · Erasmus student',
  mood       text default 'Looking for plans tonight',
  flag       text default '🏳️',
  uni        text default 'TBU · Zlín',
  updated_at timestamptz default now()
);

create table if not exists rsvps (
  user_id    uuid not null references auth.users(id) on delete cascade,
  event_id   bigint not null references events(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, event_id)
);

-- 2. ROW LEVEL SECURITY

alter table bars     enable row level security;
alter table events   enable row level security;
alter table profiles enable row level security;
alter table rsvps    enable row level security;

-- Bars : lecture publique
create policy "bars_select"    on bars     for select using (true);

-- Events : lecture publique
create policy "events_select"  on events   for select using (true);

-- Profiles : lecture publique, écriture sur son propre profil
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- RSVPs : lecture publique, écriture/suppression sur ses propres RSVPs
create policy "rsvps_select" on rsvps for select using (true);
create policy "rsvps_insert" on rsvps for insert with check (auth.uid() = user_id);
create policy "rsvps_delete" on rsvps for delete using (auth.uid() = user_id);

-- 3. DONNÉES DE DÉPART

insert into bars (id, name, emoji, tag, description, gradient, color, distance, open) values
  ('charlie',  'Charlie',  '🎸', 'Live music',   'Zlín''s rock bar. Live concerts, craft beers and great vibes every night.',          'from-rose-500/30 via-red-500/20 to-orange-500/20',       'rose',   '5 min walk',  true),
  ('infinity', 'Infinity', '∞',  'Club · Techno', 'Zlín''s go-to electronic club. Local and international DJs every weekend.',          'from-violet-500/30 via-fuchsia-500/20 to-indigo-500/20', 'violet', '8 min walk',  false),
  ('flip',     'Flip',     '🎱', 'Bar · Pool',    'Relaxed bar with pool table, ping-pong and terrace. The perfect place to start your night.', 'from-sky-500/30 via-cyan-500/20 to-blue-500/20',         'sky',    '12 min walk', true)
on conflict (id) do nothing;

insert into events (bar_id, title, time_label, date_label, price, tag, emoji, gradient, description) values
  ('charlie',  'Rock Night Open Stage', 'Tonight · 21:00',   'Friday',   'Free',    'Live',     '🎸', 'from-rose-500/30 via-red-500/20 to-orange-500/20',       'Open stage — anyone can come up and play. Rock atmosphere guaranteed.'),
  ('charlie',  'Thursday Happy Hour',  'Tonight · 18:00',   'Thursday', '80 CZK',  'Deal',     '🍺', 'from-amber-500/30 via-orange-500/20 to-yellow-500/20',   '2-for-1 on all draft beers until 9pm. Perfect after class.'),
  ('infinity', 'Techno Night #12',     'Sat · 23:00',        'Saturday', '150 CZK', 'Trending', '🎵', 'from-violet-500/30 via-fuchsia-500/20 to-indigo-500/20', 'The biggest techno night of the month. 5-hour set, bar open until 4am.'),
  ('infinity', 'Erasmus Night',        'Fri · 22:00',        'Friday',   'Free',    'Erasmus',  '🌍', 'from-pink-500/30 via-rose-500/20 to-orange-500/20',      'Night dedicated to Erasmus students. Free entry with TBU student card.'),
  ('flip',     'Pool Tournament',      'Tomorrow · 19:00',   'Saturday', '50 CZK',  'Sport',    '🎱', 'from-sky-500/30 via-cyan-500/20 to-blue-500/20',         'Pool tournament in pairs. Sign up on site. Prizes for top 3.'),
  ('flip',     'Thursday Chill',       'Tonight · 20:00',    'Thursday', 'Free',    'Chill',    '🍸', 'from-cyan-500/30 via-teal-500/20 to-green-500/20',       'Chill night, good music, student-priced cocktails. Come with your friends.')
on conflict do nothing;
