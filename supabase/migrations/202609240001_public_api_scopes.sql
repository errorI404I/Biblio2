-- Backend mínimo para los scopes theme:* y schedule_exceptions:*.
-- No permite CSS, HTML ni JavaScript arbitrarios: theme_config es un objeto
-- estructurado y la API valida sus campos antes de persistirlo.

alter table public.nodes
  add column if not exists theme_config jsonb not null
  default '{"version":1}'::jsonb;

alter table public.nodes
  drop constraint if exists nodes_theme_config_is_object;

alter table public.nodes
  add constraint nodes_theme_config_is_object
  check (jsonb_typeof(theme_config) = 'object');

create table if not exists public.node_schedule_exceptions (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.nodes(id) on delete cascade,
  exception_date date not null,
  is_closed boolean not null default true,
  start_time time null,
  end_time time null,
  reason text null check (char_length(reason) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (node_id, exception_date),
  check (
    (is_closed and start_time is null and end_time is null)
    or
    (not is_closed and start_time is not null and end_time is not null and start_time < end_time)
  )
);

create index if not exists node_schedule_exceptions_node_date_idx
  on public.node_schedule_exceptions (node_id, exception_date);

alter table public.node_schedule_exceptions enable row level security;

-- Las excepciones se administran por la API server-side con service_role.
-- No se crea una política pública deliberadamente.

alter table public.node_api_keys
  drop constraint if exists node_api_keys_valid_scopes;

alter table public.node_api_keys
  add constraint node_api_keys_valid_scopes
  check (
    cardinality(scopes) > 0
    and scopes <@ array[
      'node:read',
      'schedule:read',
      'schedule:write',
      'schedule_exceptions:read',
      'schedule_exceptions:write',
      'theme:read',
      'theme:write',
      'members:read',
      'invitations:read',
      'invitations:write',
      'ranking:read',
      'presence:read'
    ]::text[]
  );

create table if not exists public.public_api_rate_limits (
  fingerprint text primary key,
  request_count integer not null default 0,
  window_started_at timestamptz not null default now()
);

alter table public.public_api_rate_limits enable row level security;

create or replace function public.consume_public_api_rate_limit(
  p_fingerprint text,
  p_limit integer default 60,
  p_window_seconds integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.public_api_rate_limits (
    fingerprint,
    request_count,
    window_started_at
  )
  values (p_fingerprint, 1, now())
  on conflict (fingerprint) do update
  set
    request_count = case
      when public_api_rate_limits.window_started_at
        <= now() - make_interval(secs => p_window_seconds)
      then 1
      else public_api_rate_limits.request_count + 1
    end,
    window_started_at = case
      when public_api_rate_limits.window_started_at
        <= now() - make_interval(secs => p_window_seconds)
      then now()
      else public_api_rate_limits.window_started_at
    end
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_public_api_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_public_api_rate_limit(text, integer, integer)
  to service_role;
