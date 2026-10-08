create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create or replace function public.assign_admin_on_signup()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if lower(new.email) = 'rohanwest@rohansweb.co.uk' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.assign_admin_on_signup();

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'General',
  file_path text not null,
  file_name text not null,
  file_type text not null default '',
  file_size bigint not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.resources to anon;
grant select, insert, update, delete on public.resources to authenticated;
grant all on public.resources to service_role;
alter table public.resources enable row level security;
create policy "Public reads published" on public.resources for select to anon, authenticated using (published or public.has_role(auth.uid(), 'admin'));
create policy "Admins insert" on public.resources for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update" on public.resources for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete" on public.resources for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Public read resource files" on storage.objects for select to anon, authenticated using (bucket_id = 'resources');
create policy "Admins upload resource files" on storage.objects for insert to authenticated with check (bucket_id = 'resources' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update resource files" on storage.objects for update to authenticated using (bucket_id = 'resources' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete resource files" on storage.objects for delete to authenticated using (bucket_id = 'resources' and public.has_role(auth.uid(), 'admin'));