# Interactor System

## What You'll Learn

- The two-tier focus model: how one detected set becomes one focused actor and one action list
- The interactor state machine and what drives each transition
- How action cycling and interaction start/stop are networked
- Which component type to pick for your project

## Core Concepts

### What Is an Interactor?

The interactor lives on whatever should be able to interact - almost always your player Pawn, but equally valid on an NPC or AI-controlled actor. It detects nearby interactables, picks one actor to focus on, and lets you cycle through and trigger the actions available on that actor.

!!! example "Real-world analogy"
    Think of it as the "hands and eyes" of an actor: it notices what's nearby (detection), decides what you're looking at (Tier 1 focus), and lets you choose which of several available actions on that thing to perform (Tier 2 cycling) - all without ever deciding *when* to act. That decision stays entirely with your project's input code.

### Two-Tier Focus Model

```cpp
// Tier 1: one focused actor, selected by weight + distance
AActor* Focused = Interactor->Execute_GetFocusedActor(Interactor.GetObject());

// Tier 2: every interactable component on that actor, weight-sorted
TArray<FInteractionActionCandidate> Actions = Interactor->Execute_GetActionList(Interactor.GetObject());
int32 Highlighted = Interactor->Execute_GetHighlightedActionIndex(Interactor.GetObject());
```

**Tier 1 - actor focus.** The interactor evaluates every actor represented in its detected set and picks exactly one as focused: the actor whose highest-weight interactable component wins, ties broken by squared distance. Only the focused actor gets an attention widget; everything else stays silently tracked.

**Tier 2 - action cycling.** Within the focused actor, every `IMounteaInteractableInterface` component becomes one entry in the action list (a door might have one interactable; a workbench might expose Craft, Repair, and Inspect as three separate components). `CycleAction(Direction)` moves the highlighted index; `StartInteraction` locks onto whichever action is currently highlighted.

!!! info "Zero input bound by the plugin"
    `StartInteraction`, `StopInteraction`, and `CycleAction` are all plain listen-only `BlueprintNativeEvent` interface methods. The interaction system never binds its own input and never calls these itself - your project's own input-handling code calls `Execute_CycleAction(Interactor, Direction)` the same way it calls `Execute_StartInteraction`, exactly like calling any other Blueprint function.

### Component Architecture

`UMounteaInteractorComponentBase` is abstract; three concrete subclasses supply the actual detection method:

| Component | Detection method | Best for |
|---|---|---|
| [Interactor Component Overlap](InteractorComponentOverlap.md) | Physics overlap events on a sibling collision shape | First/third-person games - "walk into range" |
| [Interactor Component Trace](InteractorComponentTrace.md) | Periodic line/box trace from the owner | Camera-aim / crosshair interaction |
| [Interactor Component Mouse](InteractorComponentMouse.md) | Trace under the mouse cursor | Top-down / strategy / point-and-click |

Each subclass only ever calls `AddDetected()` / `RemoveDetected()` on the base - the base owns all Tier 1/2 selection logic in `RefreshFocus()`, so switching detection method later never touches your focus/cycling code.

## State Machine

```cpp
UENUM(BlueprintType)
enum class EInteractorStateV3 : uint8
{
    EIS_Scanning,    // actively scanning for interactables (default)
    EIS_Active,      // performing an interaction
    EIS_Asleep,      // useful for cutscenes - no detection
    EIS_Suppressed,  // cannot interact (e.g. a secondary interactor while a master is active)
    EIS_Disabled,
};
```

State transitions are server-authoritative (`SetState_Server`). On both the authority path and the remote-client replication path (`OnRep_InteractorState`), the base calls `ProcessStateChanged()` - a virtual hook each concrete subclass overrides to bind/unbind its own detection (Overlap binds/unbinds overlap events; Trace and Mouse start/stop their periodic timers) before calling `Super::ProcessStateChanged()` to broadcast the state-changed delegates.

## Networking Model

| Property | Replication | Why |
|---|---|---|
| `HighlightedActionIndex` | `COND_OwnerOnly`, client-predicted | No other client needs a remote player's own cursor position in their own action list |
| `bSelectionLocked`, `LockedAction` | `COND_OwnerOnly` | Other clients query occupancy via the interactable's own `ActiveInteractorSlots`, not by introspecting a remote interactor |
| `CollisionChannel`, `DefaultInteractorState`, `InteractorTag`, `SafetyTraceSetup`, `ListOfIgnoredActors` | Replicated | Server-authoritative config values |

Action cycling is **client-predicted, server-confirmed**: `CycleAction_Implementation` updates the calling side's own index and broadcasts immediately for instant feedback, then forwards to `CycleAction_Server` (Unreliable, `WithValidation`) which recomputes the same clamped index from `Direction` server-side - it never trusts a client-sent absolute index. `StartInteraction`/`StopInteraction` route through `Reliable, WithValidation` Server RPCs.

## Key Properties

| Property | Type | Notes |
|---|---|---|
| `CollisionChannel` | `TEnumAsByte<ECollisionChannel>` | Response channel used for detection |
| `DefaultInteractorState` | `EInteractorStateV3` | Boot state, from `SetDefaults()` |
| `InteractorTag` | `FGameplayTag` | Checked against interactables' Required/Excluded tag filters |
| `SafetyTraceSetup` | `FSafetyTracingSetup` | Line-of-sight validation - see [Interactor Runtime Config](../Configuration/InteractorRuntimeConfig.md) |
| `MaxCandidatesPerActor` | `int32` | Caps `ActionList` size for the focused actor |
| `DetectedSet` | `TArray<TScriptInterface<IMounteaInteractableInterface>>` | Every currently-detected interactable, across all actors |

## Delegates

| Delegate | Fires when |
|---|---|
| `OnStateChanged` | `InteractorState` transitions |
| `OnFocusedActorChanged` | Tier 1 focus changes |
| `OnActionListChanged` | Tier 2 list is rebuilt |
| `OnHighlightedActionChanged` | Cycling moves the highlighted index |
| `OnInteractionKeyPressed` / `OnInteractionKeyReleased` | `StartInteraction` / `StopInteraction` called |
| `OnIgnoredActorAdded` / `OnIgnoredActorRemoved` | Ignore list changes |
| `OnCollisionChanged`, `OnInteractorTagChanged` | Property setters called |

## Setup

```cpp
// Blueprint-callable, via interface - never call *_Implementation directly on a raw pointer
Interactor->Execute_SetDefaults(Interactor.GetObject());          // pulls from Interactor Runtime Config
Interactor->Execute_ActivateInteractor(Interactor.GetObject(), ErrorMessage);
```

`SetDefaults_Implementation()` resolves `UMounteaInteractorRuntimeConfig` and copies its values into the component's own editable properties - called automatically from `BeginPlay()` when the owner has authority, and available in-editor via the **Set Default Values** button for iterating on config changes without a play session.

See [Configuration → Interactor Runtime Config](../Configuration/InteractorRuntimeConfig.md), [K2Nodes & Statics](../K2Nodes/IntroToK2Nodes.md) for the full Blueprint-facing API, and [User Interface](../UserInterface/UserInterface.md) for how focus changes drive the attention widget pool.
