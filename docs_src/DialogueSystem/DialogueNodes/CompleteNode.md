---
tags:
  - reference
  - dialogue
  - nodes
  - complete-node
---

# Complete Node

Complete Node is where a branch of your Dialogue Tree ends. This page covers why it ends the Dialogue - and it isn't because of any special "ending" logic baked into the node itself.

---

## 1. What Complete Node Is

`UMounteaDialogueGraphNode_CompleteNode` derives from `UMounteaDialogueGraphNode_DialogueNodeBase`, and like Lead and Answer, **it doesn't override `ProcessNode`** - see the [Dialogue Node Intro](DialogueNode.md) page for the shared lifecycle. Complete Node's behaviour comes entirely from configuration, and specifically from something outside the node's own code:

- **`Does Auto Start` is `false`.**
- **Has no output pin.** Complete Node is configured with no outgoing connections allowed at all in the graph editor - you'll never see an output pin on it, and there's nothing to wire up.
- **Requires a Dialogue Data Table.** Even though it ends the conversation, it still shows a line of text (a farewell, a closing remark) via the same `DataTable`/`RowName` pair every `DialogueNodeBase` node uses.

!!! info
    Complete Node ending the Dialogue is a *consequence*, not a feature the node implements. When the Session finishes processing a node, it computes that node's allowed children. Complete Node structurally has zero - it has no output pin to connect from - so the child count comes back empty and the Session closes the Dialogue. Any node with zero reachable children would end the Dialogue the same way; Complete Node is simply the type built to always have zero.

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/CompleteNode.webp">
</p>

---

## 2. Setting Up a Complete Node

=== "Blueprint"
    1. Add a **Complete Node** wherever a branch of the conversation should be allowed to end - after a final Lead Node line, or directly after an Answer Node that means "leave."
    2. Set **Data Table** and **Row Name** for the closing line, same as any other Dialogue Node Base type.
    3. Leave it there - there's no output pin to connect.

=== "C++"
    ```cpp
    #include "Nodes/MounteaDialogueGraphNode_CompleteNode.h"

    class UMyCustomCompleteNode : public UMounteaDialogueGraphNode_CompleteNode
    {
        // Ending behaviour comes from having no output pin, not from
        // overriding ProcessNode - most subclasses won't need to touch it.
    };
    ```

!!! warning
    Complete Node still needs a valid `DataTable`/`RowName` to pass runtime validation, exactly like Lead and Answer. A Complete Node with no dialogue data will block the whole Dialogue from starting, the same as any other unfinished `DialogueNodeBase` node.

---

## 3. Next Steps

<div class="card-grid">
  <div class="card next-steps returnToNode">
    <h4 class="card-title">Return To Node</h4>
    <p class="card-description">Jump traversal back to an earlier point instead of ending</p>
    <a href="../ReturnToNode" class="card-link"></a>
  </div>
</div>
