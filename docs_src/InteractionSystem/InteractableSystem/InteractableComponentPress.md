# Interactable Component Press

## What You'll Learn

- When Press fits better than a zero-duration Hold
- Exactly what "instant" means in the join → complete pipeline

## Core Concepts

`UMounteaInteractableComponentPress` completes the moment an interactor joins - `InteractionPeriod` is ignored entirely. It's the simplest of the five component types: one key press, one action, done.

```cpp
UMounteaInteractableComponentPress : public UMounteaInteractableComponentBase
```

## Behaviour

```cpp
void UMounteaInteractableComponentPress::InteractionStarted_Implementation(...)
{
    Super::InteractionStarted_Implementation(TimeStarted, CausingInteractor);
    Execute_CompleteInteractable(this, ErrorMessage);
}
```

`InteractionStarted_Implementation` calls straight through to `CompleteInteractable` in the same call - there is no intermediate "in progress" state a client would ever observe. Use this for buttons, switches, quick pickups, or any single-tap action where a hold or timer would just add unwanted latency.

!!! tip "Press vs a zero-length Hold"
    A `Hold` component with `InteractionPeriod` near-zero would *eventually* behave similarly, but still goes through the timer/progress machinery and is sensitive to frame timing at very small periods. Press is the correct, explicit choice whenever the design intent is "instant" rather than "very fast."

## Lifecycle Interaction

Press respects the same `LifecycleMode`/`CooldownPeriod` as every other component - a `Cycled` Press component completes, cools down, and re-awakens exactly like any other type; only the completion trigger differs.

See [Interactable System](InteractableSystem.md) for the shared slot/state/lifecycle machinery every component type builds on.
