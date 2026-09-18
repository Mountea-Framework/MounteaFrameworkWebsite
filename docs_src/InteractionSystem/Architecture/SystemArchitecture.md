# Mountea Interaction System - Architecture Design

## Table of Contents
1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [Component Relationship Diagram](#2-component-relationship-diagram)
3. [Class Hierarchy](#3-class-hierarchy)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [Interface Definitions](#5-interface-definitions)

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               MOUNTEA INTERACTION SYSTEM                                │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CONFIGURATION LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ UMounteaInteractionSystemSettings (DeveloperSettings, config=MounteaSettings)           │
│ ├─ InteractorConfig     : TSoftObjectPtr<UMounteaInteractorRuntimeConfig>               │
│ ├─ InteractorUIConfig   : TSoftObjectPtr<UMounteaInteractorUIConfig>                    │
│ ├─ InteractableConfig   : TSoftObjectPtr<UMounteaInteractableRuntimeConfig>             │
│ └─ InteractableUIConfig : TSoftObjectPtr<UMounteaInteractableUIConfig>                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DETECTION LAYER (Interactor)                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ UMounteaInteractorComponentBase (UActorComponent, IMounteaInteractorInterface)          │
│ │                                                                                       │
│ ├─ UMounteaInteractorComponentOverlap   - overlap begin/end events                      │
│ ├─ UMounteaInteractorComponentTrace     - periodic line/box trace                       │
│ └─ UMounteaInteractorComponentMouse     - cursor deproject + line trace                 │
│                                                                                         │
│ Each subclass only ever calls AddDetected() / RemoveDetected() on the                   │
│ base - the base's RefreshFocus() owns all Tier 1/2 selection logic.                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         TWO-TIER FOCUS SELECTION (in the base)                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ DetectedSet: TArray<TScriptInterface<IMounteaInteractableInterface>>                    │
│      │                                                                                  │
│      ▼  RefreshFocus()                                                                  │
│ Tier 1 - FocusedActor: AActor* (highest-weight component wins, ties                     │
│          broken by squared distance)                                                    │
│      │                                                                                  │
│      ▼                                                                                  │
│ Tier 2 - ActionList: TArray<FInteractionActionCandidate> (every                         │
│          interactable component on FocusedActor, weight-sorted)                         │
│      │                                                                                  │
│      ▼  CycleAction(Direction) / StartInteraction(Time)                                 │
│ HighlightedActionIndex -> LockedAction (bSelectionLocked = true)                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                       INTERACTABLE LAYER (slots + state machine)                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ UMounteaInteractableComponentBase (UWidgetComponent, IMounteaInteractableInterface)     │
│ │                                                                                       │
│ ├─ ActiveInteractorSlots : TArray<FInteractorSlot>  (N-interactor, replicated)          │
│ ├─ InteractableState     : EInteractableStateV3     (state machine)                     │
│ ├─ InteractionStartServerTime : float               (server-time progress)              │
│ │                                                                                       │
│ ├─ UMounteaInteractableComponentPress      - instant complete                           │
│ ├─ UMounteaInteractableComponentAutomatic  - timer-based, no input                      │
│ ├─ UMounteaInteractableComponentHold       - hold-to-complete                           │
│ │    └─ UMounteaInteractableComponentHover - cursor dwell (extends Hold)                │
│ └─ UMounteaInteractableComponentMash       - repeated-press-to-complete                 │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         WIDGET LAYER (pooled + distance-gated)                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ UMounteaInteractionWorldSubsystem (UWorldSubsystem)                                     │
│ │                                                                                       │
│ ├─ AttentionWidgetPool : TArray<FAttentionWidgetPoolEntry>  (pre-spawned)               │
│ ├─ AssignAttentionWidget(FocusedActor)  - only the Tier 1 focus gets one                │
│ ├─ ReleaseAttentionWidget(Actor)        - back to pool on focus/range change            │
│ └─ UpdateAttentionWidgetMode(Actor, Mode) - Attention <-> Interaction                   │
│                                                                                         │
│ IActorInteractionWidget - every widget (attention AND interaction)                      │
│ implements this one interface: SetWidgetMode, SetActionCount,                           │
│ SetSelectedActionIndex, Title/Body/Key/Progress setters.                                │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    REPLICATION LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Server Authority:                                                                       │
│ - RequestInteractorJoin/Leave, SetState, StartInteraction, StopInteraction              │
│ - All routed through Server RPCs with WithValidation                                    │
│                                                                                         │
│ Client Prediction:                                                                      │
│ - CycleAction: local index update + broadcast immediately, then                         │
│   CycleAction_Server mirrors it server-side (never trusts a client index)               │
│                                                                                         │
│ Replication Conditions:                                                                 │
│ - HighlightedActionIndex / bSelectionLocked / LockedAction: COND_OwnerOnly              │
│ - ActiveInteractorSlots / InteractableState: replicated to all                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  ACTOR (Player / NPC)                                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                     Interactor Component (Overlap / Trace / Mouse)                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Implements: IMounteaInteractorInterface                                                 │
│                                                                                         │
│ Owns: DetectedSet, FocusedActor, ActionList, HighlightedActionIndex,                    │
│       LockedAction                                                                      │
│                                                                                         │
│ Calls (on the focused actor's interactable components):                                 │
│ - RequestInteractorJoin()                                                               │
│ - InteractionStarted() (indirect, via the interactable's own join)                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
        │  Execute_RequestInteractorJoin / Leave
        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               ACTOR (Interactable target)                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
        │
        ├──────────────┬──────────────┬──────────────┐
        ▼              ▼              ▼              ▼
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│    Interactable    │  │    Interactable    │  │    Interactable    │  │    Interactable    │
│  Component Press   │  │   Component Hold   │  │   Component Mash   │  │  Component Hover   │
├────────────────────┤  ├────────────────────┤  ├────────────────────┤  ├────────────────────┤
│ Completes on       │  │ Timer-based        │  │ Replicated         │  │ Extends Hold,      │
│ join (instant)     │  │ hold-to-complete   │  │ press counter      │  │ cursor-driven      │
└────────────────────┘  └────────────────────┘  └────────────────────┘  └────────────────────┘

 All four implement IMounteaInteractableInterface. Each is a separate Tier 2
 action - one actor can host N of these simultaneously. ActiveInteractorSlots
 is per-component (each component tracks its own occupant slots).

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          WORLD SUBSYSTEM (per-world singleton)                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            UMounteaInteractionWorldSubsystem                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ AttentionWidgetPool: TArray<FAttentionWidgetPoolEntry>                                  │
│   { WidgetActor, WidgetComponent, AssignedActor }                                       │
│                                                                                         │
│ Called by whichever Interactor component currently has a FocusedActor -                 │
│ never by the interactable itself.                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Class Hierarchy

### 3.1 Interactor Component Hierarchy

```
UActorComponent
│
└─ UMounteaInteractorComponentBase (Abstract)
   │  Implements: IMounteaInteractorInterface
   │  Owns: DetectedSet, FocusedActor, ActionList, HighlightedActionIndex,
   │        bSelectionLocked, LockedAction
   │
   ├─ UMounteaInteractorComponentOverlap
   │  └─ Adds: CollisionShapes (TArray<UPrimitiveComponent*>), overlap event binding
   │
   ├─ UMounteaInteractorComponentTrace
   │  └─ Adds: TraceType (Precise/Loose), TraceInterval, TraceRange, periodic timer
   │
   └─ UMounteaInteractorComponentMouse
      └─ Adds: MouseTraceRange, MouseTraceInterval, DeprojectMousePositionToWorld
```

### 3.2 Interactable Component Hierarchy

```
UWidgetComponent
│
└─ UMounteaInteractableComponentBase (Abstract)
   │  Implements: IMounteaInteractableInterface
   │  Owns: ActiveInteractorSlots, InteractableState, InteractionStartServerTime,
   │        InteractionPeriod, LifecycleMode, WidgetRanges
   │
   ├─ UMounteaInteractableComponentPress
   │  └─ Completes on InteractionStarted (period ignored)
   │
   ├─ UMounteaInteractableComponentAutomatic
   │  └─ Adds: Timer_AutoCompletion (fires after InteractionPeriod)
   │
   ├─ UMounteaInteractableComponentHold
   │  │  Adds: Timer_Hold (progress from InteractionStartServerTime)
   │  │
   │  └─ UMounteaInteractableComponentHover
   │     └─ Overrides BindCollisionShape to bind cursor events instead of overlap
   │
   └─ UMounteaInteractableComponentMash
      └─ Adds: MinMashAmountRequired, KeystrokeTimeThreshold, ActualMashAmount (replicated)
```

### 3.3 Config DataAsset Hierarchy

```
UDataAsset
│
├─ UMounteaInteractorRuntimeConfig
│  └─ DefaultInteractorState, OverlapCollisionChannelName, TraceCollisionChannelName,
│     InteractorTag, SafetyTracingSetup, MaxCandidatesPerActor, CandidateRefreshRate,
│     DefaultInputMappingContext, InputMappingPriority
│
├─ UMounteaInteractorUIConfig
│  └─ AttentionWidgetPoolSize, DefaultAttentionWidgetClass, fade in/out times
│
├─ UMounteaInteractableRuntimeConfig
│  └─ DefaultInteractionPeriod, DefaultInteractableState, DefaultSetupType,
│     OverlapCollisionChannelName, Highlight defaults, LifecycleMode, CooldownPeriod,
│     Weight, MaxInteractors, WidgetRanges
│
└─ UMounteaInteractableUIConfig
   └─ DefaultInteractionWidgetClass, DefaultInteractableDataTable, MappingKeys
      (TMap<FKey, FKeyOnDevice>), WidgetUpdateFrequency
```

### 3.4 Interface Inheritance

```
(interfaces - not a UObject hierarchy)

IMounteaInteractorInterface
│  Focus (Tier 1/2), Interaction start/stop, state machine, safety trace,
│  ignored actors, dependencies, debug
│  Implementers: UMounteaInteractorComponentBase and its 3 subclasses

IMounteaInteractableInterface
│  Slots (N-interactor), widget ranges, action-cycling opt-out, state machine,
│  lifecycle events, properties, highlight, collision/mesh management,
│  compatible tags, ignored classes, dependencies, debug
│  Implementers: UMounteaInteractableComponentBase and its 5 subclasses

IActorInteractionWidget
│  Widget mode, action count/index, title/body/key/progress text
│  Implementers: any UUserWidget assigned to DefaultAttentionWidgetClass /
│  DefaultInteractionWidgetClass in the UI configs
```

### 3.5 Static Function Library Hierarchy

```
UBlueprintFunctionLibrary
│
├─ UMounteaInteractionStatics       - general-purpose: server time, focus-actor
│                                     selection, candidate building, channel resolution
├─ UMounteaInteractableStatics      - full interactable coverage (slots, state,
│                                     lifecycle, tags, highlight, setup)
└─ UMounteaInteractorStatics        - full interactor coverage (focus, cycling,
                                       state, ignored actors, Enhanced Input helper)

(legacy, deprecated-but-kept for compatibility)
├─ UMounteaInteractionFunctionLibrary
└─ UMounteaInteractionSystemBFL
```

---

## 4. Data Flow Diagrams (Simplified)

### 4.1 Detection → Focus → Action List

```
Interactor subclass (Overlap/Trace/Mouse) detects an interactable component
    │
    ├─ AddDetected(Interactable)
    │     └─ DetectedSet.AddUnique(Interactable)
    │
    ├─ RefreshFocus()
    │     ├─ Tier 1: evaluate every actor represented in DetectedSet,
    │     │          pick the one whose best (highest-weight) component wins;
    │     │          ties broken by squared distance from the interactor
    │     ├─ FocusedActor changed?
    │     │     ├─ [old] UMounteaInteractionWorldSubsystem→ReleaseAttentionWidget()
    │     │     └─ [new] UMounteaInteractionWorldSubsystem→AssignAttentionWidget()
    │     └─ Tier 2: gather every IMounteaInteractableInterface component on
    │                FocusedActor, sort by weight desc / distance asc → ActionList
    │
    └─ Broadcast OnFocusedActorChanged / OnActionListChanged
```

### 4.2 Start Interaction Flow

```
Player Input → Execute_StartInteraction(Interactor, StartTime)
    │
    ├─ [Client, if not authority] StartInteraction_Server(StartTime)
    │
    ├─ [Server] Resolve target = ActionList[HighlightedActionIndex]
    │
    ├─ [Server] Execute_RequestInteractorJoin(Target, Interactor)
    │     ├─ RequestInteractorJoin_Server (Server RPC, WithValidation)
    │     ├─ Validate: slot available? tags match (Required minus Excluded)?
    │     │            not blocked by a sibling interactable already Active?
    │     ├─ ActiveInteractorSlots.Add(FInteractorSlot{Interactor, JoinServerTime})
    │     ├─ OnRep_ActiveInteractorSlots() (replicated to all clients)
    │     └─ Execute_InteractionStarted(Target, JoinServerTime, Interactor)
    │           ├─ Base: stamps InteractionStartServerTime, sets Active state
    │           └─ Subclass override: Press completes instantly, Automatic starts
    │              a timer, Hold starts a timer, Mash waits for repeat presses
    │
    └─ [Client] bSelectionLocked = true, LockedAction = Target
```

### 4.3 Complete / Cancel / Teardown Flow

```
Interactable reaches its completion condition (timer, mash count, hold duration)
    │
    ├─ Execute_CompleteInteractable(Interactable, ErrorMessage)
    │     ├─ Fires OnInteractionCompleted for the causing interactor
    │     ├─ Cycled lifecycle → TriggerCooldown() → EIS_Cooldown → timer → EIS_Awake
    │     └─ Once lifecycle → EIS_Completed (terminal)
    │
    └─ ReleaseAllInteractorSlots() - kicks every remaining occupant cleanly,
       shared code path used by both natural completion and EndPlay teardown

Interactor actor destroyed while locked (EndPlay)
    │
    └─ Execute_RequestInteractorLeave(LockedAction, self) before ClearDetected()
       - prevents a phantom slot from permanently soft-locking a
         MaxInteractors=1 interactable

Interactable actor destroyed while occupied (EndPlay)
    │
    └─ For each occupant: Execute_InteractorLost() (notify) +
       Execute_ForceReleaseInteraction() (clears bSelectionLocked/LockedAction
       on the interactor WITHOUT calling back into the dying interactable -
       avoids re-entrancy mid-teardown)
```

### 4.4 Action Cycling (client-predicted)

```
Player Input → Execute_CycleAction(Interactor, Direction)
    │
    ├─ [Any peer] HighlightedActionIndex = (Index + Direction + Count) % Count
    ├─ [Any peer] Broadcast OnHighlightedActionChanged immediately (instant feedback)
    │
    └─ [Client only, if not authority] CycleAction_Server(Direction)
          └─ [Server] recomputes the SAME clamped index from its own ActionList -
             never trusts a client-sent absolute index
                └─ HighlightedActionIndex replicates back COND_OwnerOnly
                   → OnRep_HighlightedActionIndex corrects any misprediction
```

---

## 5. Interface Definitions

### IMounteaInteractorInterface
**Purpose:** Detection-side contract - focus selection, action cycling, interaction start/stop, state machine.
**Implementers:** `UMounteaInteractorComponentBase` and its three concrete subclasses.

**Responsibilities:**
- Expose Tier 1 focus (`GetFocusedActor`) and Tier 2 action list (`GetActionList`, `GetHighlightedActionIndex`, `CycleAction`)
- Start/stop interaction, force-release on interactable teardown
- State machine (`GetState`/`SetState`, `EInteractorStateV3`)
- Collision response channel, gameplay tag, safety line-of-sight trace
- Ignored-actor list, interactor-to-interactor dependencies
- Debug toggles and per-instance `ToString()`

---

### IMounteaInteractableInterface
**Purpose:** Target-side contract - slot occupancy, widget ranges, state machine, full lifecycle event set.
**Implementers:** `UMounteaInteractableComponentBase` and its five concrete subclasses.

**Responsibilities:**
- N-interactor slot management (`RequestInteractorJoin/Leave`, `GetActiveInteractorSlots`, `GetMaxInteractors`)
- Required/excluded gameplay-tag filtering at join time
- Widget range thresholds (`GetWidgetRanges`) driving attention/interaction widget transitions
- Standalone-interaction opt-out from Tier 2 cycling
- State machine (`EInteractableStateV3`): Active, Awake, Attention (reserved), Cooldown, Paused, Completed, Disabled, Suppressed
- Full lifecycle event set: `InteractorFound/Lost`, `InteractionStarted/Stopped/Completed/CycleCompleted/Canceled`, `InteractionLifecycleCompleted`, `InteractionCooldownCompleted`
- Highlight (post-process or overlay-material), collision/mesh component registration
- Interactable-to-interactable dependencies (this one can't activate until its dependency completes)

---

### IActorInteractionWidget
**Purpose:** The one contract every interaction UI widget implements - attention or interaction, no distinction in the interface itself.
**Implementers:** Any `UUserWidget` assigned to `DefaultAttentionWidgetClass` / `DefaultInteractionWidgetClass`.

**Responsibilities:**
- `SetWidgetMode(EInteractionWidgetMode)` - None / Attention / Interaction
- `SetActionCount` / `SetSelectedActionIndex` - "1 of 3" cycling indicators
- Title / Body / Key / Progress get/set pairs
- `ToggleVisibility()` - the only `BlueprintNativeEvent` method (has a native default); every other method is `BlueprintImplementableEvent`, left entirely to the Blueprint widget

See [Interactor System](../InteractorSystem/InteractorSystem.md), [Interactable System](../InteractableSystem/InteractableSystem.md) and [User Interface](../UserInterface/UserInterface.md) for the full per-member reference.
