-- Top 5 Content Machine query for BigQuery
-- Based on get_top_content stored procedure
-- Returns the top 5 users by content creation for the specified month
-- Uses parameterized query with $1 as the month parameter (YYYY-MM format)

WITH content AS (
  SELECT created_at, user_id FROM `758470639878.reporting_db.flickz`
  UNION ALL
  SELECT created_at, user_id FROM `758470639878.reporting_db.posts`
  UNION ALL
  SELECT created_at, user_id FROM `758470639878.reporting_db.livestreams`
  WHERE status = 'recorded'
  UNION ALL
  SELECT created_at, user_id FROM `758470639878.reporting_db.voice_channel_actions`
  UNION ALL
  SELECT created_at, user_id FROM `758470639878.reporting_db.stories`
),
monthly_content AS (
  SELECT
    DATE_FORMAT(created_at, '%Y-%m-01') AS period,
    user_id,
    COUNT(*) AS total_content
  FROM content
  WHERE DATE_FORMAT(created_at, '%Y-%m') = $1
  GROUP BY period, user_id
),
active_monthly_content AS (
  SELECT mc.period, mc.user_id, mc.total_content
  FROM monthly_content mc
  JOIN `758470639878.reporting_db.users` u ON u.id = mc.user_id
  WHERE u.suspended IS NULL 
    AND u.id IN (1502307,408175,1429274,47925,24971,48190,1506452,37642,1420845,382837,6936,117,279659,380963,351567,1429452,1506337,424980,1291548,212883,17898,654385,1522723,209251,13202,1506448,1418561,1503807,16938,1162563,546441,181,216994,1417193,554500,1435337,1466314,1435335,12688)
),
ranked AS (
  SELECT
    period,
    user_id,
    total_content,
    ROW_NUMBER() OVER (PARTITION BY period ORDER BY total_content DESC) AS position
  FROM active_monthly_content
)
SELECT
  r.user_id,
  u.name AS user_name,
  r.total_content AS metric_value,
  'posts' AS unit
FROM ranked r
JOIN `758470639878.reporting_db.users` u ON u.id = r.user_id
WHERE r.position <= 5
ORDER BY r.position;