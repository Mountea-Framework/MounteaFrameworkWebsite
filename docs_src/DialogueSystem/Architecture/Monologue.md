---
tags:
  - reference
  - dialogue
  - architecture
  - monologue
---

# Monologue

Monologue is single-speaker, narration-style playback - a Node auto-advancing through a line of text with no player choices involved. This page explains what Monologue actually is under the hood (a constrained mode of the same Dialogue Graph system, not a separate feature), the three pieces that make it work, and where its rough edges currently are.

---

## 1. Introduction

### What You'll Learn
- Why Monologue reuses `UMounteaDialogueGraph` end to end instead of being its own asset type
- What `UMounteaDialogueLocalMonologueComponent` actually does differently from a regular `UMounteaDialogueManager`
- How `UMounteaDialogueLocalMonologueSubsystem` stops a Monologue and a regular Dialogue from overlapping on the same player
- Why the UI contract for Monologue widgets is currently a stub, not a finished feature

!!! info
    This is a C++/architecture topic. A Blueprint reader building a narration sequence mostly just needs to know: tag your Graph as Monologue in Configuration, cap child connections to one per Node, and use the Local Monologue Manager component instead of the regular one. The rest of this page is for understanding what's happening underneath that.

---

## 2. A Mode, Not a Separate System

**Monologue is a graph-type tag, resolved through `UMounteaDialogueConfiguration`, not a different asset class.** A Monologue Graph is still a plain `UMounteaDialogueGraph`, built from the exact same node classes covered in [Dialogue Node Intro](../DialogueNodes/DialogueNode.md) - the same `StartNode`, `LeadNode`, `AnswerNode`, `CompleteNode`, and so on. There is no `UMounteaMonologueGraph` subclass and no separate node hierarchy.

What actually makes a Graph behave as a Monologue is two things working together:

- **Progression is driven purely by `DoesAutoStart()`.** A Monologue Graph never waits for player input to advance - every Node in a working Monologue Graph auto-starts, so traversal just keeps moving forward on its own.
- **`SelectNode_Implementation` explicitly ignores option selection.** On `UMounteaDialogueLocalMonologueComponent`, this override does nothing but log a warning - the source comment is direct about it: *"Local monologue is linear-only; option selection is ignored."*

The only place Monologue is structurally enforced is in the **Editor**: a whitelist caps Monologue Graphs to one outgoing connection per Node, checked in the graph scheme's connection-legality logic (the same place [Dialogue Tree Editor](../DialogueEditor/DialogueEditor.md#3-how-a-connection-gets-accepted-or-refused) describes for connection checks generally). Nothing on the runtime Node class itself refuses a second child on a Monologue Graph - the cap exists only to stop you from accidentally building a branching structure the runtime will never actually branch through.

!!! warning
    Because Monologue reuses the same traversal statics, the same `GetSpeechData`, and the same `GetAllowedChildNodesFiltered` as a regular Dialogue, everything covered on [Dialogue Node Intro](../DialogueNodes/DialogueNode.md) and [Dialogue Condition Intro](../DialogueConditions/DialogueCondition.md) still applies to a Monologue Graph - Edge Conditions still gate traversal, Decorators still can't. Don't think of Monologue as a parallel feature with its own rules; it's the same system with player input taken out of the loop.

---

## 3. The Three Collaborating Pieces

### 3.1 `UMounteaDialogueLocalMonologueComponent` - the initiator

This is the piece that actually runs a Monologue. It **subclasses `UMounteaDialogueManager` directly** rather than being a wholly separate class, and re-implements essentially every lifecycle method - `RequestStartDialogue`, `StartDialogue`, `PrepareNode`, `ProcessNode`, `NodeProcessed`, `SelectNode`, `ProcessDialogueRow`, `DialogueRowProcessed`, and close/cleanup - as a fully local flow:

- No `UMounteaDialogueSession` component on GameState is involved.
- No server RPC round-trip.
- No replicated `FMounteaDialogueContextPayload` dependency - everything the regular Manager would normally get from the network, this component resolves and applies directly, client-side.

Starting one goes through `RequestStartLocalMonologue`, which hands the request to the Subsystem below for arbitration rather than starting immediately - the component itself only actually begins once `StartLocalMonologueInternal` is called back into it. Advancing between Nodes on a Monologue Graph is handled by `ApplyNodeSwitchForLinearMonologue`, which walks `GetAllowedChildNodesFiltered` looking for the first `DoesAutoStart()` child rather than waiting for a `SelectNode` call the way a regular branching Dialogue would.

=== "Blueprint"
    Add **Mountea Dialogue Local Monologue Manager** as a component wherever you'd normally add the regular Dialogue Manager, then call **Request Start Local Monologue** with a start request instead of the regular **Request Start Dialogue** node. **Is Local Monologue Active** and **Get Active Local Monologue Session GUID** are pure nodes for checking state.

=== "C++"
    ```cpp
    #include "Components/MounteaDialogueLocalMonologueComponent.h"

    UMounteaDialogueLocalMonologueComponent* MonologueManager = ...;

    FString outError;
    MonologueManager->RequestStartLocalMonologue(Request, outError);
    ```

### 3.2 `UMounteaDialogueLocalMonologueSubsystem` - the arbiter

A `ULocalPlayerSubsystem`, so there's one per local player. It doesn't run any dialogue logic itself - its job is purely to gatekeep `UMounteaDialogueLocalMonologueComponent::RequestStartLocalMonologue` calls:

- **One Monologue at a time per local player.** `TryStartMonologue` refuses to start a second Monologue while `ActiveMonologueComponent` is already set to a different component.
- **No overlap with a regular Dialogue.** `CanStartLocalMonologue` also calls `HasAnyActiveRegularManager`, which walks every `UMounteaDialogueManager` on the local player's PlayerController, Pawn, and PlayerState (skipping any that are themselves `UMounteaDialogueLocalMonologueComponent` instances) and refuses to start if any of them report `EDMS_Active`. A Monologue and a normal branching Dialogue genuinely cannot run at the same time on the same player.

`RegisterMonologueComponent`/`UnregisterMonologueComponent` track every Monologue component that exists on the player (not just the active one), and `ReleaseMonologueLock` clears the active slot once a Monologue actually finishes or is torn down.

```cpp
#include "Subsystem/MounteaDialogueLocalMonologueSubsystem.h"

if (ULocalPlayer* LocalPlayer = PlayerController->GetLocalPlayer())
{
    UMounteaDialogueLocalMonologueSubsystem* MonologueSubsystem =
        LocalPlayer->GetSubsystem<UMounteaDialogueLocalMonologueSubsystem>();
}
```

!!! tip
    `UMounteaMonologueStatics::IsGraphMonologue(Graph)` is the `BlueprintPure` helper for checking whether a given Graph resolves to the Monologue type through Configuration, without needing to go through the Subsystem at all - useful for UI or validation logic that just needs a yes/no answer.

### 3.3 `IMounteaMonologueWBPInterface` - a marker, not a contract yet

`IMounteaMonologueWBPInterface` is used via `MustImplement` metadata on Configuration's default Monologue widget class, the same pattern `IMounteaDialogueWBPInterface` uses for the regular Dialogue widget.

!!! bug "This Interface Currently Declares Zero Functions"
    Unlike its sibling `IMounteaDialogueWBPInterface` (which declares `RefreshDialogueWidget` and `OnOptionSelected`, see [Dialogue Widget](../UIWidgets/DialogueWidget.md)), `IMounteaMonologueWBPInterface` has no members at all - it exists purely as a type marker so Configuration can gate which widget class is legal to assign, not as an actual UI contract a Monologue widget is expected to implement. Treat Monologue as functionally real on the traversal/manager side, but noticeably less finished than the main Dialogue flow on the UI side - there's no defined hook here yet for a widget to react to a Monologue-specific event.

---

## 4. Next Steps

<div class="card-grid">
  <div class="card next-steps k2Nodes">
    <h4 class="card-title">Intro to K2Nodes</h4>
    <p class="card-description">The custom Blueprint node the plugin uses for its own API, and why it's branding, not pin magic</p>
    <a href="../../K2Nodes/IntroToK2Nodes" class="card-link"></a>
  </div>
</div>
