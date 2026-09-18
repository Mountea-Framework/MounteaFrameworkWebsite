# Mountea Interaction System

Component-based actor interaction framework for Unreal Engine 5, with a two-tier focus model, N-interactor multiplayer support, and distance-based attention widgets.

## System Overview

The Mountea Interaction System lets any actor detect nearby interactables, pick one to focus on, and cycle through the actions available on it - all without the plugin ever binding a single input itself. Everything is driven through two Blueprint-native interfaces (`IMounteaInteractorInterface`, `IMounteaInteractableInterface`), so your project's own input handling calls plain interface functions exactly like calling any other Blueprint function.

!!! info "v5.0 architecture"
    This documentation covers the v5.0 architecture: a two-tier focus model, N-interactor multiplayer slots, a world-subsystem attention-widget pool, and a four-DataAsset configuration split. Two pre-refactor Blueprint function libraries remain available and fully working for backward compatibility - see [K2Nodes & Statics](K2Nodes/IntroToK2Nodes.md).

## Core Systems

### [Interactor System](InteractorSystem/InteractorSystem.md)

The detector - lives on whatever should be able to interact (player Pawn, NPC, AI-controlled actor):

- [Interactor System overview](InteractorSystem/InteractorSystem.md) - two-tier focus model, state machine, networking
- [Interactor Component Overlap](InteractorSystem/InteractorComponentOverlap.md) - physics-overlap detection
- [Interactor Component Trace](InteractorSystem/InteractorComponentTrace.md) - camera-aim line/box trace
- [Interactor Component Mouse](InteractorSystem/InteractorComponentMouse.md) - cursor-driven detection for top-down games

### [Interactable System](InteractableSystem/InteractableSystem.md)

The thing being interacted with - one component per available action:

- [Interactable System overview](InteractableSystem/InteractableSystem.md) - slot system, state machine, lifecycle, widget ranges
- [Press](InteractableSystem/InteractableComponentPress.md) - completes instantly on join
- [Automatic](InteractableSystem/InteractableComponentAutomatic.md) - completes after a timer, no input needed
- [Hold](InteractableSystem/InteractableComponentHold.md) - hold the key for N seconds
- [Mash](InteractableSystem/InteractableComponentMash.md) - press the key N times within a threshold
- [Hover](InteractableSystem/InteractableComponentHover.md) - cursor dwell time, no key press

### [User Interface](UserInterface/UserInterface.md)

Attention and interaction widgets, pooled and distance-gated:

- [Widget interface and attention widget pool](UserInterface/UserInterface.md) - `IActorInteractionWidget`, `UMounteaInteractionWorldSubsystem`

### [Configuration](Configuration/IntroToConfiguration.md)

Four DataAssets, all soft-referenced from one project settings object:

- [Introduction to Configuration](Configuration/IntroToConfiguration.md) - the settings singleton and how it resolves
- [Interactor Runtime Config](Configuration/InteractorRuntimeConfig.md) - detection, safety trace, Enhanced Input
- [Interactor UI Config](Configuration/InteractorUIConfig.md) - attention widget pool
- [Interactable Runtime Config](Configuration/InteractableRuntimeConfig.md) - timing, state, lifecycle, ranges
- [Interactable UI Config](Configuration/InteractableUIConfig.md) - widget class, key-texture mapping

### [K2Nodes & Statics](K2Nodes/IntroToK2Nodes.md)

The primary Blueprint API surface - three static function libraries with colour-coded, icon-tagged graph nodes:

- [Introduction to K2Nodes](K2Nodes/IntroToK2Nodes.md) - `UMounteaInteractionStatics`, `UMounteaInteractableStatics`, `UMounteaInteractorStatics`

## Key Features

**🎯 Two-Tier Focus Model**

- Tier 1: one focused actor, selected by highest component weight, tie-broken by distance
- Tier 2: cycle through every interactable component on that actor
- Zero input bound by the plugin - your project calls `StartInteraction` / `StopInteraction` / `CycleAction`

**👥 N-Interactor Multiplayer**

- Replicated interactor slots per interactable (`MaxInteractors`), not just one occupant
- Required/excluded gameplay-tag filtering at join time
- Server-authoritative Server RPCs for every state-changing call, client-predicted where it matters (action cycling)

**🖼️ Distance-Based Widgets**

- Pooled attention widgets (`UMounteaInteractionWorldSubsystem`) - only the focused actor gets one, not every detected actor
- `EInteractionWidgetMode`: None → Attention → Interaction, gated by per-component `WidgetRanges`

**⚙️ Four-DataAsset Configuration**

- Runtime + UI config split for both Interactor and Interactable, all soft-referenced from one `UMounteaInteractionSystemSettings`
- Collision channels auto-registered in the collision profile if missing

**🧩 Five Interaction Types**

- Press, Automatic, Hold, Mash, Hover - all built on the same `IMounteaInteractableInterface` slot/state machinery

## Quick Start

1. **Config**: point `UMounteaInteractionSystemSettings` (Project Settings) at your four config DataAssets - see [Introduction to Configuration](Configuration/IntroToConfiguration.md)
2. **Interactor**: add one interactor component (Overlap / Trace / Mouse) to your Pawn - see [Interactor System](InteractorSystem/InteractorSystem.md)
3. **Interactable**: add one interactable component per action (Press / Automatic / Hold / Mash / Hover) to your target actor - see [Interactable System](InteractableSystem/InteractableSystem.md)
4. **Input**: bind `Start Interaction` / `Stop Interaction` / `Cycle Action` to your own Enhanced Input actions
5. **Widgets**: implement `IActorInteractionWidget` on a `UUserWidget` and assign it in the UI configs - see [User Interface](UserInterface/UserInterface.md)

!!! tip "In-editor setup guide"
    Step-by-step setup walkthroughs (collision channel auto-configuration, per-component wiring, screenshots) live in the plugin's own in-editor Help browser (toolbar → Mountea Interaction → Help). This site is the technical reference companion - interfaces, architecture, and the full API surface.

## Interfaces & Components

- `IMounteaInteractorInterface` - detection, focus, action cycling, interaction start/stop, state machine
- `IMounteaInteractableInterface` - slots, widget ranges, action cycling opt-out, state machine, lifecycle events
- `IActorInteractionWidget` - the contract every interaction UI widget implements

Every component is Blueprint-spawnable and fully documented through its interface - no interface method is ever called directly on a raw pointer; all calls go through the `Execute_*` thunk pattern standard to Unreal interfaces.
