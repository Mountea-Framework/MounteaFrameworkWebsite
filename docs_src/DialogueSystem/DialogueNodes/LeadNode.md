---
tags:
  - reference
  - dialogue
  - nodes
  - lead-node
---

# Lead Node

Lead Node is the workhorse for NPC dialogue - the node type you'll place the most while building a conversation. This page covers what data it needs and why it fires on its own without you asking it to.

---

## 1. What Lead Node Is

`UMounteaDialogueGraphNode_LeadNode` derives from `UMounteaDialogueGraphNode_DialogueNodeBase` and - like Answer and Complete - **doesn't override `ProcessNode`.** It runs the exact same inherited logic described on the [Dialogue Node Intro](DialogueNode.md) page: pull the active `FDialogueRow` from its `DataTable`/`RowName`, push it into the context, then run decorators. What makes a Lead Node behave like "an NPC line" is configuration, not a unique code path:

- **`Does Auto Start` is `true`.** As soon as traversal reaches a Lead Node, it starts on its own - no player action required. This is the concrete mechanism behind "Lead Node represents NPC lines": nobody has to click anything for the NPC to speak.
- **Requires a Dialogue Data Table.** Lead Node inherits `DataTable`/`RowName` from `DialogueNodeBase` - without a valid table and row, `ValidateNodeRuntime` fails and the Dialogue refuses to start.
- **Blueprintable.** Unlike Start Node or Delay Node, you can create a Blueprint (or C++) subclass of Lead Node if you need custom behaviour on top of it.

!!! info
    Lead Node accepts connections from Start Node, Answer Node, another Lead Node, and Delay Node. It does **not** accept a direct connection from Complete Node, which matches Complete's role as a dialogue-ending node.

<!-- TODO(image): Lead Node selected in the graph editor, Details panel showing DataTable/RowName - no existing asset. -->

---

## 2. Setting Up a Lead Node

=== "Blueprint"
    1. Right-click on the graph canvas (or drag from an existing node's output pin) and add a **Lead Node**.
    2. In the **Details** panel, set **Data Table** to a `DialogueRow`-structured Data Table.
    3. Pick a **Row Name** - the editor shows a text preview inline once a valid row is selected.
    4. Connect its output pin to whatever should happen next (an Answer Node to offer the player choices, another Lead Node to keep talking, or Complete Node to end things).

=== "C++"
    ```cpp
    #include "Nodes/MounteaDialogueGraphNode_LeadNode.h"

    // Blueprintable - safe to subclass if you need extra behaviour
    class UMyCustomLeadNode : public UMounteaDialogueGraphNode_LeadNode
    {
        // DataTable / RowName come from UMounteaDialogueGraphNode_DialogueNodeBase
    };
    ```

!!! warning
    A Lead Node with no `DataTable` or an empty `RowName` fails runtime validation. Since validation runs across the whole Graph before a Dialogue can start, one unfinished Lead Node is enough to block the entire conversation from playing.

---

## 3. Next Steps

<div class="card-grid">
  <div class="card next-steps answerNode">
    <h4 class="card-title">Answer Node</h4>
    <p class="card-description">Give players a choice instead of an automatic line</p>
    <a href="../AnswerNode" class="card-link"></a>
  </div>
</div>
