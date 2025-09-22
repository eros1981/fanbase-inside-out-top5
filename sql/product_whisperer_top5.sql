-- Top 5 Product Whisperers query for BigQuery
-- This query should return the top 5 users by product feedback/contribution metrics
-- Replace table names and column names with your actual BigQuery schema

WITH product_metrics AS (
  SELECT 
    u.user_id,
    u.display_name,
    COUNT(f.feedback_id) as feedback_count,
    'suggestions' as unit
  FROM `your-project.your-dataset.users` u
  LEFT JOIN `your-project.your-dataset.product_feedback` f ON u.user_id = f.user_id
  WHERE DATE_TRUNC(DATE(f.submitted_at), MONTH) = DATE('$1')
    AND f.status = 'accepted' -- Only count accepted feedback
  GROUP BY u.user_id, u.display_name
),
ranked_product_whisperers AS (
  SELECT 
    user_id,
    display_name,
    feedback_count,
    unit,
    ROW_NUMBER() OVER (ORDER BY feedback_count DESC, user_id) as rank
  FROM product_metrics
  WHERE feedback_count > 0
)
SELECT 
  user_id,
  display_name,
  feedback_count as metric_value,
  unit
FROM ranked_product_whisperers
WHERE rank <= 5
ORDER BY rank;

-- Example alternative query structure if you have different schema:
-- WITH monthly_feedback AS (
--   SELECT 
--     user_id,
--     COUNT(*) as feedback_count
--   FROM product_suggestions 
--   WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM $1::date)
--     AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM $1::date)
--     AND status IN ('accepted', 'implemented')
--   GROUP BY user_id
-- )
-- SELECT 
--   u.id as user_id,
--   u.name as display_name,
--   COALESCE(mf.feedback_count, 0) as metric_value,
--   'suggestions' as unit
-- FROM users u
-- LEFT JOIN monthly_feedback mf ON u.id = mf.user_id
-- WHERE COALESCE(mf.feedback_count, 0) > 0
-- ORDER BY metric_value DESC
-- LIMIT 5;
