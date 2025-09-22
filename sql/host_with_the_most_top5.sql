-- Top 5 Host With The Most query for BigQuery
-- This query should return the top 5 users by hosting/event metrics
-- Replace table names and column names with your actual BigQuery schema

WITH hosting_metrics AS (
  SELECT 
    u.user_id,
    u.display_name,
    COUNT(e.event_id) as events_hosted,
    'events' as unit
  FROM `your-project.your-dataset.users` u
  LEFT JOIN `your-project.your-dataset.events` e ON u.user_id = e.host_id
  WHERE DATE_TRUNC(DATE(e.event_date), MONTH) = DATE('$1')
    AND e.status = 'completed' -- Only count completed events
  GROUP BY u.user_id, u.display_name
),
ranked_hosts AS (
  SELECT 
    user_id,
    display_name,
    events_hosted,
    unit,
    ROW_NUMBER() OVER (ORDER BY events_hosted DESC, user_id) as rank
  FROM hosting_metrics
  WHERE events_hosted > 0
)
SELECT 
  user_id,
  display_name,
  events_hosted as metric_value,
  unit
FROM ranked_hosts
WHERE rank <= 5
ORDER BY rank;

-- Example alternative query structure if you have different schema:
-- WITH monthly_events AS (
--   SELECT 
--     host_id as user_id,
--     COUNT(*) as events_hosted
--   FROM events 
--   WHERE EXTRACT(YEAR FROM event_date) = EXTRACT(YEAR FROM $1::date)
--     AND EXTRACT(MONTH FROM event_date) = EXTRACT(MONTH FROM $1::date)
--     AND status = 'completed'
--   GROUP BY host_id
-- )
-- SELECT 
--   u.id as user_id,
--   u.name as display_name,
--   COALESCE(me.events_hosted, 0) as metric_value,
--   'events' as unit
-- FROM users u
-- LEFT JOIN monthly_events me ON u.id = me.user_id
-- WHERE COALESCE(me.events_hosted, 0) > 0
-- ORDER BY metric_value DESC
-- LIMIT 5;
