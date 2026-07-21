---
tags:
  - reference
  - dialogue
  - nodes
  - start-node
---

# Start Node

Every Dialogue Tree begins with exactly one Start Node. This page covers what it is, why you can't configure it much, and what its one rule (`MaxChildrenNodes = 1`) means for your graph.

---

## 1. What Start Node Is

`UMounteaDialogueGraphNode_StartNode` is a pure anchor - it inherits `ProcessNode_Implementation` straight from the base `UMounteaDialogueGraphNode` and doesn't override it. There's no Start-specific logic to run; it exists only to mark where traversal begins.

- **Added automatically.** The Graph creates its Start Node the first time the Dialogue Tree asset is created - you never add one yourself.
- **Cannot be created manually, copied, cut, pasted, renamed, or deleted.** Every one of those editor actions is disabled for this node type specifically.
- **Has no input pin.** Nothing can ever connect into a Start Node - it's the one node type in the graph that only ever has children, never parents.
- **`MaxChildrenNodes` is hardcoded to `1`.** A Start Node can point at exactly one child - not zero, not several.

!!! info
    Even though Start Node derives from `UMounteaDialogueGraphNode` directly (not `UMounteaDialogueGraphNode_DialogueNodeBase`), it has no `DataTable`/`RowName` and displays no dialogue text of its own - it's purely a traversal anchor.

<!-- TODO(image): Start Node on the graph canvas - no existing asset. -->

---

## 2. Working With It

You won't spend much time configuring a Start Node - the only real task is connecting its single output pin to whatever should run first, usually a [Lead Node](LeadNode.md).

!!! warning
    Graph validation fails if the Start Node has zero children or more than one. Since it can only ever hold one connection, make sure that connection actually goes somewhere before you try to run the dialogue.

!!! bug "C++ Only"
    `UMounteaDialogueGraphNode_StartNode` is `NotBlueprintable` - you can't create a Blueprint (or C++) subclass of this specific node type. If you need different entry behaviour, that logic belongs on whatever node the Start Node points to, not on Start Node itself.

---

## 3. Next Steps

<div class="card-grid">
  <div class="card next-steps leadNode">
    <h4 class="card-title">Lead Node</h4>
    <p class="card-description">The node that usually follows Start - automatic NPC lines</p>
    <a href="../LeadNode" class="card-link"></a>
  </div>
</div>
