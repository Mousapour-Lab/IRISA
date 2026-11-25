# Task 2 — Hierarchical Tree with a path text item

Goal: a form with a Hierarchical Tree item that shows 3 levels, and a text item
below it. Selecting a node writes the full path of that node into the text item,
for example `CEO -> Procurement Deputy -> Procurement Manager`.

All items live in a **control block** (non-database).

> These are instructions, not a finished module. They were written from the Forms
> documentation and the interview notes and have **not** been executed yet.
> See `../../docs/VERIFY.md`.

Names used below (the trigger code depends on them):

| Object | Name |
| --- | --- |
| Block | `NAV` |
| Tree item | `TREE_ORG` |
| Text item | `PATH_TXT` |
| Content Canvas | `CANVAS_TREE` |

Prerequisite: the tables exist and are seeded (`sql/01_schema.sql`,
`sql/02_seed.sql`).

## Step 0 — test the query outside Forms

Before building anything: open `sql/03_tree_query.sql`, run it in SQL*Plus or
SQL Developer and check that it returns 7 rows in 5 columns, with the path in the
last column. If this step fails, the tree will be empty and Forms will not explain
why. Fix the query in SQL first.

## Build steps

1. **Create the form.**
   `File > New > Form`. `File > Save As`, save as `form_task2.fmb` in this folder.
   *(Created on my machine and added to the repository afterwards.)*

2. **Create the content canvas.**
   `Canvases > Create`. `Name = CANVAS_TREE`, `Canvas Type = Content`,
   `Window = MAIN_WINDOW`.

3. **Create the control block.**
   `Blocks > Create`. `Name = NAV`, `Database Data Block = No`,
   `Query Data Source Type = None`, `Canvas = CANVAS_TREE`.

4. **Create the tree item.**
   Select `NAV`, then `Items > Create`:
   - `Name = TREE_ORG`
   - `Item Type = Hierarchical Tree`
   - `Canvas = CANVAS_TREE`
   - `Width` / `Height` large enough for 7 nodes (for example 300 x 200)
   - `Database Item = No`

   Open the property group that holds the tree query. My notes say `Data Query`; in
   the Property Palette it may be called `Data Source Data Type` plus `Query Text`.
   Use whatever name you actually see there, and set it to the 5-column query from
   `sql/03_tree_query.sql` (the whole `SELECT ... ORDER SIBLINGS BY org_name`,
   without the trailing semicolon is safest; paste it and compile):

   ```sql
   SELECT CASE WHEN CONNECT_BY_ISLEAF = 1 THEN 0 WHEN LEVEL = 1 THEN 1 ELSE -1 END,
          LEVEL,
          org_name,
          NULL,
          SUBSTR(SYS_CONNECT_BY_PATH(org_name, ' -> '), 5)
   FROM   org_hierarchy
   START WITH parent_id IS NULL
   CONNECT BY PRIOR org_id = parent_id
   ORDER SIBLINGS BY org_name
   ```

   Column meaning expected by Forms, in this order: node state (1 expanded,
   -1 collapsed, 0 leaf), depth, label, icon, value. The value column holds the
   full path.

   Also set `Show Lines = Yes` and `Allow Multiple Selection = No` if these
   properties are offered; both are cosmetic/convenience only.

5. **Create the text item under the tree.**
   `Items > Create` in block `NAV`:
   - `Name = PATH_TXT`
   - `Item Type = Text Item`
   - `Canvas = CANVAS_TREE`
   - `Data Type = Char`, `Width = 200`
   - `Database Item = No`
   - place it below `TREE_ORG` on the canvas, with a prompt such as `Selected path`.

   Check `Canvas` and `Visible` on both items (see step 10 of task 1 for why).

6. **Trigger `WHEN-NEW-FORM-INSTANCE`.**
   This trigger is normally on the form module: in the Object Navigator select the
   form module itself, `Triggers > Create`, choose `WHEN-NEW-FORM-INSTANCE`, and
   paste:

   ```plsql
   FTREE.POPULATE_TREE('NAV.TREE_ORG');
   ```

   Without this call the tree area stays empty even though the query is correct.

7. **Trigger `WHEN-TREE-NODE-SELECTED` on the tree item.**
   Select the trigger node of `NAV.TREE_ORG`, `Triggers > Create`, choose
   `WHEN-TREE-NODE-SELECTED`, and paste the main version from `triggers.sql`.

8. **Alternative, if the value column does not arrive.**
   `triggers.sql` also contains a fallback that walks up the tree with
   `FTREE.GET_TREE_NODE_PARENT` and `FTREE.NODE_LABEL` and concatenates the labels.
   It produces the same string without relying on the value column. It is marked
   **VERIFY**: I have not confirmed those built-in names.

9. **Compile.**
   `Program > Compile Incremental`. PL/SQL errors appear in the compile window;
   an unknown `FTREE` function shows up here.

10. **Run.**
    `Program > Run Form`. The tree should show `CEO` expanded with its children.
    Click nodes at level 1, 2 and 3 and watch `PATH_TXT`.

11. **Save** and add `form_task2.fmb` to this folder.

## Expected behaviour

For the seed data the tree looks like this (siblings sorted by name):

```
CEO
├── Finance Deputy
│   └── Accounting Manager
├── Operations Deputy
│   └── Warehouse Manager
└── Procurement Deputy
    └── Procurement Manager
```

| Clicked node | Level | Text in `PATH_TXT` |
| --- | --- | --- |
| CEO | 1 | `CEO` |
| Finance Deputy | 2 | `CEO -> Finance Deputy` |
| Accounting Manager | 3 | `CEO -> Finance Deputy -> Accounting Manager` |
| Operations Deputy | 2 | `CEO -> Operations Deputy` |
| Warehouse Manager | 3 | `CEO -> Operations Deputy -> Warehouse Manager` |
| Procurement Deputy | 2 | `CEO -> Procurement Deputy` |
| Procurement Manager | 3 | `CEO -> Procurement Deputy -> Procurement Manager` |

The sibling check (Warehouse Manager vs Procurement Manager) is the one that proves
the value belongs to the node and is not just the last row of the tree: same depth,
different parent.

## Not verified

- That the tree populates from `WHEN-NEW-FORM-INSTANCE` in this environment.
- The exact type of `:SYSTEM.TRIGGER_NODE` and the exact `FTREE` constants.
- The fallback built-in names.
- That the browser runtime works here.
