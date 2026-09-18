# Interactor Component Mouse

## What You'll Learn

- When Mouse detection fits your project better than Overlap or Trace
- What the owner actor needs for this component to function
- Why the trace runs client-side, not server-side

## Core Concepts

`UMounteaInteractorComponentMouse` detects interactables via a world-space ray cast from the current mouse cursor position, using `APlayerController::DeprojectMousePositionToWorld` to build the trace ray. It's built for top-down and isometric games where interaction is mouse-driven rather than camera-forward.

```cpp
UMounteaInteractorComponentMouse : public UMounteaInteractorComponentBase
```

!!! warning "Owner requirement"
    The owner must be, or be possessed by, a Pawn with an associated `APlayerController` - `GetOwnerPlayerController()` resolves this via possession, and the component is inert without one (no controller means no cursor to deproject).

## Key Properties

| Property | Type | Default | Notes |
|---|---|---|---|
| `MouseTraceRange` | `float` (cm) | `5000` | Maximum world distance for the ray cast |
| `MouseTraceInterval` | `float` (s) | `0.05` | How frequently the mouse position is re-evaluated |

## API

```cpp
Mouse->EnableMouseTracing();     // starts the cursor trace timer
Mouse->DisableMouseTracing();    // stops it, clears the detected set
bool CanTrace = Mouse->CanMouseTrace();
```

## Client-Side Tracing, Server-Reported

`DeprojectMousePositionToWorld` needs a local viewport - only the client that owns the pawn actually has cursor/viewport data. So the trace itself always runs on the locally-controlled client (or the listen-server host acting as its own client), and the result is reported to the server via `ReportHitActors_Server` (an `Unreliable` Server RPC) so the server's own copy of `DetectedSet`/`ActionList` stays in sync - the server has no independent way to derive "what's under this specific client's mouse cursor" the way it can re-simulate Overlap or Trace detection identically on both sides.

!!! info "Unreliable is intentional"
    `ReportHitActors_Server` fires at roughly `MouseTraceInterval` Hz - a dropped RPC is superseded by the next trace tick moments later, so `Reliable` delivery would only add latency without improving correctness.

## State-Change Behaviour

`ProcessStateChanged()` starts/stops the mouse-trace timer on active/inactive transitions, matching the Trace component's pattern.

See [Interactor System](InteractorSystem.md) for the base component's two-tier focus model.
