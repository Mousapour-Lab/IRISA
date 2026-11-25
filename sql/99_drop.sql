-- 99_drop.sql
-- Removes the three tables created by 01_schema.sql.
--
-- Children first, because employees and org_hierarchy reference other tables.
-- On a clean schema the DROP statements fail with ORA-00942 (table or view does
-- not exist). That is expected and harmless; just run 01_schema.sql afterwards.
--
-- Run as: sqlplus <db_user>@<db_alias> @sql/99_drop.sql

DROP TABLE employees;
DROP TABLE org_hierarchy;
DROP TABLE departments;
