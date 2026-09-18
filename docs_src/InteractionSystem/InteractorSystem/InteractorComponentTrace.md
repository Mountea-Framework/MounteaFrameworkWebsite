# Interactor Component Trace

## What You'll Learn

- Precise (line) vs Loose (box) tracing and when to use each
- The full set of tunable trace properties
- How to trace from a custom origin (e.g. a weapon muzzle) instead of the owner's eyes

## Core Concepts

`UMounteaInteractorComponentTrace` detects interactables via a periodic line or box trace from the owner's eye location (or a custom transform). It's the natural fit for camera-aim / crosshair interaction - no sibling collision shape required, since it traces from the actor itself.

```cpp
UMounteaInteractorComponentTrace : public UMounteaInteractorComponentBase
```

## Key Properties

| Property | Type | Default | Notes |
|---|---|---|---|
| `TraceType` | `EMounteaTraceType` | `ETT_Loose` | `ETT_Precise` = thin line trace; `ETT_Loose` = forgiving box sweep |
| `TraceRange` | `float` (cm) | `250` | Maximum interaction distance |
| `TraceShapeHalfSize` | `float` (cm) | `5` | Box half-extent, only used when `TraceType = Loose` |
| `TraceInterval` | `float` (s) | `0.05` | How often the trace re-fires |
| `bUseCustomStartTransform` | `bool` | `false` | Enable + set `CustomTraceTransform` to trace from somewhere other than the owner's eye location |

```cpp
UENUM(BlueprintType)
enum class EMounteaTraceType : uint8
{
    ETT_Precise,  // Line Trace - requires precision, better for small objects
    ETT_Loose,    // Box Trace - forgiving, better for large objects
};
```

!!! example "Custom trace origin"
    Enable `bUseCustomStartTransform` and set `CustomTraceTransform` to trace from a weapon muzzle, a turret barrel, or any socket other than the owner's camera/eye location - useful when the interaction origin shouldn't follow the player's look direction.

## API

```cpp
Trace->EnableTracing();    // starts the periodic timer
Trace->DisableTracing();   // stops the timer, releases all detected interactables, clears hits
Trace->PauseTracing();     // pauses the timer WITHOUT clearing currently detected interactables
Trace->ResumeTracing();
bool CanTrace = Trace->CanTrace();
```

`PauseTracing`/`ResumeTracing` differ from `Disable`/`Enable` specifically in whether the current detected set survives - pause for a brief UI overlay, disable for a real deactivation.

Each tunable property has a paired getter/setter (`GetTraceType`/`SetTraceType`, `GetTraceRange`/`SetTraceRange`, etc.), with setters routing through `Server, Unreliable` RPCs.

## Detection Flow

Each trace tick (`ProcessTrace`) runs either `ProcessTrace_Precise` or `ProcessTrace_Loose` depending on `TraceType`, collects hit results, and diffs them against `DetectedSet` via `LastTraceHits` - new hits call `AddDetected()`, stale hits call `RemoveDetected()`, which in turn triggers `RefreshFocus()` on the base.

## State-Change Behaviour

`ProcessStateChanged()` starts/stops the periodic trace timer on active/inactive state transitions, so a `Suppressed` or `Disabled` Trace interactor performs zero trace queries per frame rather than tracing and discarding results.

See [Interactor System](InteractorSystem.md) for the base component's two-tier focus model.
