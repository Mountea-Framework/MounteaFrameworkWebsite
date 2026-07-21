---
tags:
  - reference
  - dialogue
  - decorators
  - participants
---

# Swap Participants

`UMounteaDialogueDecorator_SwapParticipants` finds a Participant by GameplayTag and, if it's different from the one currently active, makes it the active Participant and broadcasts a context-updated event so listeners (UI, audio, anything subscribed) can react immediately.

!!! info
    The header file for this class is named `MounteaIDialogueDecorator_SwapParticipants.h` - a stray `I` prefix that looks like an interface naming convention but isn't one. The class itself, `UMounteaDialogueDecorator_SwapParticipants`, is an ordinary Decorator, not an interface. A filename quirk in the source, not something that affects using it.

---

## 1. Introduction

### What You'll Learn
- How the target Participant is found, and what happens if it can't be
- What "active" means here, and the event this Decorator fires when it succeeds
- How this differs from [Override Dialogue Participants](OverrideDialogueParticipants.md)

---

## 2. What It Does

On `ExecuteDecorator`, this Decorator looks up a Participant matching `New Participant Tag` via a GameplayTag search across the Dialogue Context's known Participants. If no match is found, or the match is already the active Participant, it does nothing. Otherwise, it makes that Participant active and broadcasts the Manager's context-updated event.

| Property | Description | Default |
| --- | --- | --- |
| `New Participant Tag` | GameplayTag identifying the Participant to switch to. Matched against each Participant's own tag. | `None` |

!!! info
    This is a lighter-weight tool than [Override Dialogue Participants](OverrideDialogueParticipants.md): it only changes which already-registered Participant is active, looked up by tag. It cannot add a brand-new Actor to the conversation or override the Session's Player/NPC role tracking - for that, use Override Dialogue Participants instead.

<!-- TODO(image): a Node's Details panel with New Participant Tag set - no existing asset matches this. -->

---

## 3. Next Steps

<div class="card-grid">
  <div class="card next-steps dialogueDecorator">
    <h4 class="card-title">Dialogue Condition Intro</h4>
    <p class="card-description">The Edge-attached system that actually gates traversal</p>
    <a href="../../DialogueConditions/DialogueCondition" class="card-link"></a>
  </div>
</div>
