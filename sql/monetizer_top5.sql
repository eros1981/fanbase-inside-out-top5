-- Top 5 Monetizers query for BigQuery
-- This query should return the top 5 users by revenue/monetization metrics
-- Replace table names and column names with your actual BigQuery schema

WITH monetizer_metrics AS (
  SELECT 
    u.user_id,
    u.display_name,
    COALESCE(SUM(r.revenue), 0) as total_revenue,
    'USD' as unit
  FROM `your-project.your-dataset.users` u
  LEFT JOIN `your-project.your-dataset.revenue_transactions` r ON u.user_id = r.user_id
  WHERE DATE_TRUNC(DATE(r.created_at), MONTH) = DATE('$1')
  GROUP BY u.user_id, u.display_name
),
ranked_monetizers AS (
  SELECT 
    user_id,
    display_name,
    total_revenue,
    unit,
    ROW_NUMBER() OVER (ORDER BY total_revenue DESC, user_id) as rank
  FROM monetizer_metrics
  WHERE total_revenue > 0
)
SELECT 
  user_id,
  display_name,
  total_revenue as metric_value,
  unit
FROM ranked_monetizers
WHERE rank <= 5
ORDER BY rank;

-- Example alternative query structure if you have different schema:
-- WITH monthly_revenue AS (
--   SELECT 
--     user_id,
--     SUM(amount) as total_revenue
--   FROM payments 
--   WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM $1::date)
--     AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM $1::date)
--   GROUP BY user_id
-- )
-- SELECT 
--   u.id as user_id,
--   u.name as display_name,
--   COALESCE(mr.total_revenue, 0) as metric_value,
--   'USD' as unit
-- FROM users u
-- LEFT JOIN monthly_revenue mr ON u.id = mr.user_id
-- WHERE COALESCE(mr.total_revenue, 0) > 0
-- ORDER BY metric_value DESC
-- LIMIT 5;
