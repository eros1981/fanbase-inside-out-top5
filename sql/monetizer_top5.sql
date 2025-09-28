-- Top 5 Monetizers query for BigQuery
-- Based on get_top_revenue stored procedure
-- Returns the top 5 users by revenue for the specified month
-- Uses parameterized query with $1 as the month parameter (YYYY-MM format)

WITH base AS (
  SELECT
    DATE_FORMAT(r.created_at, '%Y-%m-01') AS period,
    r.user_id,
    SUM(r.ammount) AS total_revenue
  FROM `758470639878.reporting_db.revenues` r
  JOIN `758470639878.reporting_db.users` u ON u.id = r.user_id 
  WHERE u.suspended IS NULL 
    AND u.id IN (1502307,408175,1429274,47925,24971,48190,1506452,37642,1420845,382837,6936,117,279659,380963,351567,1429452,1506337,424980,1291548,212883,17898,654385,1522723,209251,13202,1506448,1418561,1503807,16938,1162563,546441,181,216994,1417193,554500,1435337,1466314,1435335,12688)
    AND DATE_FORMAT(r.created_at, '%Y-%m') = $1
  GROUP BY period, r.user_id
), 
ranked AS (
  SELECT
    period,
    user_id,
    total_revenue,
    ROW_NUMBER() OVER (PARTITION BY period ORDER BY total_revenue DESC) AS position
  FROM base
)
SELECT
  ranked.user_id,
  u.name AS user_name,
  ranked.total_revenue AS metric_value,
  'USD' AS unit
FROM ranked
JOIN `758470639878.reporting_db.users` u ON u.id = ranked.user_id
WHERE position <= 5
ORDER BY ranked.position;

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
