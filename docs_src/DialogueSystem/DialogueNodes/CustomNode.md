---
tags:
  - reference
  - dialogue
  - nodes
  - custom-node
  - extending
---

# Custom Node

This isn't a concrete node type - there's no `UMounteaDialogueGraphNode_CustomNode` class. This page is a guide to building your own node type, in C++ or Blueprint, once the built-in Start/Lead/Answer/Complete/Return To/Delay set doesn't cover what your project needs.

---

## 1. Pick a Base Class

Both base classes are open to subclassing - `UMounteaDialogueGraphNode` is `Blueprintable`, and `UMounteaDialogueGraphNode_DialogueNodeBase` doesn't mark itself `NotBlueprintable`, so it stays subclassable too. The choice between them comes down to one question: does your node need to display dialogue text?

- **`UMounteaDialogueGraphNode`** - subclass this if your node is a utility node, not a line of dialogue. Delay Node and Return To Node are both built this way: no `DataTable`/`RowName`, just configuration and (optionally) custom `ProcessNode` logic.
- **`UMounteaDialogueGraphNode_DialogueNodeBase`** - subclass this if your node needs the `DataTable`/`RowName` pair and should show text in the UI. Lead, Answer, and Complete are all built this way.

!!! tip
    If you're building something that behaves like "a Lead Node, but slightly different," subclassing `DialogueNodeBase` and adjusting metadata is almost always less work than subclassing the plain base and reimplementing dialogue-row handling yourself.

---

## 2. You Might Not Need to Override ProcessNode

This is the single most useful thing to take from the built-in node types: **Lead Node, Answer Node, and Complete Node all ship without a `ProcessNode` override.** They get their entire identity from constructor metadata - `bAutoStarts`, `AllowedInputClasses`, and whether the node has an output pin at all. See the [Dialogue Node Intro](DialogueNode.md) page for the full breakdown of how those three differ.

Before reaching for a `ProcessNode_Implementation` override, check whether metadata alone gets you there:

| If you want... | Configure instead of overriding |
| --- | --- |
| A node that fires without waiting for player input | `bAutoStarts = true` |
| A node that waits for the player to pick it | `bAutoStarts = false` |
| A node that only certain other node types can connect into | `AllowedInputClasses` (set in the constructor) |
| A node that can never have children (an ending point) | Set `bAllowOutputNodes = false` under `WITH_EDITORONLY_DATA` so no output pin exists in the editor |
| A cap on how many children a node can have | `MaxChildrenNodes` (`-1` for unlimited) |

Only reach for a `ProcessNode_Implementation` override when the node needs to actually *do* something beyond the base lifecycle - start a timer, jump elsewhere in the graph, load another asset. Delay Node, Return To Node, and Open Child Graph Node are the shipped examples of that heavier path.

---

## 3. What to Override for Behaviour

`ProcessNode`, `PreProcessNode`, and `CanStartNode` are all `BlueprintNativeEvent` - each has a default C++ implementation (the `..._Implementation` suffix) that a C++ or Blueprint subclass can replace.

=== "Blueprint"
    Override **Process Node**, **Pre Process Node**, or **Can Start Node** as an event in your Blueprint subclass's graph. Remember to call the parent implementation if you still want decorator execution and context validation to happen - the built-in nodes that override `ProcessNode` (Delay, Return To) all call `Super`/the parent event rather than replacing the base behaviour outright.

=== "C++"
    ```cpp
    #include "Nodes/MounteaDialogueGraphNode_DialogueNodeBase.h"

    class UMyCustomNode : public UMounteaDialogueGraphNode_DialogueNodeBase
    {
        virtual void ProcessNode_Implementation(const TScriptInterface<IMounteaDialogueManagerInterface>& Manager) override;
    };

    void UMyCustomNode::ProcessNode_Implementation(const TScriptInterface<IMounteaDialogueManagerInterface>& Manager)
    {
        // Do your custom work here, then still call Super so
        // Decorators and context validation still run:
        Super::ProcessNode_Implementation(Manager);
    }
    ```

!!! warning
    Decorators cannot gate traversal - that's an Edge Condition's job, attached to Edges, not Nodes. If your custom node needs to conditionally block a branch, don't try to build that into `ProcessNode`; it runs after the node has already been selected. See the [Dialogue Node Intro](DialogueNode.md#3-how-traversal-reaches-a-node) page for how the two systems split responsibility.

---

## 4. What to Override for Appearance

Everything about how a node looks and behaves in the graph editor lives behind `WITH_EDITOR`/`WITH_EDITORONLY_DATA`, so none of it ships in a cooked build:

- **`GetNodeTitle_Implementation`** - override for a dynamic title. Delay Node uses this to show "Delay: {N}s" instead of a static name.
- **`GetNodeCategory_Implementation`** - controls which submenu the node appears under in the right-click Add Node menu.
- **`GetDescription_Implementation`** - the tooltip body shown in the editor.
- **Constructor-set editor fields** - `EditorNodeColour`, `EditorHeaderForegroundColour`, `ContextMenuName`, `bAllowInputNodes`/`bAllowOutputNodes`, and the `bAllowCopy`/`bAllowCut`/`bAllowDelete`/`bAllowManualCreate`/`bCanRenameNode` flags Start Node uses to make itself immutable - set these directly in your node's constructor rather than overriding a function.

<!-- TODO(image): a custom node type shown in the graph editor with a distinct colour/category - no existing asset. -->

---

## 5. Next Steps

<div class="card-grid">
  <div class="card next-steps dialogueDecorator">
    <h4 class="card-title">Dialogue Decorators</h4>
    <p class="card-description">Attach side effects to your new node - or to any node</p>
    <a href="../../DialogueDecorators/DialogueDecorator" class="card-link"></a>
  </div>
</div>
