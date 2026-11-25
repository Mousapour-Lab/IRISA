# What I still have to verify in Forms Builder

These are open questions, not results. Every point is unverified: it is written from
documentation and from the interview notes, and none of it has been compiled or run.
Tick a box only after seeing the behaviour in Forms Builder or at runtime.

## 1. A Record Group query can reference an item through a bind

- [ ] Unverified: the Record Group `RG_EMP` accepts the bind variable
      `:EMP_BLK.DEPT_LIST` inside its query, and the query is re-evaluated with the
      item's current value every time the LOV opens.

  How to check: build the LOV, change the list value, open the LOV, and compare the
  rows with `SELECT emp_name FROM employees WHERE dept_id = <value>;` run in
  SQL*Plus. Also compile the Record Group and see whether the bind is accepted at
  all (some Forms versions complain about item binds in a Record Group of type
  Query).

  If it fails: create three Record Groups (one per department) or a single Record
  Group without the bind, and change `RG_EMP` with `SET_GROUP_...` / `POPULATE_GROUP`
  calls in the `WHEN-LIST-CHANGED` trigger instead.

## 2. `:SYSTEM.TRIGGER_NODE` and the value column

- [ ] Unverified: `:SYSTEM.TRIGGER_NODE` is of type `NODE` and can be passed
      directly as the second argument of `FTREE.GET_TREE_NODE_PROPERTY`.
- [ ] Unverified: `FTREE.GET_TREE_NODE_PROPERTY(htree, node, FTREE.NODE_VALUE)`
      returns the 5th column of the tree's Data Query (my path text), not the label
      and not a number.

  How to check: put `MESSAGE('SEL=' || :SYSTEM.TRIGGER_NODE_SELECTED);` in the
  trigger, click a node, then `MESSAGE(FTREE.GET_TREE_NODE_PROPERTY(htree, :SYSTEM.TRIGGER_NODE, FTREE.NODE_VALUE));`
  and compare with the query result. The compile step alone already proves the
  argument types.

## 3. The exact `FTREE` built-in names and constants

- [ ] Unverified: the names used in the fallback exist exactly as written —
      `FTREE.GET_TREE_NODE_PARENT`, `FTREE.NODE_LABEL`, `FTREE.NODE_VALUE`,
      `FTREE.ID_NULL`, and the `NODE` / `ITEM` declarations.
- [ ] Unverified: the fallback loop terminates at the root (the root's parent is
      reported as ID_NULL, not as an empty node).

  How to check: compile the fallback trigger. Unknown identifiers fail at compile
  time, so the compile window answers the naming question immediately. The loop
  itself has to be watched at runtime; check that clicking `CEO` gives exactly
  `CEO` and not `CEO -> ` or an endless loop.

## 4. The tree populates at `WHEN-NEW-FORM-INSTANCE`

- [ ] Unverified: `FTREE.POPULATE_TREE('NAV.TREE_ORG');` at
      `WHEN-NEW-FORM-INSTANCE` is enough, and the tree is visible without an extra
      `SYNCHRONIZE` or a call in `WHEN-NEW-BLOCK-INSTANCE`.

  How to check: run the form with an empty tree area in mind; if the area stays
  empty, first run the Data Query in SQL*Plus / SQL Developer (this is the likely
  cause), then move the call to `WHEN-NEW-BLOCK-INSTANCE`.

## 5. `FTREE.SELECTED_NODE`

- [ ] Unverified: `FTREE.SELECTED_NODE` — the function the interviewer's earlier
      sample used — exists and returns the selected node.
      **I could not confirm it, so I do not use it.** My code uses
      `:SYSTEM.TRIGGER_NODE` instead.

  How to check: try to compile a small trigger that calls it. If it compiles, both
  approaches can be compared; if it does not, the sample was pseudo-code.

## Also unverified, outside Forms

- [ ] The SQL scripts run on Oracle 19c without errors (they were not executed).
- [ ] `sql/03_tree_query.sql` returns 6 rows and the expected path strings.
- [ ] The two forms run in the browser in my environment.
- [ ] The environment notes in `docs/ENVIRONMENT.md` are correct.
