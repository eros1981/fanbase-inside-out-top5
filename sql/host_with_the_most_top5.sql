-- Top 5 Host With The Most query for BigQuery
-- Based on host_with_most query
-- Returns the top 5 users by hosting metrics (livestreams + voice channels) for the specified month
-- Uses parameterized query with $1 as the month parameter (YYYY-MM format)

WITH content AS (
  SELECT 
    DATE_FORMAT(l.created_at, '%Y-%m-01') AS period,
    l.user_id,
    u.name AS user_name 
  FROM `758470639878.reporting_db.livestreams` l 
  JOIN `758470639878.reporting_db.users` u ON u.id = l.user_id 
  WHERE DATE_FORMAT(l.created_at, '%Y-%m') = $1
    AND u.suspended IS NULL 
    AND u.id IN (1502307,408175,1429274,47925,24971,48190,1506452,37642,1420845,382837,6936,117,279659,380963,351567,1429452,1506337,424980,1291548,212883,17898,654385,1522723,209251,13202,1506448,1418561,1503807,16938,1162563,546441,181,216994,1417193,554500,1435337,1466314,1435335,12688)
  UNION ALL 
  SELECT 
    DATE_FORMAT(v.created_at, '%Y-%m-01') AS period,
    v.user_id,
    u2.name AS user_name 
  FROM `758470639878.reporting_db.voice_channel_actions` v 
  JOIN `758470639878.reporting_db.users` u2 ON u2.id = v.user_id 
  WHERE DATE_FORMAT(v.created_at, '%Y-%m') = $1
    AND v.state = 'close'
    AND u2.suspended IS NULL 
    AND u2.id IN (1502307,408175,1429274,47925,24971,48190,1506452,37642,1420845,382837,6936,117,279659,380963,351567,1429452,1506337,424980,1291548,212883,17898,654385,1522723,209251,13202,1506448,1418561,1503807,16938,1162563,546441,181,216994,1417193,554500,1435337,1466314,1435335,12688)
),
per_user AS (
  SELECT 
    period, 
    user_id, 
    user_name, 
    COUNT(*) AS quantity 
  FROM content 
  GROUP BY period, user_id, user_name
),
ranked AS (
  SELECT 
    period, 
    user_id, 
    user_name, 
    quantity, 
    ROW_NUMBER() OVER (PARTITION BY period ORDER BY quantity DESC, user_id) AS position 
  FROM per_user
)
SELECT 
  user_id,
  user_name,
  quantity AS metric_value,
  'events' AS unit
FROM ranked 
WHERE position <= 5 
ORDER BY period, position;