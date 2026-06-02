-- Rôles utilisateurs : table profiles liée à auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'employee' check (role in ('admin','employee')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- is_admin() : utilisé par la RLS et les checks serveur
create or replace function public.is_admin() returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- À la création d'un user auth, créer son profil (employee par défaut)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'employee')
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill des users existants
insert into public.profiles (id, email, role)
select id, email, 'employee' from auth.users
on conflict (id) do nothing;

-- Premier admin
update public.profiles set role = 'admin'
where email = 'alantouati22@gmail.com';

-- RLS : lecture par tout connecté ; écriture réservée aux admins (backstop)
create policy "auth read profiles" on public.profiles
  for select to authenticated using (true);
create policy "admin manage profiles" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
