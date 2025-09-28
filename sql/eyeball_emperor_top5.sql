-- Top 5 Eyeball Emperor query for BigQuery
-- Returns the top 5 users by engagement/view metrics for the specified month
-- Uses parameterized query with $1 as the month parameter (YYYY-MM format)

WITH engagement_metrics AS (
  SELECT 
    u.user_id,
    u.display_name,
    COALESCE(SUM(e.views), 0) as total_views,
    'views' as unit
  FROM `758470639878.fanbase_data.users` u
  LEFT JOIN `758470639878.fanbase_data.engagement` e ON u.user_id = e.user_id
  WHERE DATE_TRUNC(PARSE_DATE('%Y-%m', $1), MONTH) = DATE_TRUNC(e.created_at, MONTH)
  GROUP BY u.user_id, u.display_name
),
ranked_eyeball_emperors AS (
  SELECT 
    user_id,
    display_name,
    total_views,
    unit,
    ROW_NUMBER() OVER (ORDER BY total_views DESC, user_id) as rank
  FROM engagement_metrics
  WHERE total_views > 0
)
SELECT 
  user_id,
  display_name,
  total_views as metric_value,
  unit
FROM ranked_eyeball_emperors
WHERE rank <= 5
ORDER BY rank;