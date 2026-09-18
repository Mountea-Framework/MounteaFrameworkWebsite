# Interactable UI Config

`UMounteaInteractableUIConfig` (`UDataAsset`) controls the interaction widget class, its data source, and per-key input-prompt textures.

## Fields

| Field | Type | Default | Purpose |
|---|---|---|---|
| `DefaultInteractionWidgetClass` | `TSoftClassPtr<UUserWidget>` | none | Widget shown in interaction range when this component is the selected action. Must implement `IActorInteractionWidget` |
| `DefaultInteractableDataTable` | `TSoftObjectPtr<UDataTable>` | none | Supplies display data to interactable widgets (row type is project-defined) |
| `MappingKeys` | `TMap<FKey, FKeyOnDevice>` | empty | Per-key texture mapping for input prompt display |
| `WidgetUpdateFrequency` | `float` (s) | `0.05` | How often the interaction widget polls for data updates |

## Key-to-Texture Mapping

`MappingKeys` maps an `FKey` (e.g. `EKeys::E`, `EKeys::Gamepad_FaceButton_Bottom`) to an `FKeyOnDevice`, which is itself a list of `FKeyOnDevicePair` entries:

```cpp
USTRUCT(BlueprintType)
struct FKeyOnDevicePair
{
    TSoftObjectPtr<UTexture2D> KeyTexture;
    ECommonInputType SupportedDeviceType;   // Keyboard, Gamepad, Touch, ...
    TArray<FString> SupportedPlatforms;     // empty = all platforms
    TArray<FString> BlacklistedDeviceIDs;
};
```

This lets one logical key resolve to different prompt textures depending on the connected input device and platform - a single `FKey` can carry a keyboard glyph, a Gamepad glyph, and platform-specific variants (e.g. a different face-button icon per console) without your project writing device-detection logic in every widget.

!!! tip "This is data, not binding"
    `MappingKeys` only supplies *textures for display*. It doesn't bind any input itself - your project still owns the actual Enhanced Input Action bindings; this table exists purely so an interaction widget can show "press [E-glyph]" without hardcoding a texture per key.

## Resolving From Code

```cpp
const UMounteaInteractionSystemSettings* settings = GetDefault<UMounteaInteractionSystemSettings>();
const UMounteaInteractableUIConfig* config = settings ? settings->GetInteractableUIConfig() : nullptr;
```

Or via the ported legacy helpers on `UMounteaInteractableStatics`: `GetDefaultWidgetUpdateFrequency()`, `GetInteractableDefaultDataTable()`, `GetInteractableDefaultWidgetClass()`.

See [User Interface](../UserInterface/UserInterface.md) for the widget interface these classes must implement.
