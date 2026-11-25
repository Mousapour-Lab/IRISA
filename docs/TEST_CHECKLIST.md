# Test checklist

To be run by me after building both forms. Every line is unchecked: none of this has
been tested yet. Tick a box and note the date when it passes.

Legend: **expected** = what the form should do according to the build steps.

## Environment

- [ ] The database scripts ran in the order `01_schema.sql`, `02_seed.sql` without errors.
- [ ] `SELECT COUNT(*) FROM departments;` returns 3, `employees` returns 6,
      `org_hierarchy` returns 7.
- [ ] Forms Builder opens and compiles `form_task1.fmb` and `form_task2.fmb`.
- [ ] The form runs (browser runtime) and the DB connection works with `<db_user>`.
- [ ] No password, wallet or connection string is stored in the repository.

## Task 1 — List Item and dynamic LOV

- [ ] The form opens and all three items are visible (`DEPT_LIST`, `EMP_NAME`, `EMP_ID`).
- [ ] The list shows exactly `Procurement`, `Warehouse`, `IT`.
- [ ] Selecting `Procurement` and opening the LOV shows 2 rows: Ali Rezaei, Sara Ahmadi.
- [ ] Changing the department to `Warehouse` and opening the LOV shows 2 different
      rows: Neda Hosseini, Reza Karimi. (The rows must change; this is the main point.)
- [ ] Changing to `IT` shows Omid Taheri, Maryam Saberi.
- [ ] Picking a row fills both `EMP_NAME` and `EMP_ID` with the matching values.
- [ ] Changing the department clears `EMP_NAME` and `EMP_ID` (no stale employee left).
- [ ] Changing the department does not raise an error (FRM-4xxxx) at any point.
- [ ] Opening the LOV with no value selected (empty list) shows no error and no
      misleading rows.
- [ ] Typing an employee name that is not in the LOV does not fail validation
      (`Validate from List = No`).
- [ ] The cursor lands on `EMP_NAME` after a department change.

## Task 2 — Hierarchical Tree and path

- [ ] Before building: `sql/03_tree_query.sql` returns 7 rows and 5 columns in SQL*Plus.
- [ ] The tree shows 3 levels: CEO, then three deputies, then three managers.
- [ ] The tree is populated when the form opens (not only after a refresh).
- [ ] The root `CEO` starts expanded or can be expanded with a double click.
- [ ] Clicking `CEO` (level 1) shows `CEO`.
- [ ] Clicking `Procurement Deputy` (level 2) shows `CEO -> Procurement Deputy`.
- [ ] Clicking `Procurement Manager` (level 3) shows
      `CEO -> Procurement Deputy -> Procurement Manager`.
- [ ] Clicking `Operations Deputy` (level 2) shows `CEO -> Operations Deputy`.
- [ ] Clicking `Warehouse Manager` (level 3) shows
      `CEO -> Operations Deputy -> Warehouse Manager`. This is the sibling test: same
      depth as the previous node, different parent, so the path must differ.
- [ ] Clicking `Finance Deputy` (level 2) shows `CEO -> Finance Deputy`.
- [ ] Clicking `Accounting Manager` (level 3) shows `CEO -> Finance Deputy -> Accounting Manager`.
- [ ] Selecting a node twice in a row keeps the text correct (no duplicated path).
- [ ] Selecting the same node after another one replaces the text, it does not append.
- [ ] The text item is read-only or at least not overwritten by the user in a way
      that breaks the demo.

## Documentation

- [ ] `docs/ENVIRONMENT.md` has no `TODO(owner)` left.
- [ ] `docs/VIDEO_SCRIPT.md` matches the form that was actually built (names, order).
- [ ] The Status checklist in `README.md` reflects reality.
- [ ] `.fmb` files are committed and `.fmx` files are not.

## Notes / problems found

`TODO(owner)` — write the failing test, the message and the fix here.
