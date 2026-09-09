begin;

create extension if not exists vector
with schema extensions;

create table public.semantic_documents (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null unique references public.tickets(id) on delete cascade,
  content text not null,
  embedding extensions.vector(1536) not null,
  embedding_model text not null default 'text-embedding-3-small',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.set_semantic_documents_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger semantic_documents_set_updated_at
before update on public.semantic_documents
for each row
execute function public.set_semantic_documents_updated_at();

alter table public.semantic_documents enable row level security;

revoke all
on table public.semantic_documents
from anon, authenticated;

grant select, insert, update, delete
on table public.semantic_documents
to service_role;

create function public.match_similar_tickets(
  p_organization_id uuid,
  p_query_embedding extensions.vector(1536),
  p_exclude_ticket_id uuid default null,
  p_match_count integer default 3
)
returns table (
  ticket_id uuid,
  similarity double precision
)
language sql
stable
set search_path = ''
as $$
  select
    semantic_documents.ticket_id,
    (
      1 - (
        semantic_documents.embedding OPERATOR(extensions.<=>) p_query_embedding
      )
    )::double precision as similarity
  from public.semantic_documents
  join public.tickets on public.tickets.id = semantic_documents.ticket_id
  where public.tickets.organization_id = p_organization_id
    and public.tickets.status = 'resolved'
    and (
      p_exclude_ticket_id is null
      or semantic_documents.ticket_id <> p_exclude_ticket_id
    )
  order by semantic_documents.embedding OPERATOR(extensions.<=>) p_query_embedding
  limit least(greatest(coalesce(p_match_count, 3), 1), 10);
$$;

revoke execute on function public.match_similar_tickets(
  uuid,
  extensions.vector,
  uuid,
  integer
) from public;

grant execute on function public.match_similar_tickets(
  uuid,
  extensions.vector,
  uuid,
  integer
) to service_role;

commit;
