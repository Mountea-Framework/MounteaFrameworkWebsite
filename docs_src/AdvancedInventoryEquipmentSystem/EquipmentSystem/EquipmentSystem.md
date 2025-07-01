# Equipment System Core

Specialized equipment management extending attachment containers with RPG-style functionality.

## Core Components

### Classes

- **`UMounteaEquipmentComponent`** - Enhanced attachment container for character equipment
- **`UMounteaAttachmentContainerComponent`** - Base attachment slot management

### Interfaces

- **`IMounteaAdvancedEquipmentInterface`** - Equipment-specific operations
- **`IMounteaAdvancedAttachmentContainerInterface`** - Container management

## Key Features

- **Equipment Slots** - Predefined attachment points (helmet, chest, weapon, etc.)
- **Slot Validation** - Tag-based compatibility checking
- **Equipment Switching** - RPG-style weapon/armor swapping
- **Dual-wield Logic** - Two-handed vs single-handed equipment rules
- **Network Replication** - Multiplayer equipment synchronization

## Basic Setup

### Component Configuration

```cpp
// Add to character
UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Equipment")
UMounteaEquipmentComponent* EquipmentComponent;

// In constructor
EquipmentComponent = CreateDefaultSubobject<UMounteaEquipmentComponent>(TEXT("Equipment"));
```

### Slot Definition

```cpp
// Configure equipment slots in settings
TMap<FName, FMounteaEquipmentSlotHeaderData> EquipmentSlots;
EquipmentSlots.Add("MainHand", WeaponSlotData);
EquipmentSlots.Add("OffHand", ShieldSlotData);
EquipmentSlots.Add("Helmet", HelmetSlotData);
```

## Equipment Operations

### Basic Equipping

```cpp
// Equip item to specific slot
bool Success = EquipmentComponent->TryAttach("MainHand", WeaponActor);

// Auto-find compatible slot
FName SlotId = EquipmentComponent->FindFirstFreeSlotWithTags(WeaponTags);
EquipmentComponent->TryAttach(SlotId, WeaponActor);
```

### Equipment Validation

```cpp
// Check slot compatibility
bool CanEquip = EquipmentComponent->IsValidSlot("MainHand");
bool IsOccupied = EquipmentComponent->IsSlotOccupied("MainHand");

// Validate item compatibility
UMounteaAttachableComponent* Attachable = WeaponActor->FindComponentByClass<UMounteaAttachableComponent>();
bool CanAttach = Attachable->CanAttach();
```

### Equipment Switching

```cpp
// Unequip current weapon
EquipmentComponent->TryDetach("MainHand");

// Equip new weapon
EquipmentComponent->TryAttach("MainHand", NewWeaponActor);

// Force equipment (replaces existing)
EquipmentComponent->ForceAttach("MainHand", NewWeaponActor);
```

## Slot Configuration

### Equipment Slot Data

```cpp
struct FMounteaEquipmentSlotHeaderData
{
    FGameplayTagContainer TagContainer;  // Compatible item tags
    FText DisplayName;                   // UI display name
};
```

### Tag-Based Filtering

```cpp
// Define weapon slot
FMounteaEquipmentSlotHeaderData WeaponSlot;
WeaponSlot.TagContainer.AddTag(FGameplayTag::RequestGameplayTag("Equipment.Weapon"));
WeaponSlot.TagContainer.AddTag(FGameplayTag::RequestGameplayTag("Equipment.OneHanded"));
WeaponSlot.DisplayName = LOCTEXT("MainHand", "Main Hand");
```

## Events

Equipment component inherits attachment container events:

- `OnAttachmentChanged` - Equipment equipped/unequipped
- `OnSlotStateChanged` - Slot availability changes
- `OnContainerCleared` - All equipment removed

## Integration

### With Inventory System

```cpp
// Equip item from inventory
FInventoryItem InventoryItem = Inventory->FindItem(SearchParams);
if (InventoryItem.IsItemValid())
{
    // Spawn equipment actor
    AActor* EquipmentActor = SpawnEquipmentFromTemplate(InventoryItem.GetTemplate());
    
    // Attach to equipment
    EquipmentComponent->TryAttach(SlotName, EquipmentActor);
}
```

### With Animation

Equipment changes can trigger animation blueprints for visual updates and attachment point adjustments.

## Use Cases

- **RPG Character Equipment** - Armor, weapons, accessories
- **Weapon Switching** - Combat loadout management  
- **Vehicle Customization** - Modular vehicle parts
- **Tool Systems** - Construction/crafting equipment
