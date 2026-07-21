---
tags:
  - reference
  - dialogue
  - conditions
---

# Dialogue Condition Intro

Every Edge connecting two Nodes in a Mountea Dialogue Graph can carry one or more **Conditions** - pure yes/no checks that decide whether that connection can actually be taken. This page explains what a Condition is structurally, how Conditions attach to Edges, where they run in the traversal flow, and gives you a map of the concrete Condition classes so you know which page to read next.

---

## 1. What a Dialogue Condition Is

All Condition types - the built-in `Only First Time` and any custom Condition you write - derive from one abstract base, `UMounteaDialogueConditionBase`. Unlike a Dialogue Node or Decorator, a Condition has exactly one job: answer a yes/no question about whether traversal should be allowed to continue.

- A single contract, `EvaluateCondition(Context) const` - a `BlueprintNativeEvent` and a pure predicate: it reads the traversal history, active participant, and session data exposed by `Context`, and returns `true` or `false`. It does not, and is not meant to, change anything.
- The base class's own default implementation always returns `true`. A bare `UMounteaDialogueConditionBase` placed on an Edge never blocks anything - real gating logic lives entirely in subclasses.
- `ConditionName` (editable in the Details panel) and `GetConditionName()` give the Condition a friendly label; `GetConditionDocumentationLink()` points the editor tooltip at a docs page. Both are `BlueprintNativeEvent`, overridable per subclass.
- Each Condition instance also carries a stable `ConditionGUID`, generated automatically on creation and preserved across re-imports from the Dialoguer external editor.

!!! warning "Conditions are not Decorators"
    It's easy to assume a Decorator can stop a Node from running - it can't. [Decorators](../DialogueDecorators/DialogueDecorator.md) run side effects once a Node is already being visited, and have no way to prevent that visit. **Conditions are the opposite: they run before a Node is ever chosen, attached to the Edge leading into it, and a failing Condition genuinely removes that Node from the set of reachable options.** If you need to conditionally hide or block a dialogue option or branch, use a Condition, not a Decorator.

```cpp
#include "Conditions/MounteaDialogueConditionBase.h"

// Every concrete Condition ultimately derives from this
class MOUNTEADIALOGUESYSTEM_API UMounteaDialogueConditionBase : public UObject
{
    // EvaluateCondition_Implementation is a BlueprintNativeEvent hook a
    // subclass, C++ or Blueprint, overrides to provide the actual check.
    // The base implementation simply returns true.
};
```

!!! info
    `UMounteaDialogueConditionBase` is `Blueprintable` and `EditInlineNew` - you can write a new Condition type either as a C++ subclass or as a Blueprint subclass, the same pattern used by [Decorators](../DialogueDecorators/DialogueDecorator.md) and Custom Nodes. `EditInlineNew` also means each Edge owns its own Condition instances directly, serialized inline - a Condition is never a shared asset reference. Note that `Evaluate Condition` itself is not `BlueprintPure` (it keeps exec pins when you override it as an event in Blueprint), while `Get Condition Name` and `Get Condition Documentation Link` are pure, matching their read-only nature.

---

## 2. Attaching Conditions to Edges

Conditions do not live on Nodes. They live on **Edges** - the connections between Nodes - via `UMounteaDialogueGraphEdge::EdgeConditions`.

| Property Name | Description | Default Value |
| --- | --- | --- |
| `Rules` | Ordered list of condition entries. Each entry pairs a `Condition Class` (an instanced Condition object) with a `Negate` toggle. <ul><li>**Negate off:** the rule passes when the Condition itself returns true.</li><li>**Negate on:** the rule's result is inverted - it passes when the Condition returns false.</li></ul> | empty |
| `Mode` | How multiple `Rules` combine. <ul><li>**All:** every rule (after negation) must pass for the Edge to be traversable.</li><li>**Any:** at least one rule passing is enough.</li></ul> | `All` |

!!! info
    An Edge with an empty `Rules` array is always traversable. Conditions are opt-in per Edge, not a mandatory gate you have to configure for every connection.

`Negate` is what lets you reuse one Condition class both ways without writing two classes: put `Only First Time` on an Edge with `Negate` off to require a first visit, or `Negate` on to require the target to have already been visited at least once.

=== "Blueprint"
    1. Select the Edge on the Dialogue Tree canvas - click the connector line between two Nodes.
    2. In the **Details** panel, open the **Conditions** section and add an entry to **Rules**.
    3. Assign a **Condition Class** to the entry (e.g. **Only First Time**), toggle **Negate** if you need the inverse, and set **Mode** once you have more than one rule.

    <!-- TODO(image): screenshot of the Edge Details panel showing the Conditions/Rules array with a Condition Class assigned -->

=== "C++"
    ```cpp
    #include "Edges/MounteaDialogueGraphEdge.h"
    #include "Conditions/MounteaDialogueCondition_OnlyFirstTime.h"

    FMounteaDialogueCondition Rule;
    Rule.ConditionClass = NewObject<UMounteaDialogueCondition_OnlyFirstTime>(Edge);
    Rule.bNegate = false;

    Edge->EdgeConditions.Rules.Add(Rule);
    Edge->EdgeConditions.Mode = EConditionEvaluationMode::All;
    ```

---

## 3. How Conditions Are Evaluated at Runtime

Conditions are checked at exactly one moment: when the dialogue is deciding which child Nodes are reachable next, right after the current Node finishes and before one gets selected. Every outgoing Edge from the current Node has its Conditions evaluated, and any child whose Edge fails is dropped from the list of candidates before selection happens - it's never chosen, never processed, and never gets a chance to run.

!!! info
    This is the same traversal step described in the [Dialogue Node Intro](../DialogueNodes/DialogueNode.md)'s "How Traversal Reaches a Node" section - Conditions are the mechanism referenced there as deciding whether a Node is reachable at all.

---

## 4. Available Conditions

| Condition | Description |
| --- | --- |
| [Only First Time](OnlyFirstTime.md) | Blocks traversal of the Edge once its end Node has already appeared in the traversed history. |

---

## 5. Next Steps

<div class="card-grid">
  <div class="card next-steps onlyFirstTime">
    <h4 class="card-title">Only First Time</h4>
    <p class="card-description">The one shipped Condition, and the modern replacement for the deprecated first-visit Decorator</p>
    <a href="../OnlyFirstTime" class="card-link"></a>
  </div>
</div>
