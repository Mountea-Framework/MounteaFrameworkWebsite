---
tags:
  - reference
  - dialogue
  - nodes
  - answer-node
---

# Answer Node

Answer Node is how players talk back - it's what turns a Dialogue Tree from a monologue into a conversation with choices. This page covers what makes it wait for input and what data it needs.

---

## 1. What Answer Node Is

`UMounteaDialogueGraphNode_AnswerNode` derives from `UMounteaDialogueGraphNode_DialogueNodeBase`, and just like Lead and Complete, **it doesn't override `ProcessNode`** - see the [Dialogue Node Intro](DialogueNode.md) page for the shared lifecycle all three run. Answer Node's identity comes entirely from its metadata:

- **`Does Auto Start` is `false`.** This is the real mechanism behind "Answer Node requires Player input" - there's no special waiting-for-input code on the node itself. When the Session computes the allowed children of a node and finds more than one (typically several Answer Nodes offered as choices), it stops and waits for a `SelectNode` call instead of auto-advancing. The Answer Node just sits there as an option until the Manager relays the player's pick.
- **Requires a Dialogue Data Table.** Same `DataTable`/`RowName` pair inherited from `DialogueNodeBase` - this is the text shown on the answer button.
- **Blueprintable.** You can subclass Answer Node from Blueprint or C++ if you need extra behaviour attached to a player choice.

!!! info
    Answer Node accepts connections from Lead Node, Start Node, Delay Node, and another Answer Node - so you can chain multiple answers in sequence if a branch needs it. It does not accept a direct connection from Complete Node.

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/AnswerNode.webp">
</p>

---

## 2. Setting Up an Answer Node

=== "Blueprint"
    1. Add an **Answer Node** as a child of a Lead Node (or several, to present a list of choices).
    2. Set **Data Table** and **Row Name** exactly as with Lead Node - this is the text shown on the option button.
    3. Connect its output pin onward - typically to a Lead Node with the NPC's reply, or straight to Complete Node.

=== "C++"
    ```cpp
    #include "Nodes/MounteaDialogueGraphNode_AnswerNode.h"

    class UMyCustomAnswerNode : public UMounteaDialogueGraphNode_AnswerNode
    {
        // Still no ProcessNode override needed for most cases -
        // bAutoStarts and AllowedInputClasses already say what you need.
    };
    ```

!!! warning
    Answer Node needs a valid Data Table row for the same reason Lead Node does - `ValidateNodeRuntime` checks it before the Dialogue is allowed to start at all.

---

## 3. Next Steps

<div class="card-grid">
  <div class="card next-steps completeNode">
    <h4 class="card-title">Complete Node</h4>
    <p class="card-description">The node that lets a Dialogue end</p>
    <a href="../CompleteNode" class="card-link"></a>
  </div>
</div>
