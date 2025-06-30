# Settings

System-wide configuration for inventory types, themes, and behavior.

## Core Classes

### Settings Overview

- **`UMounteaAdvancedInventorySettings`** - Project settings (Editor > Project Settings)
- **`UMounteaAdvancedInventorySettingsConfig`** - Runtime configuration data asset
- **`UMounteaAdvancedInventoryThemeConfig`** - Visual theming
- **`UMounteaAdvancedEquipmentSettingsConfig`** - Equipment slots
- **`UMounteaAdvancedInventoryInteractiveWidgetConfig`** - 3D preview setup

## Project Settings

### Main Configuration

```cpp
// Access in code
UMounteaAdvancedInventorySettings* Settings = UMounteaInventoryStatics::GetInventorySettings();

// Key properties
TSoftObjectPtr<UInputMappingContext> InputMapping;
TSoftObjectPtr<UMounteaAdvancedInventorySettingsConfig> InventoryConfig;
TSoftObjectPtr<UMounteaAdvancedEquipmentSettingsConfig> EquipmentConfig;
uint8 LogVerbosity; // Logging levels
```

### Accessing Data

```cpp
// Get allowed categories/rarities
TArray<FString> Categories = Settings->GetAllowedCategories();
TArray<FString> Rarities = Settings->GetAllowedRarities();
```

## Runtime Configuration

### Inventory Settings Config

```cpp
// Main configuration data asset
UMounteaAdvancedInventorySettingsConfig* Config = GetInventorySettingsConfig();

// Core data
TMap<EInventoryType, FInventoryTypeConfig> AllowedInventoryTypes;
TMap<FString, FInventoryRarity> AllowedRarities;  
TMap<FString, FInventoryCategory> AllowedCategories;
```

### UI Configuration

```cpp
// Widget classes
TSoftClassPtr<UUserWidget> InventoryWidgetClass;
TSoftClassPtr<UUserWidget> ItemSlotWidgetClass;
TSoftClassPtr<UUserWidget> NotificationWidgetClass;

// Grid settings
FIntPoint InventoryGridDimensions = FIntPoint(5, 8);
FVector2D ItemSlotSize = FVector2D(128.0f, 128.0f);
float ItemSlotPadding = 5.0f;

// Behavior
uint8 bAlwaysStackStackableItems : 1;
uint8 bAllowDragAndDrop : 1;
```

## Theme System

### Theme Configuration

```cpp
UMounteaAdvancedInventoryThemeConfig* Theme = GetThemeConfig();

// Color hierarchy
FLinearColor BackgroundPrimary;     // Main backgrounds
FLinearColor BackgroundSecondary;   // Secondary areas
FLinearColor PrimaryNormal;         // Default state
FLinearColor PrimaryHovered;        // Mouse over
FLinearColor PrimaryActive;         // Pressed/selected

// Text colors
FLinearColor PrimaryText;
FLinearColor SecondaryText;
int PrimaryTextSize = 16;
```

### Applying Themes

```cpp
// Auto-apply to widgets
UMounteaInventoryUIStatics::ApplyTheme(Widget);

// Manual color access
UMounteaAdvancedInventoryThemeConfig* Theme = UMounteaInventoryUIStatics::GetThemeConfig();
Widget->SetColorAndOpacity(Theme->PrimaryNormal);
```

## Equipment Configuration

### Slot Definition

```cpp
// Equipment settings config
UMounteaAdvancedEquipmentSettingsConfig* EquipConfig;

// Slot mapping
TMap<FName, FMounteaEquipmentSlotHeaderData> AllowedEquipmentSlots;

// Example slot
FMounteaEquipmentSlotHeaderData WeaponSlot;
WeaponSlot.TagContainer.AddTag(WeaponTag);
WeaponSlot.DisplayName = LOCTEXT("MainHand", "Main Hand");
```

## Notifications

### Notification Setup

```cpp
// Style per category
TMap<EInventoryNotificationCategory, FInventoryNotificationStyle> NotificationCategoryStyle;

// Configuration per type
TMap<FString, FInventoryNotificationConfig> NotificationConfigs;

FInventoryNotificationConfig ItemAddedConfig;
ItemAddedConfig.bIsEnabled = true;
ItemAddedConfig.DefaultDuration = 3.0f;
ItemAddedConfig.MessageTemplate = LOCTEXT("Added", "{ItemName} x{Quantity} added");
```

## Best Practices

- Configure settings early in project development
- Use data assets for runtime-modifiable settings
- Test theme colors across all UI states
- Balance notification frequency to avoid spam
- Organize widget classes by functionality
