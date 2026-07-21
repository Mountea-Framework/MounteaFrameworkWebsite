---
tags:
  - reference
  - dialogue
  - decorators
  - save
---

# Save Node as Start Node

`UMounteaDialogueDecorator_SaveNodeAsStart` persists its owning Node as the Dialogue's resumable entry point - the next time this Dialogue Graph starts for the same Participant, it can resume from here instead of the actual Start Node.

!!! info
    Its in-editor `DisplayName` is **"Save Node as Start Node"** - used as this page's title instead of a literal reading of the class name, since that's the label you'll actually see in the Decorator dropdown.

---

## 1. Introduction

### What You'll Learn
- What "saving" a Node as start actually persists, and who it's saved against
- Why it's blocked on Return To and Complete Nodes
- The one small, harmless naming drift in this Decorator's own code

---

## 2. What It Does

On `ExecuteDecorator`, this Decorator resolves the Dialogue Context's owning Participant and calls `Execute_SaveStartingNode` on it, passing its own owning Node. That call is what actually persists the resumable entry point - this Decorator's whole job is finding the right Participant and Node to save.

!!! warning
    "Saving" here only writes into the Participant's runtime state (`StartingNode`). For this to survive between play sessions, save the Dialogue Participant as part of your own save-game system - the Decorator has no opinion on when or how your project persists that data to disk.

=== "Blueprint"
    Add **Save Node as Start Node** to a Node's **Node Decorators** array. No configuration needed - it always saves the Node it's attached to.

=== "C++"
    ```cpp
    virtual void ExecuteDecorator_Implementation() override;
    ```
    No configurable properties beyond the ones inherited from the base Decorator class.

---

## 3. Where It's Blocked

`ValidateDecorator` refuses this Decorator in three cases:

- **Attached directly to the Graph** - `Is Decorator Allowed For Graph` returns `false`; it must be attached to a Node.
- **Return To Node** - jumping back to an earlier point in the Graph and also being a valid "resume from here" target at the same time doesn't make sense.
- **Complete Node** - a Node that ends the Dialogue can't also be where the next session resumes.

!!! bug "Known documentation link drift"
    This Decorator's own `GetDecoratorDocumentationLink` points at a URL slug reading `SetNodeAsStart`, which happens to match this page's file name even though the class and its `DisplayName` both say "Save Node as Start" - a small, cosmetic naming inconsistency inside the source itself, not a functional issue.

---

## 4. Next Steps

<div class="card-grid">
  <div class="card next-steps swapParticipants">
    <h4 class="card-title">Swap Participants</h4>
    <p class="card-description">Switch the active Participant by GameplayTag</p>
    <a href="../SwapParticipants" class="card-link"></a>
  </div>
</div>
