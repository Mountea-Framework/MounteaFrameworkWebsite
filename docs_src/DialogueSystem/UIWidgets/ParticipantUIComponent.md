---
tags:
  - reference
  - dialogue
  - ui
  - architecture
---

# Participant UI Component

`MounteaDialogueParticipantUserInterfaceComponent` is the runtime glue between the five widget classes covered earlier in this section and the authoritative dialogue state living on [`MounteaDialogueManager`](../GettingStarted/SetupDialogueManager.md). Unlike those five, it isn't meant to be subclassed - it ships with full native logic and is meant to be attached as-is. This page is written C++/architecture-first accordingly.

---

## 1. What This Component Is For

`UMounteaDialogueParticipantUserInterfaceComponent` is a `Blueprintable` `UActorComponent` implementing `IMounteaDialogueParticipantUIInterface`. It's purely local - the constructor calls `SetIsReplicatedByDefault(false)` - and inert until explicitly bound: nothing happens until `BindToManager` is called.

It owns exactly one thing: a single UI target (`UserInterface`, a `UObject*` that must implement `IMounteaDialogueWBPInterface` - typically a `MounteaDialogue` widget instance, but it can be a `UWidgetComponent` instead of a `UUserWidget`). There are no other widget-typed fields on this class - every widget from earlier in this section is reached indirectly, through that one interface pointer.

!!! info "Part of the Same Four-Component Setup"
    This component is a sibling to `MounteaDialogueParticipant` (see [Runtime Execution](../GettingStarted/SetupDialogueParticipant.md)), not a replacement for it - they're discovered independently, not nested. The canonical layout, also enforced by the editor's Setup Defaults tool: `MounteaDialogueParticipant` on the **Pawn**, this component on the **Player Controller**, `MounteaDialogueManager` on the **Player State**, `MounteaDialogueSession` on the **Game State**.

---

## 2. Binding To a Manager

`BindToManager(Manager)` is the setup call a project makes once, typically from the owning Player Controller's `BeginPlay`:

1. If a manager is already bound, it's unbound first (`UnbindFromManager`) - safe to call repeatedly.
2. `SetParentManager` stores the reference.
3. The component subscribes to `Manager->GetDialogueUISignalEventHandle()` - the entry point for every server-driven UI update (see [Signal Dispatch](#5-signal-dispatch-and-reconciliation) below).
4. `BindLifecycleDelegates` subscribes to eight further manager delegates: `DialogueStarted`, `DialogueClosed`, `DialogueFailed`, `DialogueNodeStarted`, `DialogueNodeFinished`, `DialogueNodeSelected`, `DialogueRowStarted`, `DialogueRowFinished`, and `DialogueContextUpdated`.

`EndPlay` calls `UnbindFromManager` automatically if a manager is still bound, so a project doesn't need to manually clean this up on destroy.

!!! warning "Two Delivery Paths, Same Destination"
    On a **dedicated server**, the Manager runs server-side only, so the eight lifecycle delegates above never fire on a client at all - `Client_DispatchUISignal` (see below) is the only path that reaches the client. On a **listen server or local play**, both the delegates and the signal fire in-process. Every UI method this component calls is idempotent (`IsValid(UserInterface)` guards throughout), so the double-firing case is safe by construction, not by accident.

---

## 3. Owning the On-Screen Widget

`CreateDialogueUI(Message)` is the actual widget-spawning path:

1. `UMounteaDialogueSystemBFC::ShouldExecuteCosmetics(GetOwner())` gates everything below it - it resolves to whether the owning actor belongs to a **local player**. A server-only instance of this component (e.g. a remote client's copy on a dedicated server) returns `true` immediately without doing anything, which is what makes it safe for this component to exist on actors the local player doesn't control.
2. If `UserInterface` already exists, it just re-runs `IMounteaDialogueUIBaseInterface::Execute_BindEvents` on it and returns - no duplicate spawn.
3. Otherwise it loads `DefaultDialogueWidgetClass` from `UMounteaDialogueSystemSettings`, resolves the owning `APlayerController`, and spawns the widget via `CreateWidget`.
4. It broadcasts `OnDialogueWidgetCreated` (`BlueprintAssignable`) so a project can hook custom presentation logic before the widget is shown.
5. It adds the widget to screen - through `UMounteaDialogueViewportHUDSubsystem` if the local player has one (see [Subsystems](../Architecture/Subsystems.md)), falling back to plain `AddToPlayerScreen()` otherwise.
6. It calls `BindEvents` on the new widget and immediately dispatches the `CreateDialogueWidget` command through `UpdateDialogueUI`.

`UpdateDialogueUI(Message, Command)` forwards an arbitrary widget command string to `IMounteaDialogueWBPInterface::Execute_RefreshDialogueWidget` on `UserInterface` - lazily creating the widget first if it doesn't exist yet. `CloseDialogueUI` sends the `CloseDialogueWidget` command, removes the widget from the HUD subsystem, unbinds its events, and clears `UserInterface` - it does not destroy the widget object itself; ownership past that point is the widget's own responsibility. `ExecuteWidgetCommand(Command)` is a thin pass-through to `UpdateDialogueUI`.

---

## 4. Forwarding Player Input

Four functions relay player actions to the bound Manager via `UMounteaDialogueManagerStatics`, which RPCs to the server - none of them mutate local dialogue state directly:

| Function | Forwards To |
| --- | --- |
| `RequestSelectNode(NodeGuid)` | `UMounteaDialogueManagerStatics::SelectNode` |
| `RequestSkipDialogueRow()` | `UMounteaDialogueManagerStatics::SkipDialogueRow` |
| `RequestCloseDialogue()` | `UMounteaDialogueManagerStatics::RequestCloseDialogue` |
| `RequestProcessDialogueRow()` | `UMounteaDialogueManagerStatics::ProcessDialogueRow` |

`RequestSelectNode` and `RequestCloseDialogue` do one thing extra before forwarding: they kick off client-side prediction.

---

## 5. Client-Side Prediction

This is the part of the component that makes option selection feel instant over network latency, instead of waiting for a server round-trip before anything visibly happens.

When `RequestSelectNode` is called, `BeginSelectPrediction(NodeGuid)` immediately hides the current options and row locally (`ApplyPredictedUICommand` for `RemoveDialogueOptions` and `HideDialogueRow`) and arms a timeout timer (`UMounteaDialogueSystemSettings::GetClientPredictionTimeoutSeconds`, `0.75s` fallback). `RequestCloseDialogue` does the equivalent through `BeginClosePrediction`, predicting the `CloseDialogueWidget` command.

From there, one of two things happens:

- **The server catches up first.** Every time a new payload version arrives, `OnContextVersionUpdated` calls `ResolvePredictionFromPayload`, which clears the pending prediction once the session's `ContextVersion` has genuinely advanced past where it was when the prediction began (or, for a Close prediction, once the Manager reference itself is gone). Nothing further happens - the predicted state was correct, so there's nothing to correct.
- **The timeout fires first.** `OnPredictionTimeout` calls `RollbackPrediction`, which re-pulls the last known session payload and runs a full `ReconcileFromPayload` to correct the UI back to server truth, logs a warning, and clears the prediction state.

Prediction only runs when `IsPredictionEnabled()` is true - which requires `UMounteaDialogueSystemSettings::IsClientPredictionEnabled()`, that the owning actor is **not** the server (`UMounteaDialogueManagerStatics::IsServer`), and that `ShouldExecuteCosmetics` passes. A project can disable the whole system from Settings without touching this component.

---

## 6. Signal Dispatch and Reconciliation

`DispatchUISignal(Signal)` is the receiving end of the server's authoritative UI push, delivered as an `FMounteaDialogueUISignal` (`Command`, `SessionGUID`, `RequiredContextVersion`, `bForceReconcile`) over the Manager's `Client_DispatchUISignal` RPC:

- A signal whose `RequiredContextVersion` hasn't been reached locally yet is queued in `PendingUISignals` rather than executed immediately.
- Once `OnContextVersionUpdated` observes the local context catching up, `DrainPendingSignals` releases every now-satisfied signal in ascending version order.
- `ExecuteUISignal` does one of two things per signal: if `bForceReconcile` is set, it pulls the current `FMounteaDialogueContextPayload` straight from the Game State's `MounteaDialogueSession` and runs `ReconcileFromPayload` - a full rebuild of the view state, not an incremental patch. Otherwise it maps `Command` directly to `CreateDialogueUI`, `CloseDialogueUI`, or `UpdateDialogueUI`.

`ReconcileFromPayload` decides what the widget should currently be showing - a dialogue row, the available options, or neither - purely by inspecting the payload's `ActiveDialogueRow` and `AllowedChildNodeGUIDs`, and diffing against cached `LastReconciled...` fields so redundant reconciles are cheap no-ops instead of redundant widget refreshes.

---

## 7. Replacing the Deprecated Manager UI Methods

`UMounteaDialogueManager.cpp` still carries roughly ten UI-related methods (`CreateDialogueUI`, `UpdateDialogueUI`, `CloseDialogueUI`, `AddDialogueUIObject(s)`, `SetDialogueWidget`, `GetDialogueWidgetClass`, and others) - every one now logs a `LOG_WARNING` pointing at this component instead. A comment directly in the Manager's source states plainly that UI reconciliation is now owned by this component via signal dispatch, and that only audio reconciliation remains on the Manager itself. New projects should attach and configure this component instead of touching those deprecated Manager methods at all.

---

## 8. C++ Reference

```cpp
#include "Components/MounteaDialogueParticipantUserInterfaceComponent.h"

class MOUNTEADIALOGUESYSTEM_API UMounteaDialogueParticipantUserInterfaceComponent
    : public UActorComponent, public IMounteaDialogueParticipantUIInterface
{
    // BindToManager(Manager) / UnbindFromManager()
    // CreateDialogueUI(Message) / UpdateDialogueUI(Message, Command) / CloseDialogueUI()
    // RequestSelectNode(NodeGuid) / RequestSkipDialogueRow() /
    // RequestCloseDialogue() / RequestProcessDialogueRow()
    // DispatchUISignal(Signal) - entry point for Client_DispatchUISignal
};
```

---

## 9. Next Steps

<div class="card-grid">
  <div class="card next-steps subsystems">
    <h4 class="card-title">Dialogue Subsystems</h4>
    <p class="card-description">The World and Viewport HUD subsystems this component relies on</p>
    <a href="../../Architecture/Subsystems" class="card-link"></a>
  </div>
</div>
