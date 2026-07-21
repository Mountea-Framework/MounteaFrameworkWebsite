---
tags:
  - reference
  - dialogue
  - decorators
---

# Dialogue Decorator Intro

Decorators are the mechanism you use to attach side effects to a Dialogue Node - swapping dialogue data, changing participants, saving progress, firing an external command. This page explains what a Decorator actually is under the hood, where it can be attached, when it runs, and gives you a map of the concrete Decorators so you know which page to read next.

---

## 1. What a Decorator Is

A Decorator is an instanced `UObject` - `UMounteaDialogueDecoratorBase`, `Abstract`, `Blueprintable`, `EditInlineNew`. A Node (or a Graph) never stores the Decorator object directly; it stores an `FMounteaDialogueDecorator`, a thin struct wrapping an `Instanced, NoClear` pointer to the actual Decorator instance. `Instanced` means each Decorator is serialized inline as a sub-object of whatever owns it, visible and editable directly in the Details panel - not a shared asset reference.

!!! info
    Decorators exist only as "triggers." They are used to start audio, swap dialogue data, play animation, or run logic behind the curtains - like triggering a cutscene - not to decide whether a Node runs at all.

### What You'll Learn
- What a Decorator is structurally, and how it differs from a Condition
- Where Decorators can be attached - a Node, or the Graph itself
- The Initialize / Execute / Cleanup lifecycle and when each stage fires
- The full list of built-in Decorators and what each one actually does

---

## 2. Attaching a Decorator - Nodes vs the Graph

Every concrete Node type has its own `NodeDecorators` array. Beyond that, the Graph asset itself carries two separate Decorator arrays:

- **`GraphDecorators`** - Decorators on the Graph that get inherited by a Node whenever that Node's `bInheritGraphDecorators` is `true` (the default). These run alongside the Node's own Decorators, as part of the same Node-processing step.
- **`GraphScopeDecorators`** - a second, separate array, documented in its own source comment as executed "in the beginning of the graph only" and explicitly **not** inherited by individual Nodes.

!!! warning
    `GraphScopeDecorators` is intended to run once per Graph, at the start of a Dialogue, but no confirmed execution call site for it was found - treat it as a declared feature you should verify in your own project before relying on it, not as something guaranteed to fire.
    <!-- TODO(verify): confirm whether GraphScopeDecorators has a live execution call site before presenting it as a working feature. -->

=== "Blueprint"
    1. Select a Node on the Dialogue Tree canvas (or the Graph asset itself in the Details panel).
    2. Find the **Decorators** category.
    3. Add an entry to **Node Decorators** (or **Graph Decorators** / **Graph Scope Decorators** on the Graph) and pick a Decorator class from the dropdown - it's created inline, no separate asset to manage.
    4. On a Node, toggle **Inherit Graph Decorators** to control whether the Graph's own `GraphDecorators` also run for that Node.

=== "C++"
    ```cpp
    #include "Decorators/MounteaDialogueDecoratorBase.h"

    // Every concrete Decorator ultimately derives from this
    class MOUNTEADIALOGUESYSTEM_API UMounteaDialogueDecoratorBase : public UObject,
        public IMounteaDialogueTickableObject
    {
        // InitializeDecorator / ExecuteDecorator / CleanupDecorator are
        // BlueprintNativeEvent hooks a new Decorator type overrides.
    };
    ```
    !!! info
        `UMounteaDialogueDecoratorBase` is `Abstract`, `Blueprintable`, `BlueprintType` - you can write a new Decorator either as a C++ subclass or a Blueprint subclass. `IsDecoratorStackable()` controls whether more than one instance of your Decorator type can sit on the same Node/Graph (most built-ins return `false`; `Send Command` is the one that returns `true`). `IsDecoratorAllowedForGraph()` controls whether your Decorator can be attached to a Graph at all, not just a Node.

---

## 3. The Decorator Lifecycle

Once a Node is being processed, its Decorators (own plus inherited Graph Decorators, if applicable) go through three stages, traced from `MounteaDialogueGraphNode.cpp`:

1. **`InitializeDecorator`** - called from the Node's `PreProcessNode`, before the Node's main behavior runs. In C++ this is where the World reference gets cached; in Blueprint it's the place to cache values so `ExecuteDecorator` stays cheap.
2. **`ExecuteDecorator`** - called from the Node's `ProcessNode`. This is the only point where a Decorator's actual side effect happens - swapping data, changing a participant, firing a command.
3. **`CleanupDecorator`** - called from the Node's `CleanupNode`, once the Node is done. Resets cached state so nothing lingers for the garbage collector.

!!! warning
    Decorators cannot gate or block traversal. A base-class method called `EvaluateDecorator` exists, but its own source comment says outright it is "called for informational purposes - does NOT gate node traversal," and nothing in the codebase calls it except its own error-log line. If you need to conditionally stop a branch from being taken, that is the job of a separate mechanism, Edge Conditions, covered on its own page - not a Decorator. Every Decorator on this page and the pages that follow is a side effect that runs once a Node is already being visited; none of them can prevent that visit from happening.

---

## 4. The Built-In Decorators

| Decorator | What It Does |
| --- | --- |
| [Only First Time (Base)](OnlyFirstTimeBase.md) | **Deprecated.** Historically gated behavior on a Node's first visit; superseded by the `Only First Time` Edge Condition. Still functional, not stubbed out. |
| [Override Only First Time](OverrideOnlyFristTime.md) | **Deprecated.** Subclass of Only First Time (Base) - on first visit, swaps the active DataTable/Row. |
| [Override Dialogue Participants](OverrideDialogueParticipants.md) | Swaps in different Player / Dialogue / Active participant Actors and updates the Session's role override. |
| [Override Dialogue Row Data](OverrideDialogueRowData.md) | Unconditionally overwrites the active DataTable/RowName on the Dialogue Context. |
| [Select Random Dialogue Row](SelectRandomDialogueRow.md) | Picks a random index - optionally clamped to a configured range - into the active row's data array. |
| [Send Command](SendCommand.md) | Stackable. Fires a configured Command string plus an optional Payload object to the Participant - a generic hook out to external systems. |
| [Save Node as Start Node](SetNodeAsStart.md) | Persists the owning Node as the Dialogue's resumable entry point. Blocked on Return To and Complete Nodes by validation. |
| [Swap Participants](SwapParticipants.md) | Finds a Participant by GameplayTag and, if different from the current one, makes it active and broadcasts a context-updated event. |

<!-- TODO(image): a Node's Details panel with the Decorators category expanded, showing an instanced Decorator - no existing asset matches this. -->

---

## 5. Next Steps

<div class="card-grid">
  <div class="card next-steps onlyFirstTimeBase">
    <h4 class="card-title">Only First Time (Base)</h4>
    <p class="card-description">The deprecated original first-visit Decorator, and what replaced it</p>
    <a href="../OnlyFirstTimeBase" class="card-link"></a>
  </div>
</div>
