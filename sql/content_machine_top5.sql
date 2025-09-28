-- Top 5 Content Machine query for BigQuery
-- Returns the top 5 users by content creation metrics for the specified month
-- Uses parameterized query with $1 as the month parameter (YYYY-MM format)

WITH content_metrics AS (
  SELECT 
    u.user_id,
    u.display_name,
    COUNT(c.content_id) as total_content,
    'posts' as unit
  FROM `758470639878.fanbase_data.users` u
  LEFT JOIN `758470639878.fanbase_data.content` c ON u.user_id = c.user_id
  WHERE DATE_TRUNC(PARSE_DATE('%Y-%m', $1), MONTH) = DATE_TRUNC(c.created_at, MONTH)
  GROUP BY u.user_id, u.display_name
),
ranked_content_creators AS (
  SELECT 
    user_id,
    display_name,
    total_content,
    unit,
    ROW_NUMBER() OVER (ORDER BY total_content DESC, user_id) as rank
  FROM content_metrics
  WHERE total_content > 0
)
SELECT 
  user_id,
  display_name,
  total_content as metric_value,
  unit
FROM ranked_content_creators
WHERE rank <= 5
ORDER BY rank;