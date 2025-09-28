-- Test query to see what tables are available in the dataset
-- This will help us understand the data structure

-- List all tables in the dataset
SELECT 
  table_name,
  table_type,
  creation_time
FROM `758470639878.fanbase_data.INFORMATION_SCHEMA.TABLES`
WHERE table_type = 'BASE TABLE'
ORDER BY table_name;

-- Alternative: List tables with row counts
-- SELECT 
--   table_name,
--   row_count
-- FROM `758470639878.fanbase_data.__TABLES__`
-- ORDER BY row_count DESC;
