# Introduction to Configuration

## What You'll Learn

- How the plugin's project-wide settings singleton resolves to concrete DataAssets
- Why configuration is split into four separate assets instead of one
- How collision channels get auto-registered
- Where to find these settings in the editor

## The Settings Singleton

Every configurable default in the plugin is reached through one `UDeveloperSettings` object:

```cpp
UCLASS(config=MounteaSettings, defaultconfig)
class UMounteaInteractionSystemSettings : public UDeveloperSettings
{
    TSoftObjectPtr<UMounteaInteractorRuntimeConfig>     InteractorConfig;
    TSoftObjectPtr<UMounteaInteractorUIConfig>          InteractorUIConfig;
    TSoftObjectPtr<UMounteaInteractableRuntimeConfig>   InteractableConfig;
    TSoftObjectPtr<UMounteaInteractableUIConfig>        InteractableUIConfig;
};
```

Find it at **Project Settings → Mountea Framework → Mountea Interaction System**. Each of the four slots is a soft pointer to a DataAsset - create one instance of each type in your Content Browser, assign it here, and every component that calls `SetDefaults()` (both on `BeginPlay` and via the editor-only **Set Default Values** button) pulls its defaults from these four assets.

!!! tip "Why soft pointers?"
    Soft references mean the config assets aren't force-loaded until something actually asks for them, and swapping a config asset in Project Settings never requires a recompile.

## Why Four Assets Instead of One

| Asset | Scope | Read by |
|---|---|---|
| [Interactor Runtime Config](InteractorRuntimeConfig.md) | Gameplay defaults for detection | `UMounteaInteractorComponentBase::SetDefaults_Implementation()` |
| [Interactor UI Config](InteractorUIConfig.md) | Attention widget pool | `UMounteaInteractionWorldSubsystem::Initialize()` |
| [Interactable Runtime Config](InteractableRuntimeConfig.md) | Gameplay defaults for targets | `UMounteaInteractableComponentBase::SetDefaults_Implementation()` |
| [Interactable UI Config](InteractableUIConfig.md) | Interaction widget + key textures | Interaction widget setup, key-prompt display |

Splitting Runtime from UI, and Interactor from Interactable, means a designer can swap only the UI theme without touching gameplay tuning, or vice versa - and a dedicated server build never needs to load either UI asset at all.

## Collision Channel Auto-Registration

Both `UMounteaInteractorRuntimeConfig::OverlapCollisionChannelName` / `TraceCollisionChannelName` and `UMounteaInteractableRuntimeConfig::OverlapCollisionChannelName` carry `meta=(NoResetToDefault)` and default to the display names `InteractionOverlap` and `InteractionTrace`. The editor module auto-creates these as registered engine collision channels on startup if they aren't already present - you don't need to open **Project Settings → Collision** and add them by hand for the default setup to work. Names must match between the Interactor and Interactable configs, since one side generates overlaps and the other must respond to them.

## Resolving Config From Code

```cpp
const UMounteaInteractionSystemSettings* settings = GetDefault<UMounteaInteractionSystemSettings>();
const UMounteaInteractorRuntimeConfig* config = settings ? settings->GetInteractorConfig() : nullptr;
```

Or from Blueprint, via `UMounteaInteractableStatics::GetInteractionSystemSettings()` (ported from the pre-refactor function library) and the equivalent getters on the settings object itself.

!!! warning "Configs are defaults, not live state"
    Config DataAsset values are read once, in `SetDefaults()`, to populate a component's own editable properties. Changing a config asset at runtime does **not** retroactively change already-spawned components - it only affects components that call `SetDefaults()` afterward (e.g. newly spawned actors, or an explicit re-run via the Statics `Set*Defaults` functions).
