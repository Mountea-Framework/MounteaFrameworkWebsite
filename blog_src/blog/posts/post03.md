---
title: Decoupling UI Elements
date: 2026-01-22
authors:
  - DominikMorse
categories:
  - Inventory
tags:
  - Inventory
  - UX
  - design
---

# Indirect UI Actions: Modal Confirmation Without Widget Dependencies

Sometimes you build a feature that looks like a tiny UI polish… and it ends up unlocking a whole new level of system design.

That’s exactly what happened while improving my **Inventory & Equipment UI**.

I was working on what *looked* like a simple feature - selecting an item, choosing an action like **Use**, and showing a modal confirmation - but it exposed a bigger architectural challenge:

> How do you trigger a modal confirmation flow without forcing every widget to know about every other widget?

This update is about solving that problem properly.

Not by introducing more master classes, not by casting to specific widget types, and not by wiring together a delegate spiderweb - but by designing the flow around **decoupled commands, payloads, and queued execution**.

It’s visually small.

Technically huge.

<!-- more -->

<p align="center" width="100%" class="preview-container"> <video width="100%" controls> <source class="preview" width="90%" src="https://github.com/Mountea-Framework/MounteaInventoryEquipment/raw/refs/heads/main/DocumentationResources/DecouplingUIElements.mp4" type="video/mp4"> </video> </p>

The flow shown in the video is straightforward:

- An item is selected
- The player requests an action (for example, **Use**)
- A modal window appears to confirm or configure the action

So what is this really about? Let’s break it down.

---


## Why avoiding widget dependencies matters

If a widget directly references a specific modal widget class, you’ve created a dependency that spreads fast:

- Your inventory widget must “know” the modal class
- The modal must “know” the action class (or vice versa)
- You end up casting across the UI layer
- Refactors become risky (rename, move, replace = break)
- Testing becomes harder because UI logic is not easily isolated

Decoupling UI from logic gives you concrete benefits:

- You can redesign UI layout without rewriting game logic
- You can change game logic without rebuilding UI
- Your dependency graph stays shallow
- You can delete/move/rename assets safely
- You can swap modal implementations (full-screen, inline, radial, etc.) without touching callers

In Unreal projects, the biggest killer isn’t complexity itself - it’s *coupling*.

---

## Typical approach: delegates + inheritance pressure

The common Unreal pattern is:

- UI Action exposes a Delegate like `OnActionConfirmed`
- Modal binds to that delegate (or the action binds to modal callbacks)
- Something needs to coordinate the relationship

This can work well, but it often drifts into:

- A “master modal base class” to unify confirm/cancel handling
- A “master action base class” to unify payload and callbacks
- Hard casts or strict inheritance rules so types line up
- Direct references from widget A to widget B (or both)

Even if you start clean, you often end up with either:

- A God object managing everything through concrete types
- A web of bindings that is difficult to trace/debug
- A fragile chain where the caller must know modal details

---

## Our approach: queued indirect execution using payloads

Instead of binding two widgets together, we built an indirect execution pipeline driven by:

- Command/payload messages
- A UI manager acting as mediator
- A queue storing the invocating action context
- A modal returning a payload rather than calling concrete types

Conceptually this is a mix of a few proven patterns:

- **Command Pattern**: “An action request is a command object + data”
- **Mediator Pattern**: “UI Manager coordinates interaction, widgets don’t know each other”
- **Message/Payload Pattern**: “Requests and responses are data-driven”
- **Two-phase commit style flow**: “Request action → confirm/cancel → commit”

This is exactly the kind of architecture that scales for dynamic UI.

---

## Step-by-step breakdown (in practical terms)

### Phase 1: Action request (UI Action initiates)
1. **UI Action executes its local UI logic**
   - Example: Player clicked “Use” in context menu.
   - UI Action decides this needs confirmation (quantity, yes/no, etc.).

2. **UI Action creates a modal payload**
   - Payload contains the *intent* (command) and necessary context:
     - Selected item reference / ID
     - Allowed quantity range
     - Default quantity
     - UI text (title/body)
     - Any additional data needed to resolve the action later

3. **UI Action requests the modal (via manager)**
   - Importantly: UI Action does not instantiate the modal widget.
   - It just asks: “Show a modal for this request payload.”

4. **UI Manager stores the UI Action in a queue**
   - This is the key decoupling mechanism.
   - The action is now *dormant* and can be resumed later.
   - The manager stores:
     - A weak reference pointer to the action object (preferred for safety)

At this point: the UI action is paused, waiting for user confirmation.

---

### Phase 2: Modal interaction (Modal resolves)
5. **Modal window is created using payload information**
   - Modal does not need to know who requested it.
   - It receives a context object (payload) and renders itself:
     - Buttons, labels, sliders, icons, etc.

6. **User selects Cancel or Confirm**
   - Cancel:
     - No side-effects
     - Modal closes
     - Manager clears the queued action entry to release resources
   - Confirm:
     - Modal gathers return values (quantity, selected option, etc.)
     - Moves to the commit phase

7. **Modal creates a return payload**
   - This payload contains the result:
     - Confirmed = true
     - Quantity chosen
     - Anything we want or need

8. **Modal asks UI Manager to execute the queued action**
   - The manager finds the queued action (by reference).
   - The manager invokes it through interface.
   - No casting to concrete action types is required.

9. **QueuedExecute runs**
   - The action resumes execution with the return payload.
   - No resources blocked on waiting actions.

---

### Phase 3: Action commit (UI Action completes)
10. **UI Action receives return payload**
    - It now has the user decision and any parameters (like quantity).

11. **UI Action executes logic based on return data**
    - Example:
      - Consume N items
      - Trigger gameplay effect
      - Update inventory data source
      - Request UI refresh

This keeps the UI action as the owner of gameplay intent, while the modal is purely a parameter collection / confirmation UI.

---

## Flow diagram

```
+--------------------------------------+
|              UI ACTION               |
+--------------------------------------+
| 1) Executes UI logic                 |
| 2) Creates modal payload             |
| 3) Requests modal creation(payload)  |
| 4) Stores UI action in queue         |
+--------------------------------------+
                   |
                   v
+--------------------------------------+
|             MODAL WINDOW             |
+--------------------------------------+
| 5) Created with UI action context    |
| 6) User selects:                     |
|    a) Cancel  -> End (no changes)    |
|    b) Confirm -> Continue            |
|       7) Create return payload       |
|       8) Find UI action in queue     |
|       9) Execute (QueuedExecute)     |
+--------------------------------------+
                   |
                   v
+--------------------------------------+
|              UI ACTION               |
+--------------------------------------+
| 10) Receives return payload          |
| 11) Executes logic using return data |
+--------------------------------------+
```

---

## Best practices to make this pattern robust

### 1) Separate “request payload” vs “return payload”
Treat these as different message types:

- Request payload: everything needed to *display* the modal
- Return payload: everything needed to *commit* the action

This prevents payloads from becoming bloated “do everything” bags.

### 2) Keep modals dumb: collect inputs, validate, return
A modal should not apply game logic.

It should:
- Present information
- Accept input
- Validate input constraints
- Return a result

The action (or action handler) should own:
- Inventory modifications
- Effects
- Networking (if any)
- Persistence
- Audit/logging

### 3) Treat cancel as a first-class path
Cancel should be explicit:
- It should clear queue entries
- It should close modal cleanly
- It should not leave pending actions around

Also handle “implicit cancel” cases:
- menu closed
- focus lost
- controller disconnected
- modal removed by navigation

### 4) Centralize routing, not implementation
Your manager should be a mediator, not a God object.

Good responsibilities for the UI Manager:
- Queue management
- Modal lifecycle management
- Dispatching queued execution
- Validation of action existence / state

Bad responsibilities:
- Performing item consumption logic
- Knowing every inventory rule
- Becoming a dumping ground for “one more UI hack”

---

## Takeaway

The important part is not the modal itself.

The important part is that we have created a clean contract:

- UI Action requests a modal through data
- Modal returns a result through data
- A mediator routes execution without direct knowledge of either concrete type

That is how you get dynamic, modular UI without class-locking.

---

If you actually read all of this: thanks.
More updates soon.
