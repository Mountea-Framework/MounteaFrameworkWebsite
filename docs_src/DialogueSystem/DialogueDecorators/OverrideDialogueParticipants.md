---
tags:
  - reference
  - dialogue
  - decorators
  - participants
---

# Override Dialogue Participants

`UMounteaDialogueDecorator_OverrideParticipants` swaps in different Player, Dialogue, or Active Participant Actors mid-conversation - useful when more than one NPC is involved and the conversation needs to hand off between them.

---

## 1. Introduction

### What You'll Learn
- The three independent overrides this Decorator can apply, and what each one actually changes
- What an Actor needs to implement to be a valid target
- Where the override is applied - both the Dialogue Context and the Session's role tracking

!!! info
    This Decorator is not deprecated - it's the current, recommended way to hand a conversation off between participants.

---

## 2. The Three Overrides

Each override is an independent toggle plus an Actor reference - you can use any combination of the three on the same Decorator instance:

| Toggle | Target Actor | Effect on `ExecuteDecorator` |
| --- | --- | --- |
| `Override Player Participant` | `New Player Participant` | Adds the Actor to the Dialogue Context's participants and sets the Session's `Player` role override to it. |
| `Override Dialogue Participant` | `New Dialogue Participant` | Adds the Actor to the Dialogue Context's participants and sets the Session's `NPC` role override to it. |
| `Override Active Participant` | `New Active Participant` | Makes the Actor the Context's currently-active participant - the one considered to be speaking right now. Does not touch the Session's role overrides. |

!!! warning
    An override can only ever point at a non-null Actor - it cannot be used to clear a participant back to null. Toggling the checkbox off is how you stop applying that override, not clearing the Actor reference.

<!-- TODO(image): a Node's Details panel showing the three override toggles and their Actor reference fields - no existing asset matches this. -->

---

## 3. What a Target Actor Needs

Each Actor reference is validated before the Decorator is allowed to run:

=== "Blueprint"
    The target Actor must either implement the **Mountea Dialogue Participant** interface directly, or have at least one Component on it that implements that interface (this is how the standard `MounteaDialogueParticipant` component setup satisfies the requirement). If neither is true, validation fails and the Dialogue as a whole refuses to start - check the Output Log for which Actor and which Decorator.

=== "C++"
    ```cpp
    UPROPERTY(SaveGame, Category="Override", EditAnywhere, BlueprintReadOnly,
        meta=(EditCondition="bOverridePlayerParticipant"))
    TSoftObjectPtr<AActor> NewPlayerParticipant;
    ```
    Resolution (`GetParticipantFromActorRef`) checks `Actor->Implements<UMounteaDialogueParticipantInterface>()` first, then falls back to scanning the Actor's components for the first one that implements it.

---

## 4. Next Steps

<div class="card-grid">
  <div class="card next-steps overrideDialogueRowData">
    <h4 class="card-title">Override Dialogue Row Data</h4>
    <p class="card-description">Unconditionally overwrite the active DataTable and Row on the Context</p>
    <a href="../OverrideDialogueRowData" class="card-link"></a>
  </div>
</div>
