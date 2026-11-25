# Oracle Forms take-home task

This repository is a take-home task I received after a job interview.

It is a small learning project: two Oracle Forms screens, the SQL behind them, and the
notes I made while building them.

The forms are built by hand in Oracle Forms Builder. This repository holds the SQL,
the step-by-step build instructions and the trigger code, not a compiled module.

## Requirements from the task

1. **List Item + dynamic LOV**
   A form with a Lookup-type item, implemented here as a List Item with static list
   elements, plus an LOV. Choosing a different value in the list changes what the LOV
   returns. Example: choosing a department makes the LOV show only that department's
   employees.
2. **Hierarchical Tree + path text**
   A form with a Hierarchical Tree item with at least 3 levels, and a text item below
   the tree. Selecting a node shows the full path of that node in the text item.
   Example: `CEO -> Procurement Deputy -> Procurement Manager`.

## Folder map

```
.
├── README.md
├── .gitignore
├── package.json              -- Next.js companion app
├── src/app/                  -- Persian interface and simulator
├── public/                   -- read-only copies of source files for in-app links
├── sql/
│   ├── 01_schema.sql        -- three tables
│   ├── 02_seed.sql          -- sample data used by both forms
│   ├── 03_tree_query.sql    -- the 5-column query behind the hierarchical tree
│   └── 99_drop.sql          -- drops the three tables
├── forms/
│   ├── task1_list_and_dynamic_lov/
│   │   ├── BUILD_STEPS.md   -- step-by-step in Forms Builder
│   │   └── triggers.sql     -- WHEN-LIST-CHANGED code
│   └── task2_tree_path/
│       ├── BUILD_STEPS.md   -- step-by-step in Forms Builder
│       └── triggers.sql     -- WHEN-NEW-FORM-INSTANCE and WHEN-TREE-NODE-SELECTED
└── docs/
    ├── ENVIRONMENT.md       -- installation notes (template, to be filled in)
    ├── VIDEO_SCRIPT.md      -- outline for the screen recording
    ├── TEST_CHECKLIST.md    -- what to test after building
    └── VERIFY.md            -- what I still have to confirm in Forms Builder
```

## Data model

| Table | Used by | Purpose |
| --- | --- | --- |
| `departments` | Task 1 | values shown in the List Item |
| `employees` | Task 1 | rows returned by the LOV, filtered by department |
| `org_hierarchy` | Task 2 | self-referencing tree via `parent_id` |

## How to run the SQL

You need an Oracle Database instance and a user that may create tables.
The scripts were written for Oracle Database 19c and use only conservative,
long-standing syntax. Replace the placeholders with your own values.

```text
User:      <db_user>
Password:  <db_user_password>   (do not commit it)
Connect:   <db_alias>           (for example from tnsnames.ora)
```

1. Connect with SQL*Plus or SQL Developer.
2. Run the scripts in this order:

```sql
-- SQL*Plus:
@sql/01_schema.sql
@sql/02_seed.sql
@sql/03_tree_query.sql
```

In SQL Developer, open each file and run it as a script (F5); the statement
terminator `;` is already in the files.

To start over, run `sql/99_drop.sql` first, then the three scripts again.

## How form 1 works (list + dynamic LOV)

- `EMP_BLK` is a control block (non-database), so nothing is saved to a table.
- `DEPT_LIST` is a List Item with three static elements: `Procurement = 1`,
  `Warehouse = 2`, `IT = 3`.
- `EMP_NAME` is the text item that has the LOV `LOV_EMP`; `EMP_ID` is filled from the
  LOV column mapping, not by its own LOV.
- The Record Group `RG_EMP` reads `employees` and filters on the selected
  department through a bind to the item:

```sql
SELECT emp_name, emp_id
FROM   employees
WHERE  dept_id = :EMP_BLK.DEPT_LIST
ORDER  BY emp_name
```

`DEPT_LIST` is a Number item, so no `TO_NUMBER` is needed. The List Item must have
`Automatic Refresh` (or the equivalent "refresh the LOV each time it opens" property)
turned on, otherwise the LOV may keep rows from the previous department.

- A `WHEN-LIST-CHANGED` trigger on `DEPT_LIST` clears the two employee items,
  moves the cursor to `EMP_NAME` and opens the LOV again. Because the Record Group
  query is re-evaluated with the new value, the LOV shows the employees of the
  department that is now selected.

Full build steps: `forms/task1_list_and_dynamic_lov/BUILD_STEPS.md`.

## How form 2 works (tree + path)

- `NAV` is a control block. `TREE_ORG` is a Hierarchical Tree item. Its Data Query
  (the query text property in the Data group) is the 5-column query from
  `sql/03_tree_query.sql`: node state, depth, label, icon, value.
- The fifth column (value) contains the full path of the node, built with
  `SYS_CONNECT_BY_PATH`, so the tree can simply display it.
- `WHEN-NEW-FORM-INSTANCE` populates the tree with `FTREE.POPULATE_TREE`.
- `WHEN-TREE-NODE-SELECTED` reads the value of the selected node and puts it into
  the text item `PATH_TXT`, which sits under the tree.

Full build steps: `forms/task2_tree_path/BUILD_STEPS.md`.

## Status

Everything below is **not done yet**. I tick the boxes myself after building and
testing the forms. Nothing in this repository has been run or verified so far.

- [ ] `sql/01_schema.sql` and `sql/02_seed.sql` run without errors on Oracle 19c
- [ ] `sql/03_tree_query.sql` returns 7 rows with the expected paths
- [ ] Task 1 form compiles in Forms Builder
- [ ] Task 1: changing the department changes the LOV rows
- [ ] Task 2 form compiles in Forms Builder
- [ ] Task 2: the tree shows 3 levels
- [ ] Task 2: clicking a node shows the correct path in the text item
- [ ] Both forms run in the browser
- [ ] `docs/ENVIRONMENT.md` filled in
- [ ] `docs/TEST_CHECKLIST.md` completed
- [ ] `.fmb` source files added to this repository
- [ ] Screen recording recorded and link added

## Known limitations / still to verify

- **Nothing has been executed.** No form was compiled, no trigger was fired and no
  SQL statement was run. The code was written from the documentation, not tested.
- **No `.fmb` files yet.** They are created by following the `BUILD_STEPS.md` files
  in Forms Builder. Compressed modules are excluded by `.gitignore`, the source
  `.fmb` files are kept on purpose.
- **A few Forms built-ins and one bind variable usage need confirmation** before I
  can claim they work: see `docs/VERIFY.md`.
- **Environment notes are a template.** Version numbers, install order and problems
  met are `TODO(owner)` and must be filled in from the real machine.
- **No video link yet.** The outline is in `docs/VIDEO_SCRIPT.md`; the recording is
  `TODO(owner)`.
- The sample data is English only, because Forms has RTL and encoding issues with
  other scripts.

## Persian companion web app

A small Next.js companion is available in the same repository. Its Persian-language
installation guide is intentionally conservative, and both form previews are browser
simulations using sample data; they do not connect to Oracle and are not evidence that
the Forms modules work.

Run it locally with a current Node.js release supported by the installed Next.js version:

```sh
npm install
npm run dev
```

Open the local URL printed by Next.js. The personal checklist and environment notes are
stored only in that browser's local storage. No Oracle credentials, connection strings,
or profile details are requested or transmitted by this app.

The guide does not claim that a VPN bypasses Oracle's terms, licensing, account checks,
or download restrictions. Use accurate account information and consult the official
installation and certification documentation for the exact product releases in use.
