-- Top 5 Product Whisperer query for BigQuery
-- Returns the top 5 users by product feedback/engagement metrics for the specified month
-- Uses parameterized query with $1 as the month parameter (YYYY-MM format)

WITH feedback_metrics AS (
  SELECT 
    u.user_id,
    u.display_name,
    COUNT(f.feedback_id) as total_feedback,
    'feedback items' as unit
  FROM `758470639878.fanbase_data.users` u
  LEFT JOIN `758470639878.fanbase_data.product_feedback` f ON u.user_id = f.user_id
  WHERE DATE_TRUNC(PARSE_DATE('%Y-%m', $1), MONTH) = DATE_TRUNC(f.created_at, MONTH)
  GROUP BY u.user_id, u.display_name
),
ranked_whisperers AS (
  SELECT 
    user_id,
    display_name,
    total_feedback,
    unit,
    ROW_NUMBER() OVER (ORDER BY total_feedback DESC, user_id) as rank
  FROM feedback_metrics
  WHERE total_feedback > 0
)
SELECT 
  user_id,
  display_name,
  total_feedback as metric_value,
  unit
FROM ranked_whisperers
WHERE rank <= 5
ORDER BY rank;