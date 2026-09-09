begin;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  ticket_number integer not null,
  title text not null,
  description_original text not null,
  description_sanitized text,
  category text,
  status text not null default 'open',
  department text,
  equipment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint tickets_organization_ticket_number_key unique (organization_id, ticket_number),
  constraint tickets_status_check check (status in ('open', 'analyzing', 'resolved'))
);

create table public.ticket_resolutions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  cause text not null,
  solution text not null,
  steps jsonb not null default '[]'::jsonb,
  notes text,
  reference_ticket_id uuid references public.tickets(id) on delete set null,
  reference_similarity numeric(5,4),
  created_at timestamptz not null default now(),
  constraint ticket_resolutions_ticket_id_key unique (ticket_id),
  constraint ticket_resolutions_steps_is_array_check check (jsonb_typeof(steps) = 'array'),
  constraint ticket_resolutions_reference_similarity_check check (
    reference_similarity is null or reference_similarity between 0 and 1
  ),
  constraint ticket_resolutions_reference_ticket_check check (
    reference_ticket_id is null or reference_ticket_id <> ticket_id
  )
);

create index tickets_organization_id_idx on public.tickets (organization_id);
create index tickets_status_idx on public.tickets (status);
create index tickets_created_at_idx on public.tickets (created_at);
create index ticket_resolutions_organization_id_idx on public.ticket_resolutions (organization_id);

create function public.set_tickets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tickets_set_updated_at
before update on public.tickets
for each row
execute function public.set_tickets_updated_at();

create function public.validate_ticket_resolution_organization()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  ticket_organization_id uuid;
  reference_ticket_organization_id uuid;
begin
  select organization_id
  into ticket_organization_id
  from public.tickets
  where id = new.ticket_id;

  if not found then
    raise exception 'ticket_resolutions.ticket_id references a ticket that does not exist';
  end if;

  if ticket_organization_id <> new.organization_id then
    raise exception 'ticket_resolutions.ticket_id must belong to the same organization_id';
  end if;

  if new.reference_ticket_id is not null then
    select organization_id
    into reference_ticket_organization_id
    from public.tickets
    where id = new.reference_ticket_id;

    if not found then
      raise exception 'ticket_resolutions.reference_ticket_id references a ticket that does not exist';
    end if;

    if reference_ticket_organization_id <> new.organization_id then
      raise exception 'ticket_resolutions.reference_ticket_id must belong to the same organization_id';
    end if;
  end if;

  return new;
end;
$$;

create trigger ticket_resolutions_validate_organization
before insert or update on public.ticket_resolutions
for each row
execute function public.validate_ticket_resolution_organization();

alter table public.organizations enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_resolutions enable row level security;

commit;
