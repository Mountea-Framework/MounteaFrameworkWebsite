# Interactable System

## What You'll Learn

- The N-interactor slot system and how join requests are validated
- The interactable state machine and lifecycle modes
- How widget ranges gate attention/interaction widget visibility
- Which of the five component types to pick per action

## Core Concepts

### What Is an Interactable?

An interactable component sits on the actor being interacted with - one component per available action. A workbench might have three sibling interactable components (Craft, Repair, Inspect); a door needs just one. Each is independently a Tier 2 entry in whatever interactor's action list currently focuses that actor.

```cpp
UMounteaInteractableComponentBase : public UWidgetComponent, public IMounteaInteractableInterface
```

!!! info "It's a UWidgetComponent"
    The base class extends `UWidgetComponent` directly - it hosts the **interaction widget** itself (shown when this component is the selected action, in interaction range). The **attention widget** is a separate system entirely; see [User Interface](../UserInterface/UserInterface.md).

### N-Interactor Slots

Unlike a single "who's using this" reference, interactables track a replicated array of occupant slots, enabling more than one interactor to use the same interactable simultaneously (a two-player lever, a shared crafting station):

```cpp
USTRUCT(BlueprintType)
struct FInteractorSlot
{
    TScriptInterface<IMounteaInteractorInterface> Interactor;
    FGameplayTagContainer MatchedTags;   // tags the interactor satisfied on join
    float JoinServerTime;                // server world time at join - drives Hold/Mash progress
};
```

`MaxInteractors` caps concurrent occupants (default `1`). Joining is fully server-validated:

```cpp
Execute_RequestInteractorJoin(Interactable.GetObject(), Interactor);
    // → RequestInteractorJoin_Server (Reliable, WithValidation)
    // → checks: slot available? Required tags matched, Excluded tags avoided?
    //           not blocked by a sibling interactable already Active on the same actor?
    // → ActiveInteractorSlots.Add(FInteractorSlot{...})
    // → Execute_InteractionStarted(this, JoinServerTime, Interactor)
```

### Tag Filtering

Two independent `FGameplayTagContainer` fields gate who can join:

| Field | Effect |
|---|---|
| `RequiredInteractorTags` | Interactor must match at least one (empty = accept all) |
| `ExcludedInteractorTags` | Interactor disqualified if it matches any (empty = exclude none) |

This lets an interaction stay fully set up (colliders, widgets, everything) while still being turned off for specific groups - e.g. an NPC-tagged interactor excluded from a player-only console, or a `Team.B`-tagged interactor excluded from Team A's vehicle.

## State Machine

```cpp
UENUM(BlueprintType)
enum class EInteractableStateV3 : uint8
{
    EIS_Active,      // being interacted with
    EIS_Awake,       // can be interacted with, reacts to interactors (default)
    EIS_Attention,   // reserved - never assigned; see EInteractionWidgetMode::EWM_Attention
    EIS_Cooldown,    // recovering, will awake after cooldown
    EIS_Paused,      // retains progress, does not react further until resumed
    EIS_Completed,   // terminal - interaction completed, cannot re-activate
    EIS_Disabled,    // can be awakened manually
    EIS_Suppressed,  // suppressed by a dependency, cannot be interacted with
};
```

State changes are server-authoritative (`SetState_Server`) and replicated to all clients via `OnRep_InteractableState`, which also drives the coarse widget-visibility gate (`bWidgetStateEligible`) - see [User Interface](../UserInterface/UserInterface.md) for how that combines with the fine-grained distance check.

## Lifecycle

```cpp
UENUM(BlueprintType)
enum class EInteractableLifecycle : uint8
{
    EIL_OnlyOnce,  // once finished, no more interaction allowed
    EIL_Cycled,    // finished → cooldown period → awake again; optionally bounded by LifecycleCount
};
```

`LifecycleCount` (`-1` = infinite) tracks total allowed cycles when `Cycled`; `RemainingLifecycleCount` is the read-only live counter.

## Timing Without FTimerHandle Replication

Progress is computed from a single replicated server timestamp rather than replicating timer state:

```cpp
// Client-side progress calculation
float Progress = (ServerTime - InteractionStartServerTime) / InteractionPeriod;
```

`InteractionStartServerTime` replicates via `OnRep_InteractionStartServerTime`; every client derives the same progress value from its own (replicated) `AGameStateBase::GetServerWorldTimeSeconds()` read, avoiding the clock-skew problems of replicating a local `FTimerHandle`.

## Component Types

| Component | Completion trigger | Best for |
|---|---|---|
| [Press](InteractableComponentPress.md) | Instant, on join | Buttons, switches, quick pickups |
| [Automatic](InteractableComponentAutomatic.md) | Timer, no input required | Proximity triggers, notification-style interactions |
| [Hold](InteractableComponentHold.md) | Hold key for `InteractionPeriod` seconds | Doors, levers, channeled actions |
| [Mash](InteractableComponentMash.md) | N presses within a threshold | QTE-style struggle interactions |
| [Hover](InteractableComponentHover.md) | Cursor dwell time (extends Hold) | Mouse-driven UI-style interactables |

## Widget Ranges

```cpp
struct FInteractableWidgetRanges
{
    float AttentionRange = 500.f;    // must be >= InteractionRange
    float InteractionRange = 200.f;
};
```

An interactor's `RefreshFocus()` compares its distance to each detected interactable against these thresholds, toggling between `EWM_None` → `EWM_Attention` → `EWM_Interaction` - see [User Interface](../UserInterface/UserInterface.md).

## Lifecycle Events

Every state transition and slot change fires a matching delegate: `OnInteractorFound/Lost`, `OnInteractionStarted/Stopped/Completed/CycleCompleted/Canceled`, `OnLifecycleCompleted`, `OnCooldownCompleted`, `OnInteractorSlotsChanged`, `OnInteractorRejected`. Each has a `BlueprintImplementableEvent` counterpart (`OnInteractionStartedEvent`, etc.) for pure-Blueprint subclasses that don't want to bind a dynamic delegate.

## Setup

```cpp
Interactable->Execute_SetDefaults(Interactable.GetObject());   // pulls from Interactable Runtime Config
Interactable->Execute_ActivateInteractable(Interactable.GetObject(), ErrorMessage);
```

See [Configuration → Interactable Runtime Config](../Configuration/InteractableRuntimeConfig.md), [K2Nodes & Statics](../K2Nodes/IntroToK2Nodes.md) for the full Blueprint-facing API, and [Interactor System](../InteractorSystem/InteractorSystem.md) for the detection side.
