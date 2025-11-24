create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url, country_code, created_at)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'username'), new.email),
    (new.raw_user_meta_data->>'avatar_url'),
    (new.raw_user_meta_data->>'country'),
    now()
  )
  on conflict (id) do update
    set username = excluded.username,
        avatar_url = excluded.avatar_url,
        country_code = excluded.country_code,
        created_at = profiles.created_at;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();