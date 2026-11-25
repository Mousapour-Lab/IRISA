-- triggers.sql
-- Task 2: Hierarchical Tree and the path text item.
--
-- Paste the code below into the triggers named in each section, in Forms Builder.
-- The block NAV is a control block.
--
-- NOT EXECUTED. Nothing here has been compiled or run. See ../../docs/VERIFY.md.

-- ===========================================================================
-- Trigger 1: WHEN-NEW-FORM-INSTANCE (form-level trigger)
-- ===========================================================================
--
-- Populates the tree item from its Data Query. Without this call the tree stays
-- empty at runtime, even when the query is correct.
--
-- The argument is the full item name: block.item

FTREE.POPULATE_TREE('NAV.TREE_ORG');


-- ===========================================================================
-- Trigger 2: WHEN-TREE-NODE-SELECTED (trigger of item NAV.TREE_ORG)
-- ===========================================================================
--
-- MAIN VERSION.
-- Reads the tree's value column (the 5th column of the Data Query, which holds the
-- full path) for the node the user selected and writes it into PATH_TXT.
--
-- I use :SYSTEM.TRIGGER_NODE because I found it in the Forms documentation, and I
-- did not find FTREE.SELECTED_NODE there. Both are worth trying if this returns
-- NULL. VERIFY (docs/VERIFY.md, point 2).

DECLARE
  htree ITEM;
BEGIN
  htree := FIND_ITEM('NAV.TREE_ORG');
  IF :SYSTEM.TRIGGER_NODE_SELECTED = 'TRUE' THEN
    :NAV.PATH_TXT := FTREE.GET_TREE_NODE_PROPERTY(htree, :SYSTEM.TRIGGER_NODE, FTREE.NODE_VALUE);
  END IF;
END;


-- ===========================================================================
-- ALTERNATIVE (fallback) — use only if the main version returns NULL
-- ===========================================================================
--
-- Builds the path from the node labels instead of the value column, by walking up
-- with FTREE.GET_TREE_NODE_PARENT until FTREE.ID_NULL is true, then prepending the
-- label of each ancestor.
--
-- This version depends on three things I have not confirmed:
--   * FTREE.GET_TREE_NODE_PARENT(htree, node) returning a node
--   * FTREE.NODE_LABEL as the property constant for the label text
--   * FTREE.ID_NULL(node) as the test for "no more parent" (the root's parent)
-- A NODE is a special type, so do not test it with "IS NOT NULL"; keep the
-- FTREE.ID_NULL(...) condition for the loop.
-- VERIFY (docs/VERIFY.md, points 3 and 4).

/*
DECLARE
  htree  ITEM;
  v_node FTREE.NODE;
  v_path VARCHAR2(4000);
BEGIN
  htree := FIND_ITEM('NAV.TREE_ORG');

  IF :SYSTEM.TRIGGER_NODE_SELECTED = 'TRUE' THEN
    v_node := :SYSTEM.TRIGGER_NODE;
    v_path := NULL;

    WHILE NOT FTREE.ID_NULL(v_node) LOOP
      v_path := FTREE.GET_TREE_NODE_PROPERTY(htree, v_node, FTREE.NODE_LABEL)
                || CASE WHEN v_path IS NULL THEN NULL ELSE ' -> ' || v_path END;
      v_node := FTREE.GET_TREE_NODE_PARENT(htree, v_node);
    END LOOP;

    :NAV.PATH_TXT := v_path;
  END IF;
END;
*/


-- ===========================================================================
-- Notes
-- ===========================================================================
--
-- * The fallback is wrapped in a block comment so that copy/paste of this whole
--   file into the trigger does not produce a PL/SQL error. Remove the /* and */
--   lines when you actually use it.
--
-- * Do not assign PATH_TXT in this trigger if you also plan to let the user edit
--   it: keep the item's Updateable property as is and just display the value.
--
-- * Concatenation uses ' -> ' to match the separator in SYS_CONNECT_BY_PATH, so
--   both versions produce the same string.
--
-- * If PATH_TXT stays empty, first check that the WHEN-TREE-NODE-SELECTED trigger
--   is attached to NAV.TREE_ORG (not to the block or the form), then log the value
--   with MESSAGE(:SYSTEM.TRIGGER_NODE_SELECTED).
