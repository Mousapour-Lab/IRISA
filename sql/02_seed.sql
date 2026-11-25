-- 02_seed.sql
-- Sample data for both tasks.
-- Text is English only: Forms has RTL and encoding problems with other scripts.
--
-- Run as: sqlplus <db_user>@<db_alias> @sql/02_seed.sql

INSERT INTO departments (dept_id, dept_name) VALUES (1, 'Procurement');
INSERT INTO departments (dept_id, dept_name) VALUES (2, 'Warehouse');
INSERT INTO departments (dept_id, dept_name) VALUES (3, 'IT');

INSERT INTO employees (emp_id, emp_name, dept_id) VALUES (101, 'Ali Rezaei', 1);
INSERT INTO employees (emp_id, emp_name, dept_id) VALUES (102, 'Sara Ahmadi', 1);
INSERT INTO employees (emp_id, emp_name, dept_id) VALUES (103, 'Reza Karimi', 2);
INSERT INTO employees (emp_id, emp_name, dept_id) VALUES (104, 'Neda Hosseini', 2);
INSERT INTO employees (emp_id, emp_name, dept_id) VALUES (105, 'Omid Taheri', 3);
INSERT INTO employees (emp_id, emp_name, dept_id) VALUES (106, 'Maryam Saberi', 3);

-- Tree: 3 levels, 7 nodes.
--   Level 1: CEO
--   Level 2: Procurement Deputy, Operations Deputy, Finance Deputy
--   Level 3: Procurement Manager (under Procurement Deputy)
--            Warehouse Manager   (under Operations Deputy)
--            Accounting Manager  (under Finance Deputy)
INSERT INTO org_hierarchy (org_id, org_name, parent_id, org_type) VALUES (1, 'CEO', NULL, 'COMPANY');
INSERT INTO org_hierarchy (org_id, org_name, parent_id, org_type) VALUES (2, 'Procurement Deputy', 1, 'DIVISION');
INSERT INTO org_hierarchy (org_id, org_name, parent_id, org_type) VALUES (3, 'Finance Deputy', 1, 'DIVISION');
INSERT INTO org_hierarchy (org_id, org_name, parent_id, org_type) VALUES (7, 'Operations Deputy', 1, 'DIVISION');
-- The manager rows come last: each parent_id must already exist, otherwise the
-- foreign key rejects the insert (ORA-02291).
INSERT INTO org_hierarchy (org_id, org_name, parent_id, org_type) VALUES (4, 'Procurement Manager', 2, 'DEPARTMENT');
INSERT INTO org_hierarchy (org_id, org_name, parent_id, org_type) VALUES (5, 'Warehouse Manager', 7, 'DEPARTMENT');
INSERT INTO org_hierarchy (org_id, org_name, parent_id, org_type) VALUES (6, 'Accounting Manager', 3, 'DEPARTMENT');

COMMIT;
