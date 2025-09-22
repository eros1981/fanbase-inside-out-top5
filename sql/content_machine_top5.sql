-- Top 5 Content Machines query for BigQuery
-- This query should return the top 5 users by content creation metrics
-- Replace table names and column names with your actual BigQuery schema

WITH content_metrics AS (
  SELECT 
    u.user_id,
    u.display_name,
    COUNT(c.content_id) as content_count,
    'posts' as unit
  FROM `your-project.your-dataset.users` u
  LEFT JOIN `your-project.your-dataset.content` c ON u.user_id = c.user_id
  WHERE DATE_TRUNC(DATE(c.created_at), MONTH) = DATE('$1')
    AND c.status = 'published' -- Only count published content
  GROUP BY u.user_id, u.display_name
),
ranked_content_creators AS (
  SELECT 
    user_id,
    display_name,
    content_count,
    unit,
    ROW_NUMBER() OVER (ORDER BY content_count DESC, user_id) as rank
  FROM content_metrics
  WHERE content_count > 0
)
SELECT 
  user_id,
  display_name,
  content_count as metric_value,
  unit
FROM ranked_content_creators
WHERE rank <= 5
ORDER BY rank;

-- Example alternative query structure if you have different schema:
-- WITH monthly_content AS (
--   SELECT 
--     author_id as user_id,
--     COUNT(*) as content_count
--   FROM posts 
--   WHERE EXTRACT(YEAR FROM published_at) = EXTRACT(YEAR FROM $1::date)
--     AND EXTRACT(MONTH FROM published_at) = EXTRACT(MONTH FROM $1::date)
--     AND status = 'published'
--   GROUP BY author_id
-- )
-- SELECT 
--   u.id as user_id,
--   u.name as display_name,
--   COALESCE(mc.content_count, 0) as metric_value,
--   'posts' as unit
-- FROM users u
-- LEFT JOIN monthly_content mc ON u.id = mc.user_id
-- WHERE COALESCE(mc.content_count, 0) > 0
-- ORDER BY metric_value DESC
-- LIMIT 5;
