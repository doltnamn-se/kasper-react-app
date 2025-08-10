
-- 1) Create table for "under users" (customer members)
create table if not exists public.customer_members (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  display_name text not null,
  relationship text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.customer_members enable row level security;

-- RLS: super_admin full access
create policy "Super admin full access to customer_members"
  on public.customer_members
  as permissive
  for all
  using (is_super_admin())
  with check (is_super_admin());

-- RLS: customers can view their own members
create policy "Customers can view their own members"
  on public.customer_members
  as permissive
  for select
  using (customer_id = auth.uid());

-- Keep updated_at fresh
drop trigger if exists trg_customer_members_updated_at on public.customer_members;
create trigger trg_customer_members_updated_at
  before update on public.customer_members
  for each row
  execute procedure public.handle_updated_at();

-- 2) Enforce max members by plan (Personskydd=0, Parskydd=1, Familjeskydd=3)
create or replace function public.validate_member_limit()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  plan text;
  member_count integer;
  allowed integer;
begin
  select subscription_plan::text into plan
  from public.customers
  where id = NEW.customer_id;

  -- Default to 0 for all non-"parskydd"/"familjeskydd" plans
  allowed := case
    when plan in ('parskydd_1_year','parskydd_2_years') then 1
    when plan in ('familjeskydd_1_year','familjeskydd_2_years') then 3
    else 0
  end;

  select count(*) into member_count
  from public.customer_members
  where customer_id = NEW.customer_id;

  if member_count >= allowed then
    raise exception 'Member limit reached for plan % (allowed %, current %)',
      plan, allowed, member_count;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_customer_members_limit on public.customer_members;
create trigger trg_customer_members_limit
  before insert on public.customer_members
  for each row
  execute function public.validate_member_limit();

-- 3) Extend customer_site_statuses with optional member_id
alter table public.customer_site_statuses
  add column if not exists member_id uuid null;

alter table public.customer_site_statuses
  add constraint customer_site_statuses_member_fk
  foreign key (member_id) references public.customer_members(id)
  on delete cascade;

-- Ensure customer_id always matches the member’s customer_id when member_id is set
create or replace function public.set_customer_id_from_member()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  m_customer uuid;
begin
  if NEW.member_id is not null then
    select customer_id into m_customer
    from public.customer_members
    where id = NEW.member_id;

    if m_customer is null then
      raise exception 'Member not found for member_id %', NEW.member_id;
    end if;

    NEW.customer_id := m_customer;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_statuses_set_customer_from_member on public.customer_site_statuses;
create trigger trg_statuses_set_customer_from_member
  before insert or update on public.customer_site_statuses
  for each row
  execute function public.set_customer_id_from_member();

-- Useful indexes
create index if not exists idx_customer_members_customer_id
  on public.customer_members(customer_id);

create index if not exists idx_statuses_customer_member
  on public.customer_site_statuses(customer_id, member_id);

create index if not exists idx_statuses_member_only
  on public.customer_site_statuses(member_id);
