---
tags:
  - reference
  - dialogue
  - editor
  - setup
---

# Setup Defaults

Setup Defaults is a one-click toolbar automation that wires the Dialogue System's four runtime components onto your project's GameMode-related actor classes, so you don't have to add each one by hand. This page documents what it actually checks, what it changes, and the one hard limitation you need to know before relying on it.

---

## 1. Introduction

### What You'll Learn
- Where to find Setup Defaults, and what it touches before it looks at your actor classes at all
- The exact four components it adds, and which actor class each one goes on
- Why it can fail outright before doing anything, and why a C++ class is reported as unmodifiable rather than silently skipped
- How to read the HTML report it produces

---

## 2. Where to Find It

Setup Defaults lives under the main Level Editor's **Mountea Framework → Mountea Dialogue → Setup Defaults** menu entry - it is not part of the [Dialogue Tree graph editor](DialogueEditor.md)'s own toolbar, because it doesn't touch the Graph asset you have open. It configures your project's GameMode-related classes instead.

---

## 3. What It Checks, in Order

Running Setup Defaults performs a fixed sequence of checks. It stops early and reports why if either of the first two fail.

1. **Dialogue Configuration on Settings** - if `UMounteaDialogueSystemSettings` doesn't already have a `Dialogue Configuration` asset assigned, Setup Defaults assigns the plugin's own shipped default `UMounteaDialogueConfiguration` automatically. If Settings already points at a valid Configuration, this step is a no-op.
2. **Resolves the project's default GameMode** - read from the current World's `AWorldSettings::DefaultGameMode`, falling back to the project-wide default in `UGameMapsSettings` if the World doesn't override it.
3. **Refuses to proceed on the stock engine GameMode** - if the resolved class is null, `AGameModeBase` itself, or literally named `GameMode`, Setup Defaults stops there and reports that your project hasn't set up its own GameMode yet. No component changes happen in this case.

!!! warning
    Step 3 is a hard stop, not a warning you can ignore. If your project is still running on the engine's stock `GameMode` class, Setup Defaults has nothing to attach components to and will tell you so instead of guessing.

---

## 4. The Four Components It Adds

Once a real project GameMode is confirmed, Setup Defaults inspects that GameMode's four actor class slots and adds one component to each, if it isn't already present:

| Actor Class Slot | Component Added |
| --- | --- |
| Default Pawn Class | `MounteaDialogueParticipant` |
| Player Controller Class | `MounteaDialogueParticipantUserInterfaceComponent` |
| Player State Class | `MounteaDialogueManager` |
| Game State Class | `MounteaDialogueSession` |

This mapping is the same Participant/UI Component/Manager/Session split covered on the [Dialogue Manager](../GettingStarted/SetupDialogueManager.md) and [Dialogue Participant](../GettingStarted/SetupDialogueParticipant.md) setup pages - Setup Defaults just automates adding each one to the class that's supposed to carry it, instead of you opening four Blueprints by hand.

For each of the four slots, Setup Defaults reports one of:

- **Already Present** - the component (or a subclass of it) is already on that Blueprint, nothing changed.
- **Added** - the component wasn't there, so it was added and the Blueprint recompiled.
- **C++ Class** - see [section 5](#5-the-c-limitation) below.
- **Failed** - the class exists and is a Blueprint, but adding the component didn't succeed.
- **Skipped** - the GameMode doesn't have a class assigned for that slot at all.

---

## 5. The C++ Limitation

!!! bug "C++ Classes Are Reported, Not Modified"
    Setup Defaults can only modify **Blueprint-generated classes**. For each of the four slots, it edits the Blueprint's Simple Construction Script directly (adding an `SCS_Node` for the component) and recompiles the Blueprint. If a slot is filled by a plain C++ class instead of a Blueprint, there is no construction script to edit - Setup Defaults reports that slot as **C++ Class** and moves on. It does not silently skip it, and it does not attempt any other way of injecting the component. A C++ Pawn, PlayerController, PlayerState, or GameState always needs the matching component added manually, in the class's own constructor.

---

## 6. Reading the Report

Setup Defaults renders its results as an HTML report inside an embedded Slate web browser popup - one row per slot, showing the class name, the status badge (Already Present / Added / C++ Class / Failed / Skipped), and a short detail message explaining why. There's nothing to configure on the report itself; it's a summary, not a dialog you interact with further.

<!-- TODO(image): screenshot of the Setup Defaults HTML report popup showing the four component rows and their status badges -->

!!! tip
    If you re-run Setup Defaults after fixing a C++ class or reassigning a GameMode slot, it re-checks every slot from scratch - it's safe to run repeatedly and won't duplicate a component that's already present.

---

## 7. Next Steps

<div class="card-grid">
  <div class="card next-steps dialogueNode">
    <h4 class="card-title">Dialogue Node Intro</h4>
    <p class="card-description">What a Dialogue Node actually is, and the map of concrete node types</p>
    <a href="../../DialogueNodes/DialogueNode" class="card-link"></a>
  </div>
</div>
