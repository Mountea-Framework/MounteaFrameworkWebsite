---
title: Sidequestin UI to improve UX
date: 2026-01-18
authors:
  - DominikMorse
categories:
  - Inventory
tags:
  - Inventory
  - UX
  - K2Node
---

# From “Side Quest” to Main Quest: Making a Widget System Without Class-Lock

Sometimes you start “just polishing one small thing”… and you end up solving a problem that’s been haunting you for years.

That’s exactly what happened to me while working on my **Inventory & Equipment System**.

I originally considered this work a side quest. 

I should’ve been focused on the “main gameplay” features. But honestly? Seeing the UI architecture click into place is *insanely satisfying*.

And more importantly: this rabbit hole led to a major improvement in usability - not just for me, but for anyone who will use the system later.

<!-- more -->

<p align="center" width="100%" class="preview-container">
        <img class="preview" width="30%" src="https://github.com/user-attachments/assets/739c356a-bd21-4c77-b2d3-cfc5efaaee76">
        <img class="preview" width="30%" src="https://github.com/user-attachments/assets/9b1a13b0-9ad4-4802-876a-c7a42f367ed6">
        <img class="preview" width="30%" src="https://github.com/user-attachments/assets/0a2f66c1-92a6-4c7c-8e70-9a50d414f621">
</p>

---

## The Real Problem: Widget Class-Lock

I *hate* the idea of UI Widgets being hard-coded classes.

For static UI screens this might be manageable, but for dynamic content like inventory grids, equipment slots, nested widget containers, etc., **class-lock becomes a real limitation**.

Classic OOP patterns lead you into one of two bad outcomes:

1. **You cast everything to specific widget classes**
   - Fragile
   - Hard to extend
   - Not scalable for modded/dynamic UI layouts

2. **You build one bloated master widget class**
   - Everything inherits from it
   - Everything depends on it
   - Everything becomes one big “God Object”

Neither is acceptable if your goal is modular, future-proof UI systems.

So I asked myself:

> *How do you broadcast events if you don’t cast to specific classes and don’t rely on one master class?*

---

## Some (Very) Wild Ideas

Before I landed on something stable, I explored multiple approaches - including a few… questionable ones:

- Sending packed events as bits and reconstructing them on the other side  
- Virtual delegates (even crazier)
- Hybrid centralized dispatch tables

But eventually I ended up with the simplest solution that still scales:

**An Interface-based command system.**

---

## The Interface-Based Solution

### The Generic Widget Interface

I created a **Generic Widget Interface** that defines a single event:

- **ProcessInventoryWidgetCommand** *(Blueprint Implementable Event)*

This means *any* widget can implement it, no class inheritance needed.

### A UIStaticsLibrary Wrapper

I then added a Blueprint Callable function:

- **ProcessWidgetCommand**

This function takes a simple input type:

> `UObject`

This is the key part.

Because the input is `UObject`, **literally anything in Unreal can listen**:
- User widgets
- actor components
- actors
- managers
- UI controllers
- subsystems
- whatever

It also supports **payload objects** (similar to DragDrop payloads), so commands can carry structured data.

At this point everything worked amazingly:
- Commands can be passed around
- Payloads can be attached
- Widgets stay generic and dynamic
- No casting
- No hard dependencies

The *foundation* was done.

---

## The UX Problem That Almost Ruined It

Here’s what hit me next:

This system is powerful, but **too easy to break**.

To keep things centralized, I defined **WidgetCommands** inside the *UI Config* (so all command names live in one place and stay reachable).

Then I ended up stuck in debugging hell:

- My *Item Action* was not displaying the correct Gamepad icon.
- Everything looked correct.
- Everything compiled.
- The UI “kind of” worked.

After a few hours of digging I found the culprit:

- `CreateWidget`
- `CraeteWidget`

Do you see it?

That typo cost me **hours**.

And I know the system inside out.

So I immediately realized:

> If this can happen to me, this system will be absolute horror for anyone else.

That was the moment I remembered why I’m building this in the first place:

**To help other developers.**

A powerful system that is painful to use isn’t a solution - it’s technical debt with a better marketing pitch.

---

## The Fix: Custom K2 Nodes

So instead of accepting “stringly-typed” commands as the final state, I started researching **custom K2Nodes**.

And this is where the real transformation happened.

In the screenshot, you can see two nodes I created:

- **SwitchOnCommand**
- **ProcessWidgetCommand**

Both nodes:

✅ Pull the list of available commands directly from *UI Config*  
✅ Present them as a selection (no typing)  
✅ Make commands behave like “static enums”  
✅ Remove typo risk entirely

So instead of writing:

```text
ProcessWidgetCommand(Target, "CraeteWidget", Payload)
```

You get a node with selectable options like:

```text
ProcessWidgetCommand
  Command: CreateWidget
  Command: RemoveWidget
```

Meaning:

* no misspellings
* no silent failures
* much faster setup
* vastly improved discoverability

---

## Why This Matters

This is a small change that has an enormous impact:

### For me:

* Less debugging time
* Cleaner command architecture
* Better scalability

### For other developers:

* Easy to navigate
* Hard to break
* Faster workflow
* Higher confidence

And this is the real goal.

It doesn’t matter if the system takes a few more months to finish.

I’d rather ship something that feels *pleasant*, logical, and consistent - not half-baked power tools held together by string comparisons.

---

## Final Thoughts

I started this as a side quest.

But it ended up becoming one of the most important improvements in the entire UI system.

Because at the end of the day, architecture isn’t just about “can it work?”
It’s about:

* Can others understand it?
* Can others extend it?
* Can others use it without fear?

Custom K2Nodes turned commands from fragile strings into something closer to compile-time safety - and that single change made the whole system feel *professional*.

---

If you actually read all of this: thanks.
More updates soon.
