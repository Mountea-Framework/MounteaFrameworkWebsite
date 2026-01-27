# SwitchOnCommand

**Switch on Widget Command** is a Blueprint node that lets you branch logic based on a *Widget Command* - **without typing strings** and without building messy “if string equals …” chains.

It exists for one reason: **UX**.

When commands are plain strings, the system is powerful… but also ridiculously easy to break with a typo. One wrong letter can give you silent failures and hours of debugging.

!!! question "Why this node exists (the real story)"
    I once lost hours because of a typo like `CreateWidget` vs `CraeteWidget`.  
    Everything compiled. The UI *kind of* worked. But the command never matched.

    This node fixes that problem by turning commands into **selectable options** (no typing), so they behave more like “static enums” while still staying fully data-driven.

    Read the full breakdown here: **[From “Side Quest” to Main Quest: Making a Widget System Without Class-Lock](https://mountea.tools/blog/2026/01/18/sidequestin-ui-to-improve-ux/)**

## What it does

- Pulls the list of available widget commands from your **UI Config**
- Builds output execution pins based on those commands
- Lets you route Blueprint flow safely, with **zero typo risk**

So instead of writing:

- `ProcessWidgetCommand(Target, "CreateWidget", Payload)` *(string)*

…you pick **CreateWidget** from a dropdown-style setup and switch on it safely.

<p align="center" width="100%" class="preview-container">
  <img class="preview" width="90%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaInventoryEquipment/refs/heads/main/DocumentationResources/switchOnCommand.webp">
</p>

## When to use it

Use **SwitchOnCommand** when you:

- Want your UI logic to be **data-driven** (commands come from config, not code)
- Need branching behavior like “Create”, “Remove”, “Refresh”, “Focus”, etc.
- Want a workflow that’s **hard to break** and easy for others to understand

!!! tip "This node is about confidence"
    A powerful system is hated by users if it is painful to use, and it quickly becomes technical debt.
    This node exists to make the command system feel pleasant and safe in Blueprints.

## Pins (what you connect)

- **Selection** *(String)*  
  The incoming command value you want to switch on (usually coming from your UI command flow).

- **Exec outputs (cases)**  
  One output per enabled command case.

!!! note "Default pin"
    This switch is meant to be explicit. It doesn’t expose a “Default” execution output by default.

## Command list behavior

The available commands come from **UI Config**:

- Config-defined commands are **always available**
- They **cannot be removed or edited** from the node (by design)
- You *can* add extra custom cases manually if you want

## Common pattern

- You receive a command string
- You run **SwitchOnCommand**
- Each output pin drives the correct UI logic path

!!! example "Real-World Analogy"
    Like selecting actions from a predefined command palette instead of typing commands into a terminal.
    Same flexibility - massively fewer mistakes.
