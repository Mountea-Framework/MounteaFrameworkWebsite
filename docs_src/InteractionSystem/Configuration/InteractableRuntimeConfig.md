# Interactable Runtime Config

`UMounteaInteractableRuntimeConfig` (`UDataAsset`) supplies gameplay defaults to every interactable component via `SetDefaults()`.

## Fields

| Field | Type | Default | Purpose |
|---|---|---|---|
| `DefaultInteractionPeriod` | `float` (s) | `3.0` | Interaction duration. `-1` = instant (Press-style behaviour) |
| `DefaultInteractableState` | `EInteractableStateV3` | `EIS_Awake` | State interactables boot into |
| `DefaultSetupType` | `ESetupType` | `EST_Quick` | How collision/highlight components are auto-discovered (see below) |
| `OverlapCollisionChannelName` | `FName` | `InteractionOverlap` | Must match the Interactor Runtime Config's channel of the same name |
| `bDefaultHighlightEnabled` | `bool` | `true` | Whether interactables highlight when focused |
| `DefaultHighlightSetup` | `FInteractionHighlightSetup` | Overlay Material, Stencil 133 | Highlight type + material/stencil |
| `DefaultLifecycleMode` | `EInteractableLifecycle` | `EIL_Cycled` | Re-triggerable (`Cycled`) or single-use (`OnlyOnce`) |
| `DefaultCooldownPeriod` | `float` (s) | `3.0` | Cooldown between cycles, only when `Cycled` |
| `DefaultInteractableWeight` | `int32` | `1` | Tier 1 focus-selection priority - higher wins |
| `DefaultMaxInteractors` | `int32` | `1` | How many interactors can occupy slots simultaneously |
| `DefaultWidgetRanges` | `FInteractableWidgetRanges` | Attention 500cm / Interaction 200cm | Distance thresholds for widget mode transitions |

## Auto-Setup Modes

`ESetupType` controls how `FindAndAddCollisionShapes()` / `FindAndAddHighlightableMeshes()` discover components on the owning actor:

| Mode | Behaviour |
|---|---|
| `EST_FullAll` | Adds every component from the owning actor |
| `EST_AllParent` | Adds all parent components |
| `EST_Quick` | Adds only the first parent component (the default - fastest, works for most single-mesh actors) |
| `EST_None` | No auto-discovery; wire `CollisionOverrides` / `HighlightableOverrides` by hand |

## Lifecycle

```
EIL_OnlyOnce : one successful interaction, then EIS_Completed forever
EIL_Cycled   : completes → EIS_Cooldown (DefaultCooldownPeriod) → EIS_Awake again
               optionally bounded by LifecycleCount (-1 = infinite repeats)
```

## Widget Ranges

`FInteractableWidgetRanges` requires `InteractionRange <= AttentionRange` (validated by `IsValid()`). An interactor's `RefreshFocus()` compares its distance to each detected interactable against these thresholds and calls `ToggleWidgetVisibility` / `UpdateAttentionWidgetMode` accordingly - see [User Interface](../UserInterface/UserInterface.md).

## Resolving From Code

```cpp
const UMounteaInteractionSystemSettings* settings = GetDefault<UMounteaInteractionSystemSettings>();
const UMounteaInteractableRuntimeConfig* config = settings ? settings->GetInteractableConfig() : nullptr;
```

See [Interactable System](../InteractableSystem/InteractableSystem.md) for how these values map onto the component's own editable properties.
