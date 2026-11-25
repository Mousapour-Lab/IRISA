# Task 1 — List Item with a dynamic LOV

Goal: a form with a department List Item and an employee LOV. Choosing a different
department changes the rows the LOV returns.

All items live in a **control block** (non-database), so the form does not write
anything to the tables.

> This is a set of instructions, not a finished module. I wrote them from the Forms
> documentation and the interview notes; they have **not** been executed yet.
> See `../../docs/VERIFY.md` for the points that need confirmation.

Names used everywhere below (keep them exactly, the trigger code depends on them):

| Object | Name |
| --- | --- |
| Block | `EMP_BLK` |
| List Item | `DEPT_LIST` |
| Text item + LOV display | `EMP_NAME` |
| Text item | `EMP_ID` |
| Record Group | `RG_EMP` |
| LOV | `LOV_EMP` |
| Content Canvas | `CANVAS_MAIN` |

Prerequisite: the tables exist and are seeded (`sql/01_schema.sql`,
`sql/02_seed.sql`).

## Build steps

1. **Create the form.**
   Start Forms Builder, `File > New > Form`. In the Object Navigator keep the
   default form module and give it a clear name, for example `FORM_TASK1`.
   `File > Save As`, save it as `form_task1.fmb` in this folder.
   *(The `.fmb` is created on my machine and added to the repository afterwards.)*

2. **Create the content canvas.**
   In the Object Navigator select `Canvases` and click **Create**. In the Property
   Palette set `Name = CANVAS_MAIN` and `Canvas Type = Content`. Leave
   `Window = MAIN_WINDOW` (the default window is created with the form).

3. **Create the control block.**
   Select `Blocks` and click **Create**. Set `Name = EMP_BLK`.
   On the `Database` property group leave `Database Data Block = No` (this makes it
   a control block). Set `Query Data Source Type = None`.
   Set `Canvas = CANVAS_MAIN` if the property exists on the block; if the items stay
   invisible later, this is one of the causes (see step 9).

4. **Create `DEPT_LIST` as a List Item.**
   Select `EMP_BLK` in the Object Navigator, then `Items > Create`.
   - `Name = DEPT_LIST`
   - `Item Type = List Item`
   - `Canvas = CANVAS_MAIN`
   - `Data Type = Number`, `Width = 20`

   Open the List Item property group and set the static list elements
   (`Elements in List`). Three pairs, label = value:

   | Label | Value |
   | --- | --- |
   | Procurement | 1 |
   | Warehouse | 2 |
   | IT | 3 |

   Leave `Mapping of Other Values` empty (do not put `0` there: 0 is not one of the
   list values) and set `Required = No`, so an empty selection cannot raise an error.

5. **Create the two employee text items.**
   Two more items in the same block, both `Item Type = Text Item`,
   `Canvas = CANVAS_MAIN`, `Database Item = No`:

   | Name | Data Type | Width | Notes |
   | --- | --- | --- | --- |
   | `EMP_NAME` | Char | 50 | will get the LOV |
   | `EMP_ID` | Number | 10 | filled from the LOV |

   Give the block a simple layout: `DEPT_LIST` on top, `EMP_NAME` and `EMP_ID`
   below it, each with its own prompt text item (`DEPT_LIST_PROMPT` etc. are optional).

6. **Create the Record Group `RG_EMP`.**
   Select `Record Groups` and click **Create**. Set `Name = RG_EMP` and
   `Record Group Type = Query`. Paste this into `Record Group Query`:

   ```sql
   SELECT emp_name, emp_id
   FROM   employees
   WHERE  dept_id = :EMP_BLK.DEPT_LIST
   ORDER  BY emp_name
   ```

   `DEPT_LIST` is a Number item and `dept_id` is a NUMBER column, so the comparison
   needs no conversion.

   The Record Group takes its column names from the select list, so the display
   items can be created automatically from `EMP_NAME` and `EMP_ID`. Every row
   returns exactly two values, one per column.
   The bind `:EMP_BLK.DEPT_LIST` is the part I must confirm in Forms — see
   `docs/VERIFY.md`, point 1. If it is not accepted, the fallback is to build the
   query text in the trigger and run `POPULATE_GROUP_WITH_QUERY`.

7. **Create the LOV `LOV_EMP`.**
   Select `LOVs` and click **Create**.
   - `Name = LOV_EMP`
   - `Record Group = RG_EMP`
   - `Title = Employees of the selected department`
   - `Column Mapping Properties`: map the first Record Group column `EMP_NAME`
     to the item `EMP_BLK.EMP_NAME`, and the second column `EMP_ID` to
     `EMP_BLK.EMP_ID`.
   - Return item: `EMP_BLK.EMP_NAME`.
   - Turn on `Automatic Refresh` (the property that makes the LOV re-run its query
     every time it opens). Without it the LOV may keep showing rows from the
     previously selected department.
   - Optional cosmetics: width/height of the LOV window, column titles.

8. **Assign the LOV to the item.**
   Select item `EMP_NAME` and set `LOV = LOV_EMP`.
   In the same Property Palette set `Validate from List = No`, so that typing a free
   value does not fail validation.
   `EMP_ID` gets no LOV of its own: its value arrives through the column mapping.

9. **Check that every item has a Canvas.**
   For each of `DEPT_LIST`, `EMP_NAME`, `EMP_ID` open the Property Palette and
   confirm `Canvas = CANVAS_MAIN`, `Visible = Yes` and a non-zero
   `X Position` / `Y Position`. An item without a canvas is invisible at runtime,
   which looks exactly like a broken form.

10. **Create the trigger.**
    Select the trigger node of `DEPT_LIST` (`EMP_BLK.DEPT_LIST > Triggers`), click
    **Create**, choose `WHEN-LIST-CHANGED`, and paste the code from `triggers.sql`
    in this folder.

11. **Compile.**
    `Program > Compile Incremental` from the menu (the keyboard shortcut is whatever
    your Builder shows; I have not confirmed it). Fix any error shown in
    the compile window before continuing. Common causes: a missing canvas, a typo in
    an item name, a trigger on the wrong node.

12. **Run.**
    `Program > Run Form` (or the Run button on the toolbar). Forms translates the
    module to `.fmx` and starts the client. If the runtime environment is configured
    for the browser, the form opens in the browser instead. See
    `docs/ENVIRONMENT.md`.
    Do not commit the generated `.fmx` file; it is ignored by `.gitignore`.

13. **Save the module** and add `form_task1.fmb` to this folder.

## Expected behaviour

- The form opens with the department list on top.
- Choosing `Warehouse` and opening the LOV on `EMP_NAME` lists
  `Neda Hosseini` and `Reza Karimi` only.
- Choosing `IT` and opening the LOV lists `Maryam Saberi` and `Omid Taheri` only.
- Picking a row fills `EMP_NAME` and `EMP_ID`.
- Changing the department clears both employee items and reopens the LOV.

## Not verified

- That the Record Group query accepts `:EMP_BLK.DEPT_LIST` as a bind variable.
- That Form Builder compiles the module without warnings I did not anticipate.
- That the browser runtime works in this environment.
