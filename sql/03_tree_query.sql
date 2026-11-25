-- 03_tree_query.sql
-- The 5-column query used as the Data Query of the Hierarchical Tree item
-- (task 2). Oracle Forms expects exactly this order:
--
--   1. node state :  1 = expanded, -1 = collapsed, 0 = leaf
--   2. depth      :  LEVEL
--   3. label      :  text shown in the tree
--   4. icon       :  NULL here, so Forms uses its default icons
--   5. value      :  data stored with the node. Here: the full path.
--
-- TEST THIS QUERY IN SQL*PLUS OR SQL DEVELOPER BEFORE PASTING IT INTO FORMS.
-- If the query fails or returns the wrong shape, the tree will stay empty and
-- Forms will not tell you much about the reason.
--
-- Expected: 6 rows, for example
--   level 1 : CEO
--   level 2 : CEO -> Procurement Deputy
--   level 3 : CEO -> Procurement Deputy -> Procurement Manager

SELECT CASE WHEN CONNECT_BY_ISLEAF = 1 THEN 0 WHEN LEVEL = 1 THEN 1 ELSE -1 END,
       LEVEL,
       org_name,
       NULL,
       SUBSTR(SYS_CONNECT_BY_PATH(org_name, ' -> '), 5)
FROM   org_hierarchy
START WITH parent_id IS NULL
CONNECT BY PRIOR org_id = parent_id
ORDER SIBLINGS BY org_name;

-- Notes
-- * SYS_CONNECT_BY_PATH returns ' -> CEO -> Procurement Deputy'.
--   SUBSTR(..., 5) removes the leading ' -> ' (4 characters), so the first level
--   shows just 'CEO' and the deeper levels show the whole path.
-- * The state column is 1 for the root, -1 for intermediate nodes and 0 for
--   leaves, so the tree opens with the root expanded and the rest collapsed.
-- * ORDER SIBLINGS BY keeps siblings in alphabetical order at every level.
