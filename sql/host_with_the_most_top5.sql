-- Top 5 Host With The Most query for BigQuery
-- Returns the top 5 users by event hosting metrics for the specified month
-- Uses parameterized query with $1 as the month parameter (YYYY-MM format)

WITH hosting_metrics AS (
  SELECT 
    u.user_id,
    u.display_name,
    COUNT(e.event_id) as total_events_hosted,
    'events' as unit
  FROM `758470639878.fanbase_data.users` u
  LEFT JOIN `758470639878.fanbase_data.events` e ON u.user_id = e.host_user_id
  WHERE DATE_TRUNC(PARSE_DATE('%Y-%m', $1), MONTH) = DATE_TRUNC(e.created_at, MONTH)
  GROUP BY u.user_id, u.display_name
),
ranked_hosts AS (
  SELECT 
    user_id,
    display_name,
    total_events_hosted,
    unit,
    ROW_NUMBER() OVER (ORDER BY total_events_hosted DESC, user_id) as rank
  FROM hosting_metrics
  WHERE total_events_hosted > 0
)
SELECT 
  user_id,
  display_name,
  total_events_hosted as metric_value,
  unit
FROM ranked_hosts
WHERE rank <= 5
ORDER BY rank;