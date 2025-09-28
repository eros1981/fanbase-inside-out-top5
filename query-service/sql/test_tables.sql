-- Test query to see what tables are available in the dataset
-- This will help us understand the data structure

-- List all tables in the dataset
SELECT 
  table_name,
  table_type,
  creation_time
FROM `758470639878.fanbase-reporting.INFORMATION_SCHEMA.TABLES`
WHERE table_type = 'BASE TABLE'
ORDER BY table_name;

-- Test if specific tables exist and have data
SELECT 'users' as table_name, COUNT(*) as row_count FROM `758470639878.fanbase-reporting.users` WHERE 1=1
UNION ALL
SELECT 'revenues' as table_name, COUNT(*) as row_count FROM `758470639878.fanbase-reporting.revenues` WHERE 1=1
UNION ALL
SELECT 'flickz' as table_name, COUNT(*) as row_count FROM `758470639878.fanbase-reporting.flickz` WHERE 1=1
UNION ALL
SELECT 'posts' as table_name, COUNT(*) as row_count FROM `758470639878.fanbase-reporting.posts` WHERE 1=1
UNION ALL
SELECT 'livestreams' as table_name, COUNT(*) as row_count FROM `758470639878.fanbase-reporting.livestreams` WHERE 1=1;
