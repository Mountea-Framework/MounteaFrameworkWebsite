---
tags:
  - reference
  - dialogue
  - decorators
  - events
---

# Send Command

`UMounteaDialogueDecorator_SendCommand` fires a configured Command string, plus an optional Payload object, out to the Dialogue Participant. It's a generic hook - the Decorator itself doesn't know or care what the command means, that's entirely up to whatever the Participant does with it (starting a cutscene, showing UI, triggering an animation, anything).

---

## 1. Introduction

### What You'll Learn
- What actually gets called on `ExecuteDecorator`, and who's responsible for handling it
- Why this is the one Decorator you can stack multiple instances of on the same Node
- The two properties you configure

---

## 2. What It Does

On `ExecuteDecorator`, this Decorator calls `Execute_ProcessDialogueCommand` on the owning Participant, passing the configured `Command` string and `Optional Payload`. Nothing about the command's meaning is interpreted here - the Decorator's whole job is to relay it. What happens next depends entirely on how your project's Participant implementation handles `ProcessDialogueCommand`.

| Property | Description | Default |
| --- | --- | --- |
| `Command` | The command string sent to the Participant. Required - validation fails if left empty. | `""` |
| `Optional Payload` | An arbitrary `UObject` passed alongside the command, for whatever extra data the receiving side needs. | `None` |

!!! info
    Think of this as a generic event bus entry point, not a built-in feature - the Dialogue System ships no predefined command strings. Your project defines what `Command` values mean and implements the response in your Participant's `ProcessDialogueCommand`.

---

## 3. Stackable

!!! feature "Stackable Decorator"
    `Send Command` is one of the few Decorators where `Is Decorator Stackable` returns `true` - you can attach more than one instance to the same Node, each with a different `Command`/`Payload` pair, and all of them fire when the Node processes. Most other Decorators only allow a single instance per Node.

---

## 4. Next Steps

<div class="card-grid">
  <div class="card next-steps saveNodeAsStart">
    <h4 class="card-title">Save Node as Start Node</h4>
    <p class="card-description">Persist the owning Node as the Dialogue's resumable entry point</p>
    <a href="../SetNodeAsStart" class="card-link"></a>
  </div>
</div>
