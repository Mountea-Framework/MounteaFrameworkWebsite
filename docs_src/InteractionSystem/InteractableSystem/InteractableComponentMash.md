# Interactable Component Mash

## What You'll Learn

- How repeated key presses translate into replicated progress
- What happens when the player mashes too slowly
- The two extra delegates unique to this component

## Core Concepts

`UMounteaInteractableComponentMash` requires the interactor to press the interaction key `MinMashAmountRequired` times, with no more than `KeystrokeTimeThreshold` seconds between consecutive presses. Classic QTE-style struggle interaction - breaking free, forcing a door, reviving an ally faster under pressure.

```cpp
UMounteaInteractableComponentMash : public UMounteaInteractableComponentBase
```

## Key Properties

| Property | Type | Default | Notes |
|---|---|---|---|
| `MinMashAmountRequired` | `int32` | `5` | Presses required to complete |
| `KeystrokeTimeThreshold` | `float` (s) | `1.0` | Max allowed gap between presses before failure |
| `ActualMashAmount` | `int32` (read-only, replicated) | `0` | Current count - `OnRep_ActualMashAmount` keeps all clients showing consistent progress |

## How Repeat Presses Register

Each physical key press naturally produces a repeat `StartInteraction` call via Enhanced Input's `Triggered` event. Once the interactor's selection is already locked onto this interactable, repeat calls forward straight to `InteractionStarted` instead of re-joining a slot - each call increments `ActualMashAmount` and resets `Timer_KeystrokeThreshold`:

```cpp
float UMounteaInteractableComponentMash::GetInteractionProgress_Implementation() const
{
    if (MinMashAmountRequired <= 0) return 0.f;
    return FMath::Clamp(static_cast<float>(ActualMashAmount) / static_cast<float>(MinMashAmountRequired), 0.f, 1.f);
}
```

Reaching `MinMashAmountRequired` triggers `CompleteInteractable`. `OnKeyMashedEvent` (`BlueprintImplementableEvent`) fires on every registered press - a convenient hook for per-press juice (a screen shake, a UI pip filling in).

## Timing Out

If `KeystrokeTimeThreshold` elapses without a new press, `OnKeystrokeThresholdExpired()` fires: the interaction fails, `ResetMashState()` zeroes `ActualMashAmount`, and `OnInteractionFailedEvent` (`BlueprintImplementableEvent`) broadcasts so your UI can show a clear "too slow" failure state distinct from a normal `InteractionCanceled`.

## Replication

`ActualMashAmount` is the one piece of interaction-specific progress state that genuinely needs its own replicated property (unlike Hold's derived-from-timestamp approach) - each key press is a discrete event, not a continuous timer, so every client needs to see the running count directly to render consistent progress.

See [Interactable System](InteractableSystem.md) for the shared slot/state/lifecycle machinery every component type builds on.
