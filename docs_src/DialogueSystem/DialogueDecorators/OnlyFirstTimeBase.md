---
tags:
  - reference
  - dialogue
  - decorators
  - deprecated
---

# Only First Time (Base)

`UMounteaDialogueDecorator_OnlyFirstTime` is the original mechanism for running logic only the first time a Node is reached. It is deprecated - this page documents it because older content may still reference it, not as a recommendation for new work.

---

## 1. Deprecated - Use an Edge Condition Instead

!!! warning "Deprecated"
    The class's own metadata says it plainly: *"Deprecated. Use edge condition 'Only First Time' on incoming edges for traversal gating."* This Decorator predates Edge Conditions, an Edge-attached system that can genuinely stop a branch from being taken. The `Only First Time` Edge Condition is the intended replacement and is covered on its own page (Dialogue Conditions section). If you're setting up new "only on first visit" behavior, start there, not here.

This page documents the class because it still ships, still functions, and existing Graphs built before Edge Conditions existed may still have it attached.

### What You'll Learn
- What this Decorator actually does, and why it can't gate a branch even though its name suggests it can
- Why it's `Abstract`, and what that means for using it directly
- Where it's blocked from being attached, and why

---

## 2. What It Does

This is an `Abstract` base class - `BlueprintType`, `EditInlineNew`, `DisplayName="Only First Time Base"` - not something you add directly from the Decorator dropdown. It exists to be subclassed, in C++ or Blueprint, by a concrete Decorator that wants to do something only the first time its owning Node is visited. The one shipped subclass is [Override Only First Time](OverrideOnlyFristTime.md).

By itself, its `ExecuteDecorator` does nothing beyond the base class's manager check - all the useful logic lives in `IsFirstTime()`, a `BlueprintPure` function a subclass calls to decide whether to run its own override logic:

=== "Blueprint"
    `Is First Time` is exposed as a pure Blueprint node on any subclass, returning `true` if the owning Node has never appeared in the Participant's (or Context's) traversed path yet.

=== "C++"
    ```cpp
    UFUNCTION(BlueprintCallable, BlueprintPure, Category="Mountea|Dialogue|Decorator")
    bool IsFirstTime() const;
    ```
    Checks the Participant's traversed path first, falling back to the Dialogue Context's traversed path if no Participant is available yet. Returns `true` if the owning Node's GUID hasn't appeared in either.

!!! warning
    Even though a base-class `EvaluateDecorator` override exists here and returns `IsFirstTime()`, it does not gate anything. Nothing in the codebase calls `EvaluateDecorator` except its own error-log line - see the [Decorator Intro](DialogueDecorator.md) for why. This class's "first time" check only ever mattered for whatever a subclass's `ExecuteDecorator` chose to do with it, never for blocking traversal by itself.

---

## 3. Where It Can't Be Attached

`ValidateDecorator` actively blocks this Decorator (and its subclasses) from being attached in three places:

- **Start Node** - a first-visit check makes no sense on the entry point.
- **Return To Node** - the jump-back behavior makes "first visit" ambiguous.
- **The Graph** directly - `IsDecoratorAllowedForGraph()` returns `false`, so it must be attached to a Node.
- **The first Node after Start** - always trivially "first time," so attaching it there is flagged as a validation error too.

---

## 4. Next Steps

<div class="card-grid">
  <div class="card next-steps overrideOnlyFirstTime">
    <h4 class="card-title">Override Only First Time</h4>
    <p class="card-description">The one shipped subclass - swaps dialogue data on a Node's first visit</p>
    <a href="../OverrideOnlyFristTime" class="card-link"></a>
  </div>
</div>
