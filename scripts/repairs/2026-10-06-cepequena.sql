-- Authorized repair of the four copied games and aggregate stats of Cepequena.
-- The encrypted, verified external backup is retained separately from Git.
-- Checksum guards abort if any affected record changed after the backup.
+DO $repair$
DECLARE u uuid; n integer;
BEGIN
 SELECT id INTO STRICT u FROM public.user_profiles WHERE username='Cepequena' FOR UPDATE;
 PERFORM 1 FROM public.daily_results WHERE user_id=u FOR UPDATE;
 PERFORM 1 FROM public.user_stats WHERE user_id=u FOR UPDATE;
 IF (SELECT md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.game_date)::text,'[]')) FROM public.daily_results r WHERE r.user_id=u)<>'e660db4e2f53615becec365d4d6c548a' OR (SELECT md5(coalesce(jsonb_agg(to_jsonb(s) ORDER BY s.id)::text,'[]')) FROM public.user_stats s WHERE s.user_id=u)<>'88ff77a083d64eb354f5ced49eb9e37f' THEN RAISE EXCEPTION 'Account changed since verified encrypted backup'; END IF;
 DELETE FROM public.daily_results WHERE user_id=u AND game_date IN ('2026-08-31','2026-09-01','2026-09-02','2026-09-13');
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>4 THEN RAISE EXCEPTION 'Expected four copied games, got %',n; END IF;
 DELETE FROM public.user_stats WHERE user_id=u AND played=0;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'Expected one redundant initial stats row'; END IF;
 UPDATE public.user_stats SET played=1,win_ratio=1,current_streak=1,max_streak=1,average_best_distance=0,guess_distribution='{"1":1,"2":0,"3":0,"4":0}'::jsonb,updated_at=now() WHERE user_id=u;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'Expected one canonical stats row'; END IF;
 IF (SELECT count(*) FROM public.daily_results WHERE user_id=u)<>1 OR NOT EXISTS(SELECT 1 FROM public.daily_results WHERE user_id=u AND game_date='2026-09-10' AND total_score=160 AND tries_count=1 AND won) THEN RAISE EXCEPTION 'Legitimate game verification failed'; END IF;
END $repair$;
