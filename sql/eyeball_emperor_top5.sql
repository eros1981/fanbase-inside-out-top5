-- Top 5 Eyeball Emperors query for BigQuery
-- This query should return the top 5 users by view/engagement metrics
-- Replace table names and column names with your actual BigQuery schema

WITH engagement_metrics AS (
  SELECT 
    u.user_id,
    u.display_name,
    COALESCE(SUM(v.view_count), 0) as total_views,
    'views' as unit
  FROM `your-project.your-dataset.users` u
  LEFT JOIN `your-project.your-dataset.content` c ON u.user_id = c.user_id
  LEFT JOIN `your-project.your-dataset.content_views` v ON c.content_id = v.content_id
  WHERE DATE_TRUNC(DATE(v.viewed_at), MONTH) = DATE('$1')
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

-- Example alternative query structure if you have different schema:
-- WITH monthly_views AS (
--   SELECT 
--     c.author_id as user_id,
--     SUM(v.views) as total_views
--   FROM content c
--   JOIN content_analytics v ON c.id = v.content_id
--   WHERE EXTRACT(YEAR FROM v.date) = EXTRACT(YEAR FROM $1::date)
--     AND EXTRACT(MONTH FROM v.date) = EXTRACT(MONTH FROM $1::date)
--   GROUP BY c.author_id
-- )
-- SELECT 
--   u.id as user_id,
--   u.name as display_name,
--   COALESCE(mv.total_views, 0) as metric_value,
--   'views' as unit
-- FROM users u
-- LEFT JOIN monthly_views mv ON u.id = mv.user_id
-- WHERE COALESCE(mv.total_views, 0) > 0
-- ORDER BY metric_value DESC
-- LIMIT 5;
