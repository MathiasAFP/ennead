begin;

drop function if exists public.match_similar_tickets(
  uuid,
  extensions.vector,
  uuid,
  integer
);

alter table public.semantic_documents
alter column embedding type extensions.vector(1024)
using embedding::extensions.vector(1024);

alter table public.semantic_documents
alter column embedding_model set default 'bge-m3';

create function public.match_similar_tickets(
  p_organization_id uuid,
  p_query_embedding extensions.vector(1024),
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
