-- Native Postgres maintenance only; no Edge invocation or paid external scheduler.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
SELECT cron.schedule('random-stranger-expiry','* * * * *',$job$
 DELETE FROM random_stranger.live_positions WHERE expires <= (extract(epoch FROM now())*1000)::bigint;
 DELETE FROM random_stranger.attempts WHERE expires <= (extract(epoch FROM now())*1000)::bigint;
 DELETE FROM random_stranger.handoffs WHERE expires <= (extract(epoch FROM now())*1000)::bigint;
 DELETE FROM random_stranger.sessions WHERE expires <= (extract(epoch FROM now())*1000)::bigint;
$job$);
