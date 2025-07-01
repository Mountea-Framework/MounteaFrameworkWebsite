# Inventory Types Configuration

## What You'll Learn

- Understanding different inventory types and their behaviors
- Configuring inventory limits and constraints
- Setting up type-specific flags and properties
- Customizing inventory behavior for different game entities

## Quick Start

```cpp
// Access inventory type configuration
auto Config = UMounteaInventorySystemStatics::GetMounteaAdvancedInventoryConfig();
FInventoryTypeConfig PlayerConfig = Config->AllowedInventoryTypes[EInventoryType::EIT_Player];

// Check type capabilities
bool CanStack = PlayerConfig.ConfigFlags & EInventoryTypeFlags::EITF_AllowStacking;
float WeightLimit = PlayerConfig.MaxWeight;
```

!!! tip "Result"
    Access to all inventory type behaviors and constraints for any inventory entity.

## Core Concepts

### Inventory Types Overview

Each inventory type serves different gameplay purposes with specific behaviors:

| Type | Purpose | Primary Use Case |
|------|---------|------------------|
| **Player** | Character inventory | Main player storage with progression |
| **NPC** | Character inventory | AI character storage, becomes lootable |
| **Storage** | Shared containers | Chests, lockers, persistent storage |
| **Merchant** | Trading interface | Buy/sell operations with value limits |
| **Loot** | Temporary containers | Ground loot, corpse containers |
| **Specialized** | Custom systems | Quest items, unique constraints |

### Configuration Structure

Each type defines behavior through flags and limits:

```cpp
// Example: Player inventory setup
void UMounteaAdvancedInventorySettingsConfig::SetupPlayerConfig(FInventoryTypeConfig& Config)
{
    Config.InventoryDisplayName = LOCTEXT("PlayerInventory", "Character Inventory");
    Config.ConfigFlags = static_cast<uint8>(
        EInventoryTypeFlags::EITF_HasWeightLimit | 
        EInventoryTypeFlags::EITF_CanAddItems |
        EInventoryTypeFlags::EITF_CanRemoveItems |
        EInventoryTypeFlags::EITF_AllowStacking |
        EInventoryTypeFlags::EITF_AutoStack |
        EInventoryTypeFlags::EITF_Persistent
    );
    Config.SlotsRange = FIntPoint(30, 50);
    Config.MaxWeight = 75.0f;
}
```

!!! note "Editor Configuration"
    All inventory types can be configured directly in Unreal Editor through the Inventory Settings Config Data Asset. Open your config asset to modify these values visually.

![Inventory Types Configuration](https://cdn2.unrealengine.com/hlod-water-support-in-unreal-engine-5-1-1920x1080-e402b5c30a87.jpg?resize=1&w=1920)

## Inventory Type Details

### Player Inventory

!!! note "When & Why"
    - Main character storage system
    - Supports progression through expandable slots
    - Weight affects movement speed

```cpp
// Player configuration features
Config.WeightThresholds = FVector4(0.3f, 0.5f, 0.7f, 0.9f);
Config.WeightSpeedMultipliers = FVector4(1.0f, 0.8f, 0.6f, 0.4f);
```

**Key Features:**

- **Slots:** 30-50 (expandable)
- **Weight Limit:** 75kg with speed penalties
- **Persistence:** Survives game sessions
- **Auto-stacking:** Automatically organizes identical items

### NPC Inventory

!!! note "When & Why"
    - AI character storage
    - Becomes lootable when character dies
    - Simpler than player inventory

```cpp
// NPC-specific setup
Config.AccessFlags = static_cast<uint8>(
    EInventoryFlags::EIF_Private | 
    EInventoryFlags::EIF_Lootable
);
Config.SlotsRange = FIntPoint(15, 30);
Config.MaxWeight = 50.0f;
```

**Key Features:**

- **Slots:** 15-30 (fixed or limited growth)
- **Weight Limit:** 50kg (lighter than player)
- **Lootable:** Accessible when NPC is defeated
- **Non-persistent:** Cleared when NPC despawns

### Storage Inventory

!!! note "When & Why"
    - Shared containers like chests
    - High capacity for base building
    - Persistent across sessions

```cpp
// Large capacity configuration
Config.SlotsRange = FIntPoint(50, 200);
Config.MaxWeight = 300.0f;
Config.ConfigFlags |= EInventoryTypeFlags::EITF_Persistent;
```

**Key Features:**

- **Slots:** 50-200 (very expandable)
- **Weight Limit:** 300kg (highest capacity)
- **Shared:** Multiple players can access
- **Persistent:** Contents saved permanently

### Merchant Inventory

!!! note "When & Why"
    - Trading interfaces
    - Value-based limits instead of weight
    - Dynamic stock management

```cpp
// Value-based limitation
Config.ConfigFlags = static_cast<uint8>(
    EInventoryTypeFlags::EITF_HasValueLimit |
    EInventoryTypeFlags::EITF_CanAddItems |
    EInventoryTypeFlags::EITF_CanRemoveItems |
    EInventoryTypeFlags::EITF_AllowStacking
);
Config.MaxValue = 5000.0f;
```

**Key Features:**

- **Slots:** 50 (fixed)
- **Value Limit:** 5000 credits (not weight-based)
- **Trading:** Buy/sell operations
- **Stock rotation:** Can refresh inventory

### Loot Inventory

!!! note "When & Why"
    - Temporary ground containers
    - Public access for pickup
    - Minimal configuration

```cpp
// Simplified loot setup
Config.AccessFlags = static_cast<uint8>(
    EInventoryFlags::EIF_Public | 
    EInventoryFlags::EIF_Lootable | 
    EInventoryFlags::EIF_Temporary
);
Config.SlotsRange = FIntPoint(1, 30);
```

**Key Features:**

- **Slots:** 1-30 (variable based on content)
- **Public:** Any player can access
- **Temporary:** Auto-cleanup after time
- **No limits:** Weight/value restrictions disabled

### Specialized Inventory

!!! note "When & Why"
    - Custom game mechanics
    - Quest item storage
    - Unique constraints per use case

```cpp
// Minimal setup for customization
Config.ConfigFlags = static_cast<uint8>(
    EInventoryTypeFlags::EITF_CanAddItems | 
    EInventoryTypeFlags::EITF_CanRemoveItems
);
Config.SlotsRange = FIntPoint(20, 20);
```

**Key Features:**

- **Slots:** 20 (fixed)
- **Flexible:** Enable only needed features
- **Custom logic:** Override behavior in subclasses

## Configuration Flags Reference

### Type Flags (EInventoryTypeFlags)

```cpp
enum class EInventoryTypeFlags : uint8
{
    EITF_HasWeightLimit     = 1 << 0,  // Enable weight constraints
    EITF_HasValueLimit      = 1 << 1,  // Enable value constraints  
    EITF_CanAddItems        = 1 << 2,  // Allow item addition
    EITF_CanRemoveItems     = 1 << 3,  // Allow item removal
    EITF_AllowStacking      = 1 << 4,  // Enable item stacking
    EITF_AutoStack          = 1 << 5,  // Automatic stacking
    EITF_Persistent         = 1 << 6   // Save across sessions
};
```

!!! note "Editor Flags Configuration"
    Flags appear as checkboxes in the Data Asset editor. Toggle individual behaviors without touching code.

![Configuration Flags Editor](https://cdn2.unrealengine.com/hlod-water-support-in-unreal-engine-5-1-1920x1080-e402b5c30a87.jpg?resize=1&w=1920)

### Access Flags (EInventoryFlags)

```cpp
enum class EInventoryFlags : uint8
{
    EIF_Private     = 1 << 0,  // Owner-only access
    EIF_Public      = 1 << 1,  // Anyone can access
    EIF_Lootable    = 1 << 2,  // Can be looted when available
    EIF_Temporary   = 1 << 3   // Auto-cleanup enabled
};
```

## Customizing Inventory Types

### Override Default Configuration

```cpp
// In your settings config
void CustomizePlayerInventory()
{
    auto Config = UMounteaInventorySystemStatics::GetMounteaAdvancedInventoryConfig();
    
    // Modify player config
    FInventoryTypeConfig& PlayerConfig = Config->AllowedInventoryTypes[EInventoryType::EIT_Player];
    PlayerConfig.SlotsRange = FIntPoint(40, 80);  // More slots
    PlayerConfig.MaxWeight = 100.0f;              // Higher weight limit
}
```

!!! note "Editor Workflow"
    Instead of code modifications, edit values directly in your Inventory Settings Config Data Asset. Changes apply immediately without recompilation.

![Inventory Type Customization](https://cdn2.unrealengine.com/hlod-water-support-in-unreal-engine-5-1-1920x1080-e402b5c30a87.jpg?resize=1&w=1920)

### Runtime Type Checking

```cpp
// Check inventory capabilities at runtime
bool CanInventoryStack(UMounteaInventoryComponent* Inventory)
{
    auto Config = UMounteaInventorySystemStatics::GetMounteaAdvancedInventoryConfig();
    if (!Config) return false;
    
    EInventoryType Type = Inventory->GetInventoryType();
    const FInventoryTypeConfig& TypeConfig = Config->AllowedInventoryTypes[Type];
    
    return TypeConfig.ConfigFlags & EInventoryTypeFlags::EITF_AllowStacking;
}
```

## Performance Considerations

!!! warning "Optimization Tips"
    - **Cache Type Configs:** Load once, store in component
    - **Batch Operations:** Group multiple item operations
    - **Avoid LoadSynchronous:** Cache configs during initialization

```cpp
// Cache pattern in component
class UMounteaInventoryComponent : public UActorComponent
{
private:
    FInventoryTypeConfig CachedTypeConfig;
    
public:
    void BeginPlay() override
    {
        Super::BeginPlay();
        CacheTypeConfiguration();
    }
    
    void CacheTypeConfiguration()
    {
        auto Config = UMounteaInventorySystemStatics::GetMounteaAdvancedInventoryConfig();
        if (Config)
            CachedTypeConfig = Config->AllowedInventoryTypes[InventoryType];
    }
};
```

## Troubleshooting

### Type Configuration Not Found

!!! tip "Problem & Solution"
    - Inventory type returns default/empty config
    - Verify type is defined in `AllowedInventoryTypes` map in your Data Asset

![Troubleshooting Configuration](https://cdn2.unrealengine.com/hlod-water-support-in-unreal-engine-5-1-1920x1080-e402b5c30a87.jpg?resize=1&w=1920)

```cpp
// Validate type exists
if (!Config->AllowedInventoryTypes.Contains(InventoryType))
{
    LOG_ERROR(TEXT("Inventory type %d not configured"), (int32)InventoryType);
    return;
}
```

### Flags Not Working

!!! tip "Problem & Solution"
    - Type behavior doesn't match flag settings
    - Check bitwise operations and flag combinations

```cpp
// Debug flag checking
void DebugInventoryFlags(const FInventoryTypeConfig& TypeConfig)
{
    LOG_INFO(TEXT("Can Add Items: %s"), 
        (TypeConfig.ConfigFlags & EInventoryTypeFlags::EITF_CanAddItems) ? TEXT("Yes") : TEXT("No"));
}
```

## Best Practices

- **Define Early:** Set up inventory types before creating inventories
- **Use Defaults:** Start with plugin defaults, customize as needed
- **Test Combinations:** Verify flag combinations work as expected
- **Document Changes:** Track custom type configurations

## Next Steps

- **[Settings Overview](Settings.md):** Basic settings configuration
- **[UI Theming Guide](UIThemingGuide.md):** Visual customization
- **[Item Categories](ItemCategoriesRarities.md):** Item organization system
