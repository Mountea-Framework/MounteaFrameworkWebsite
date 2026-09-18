# Interactor Component Overlap

## What You'll Learn

- When to pick Overlap over Trace or Mouse
- The one extra setup step it needs
- Why safety tracing defaults ON for this component specifically

## Core Concepts

`UMounteaInteractorComponentOverlap` detects interactables via physics overlap events (`OnBeginOverlap` / `OnEndOverlap`) on a sibling collision shape. It's the natural fit for first/third-person games where "walk into range" should be enough to start interacting.

```cpp
UMounteaInteractorComponentOverlap : public UMounteaInteractorComponentBase
```

## Setup

Add **Interactor Component Overlap** to your actor, then add a collision shape (e.g. **Sphere Collision**) as a sibling component - this defines the interaction range. On `BeginPlay`, the component auto-discovers every primitive component on the owner and configures its collision responses for you: sets the configured overlap channel to `Overlap`, everything else to `Ignore`. You don't need to touch collision presets by hand.

!!! tip "Only want specific components?"
    Fill in `OverrideCollisionComponents` with the exact component names to use as detection volume(s), instead of letting auto-discovery pick up everything on the actor.

## Key Properties

| Property | Type | Notes |
|---|---|---|
| `OverrideCollisionComponents` | `TArray<FName>` | Component tag filter for auto-setup |
| `CollisionShapes` | `TArray<UPrimitiveComponent*>` | Registered shapes with overlap events bound |

## API

```cpp
Overlap->AddCollisionComponent(NewShape);      // binds overlap events, adds to CollisionShapes
Overlap->RemoveCollisionComponent(OldShape);   // unbinds, restores pre-interaction collision state
TArray<UPrimitiveComponent*> Shapes = Overlap->GetCollisionComponents();
```

Each add/remove has a batch (`*Components`) variant, and both route through Server RPCs when called from a client.

## Safety Trace Defaults to ON

Overlap volumes can poke into an adjacent room - a sphere large enough to feel generous will happily overlap an interactable through a thin wall. `SafetyTracingSetup.SafetyTracingMode` defaults to `ESTM_Location` for Overlap interactors specifically (Trace and Mouse interactors already trace to detect in the first place, so they default to `ESTM_None`). Every detected candidate gets a secondary line trace validated before it's allowed into the focus list - see [Interactor Runtime Config](../Configuration/InteractorRuntimeConfig.md#safety-tracing).

## State-Change Behaviour

`ProcessStateChanged()` binds overlap events when transitioning into an active-detection state and unbinds them on `Asleep` / `Suppressed` / `Disabled` - so a suppressed Overlap interactor stops generating overlap callbacks entirely rather than merely ignoring them, avoiding wasted physics work while suppressed.

See [Interactor System](InteractorSystem.md) for the base component's two-tier focus model, and [Interactable System](../InteractableSystem/InteractableSystem.md) for the target side of detection.
