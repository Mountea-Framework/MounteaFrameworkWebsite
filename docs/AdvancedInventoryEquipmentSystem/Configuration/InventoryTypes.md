# Inventory Types

Different inventory behaviors and constraints for various use cases.

## Core Types

### `EInventoryType`

```cpp
enum class EInventoryType : uint8
{
    EIT_Player,      // Main character inventory
    EIT_NPC,         // NPCs and companions  
    EIT_Storage,     // Chests and containers
    EIT_Merchant,    // Vendors with trading
    EIT_Loot,        // Temporary loot sources
    EIT_Specialized  // Custom purposes
};
```

## Configuration Structure

### `FInventoryTypeConfig`

```cpp
struct FInventoryTypeConfig
{
    FText InventoryDisplayName;           // UI name
    TSoftClassPtr<UUserWidget> WidgetClass; // UI widget
    uint8 ConfigFlags;                    // Type-specific flags
    uint8 AccessFlags;                    // Behavior flags
    FIntPoint SlotsRange;                 // Min/max slots
    int32 StartingSlots;                  // Initial capacity
    float MaxWeight;                      // Weight limit
    float MaxValue;                       // Value limit
    FGameplayTagContainer InventoryTags;  // Special properties
};
```

## Type Behaviors

### Player Inventory

- Weight/value limits enforced
- Equipment slot integration
- Save/load persistence
- Full UI functionality

### NPC Inventory

- AI interaction support
- Limited player access
- Context-sensitive behavior

### Storage Containers

- No weight limits
- Permanent persistence
- Shared access support

### Merchant Inventory

- Buy/sell mechanics
- Price calculations
- Stock management

### Loot Containers

- Temporary existence
- Auto-cleanup timers
- Spawn-based creation

## Flags System

### Access Flags (`EInventoryFlags`)

```cpp
EIF_Public      // Accessible by all
EIF_TeamShared  // Team access only
EIF_Lootable    // Can be looted
EIF_Temporary   // Auto-cleanup
EIF_Private     // Owner only
```

### Type Flags (`EInventoryTypeFlags`)

```cpp
EITF_HasWeightLimit   // Enforce weight
EITF_HasValueLimit    // Enforce value
EITF_CanAddItems      // Allow additions
EITF_CanRemoveItems   // Allow removal
EITF_AllowStacking    // Item stacking
EITF_AutoStack        // Auto-combine
EITF_Persistent       // Save between sessions
```

## Usage

### Runtime Access

```cpp
// Get type configuration
UMounteaAdvancedInventorySettingsConfig* Config = GetInventoryConfig();
FInventoryTypeConfig PlayerConfig = Config->AllowedInventoryTypes[EInventoryType::EIT_Player];

// Check capabilities
bool CanAddItems = PlayerConfig.HasFlag(EInventoryFlags::EIF_CanAddItems);
bool HasWeightLimit = PlayerConfig.HasWeightLimit();
```

### Flag Validation

```cpp
// Check access permissions
bool IsPublic = Config.IsPublic();
bool IsLootable = Config.IsLootable();

// Validate operations
if (Config.CanAddItems())
{
    // Allow item addition
}
```
