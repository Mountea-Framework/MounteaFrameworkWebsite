# Interactor UI Config

`UMounteaInteractorUIConfig` (`UDataAsset`) controls the attention-widget pool owned by `UMounteaInteractionWorldSubsystem`. It is read once, in the subsystem's `Initialize()`.

## Fields

| Field | Type | Default | Purpose |
|---|---|---|---|
| `AttentionWidgetPoolSize` | `int32` | `5` | Number of attention-widget actors pre-spawned in the pool |
| `DefaultAttentionWidgetClass` | `TSoftClassPtr<UUserWidget>` | none | Widget class shown when an actor is in attention range but not yet interaction range. Must implement `IActorInteractionWidget` (enforced via `MustImplement` metadata) |
| `AttentionWidgetFadeInTime` | `float` (s) | `0.2` | Fade-in duration when a new actor becomes focused |
| `AttentionWidgetFadeOutTime` | `float` (s) | `0.15` | Fade-out duration when focus is lost or the actor enters interaction range |

## Pool Sizing

The pool is a fixed set of pre-spawned actors - `AttentionWidgetPoolSize` is the maximum number of actors that can simultaneously show an attention widget on one client. Raise it if your game routinely has many actors in attention range at once (a crowd scene, a room full of interactable NPCs); each idle pool entry costs one hidden actor + one `UWidgetComponent`, so there's a real but usually small memory/tick cost to over-provisioning.

!!! info "Only the focused actor gets a widget"
    The pool is not "one widget per detected actor." Only the Tier 1 `FocusedActor` on a given interactor gets a widget assigned via `AssignAttentionWidget()`. If your interactor never focuses more than one actor at a time, a pool of 1 would technically suffice for a single-player client - the pool exists to support multiple simultaneous local viewers (split-screen) and to avoid a spawn/despawn every single frame focus flickers between two nearby candidates.

## Fade Timings

The fade in/out durations are exposed for Blueprint-side UMG animations to read, via `UMounteaInteractionWidgetBase`-style getters or by resolving the config directly - the plugin does not drive the fade itself; your widget's own animation reads these values as its playback duration so a designer can retune pacing project-wide from one DataAsset instead of editing every widget's animation curve.

See [User Interface](../UserInterface/UserInterface.md) for how the pool and widget-mode transitions work together.
