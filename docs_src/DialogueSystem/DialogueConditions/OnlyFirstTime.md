---
tags:
  - reference
  - dialogue
  - conditions
---

# Only First Time

`UMounteaDialogueCondition_OnlyFirstTime` is the one Condition class the plugin ships today, and the answer to a very common branching need: only take this Edge if the player hasn't already seen where it leads. This page covers what it checks, where it looks for traversal history, and how it relates to the older, deprecated Decorator with the same name.

---

## 1. What It Does

`Only First Time` blocks traversal of the Edge it's attached to once the Edge's end Node has already appeared in the traversed path. Put it on an Edge, and that Edge stops being traversable the second time a conversation would otherwise take it.

Resolving *which* Edge it's attached to happens through `GetTypedOuter<UMounteaDialogueGraphEdge>()` - because a Condition is `EditInlineNew` and owned inline by the Edge it's added to (see [Dialogue Condition Intro](DialogueCondition.md)), the Condition instance can always find its owning Edge this way without needing an explicit reference back to it.

`EvaluateCondition_Implementation` checks history in two places, in order:

1. **The Condition Context's own traversed path** - if the end Node's GUID already appears here, the Edge is blocked immediately.
2. **A resolved Participant's traversed path** - it looks for the Graph's owning Participant first, falling back to the Context's active Participant if no graph-owner Participant is available, and checks that Participant's own traversed history.

If neither history shows the end Node as visited, the Condition passes and the Edge remains traversable.

!!! info
    This two-source check is why the Condition still works correctly even before a Participant reference is fully resolved in the Context - it isn't relying on a single source of truth for "has this been seen," it checks both places traversal history can live.

---

## 2. The Deprecated Decorator With the Same Name

Before Edge Conditions existed, [Only First Time (Base)](../DialogueDecorators/OnlyFirstTimeBase.md) tried to do this same job as a Decorator attached to a Node. That approach is now deprecated - the class's own metadata says so directly: *"Deprecated. Use edge condition 'Only First Time' on incoming edges for traversal gating."*

!!! warning "Use This Condition, Not the Old Decorator"
    [Decorators](../DialogueDecorators/DialogueDecorator.md) run side effects once a Node is already being visited and cannot stop that visit - see the Decorator Intro page for why. The old `Only First Time` Decorator only ever mattered for whatever a subclass chose to do with its `IsFirstTime()` check; it never actually blocked traversal. This Condition is the real replacement: it runs on the Edge, before the Node is ever chosen, and a failing check genuinely removes that Node from the set of reachable options. If you're setting up "only show/take this once" behavior in a new Graph, this page is where to start - not the old Decorator.

---

## 3. Using It

=== "Blueprint"
    1. Select the Edge on the Dialogue Tree canvas - click the connector line between the two Nodes you want to gate.
    2. In the **Details** panel, open the **Conditions** section and add an entry to **Rules**.
    3. Assign **Condition Class** to **Only First Time**.
    4. Leave **Negate** off to block the Edge after the first visit, or turn it on to require the end Node to have already been visited at least once (the inverse case - see [Dialogue Condition Intro](DialogueCondition.md#2-attaching-conditions-to-edges) for how `Negate` works).

    <!-- TODO(image): screenshot of an Edge's Details panel with Only First Time assigned as a Condition Rule -->

=== "C++"
    ```cpp
    #include "Edges/MounteaDialogueGraphEdge.h"
    #include "Conditions/MounteaDialogueCondition_OnlyFirstTime.h"

    FMounteaDialogueCondition Rule;
    Rule.ConditionClass = NewObject<UMounteaDialogueCondition_OnlyFirstTime>(Edge);
    Rule.bNegate = false;

    Edge->EdgeConditions.Rules.Add(Rule);
    ```

---

## 4. Next Steps

<div class="card-grid">
  <div class="card next-steps uiWidgets">
    <h4 class="card-title">UI Widgets</h4>
    <p class="card-description">Build the on-screen dialogue interface from the base WBP widgets</p>
    <a href="../../UIWidgets/UIWidgets" class="card-link"></a>
  </div>
</div>
