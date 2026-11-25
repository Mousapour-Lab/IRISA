# Video script (2–4 minutes)

Screen recording, no slides. Plain outline. The TODO items are for me to fill in
while recording; the timings are targets, not promises.

## 1. Intro (~10 s)

- Who I am is not the point; the task is. One sentence:
  "Two Oracle Forms screens from a take-home task: a dynamic LOV and a tree with a path."
- Say that the forms were built in Forms Builder and that the data comes from three
  small tables.

## 2. Tables and data (~30 s)

- Show `sql/01_schema.sql`: three tables, `org_hierarchy.parent_id` makes the tree.
- Show the seed data: 3 departments, 6 employees, 6 organisation nodes with 3 levels.
- Mention that the data is English-only on purpose (Forms has RTL/encoding issues).

## 3. Task 1 — List Item and dynamic LOV (~60 s)

- Open the form, show the three items.
- Select `Procurement`, open the LOV, show the 2 employees.
- Change to `Warehouse`, open the LOV again: different 2 employees. Say the point out
  loud: "the list value changes, so the LOV rows change."
- Change to `IT`, show 2 other employees.
- Pick a row: `EMP_NAME` and `EMP_ID` are filled.
- Change the department again and show that both fields are cleared.

## 4. Task 2 — Tree and path (~60 s)

- Open the form, show the tree with 3 levels.
- Click `CEO`, show the path text.
- Click `Procurement Deputy`, then `Procurement Manager`, show the growing path.
- Click `Warehouse Manager` (sibling of the previous node) and show that the path is
  different and correct.
- Click `Finance Deputy` and `Accounting Manager` for the second branch.
- Optional: show the 5-column query in SQL Developer explaining label and value.

## 5. Triggers (~30 s)

- Show `WHEN-LIST-CHANGED` on `DEPT_LIST`: clear, `GO_ITEM`, `LIST_VALUES`.
- Show the Record Group query with the bind to `DEPT_LIST`.
- Show `WHEN-NEW-FORM-INSTANCE` with `FTREE.POPULATE_TREE`.
- Show `WHEN-TREE-NODE-SELECTED` with `FTREE.GET_TREE_NODE_PROPERTY(... NODE_VALUE)`.
- One sentence on why `:SYSTEM.TRIGGER_NODE` and not `FTREE.SELECTED_NODE`:
  I could not confirm the latter.

## 6. Environment (~20 s)

- Show which version of Forms and Database is used (from `docs/ENVIRONMENT.md`).
- One sentence on the biggest installation problem and how it was solved.
- `TODO(owner)` — fill in with the real version numbers and the real problem.

## 7. Closing (~10 s)

- What works, what is still open (point at `docs/VERIFY.md`).
- "The repository has the SQL, the build steps and the trigger code."

## Recording notes

- Resolution and length: `TODO(owner)`.
- Upload location and link: `TODO(owner)` — the link goes into `README.md` only after
  the video exists.
- Record with the mouse visible; pause briefly after each click so the viewer can
  follow which node or value was chosen.
