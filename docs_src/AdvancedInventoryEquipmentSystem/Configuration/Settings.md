# Mountea Advanced Inventory Settings

## What You'll Learn

- Basic settings access and configuration
- Setting up inventory types, categories, and rarities
- Applying themes to widgets
- Configuring equipment slots and notifications

## Quick Start

```cpp
// Access settings singleton
UMounteaAdvancedInventorySettings* Settings = GetDefault<UMounteaAdvancedInventorySettings>();
TArray<FString> Categories = Settings->GetAllowedCategories();

// Use Statics wrapper
UMounteaAdvancedInventorySettings* Settings = UMounteaInventoryStatics::GetInventorySettings();
```

!!! tip "Result"
    Access to all inventory system configuration from any code location.

## Core Concepts

### Settings Access Pattern

All settings follow a consistent two-level access pattern: **Project Settings** → **Data Asset Config**.

```cpp
// 1. Get project settings
auto Settings = UMounteaInventoryStatics::GetInventorySettings();

// 2. Load specific config
auto InventoryConfig = Settings->InventorySettingsConfig.LoadSynchronous();
auto EquipmentConfig = Settings->EquipmentSettingsConfig.LoadSynchronous();
```

!!! tip "Key Points"
    - Settings are singletons accessible anywhere via `GetDefault<>()` or by pre-defined `UMounteaInventoryStatics`
    - Data assets are soft references loaded synchronously when needed
    - Always validate objects before use

### Categories and Rarities

Categories and rarities are defined in data assets but accessed through convenience functions:

```cpp
// Get available categories for dropdown/validation
TArray<FString> UMounteaInventoryItemTemplate::GetAllowedCategories()
{
    auto Settings = UMounteaInventoryStatics::GetInventorySettings();
    return IsValid(Settings) ? Settings->GetAllowedCategories() : TArray<FString>{TEXT("Miscellaneous")};
}

// Access category data for items
FInventoryCategory Category = UMounteaInventoryStatics::GetInventoryCategory(Item);
FLinearColor RarityColor = UMounteaInventoryStatics::GetInventoryRarity(Item).RarityColor;
```

!!! note "When & Why"
    - Item creation, UI display, validation
    - Centralized configuration prevents hardcoded values

## Common Patterns

### Pattern 1: Equipment Slot Discovery

!!! note "When & Why"
    - Building equipment UI or validation
    - Dynamic slot configuration without hardcoding

```cpp
TArray<FName> UMounteaAdvancedAttachmentSlotBase::GetAvailableSlotNames() const
{
    const auto Settings = UMounteaInventoryStatics::GetInventorySettings();
    if (!Settings) return {};

    const auto EquipmentConfig = Settings->EquipmentSettingsConfig.LoadSynchronous();
    if (!IsValid(EquipmentConfig)) return {};

    TArray<FName> SlotNames;
    EquipmentConfig->AllowedEquipmentSlots.GetKeys(SlotNames);
    return SlotNames;
}
```

### Pattern 2: Theme Application

!!! note "When & Why"
    - Widget construction
    - Consistent visual styling across all UI

```cpp
void UMounteaAdvancedInventoryBaseWidget::NativeConstruct()
{
    Super::NativeConstruct();
    Execute_ApplyTheme(this);
}

// In your widget class
void UMyInventoryWidget::ApplyTheme_Implementation()
{
    // Access settings is not needed in this case, as UMounteaInventorySystemStatics 
    // provides functions to get the Config directly
    /*
    auto Settings = UMounteaInventoryStatics::GetInventorySettings();
    if (!Settings)
        return;
    */

    // Access theme config and apply colors/styles
    auto Config = UMounteaInventorySystemStatics::GetMounteaAdvancedInventoryConfig();
    if (Config && Config->BaseTheme.LoadSynchronous())
    {
        auto Theme = Config->BaseTheme.LoadSynchronous();
        // Apply theme colors to your widgets
    }
}
```

### Pattern 3: Subcategory Access

!!! note "When & Why"
    - Hierarchical item organization
    - Support complex categorization systems

```cpp
TArray<FString> UMounteaInventoryItemTemplate::GetAllowedSubCategories() const
{
    auto Settings = UMounteaInventoryStatics::GetInventorySettings();
    auto Config = Settings->InventorySettingsConfig.LoadSynchronous();
    
    if (const auto* CategoryConfig = Config->AllowedCategories.Find(ItemCategory))
    {
        TArray<FString> SubCategories;
        CategoryConfig->SubCategories.GetKeys(SubCategories);
        return SubCategories;
    }
    return {};
}
```

## Advanced Usage

### Static Helper Functions

Use static utility functions for common access patterns:

```cpp
// Centralized access pattern
UMounteaAdvancedInventorySettingsConfig* Config = 
    UMounteaInventorySystemStatics::GetMounteaAdvancedInventoryConfig();

// Item-specific data access
FInventoryCategory Category = UMounteaInventoryStatics::GetInventoryCategory(Item);
FString CategoryKey = UMounteaInventoryStatics::GetInventoryCategoryKey(Item);
FInventoryRarity Rarity = UMounteaInventoryStatics::GetInventoryRarity(Item);
```

!!! warning "Performance Impact & Thread Safety"
    - `LoadSynchronous()` can cause hitches - cache configs when possible
    - Settings access is safe, but avoid calling from non-game threads

## Project Settings Configuration

Open **Edit → Project Settings → Mountea Framework → Inventory System**:

| Property | Purpose | Default Plugin Value |
|----------|---------|---------------|
| Inventory Config | Main data asset | `DefaultInventoryConfig` |
| Equipment Config | Equipment slots | `DefaultEquipmentConfig` |
| Input Mapping | Inventory hotkeys | `IMC_Inventory` |
| Equipment Input Mapping | Equipment UI | `IMC_Equipment` |

## Troubleshooting

### Config Returns Null

!!! tip "Problem & Solution"
    - Settings or configs return nullptr
    - Verify data assets are assigned in Project Settings

```cpp
if (!Settings || !Settings->InventorySettingsConfig.IsValid())
{
    LOG_WARNING(TEXT("Inventory config not assigned"));
    return;
}
```

### Theme Not Applied

!!! tip "Problem & Solution"
    - Widgets don't receive theme styling
    - Ensure widget implements `IMounteaInventoryGenericWidgetInterface` or inherits from `UMounteaAdvancedInventoryBaseWidget`

## Best Practices

- **Validate Everything:** Always check for null before accessing configs
- **Cache Configs:** Store frequently-used configs in member variables
- **Use Statics:** Prefer static helper functions for common patterns
- **Theme Early:** Apply themes in `NativeConstruct()` for consistent timing

## Next Steps

- **[Inventory Types Configuration](InventoryTypes.md):** Configure different inventory behaviors
- **[UI Theming Guide](UIThemingGuide.md):** Complete theme customization
- **[Equipment System](../EquipmentSystem/EquipmentSystem.md):** Equipment slot setup and management
