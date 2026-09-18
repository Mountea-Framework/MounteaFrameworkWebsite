# Interactable Component Hover

## What You'll Learn

- How Hover reuses Hold's timer/progress logic for a completely different trigger
- What binds instead of overlap events
- Why moving the cursor away cancels immediately

## Core Concepts

`UMounteaInteractableComponentHover` is triggered by cursor hover instead of key presses - hold for `InteractionPeriod` seconds while the cursor remains over the collision shape; moving the cursor away cancels. It extends `UMounteaInteractableComponentHold` directly, inheriting all of its timer/progress machinery:

```cpp
UMounteaInteractableComponentHover : public UMounteaInteractableComponentHold
```

!!! info "Same progress model as Hold"
    Because Hover extends Hold rather than duplicating it, progress is computed the exact same way: `(ServerTime - InteractionStartServerTime) / InteractionPeriod`. Only the *trigger source* differs - cursor dwell instead of a held key.

## What's Actually Overridden

```cpp
virtual void BindCollisionShape_Implementation(UPrimitiveComponent* PrimitiveComponent) const override;
virtual void UnbindCollisionShape_Implementation(UPrimitiveComponent* PrimitiveComponent) const override;
virtual bool CanInteract_Implementation() const override;
```

Instead of binding overlap or hit events, Hover binds `OnBeginCursorOver` / `OnEndCursorOver` on the collision primitive - this is the component's entire behavioural difference from Hold. `OnCursorBeginOverlapEvent` starts the same `InteractionStarted` → `Timer_Hold` flow Hold uses; `OnCursorEndOverlapEvent` calls `InteractionStopped`, cancelling the hold exactly as releasing a held key would.

## Fit

Best for mouse-driven UI-style interactables - a top-down game's clickable world objects, or any interface where "point at it and wait" is the intended feel rather than a discrete key press. Pairs naturally with [Interactor Component Mouse](../InteractorSystem/InteractorComponentMouse.md), though it works with any interactor type since detection and triggering are independent concerns.

See [Interactable Component Hold](InteractableComponentHold.md) for the inherited timer/progress/idempotency behaviour, and [Interactable System](InteractableSystem.md) for the shared slot/state/lifecycle machinery.
