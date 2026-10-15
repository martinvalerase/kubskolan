-- Kubskolan: konton, framsteg och topplistor i Supabase (Postgres).
-- Klistra in hela filen i Supabase Dashboard > SQL Editor > Run. Den går att köra om (idempotent).
--
-- Modell: ett föräldrakonto (e-post, magisk länk) äger flera barnprofiler. Barnen har ingen e-post.
-- Det enda som lämnar enheten är smeknamn, figur/färg och framsteg. Foto-avatarer synkas aldrig.

-- ---------- Konton och samtycke ----------

create table if not exists public.accounts (
  id            uuid primary key references auth.users(id) on delete cascade,
  consent_at    timestamptz not null default now(),   -- när vårdnadshavaren godkände villkoren
  consent_ver   text not null default '1'
);

-- ---------- Profiler (barn/användare under ett konto) ----------

create table if not exists public.profiles (
  id              uuid primary key default gen_random_uuid(),
  owner           uuid not null references auth.users(id) on delete cascade,
  nickname        text not null check (char_length(nickname) between 1 and 16),
  avatar          text not null default 's0c0' check (char_length(avatar) <= 40),
  on_leaderboard  boolean not null default false,     -- bara de som valt det syns på topplistan
  created_at      timestamptz not null default now()
);
create index if not exists profiles_owner_idx on public.profiles(owner);

-- Högst 8 profiler per konto
create or replace function public.limit_profiles() returns trigger language plpgsql as $$
begin
  if (select count(*) from public.profiles where owner = new.owner) >= 8 then
    raise exception 'Högst 8 profiler per konto';
  end if;
  return new;
end $$;
drop trigger if exists limit_profiles on public.profiles;
create trigger limit_profiles before insert on public.profiles
  for each row execute function public.limit_profiles();

-- ---------- Framsteg: en rad per profil, samma form som appen sparar lokalt ----------

create table if not exists public.progress (
  profile_id   uuid primary key references public.profiles(id) on delete cascade,
  lessons      jsonb not null default '{}',   -- { w3: true, ... }
  quiz         jsonb not null default '{}',   -- { w3: 0.67, ... }
  boxes        jsonb not null default '{}',   -- { sune: 4, ... }
  step_at      jsonb not null default '{}',
  stars        int  not null default 0 check (stars between 0 and 100),     -- räknas av appen, kontrolleras bara för rimlighet
  mastered     int  not null default 0 check (mastered between 0 and 200),  -- algoritmer på nivå 3 eller högre
  streak_days  int  not null default 0,
  last_active  date,
  updated_at   timestamptz not null default now()
);

-- Dagar i rad räknas på servern (svensk tid) så att det inte går att fuska med enhetens klocka.
create or replace function public.touch_progress() returns trigger language plpgsql as $$
declare today date := (now() at time zone 'Europe/Stockholm')::date;
begin
  new.updated_at := now();
  if tg_op = 'INSERT' or old.last_active is null then
    new.streak_days := 1;
  elsif old.last_active = today then
    new.streak_days := old.streak_days;
  elsif old.last_active = today - 1 then
    new.streak_days := old.streak_days + 1;
  else
    new.streak_days := 1;
  end if;
  new.last_active := today;
  return new;
end $$;
drop trigger if exists touch_progress on public.progress;
create trigger touch_progress before insert or update on public.progress
  for each row execute function public.touch_progress();

-- ---------- Tidtagning ----------

create table if not exists public.times (
  id          bigint generated always as identity primary key,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  ms          int not null check (ms between 2000 and 3600000),   -- under 2 s är inte en lösning
  at          timestamptz not null default now()
);
create index if not exists times_profile_idx on public.times(profile_id, ms);

-- ---------- Radnivåsäkerhet: man ser och ändrar bara sitt eget ----------

alter table public.accounts enable row level security;
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.times    enable row level security;

drop policy if exists accounts_own on public.accounts;
create policy accounts_own on public.accounts for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists progress_own on public.progress;
create policy progress_own on public.progress for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.owner = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.owner = auth.uid()));

drop policy if exists times_own on public.times;
create policy times_own on public.times for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.owner = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.owner = auth.uid()));

-- ---------- Topplistor: öppna, men bara smeknamn, figur och poäng, och bara för dem som valt att vara med ----------

create or replace view public.leaderboard as
select
  p.id,
  p.nickname,
  p.avatar,
  coalesce(g.stars, 0)       as stars,
  coalesce(g.mastered, 0)    as mastered,
  case when g.last_active >= (now() at time zone 'Europe/Stockholm')::date - 1
       then coalesce(g.streak_days, 0) else 0 end as streak_days,   -- bruten kedja visas som 0
  (select min(t.ms) from public.times t where t.profile_id = p.id) as best_ms
from public.profiles p
left join public.progress g on g.profile_id = p.id
where p.on_leaderboard;

-- Vyn körs med ägarens rättigheter (förbi radnivåsäkerheten) med flit, men visar bara de kolumnerna ovan.
revoke all on public.leaderboard from public;
grant select on public.leaderboard to anon, authenticated;

-- ---------- Ta bort mitt konto (appen anropar rpc('delete_my_account')) ----------

create or replace function public.delete_my_account() returns void
language sql security definer set search_path = public, auth as $$
  delete from auth.users where id = auth.uid();   -- tar med konto, profiler, framsteg och tider (on delete cascade)
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
