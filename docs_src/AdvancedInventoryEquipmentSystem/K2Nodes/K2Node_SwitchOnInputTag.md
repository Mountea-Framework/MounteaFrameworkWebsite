# SwitchOnInputTag

**Switch on Widget Input Tag** is a Blueprint node that lets you branch logic based on a **Gameplay Tag** representing a UI input action - but only from a **safe, pre-filtered list** defined in your project settings.

This is basically the “no typos, no guesswork” way to react to UI input actions in Blueprints.

!!! question "Why this exists"
    Handling UI input with raw tags (or strings) is flexible, but it’s also easy to mess up:
    
    - you type a tag that doesn’t exist  
    - you use the wrong category  
    - you forget what tags are actually valid for UI  
    - someone changes the config and your Blueprint silently stops matching
    
    This node solves that by pulling the **allowed UI Action Tags** from your **UI Config** and building switch cases from them.

## What it does

- Takes an incoming **Gameplay Tag** (`Selection`)
- Shows you output execution pins for **valid UI input tags**
- Routes execution to the matching case

It’s a clean way to do:

- “If input tag is X → do X logic”
- “If input tag is Y → do Y logic”

…without turning your graph into a pile of comparisons.

<p align="center" width="100%" class="preview-container">
  <img class="preview" width="90%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaInventoryEquipment/refs/heads/main/DocumentationResources/switchOnInputTag.webp">
</p>

## Where the tag list comes from

The available tags are read from your **UI Config** (UI Action Mappings).

That means:

- Tags defined in the config are **automatically available**
- Those config-based cases are **protected**:
  - you can’t edit them
  - you can’t remove them

!!! note "This is on purpose"
    If UI Config is the source of truth, the Blueprint node should reflect that truth, not fight it.
    It prevents accidental desync between config and Blueprints.

## Pins (what you connect)

- **Selection (Gameplay Tag)**  
  The input tag you want to react to (usually coming from your UI input system).

- **Case outputs (Exec pins)**  
  One output per enabled/selected input tag case.

!!! note "No Default pin"
    This switch is meant to be explicit. If the tag isn’t handled, nothing fires - which makes missing cases easier to spot during testing.

## Typical use

Use **SwitchOnInputTag** when you’re driving UI behavior from input tags, for example:

- Confirm / Cancel
- Navigate left/right/up/down
- Context actions (Equip, Drop, Inspect, Use)
- UI-specific shortcuts (Sort, Filter, Toggle Panel)

!!! example "Real-World Analogy"
    Like having a controller input menu where you can only pick valid actions from a list - instead of typing action names by hand and hoping you spelled them correctly.

## Common pattern

1. Receive an input tag from the UI system
2. Plug it into **Selection**
3. Implement logic on each case pin

This keeps your UI Blueprints:
- clean
- predictable
- easy to extend when new input actions are added to the config

## Gotchas

- If a tag isn’t present in the UI Config (or not enabled on the node), it won’t have a case pin.
- If your UI Config changes, this node updates its cases when the Blueprint is refreshed/recompiled.

!!! tip "Best practice"
    Treat UI Config as the “single source of truth” for input actions.
    Then use this node to route them in Blueprints safely and consistently.
