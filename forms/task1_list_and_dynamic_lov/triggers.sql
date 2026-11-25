-- triggers.sql
-- Task 1: List Item with a dynamic LOV.
--
-- Paste the code below into the trigger named in each section, in Forms Builder.
-- The block is a control block, so no database transaction is involved.
--
-- NOT EXECUTED. This code has not been compiled or run. See ../../docs/VERIFY.md.

-- ===========================================================================
-- Trigger 1: WHEN-LIST-CHANGED on item EMP_BLK.DEPT_LIST
-- ===========================================================================
--
-- Fires each time the user picks another value in the list.
-- 1. clear the values that belonged to the previous department
-- 2. put the cursor on the LOV item
-- 3. open the LOV, so the new rows (filtered by the new value) are visible
--
-- The Record Group query itself is NOT changed here. It is re-evaluated when the
-- LOV opens and reads the current value of :EMP_BLK.DEPT_LIST.
--
-- requires: the items EMP_NAME and EMP_ID, and the LOV assigned to EMP_NAME.

:EMP_BLK.EMP_NAME := NULL;
:EMP_BLK.EMP_ID   := NULL;

GO_ITEM('EMP_BLK.EMP_NAME');

LIST_VALUES;   -- optional extra: opens the LOV automatically


-- ===========================================================================
-- Minimal version, if LIST_VALUES turns out to be a problem
-- ===========================================================================
-- If opening the LOV from the trigger is not wanted, delete the last line of the
-- trigger above and keep only the three statements. The LOV then opens when the
-- user presses the LOV button. Everything else behaves the same.

-- :EMP_BLK.EMP_NAME := NULL;
-- :EMP_BLK.EMP_ID   := NULL;
-- GO_ITEM('EMP_BLK.EMP_NAME');


-- ===========================================================================
-- Reference: the Record Group query (this belongs in RG_EMP, not in a trigger)
-- ===========================================================================
--
-- SELECT emp_name, emp_id
-- FROM   employees
-- WHERE  dept_id = TO_NUMBER(:EMP_BLK.DEPT_LIST)
-- ORDER  BY emp_name
--
-- TO_NUMBER is used because the List Item stores its values as numbers (1, 2, 3)
-- while dept_id is a NUMBER: the conversion makes the intent explicit and keeps
-- the comparison away from implicit character conversion.
