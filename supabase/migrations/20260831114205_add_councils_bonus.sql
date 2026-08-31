alter table public.daily_results
  add column if not exists municipalities_bonus boolean not null default false;

update public.daily_results
set municipalities_bonus = false
where municipalities_bonus is null;

alter table public.daily_results
  alter column municipalities_bonus set default false,
  alter column municipalities_bonus set not null;

drop function if exists public.submit_daily_result(date, jsonb, boolean, boolean);
drop function if exists public.submit_daily_result(date, jsonb, boolean, boolean, boolean);

create function public.submit_daily_result(
  target_game_date date,
  submitted_guesses jsonb,
  submitted_shield_bonus boolean default false,
  submitted_map_bonus boolean default false,
  submitted_municipalities_bonus boolean default false
)
returns public.daily_results
language plpgsql
security definer
set search_path = ''
as $$
declare
  requesting_user uuid := auth.uid();
  guess_count integer;
  win_try integer;
  completed_result boolean;
  best_distance_result numeric;
  main_score_result integer := 0;
  bonus_score_result integer := 0;
  final_shield_bonus boolean := false;
  final_map_bonus boolean := false;
  final_municipalities_bonus boolean := false;
  existing_needs_main_backfill boolean := false;
  existing_result public.daily_results;
  saved_result public.daily_results;
begin
  if requesting_user is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if target_game_date is null then
    raise exception 'target_game_date is required' using errcode = '22023';
  end if;

  if submitted_guesses is null or jsonb_typeof(submitted_guesses) <> 'array' then
    raise exception 'submitted_guesses must be an array' using errcode = '22023';
  end if;

  guess_count := jsonb_array_length(submitted_guesses);
  if guess_count < 1 or guess_count > 4 then
    raise exception 'submitted_guesses must contain 1 to 4 guesses' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(submitted_guesses) as guess(value)
    where jsonb_typeof(guess.value) <> 'object'
      or nullif(btrim(guess.value ->> 'name'), '') is null
      or nullif(btrim(guess.value ->> 'direction'), '') is null
      or nullif(btrim(guess.value ->> 'distance'), '') is null
      or (guess.value ->> 'distance') !~ '^[0-9]+(\.[0-9]+)?$'
  ) then
    raise exception 'submitted_guesses contains invalid guesses' using errcode = '22023';
  end if;

  select min(guess.ordinality)::integer
  into win_try
  from jsonb_array_elements(submitted_guesses) with ordinality as guess(value, ordinality)
  where (guess.value ->> 'distance') ~ '^[0-9]+(\.[0-9]+)?$'
    and (guess.value ->> 'distance')::numeric = 0;

  completed_result := win_try is not null or guess_count >= 4;
  if not completed_result then
    raise exception 'Cannot submit incomplete daily result' using errcode = '22023';
  end if;

  select min((guess.value ->> 'distance')::numeric)
  into best_distance_result
  from jsonb_array_elements(submitted_guesses) as guess(value)
  where (guess.value ->> 'distance') ~ '^[0-9]+(\.[0-9]+)?$';

  if win_try is not null then
    main_score_result := case win_try
      when 1 then 100
      when 2 then 75
      when 3 then 50
      when 4 then 25
      else 0
    end;
  end if;

  select *
  into existing_result
  from public.daily_results
  where user_id = requesting_user
    and game_date = target_game_date;

  if found then
    existing_needs_main_backfill :=
      not coalesce(existing_result.completed, false)
      or existing_result.tries_count is null
      or existing_result.best_distance is null
      or (
        not coalesce(existing_result.won, false)
        and win_try is not null
        and coalesce(existing_result.best_distance, 999999999)::numeric = 0
      )
      or (
        coalesce(existing_result.won, false)
        and coalesce(existing_result.main_score, 0) = 0
        and win_try is not null
      );

    final_shield_bonus :=
      coalesce(existing_result.shield_bonus, false)
      or (
        (case when existing_needs_main_backfill then win_try is not null else existing_result.won end)
        and coalesce(submitted_shield_bonus, false)
      );
    final_map_bonus :=
      coalesce(existing_result.map_bonus, false)
      or (
        (case when existing_needs_main_backfill then win_try is not null else existing_result.won end)
        and coalesce(submitted_map_bonus, false)
      );
    final_municipalities_bonus :=
      coalesce(existing_result.municipalities_bonus, false)
      or coalesce(submitted_municipalities_bonus, false);
    bonus_score_result :=
      case when final_shield_bonus then 20 else 0 end
      + case when final_map_bonus then 20 else 0 end
      + case when final_municipalities_bonus then 20 else 0 end;

    if existing_needs_main_backfill then
      update public.daily_results
      set
        guesses = submitted_guesses,
        completed = completed_result,
        won = win_try is not null,
        tries_count = case when win_try is not null then win_try else guess_count end,
        best_distance = best_distance_result,
        shield_bonus = final_shield_bonus,
        map_bonus = final_map_bonus,
        municipalities_bonus = final_municipalities_bonus,
        main_score = main_score_result,
        bonus_score = bonus_score_result,
        total_score = main_score_result + bonus_score_result,
        updated_at = now()
      where id = existing_result.id
      returning * into saved_result;

      return saved_result;
    end if;

    update public.daily_results
    set
      shield_bonus = final_shield_bonus,
      map_bonus = final_map_bonus,
      municipalities_bonus = final_municipalities_bonus,
      bonus_score = bonus_score_result,
      total_score = existing_result.main_score + bonus_score_result,
      updated_at = now()
    where id = existing_result.id
    returning * into saved_result;

    return saved_result;
  end if;

  if win_try is not null then
    final_shield_bonus := coalesce(submitted_shield_bonus, false);
    final_map_bonus := coalesce(submitted_map_bonus, false);
  end if;
  final_municipalities_bonus := coalesce(submitted_municipalities_bonus, false);
  bonus_score_result :=
    case when final_shield_bonus then 20 else 0 end
    + case when final_map_bonus then 20 else 0 end
    + case when final_municipalities_bonus then 20 else 0 end;

  insert into public.daily_results (
    user_id,
    game_date,
    guesses,
    completed,
    won,
    tries_count,
    best_distance,
    shield_bonus,
    map_bonus,
    municipalities_bonus,
    main_score,
    bonus_score,
    total_score,
    updated_at
  )
  values (
    requesting_user,
    target_game_date,
    submitted_guesses,
    completed_result,
    win_try is not null,
    case when win_try is not null then win_try else guess_count end,
    best_distance_result,
    win_try is not null and final_shield_bonus,
    win_try is not null and final_map_bonus,
    final_municipalities_bonus,
    main_score_result,
    bonus_score_result,
    main_score_result + bonus_score_result,
    now()
  )
  returning * into saved_result;

  return saved_result;
end;
$$;

revoke all on function public.submit_daily_result(date, jsonb, boolean, boolean, boolean)
  from public, anon;
grant execute on function public.submit_daily_result(date, jsonb, boolean, boolean, boolean)
  to authenticated;

notify pgrst, 'reload schema';
