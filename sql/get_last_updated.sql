-- Get the last updated timestamp from BigQuery
-- This query checks the creation time of key tables to determine data freshness

SELECT 
  'Data last updated' AS info,
  MAX(creation_time) AS last_updated
FROM (
  SELECT creation_time FROM `758470639878.reporting_db.INFORMATION_SCHEMA.TABLES` 
  WHERE table_name IN ('users', 'revenues', 'flickz', 'posts', 'livestreams', 'voice_channel_actions', 'stories', 'tvs')
  UNION ALL
  SELECT creation_time FROM `758470639878.reporting_db.INFORMATION_SCHEMA.TABLES` 
  WHERE table_name LIKE 'events_%'
  LIMIT 10
);
