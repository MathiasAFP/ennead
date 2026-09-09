begin;

grant usage on schema public to service_role;

grant select, insert, update, delete
on table
public.organizations,
public.tickets,
public.ticket_resolutions
to service_role;

commit;
