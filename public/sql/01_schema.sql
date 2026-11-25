-- 01_schema.sql
-- Three small tables for the two Forms tasks.
-- Written for Oracle Database 19c. Only conservative, long-standing syntax is used.
--
-- Run order: 01_schema.sql -> 02_seed.sql -> 03_tree_query.sql
-- To start over, run 99_drop.sql first, then this script again.
--
-- Run as: sqlplus <db_user>@<db_alias> @sql/01_schema.sql

CREATE TABLE departments (
  dept_id   NUMBER PRIMARY KEY,
  dept_name VARCHAR2(50) NOT NULL
);

CREATE TABLE employees (
  emp_id   NUMBER PRIMARY KEY,
  emp_name VARCHAR2(50) NOT NULL,
  dept_id  NUMBER REFERENCES departments(dept_id)
);

-- Self-referencing table: parent_id points to org_id of the parent row.
CREATE TABLE org_hierarchy (
  org_id    NUMBER PRIMARY KEY,
  org_name  VARCHAR2(100) NOT NULL,
  parent_id NUMBER REFERENCES org_hierarchy(org_id),
  org_type  VARCHAR2(30)
);
