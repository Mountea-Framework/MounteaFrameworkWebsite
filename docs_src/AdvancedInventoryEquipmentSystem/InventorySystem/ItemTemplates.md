# Item Templates

Static item definitions that serve as blueprints for creating inventory item instances.

## Core Class

### `UMounteaInventoryItemTemplate`

Data asset defining static item properties:

- **Primary Data** - Core identification and behavior
- **Secondary Data** - Visual assets and economic properties
- **Durability System** - Condition and degradation rules
- **Economic Data** - Pricing and trading information

## Primary Properties

### Identification

```cpp
// Core identification
FGuid Guid;                    // Unique template identifier
FText DisplayName;             // Localized item name
FString ItemCategory;          // Primary category (Weapon, Armor, etc.)
FString ItemSubCategory;       // Secondary classification
FString ItemRarity;            // Rarity tier (Common, Rare, Epic)
```

### Behavior Flags

```cpp
// Item behavior (bitmask)
uint8 ItemFlags;
// Available flags:
// - EIIF_Tradeable: Can be traded between players
// - EIIF_Stackable: Can combine with identical items  
// - EIIF_Craftable: Used in crafting recipes
// - EIIF_Dropable: Can be dropped into world
// - EIIF_Consumable: Single-use items
// - EIIF_QuestItem: Required for quests
// - EIIF_Unique: Only one allowed per inventory
// - EIIF_Durable: Has durability system
```

### Quantity Rules

```cpp
int32 MaxQuantity;             // Max items per inventory
int32 MaxStackSize;            // Max items per stack
FGameplayTagContainer Tags;    // Filtering and categorization tags
TSoftClassPtr<AActor> SpawnActor; // Actor spawned when used/dropped
```

## Visual Assets

### UI Elements

```cpp
FText ItemShortInfo;           // Brief description
FText ItemLongInfo;            // Detailed description
TSoftObjectPtr<UTexture2D> ItemThumbnail;  // Small icon
TSoftObjectPtr<UTexture2D> ItemCover;      // Large preview image
```

### 3D Assets

```cpp
TObjectPtr<UStreamableRenderAsset> ItemMesh;  // StaticMesh or SkeletalMesh
```

## Durability System

### Configuration

```cpp
bool bHasDurability;           // Enable durability
float MaxDurability;          // Maximum condition value
float BaseDurability;         // Starting condition
float DurabilityPenalization; // Damage per use
float DurabilityToPriceCoefficient; // Price impact
```

### Usage

```cpp
// Check if item uses durability
if (Template->bHasDurability)
{
    float StartingCondition = Template->BaseDurability;
    float MaxCondition = Template->MaxDurability;
}
```

## Economic Properties

### Pricing

```cpp
bool bHasPrice;               // Enable pricing
float BasePrice;              // Base monetary value
float SellPriceCoefficient;   // Sell price multiplier
```

### Weight System

```cpp
bool bHasWeight;              // Enable weight
float Weight;                 // Item weight in kg
```

## Attachment Support

### Slot Definitions

```cpp
FGameplayTagContainer AttachmentSlots; // Compatible attachment types
TObjectPtr<UObject> ItemSpecialAffect; // Special effects/abilities
```

### Slot Usage

```cpp
// Check attachment compatibility
bool CanAttachGem = Template->AttachmentSlots.HasTag(GemSlotTag);
```

## Template Creation

### In Editor

1. Create new **Inventory Item Template** data asset
2. Set primary identification data
3. Configure behavior flags
4. Add visual assets
5. Set up economic properties
6. Define attachment slots

### In Code

```cpp
// Access template data
UMounteaInventoryItemTemplate* Template = LoadObject<UMounteaInventoryItemTemplate>(
    nullptr, TEXT("/Game/Items/Weapons/Sword_Template"));

// Get properties
FText ItemName = Template->DisplayName;
bool IsStackable = Template->ItemFlags & static_cast<uint8>(EInventoryItemFlags::EIIF_Stackable);
```

## Categories & Rarities

### Template Configuration

Categories and rarities defined in [Settings](../Configuration/Settings.md):

```cpp
// Get allowed values
TArray<FString> Categories = UMounteaInventoryStatics::GetInventorySettings()->GetAllowedCategories();
TArray<FString> Rarities = UMounteaInventoryStatics::GetInventorySettings()->GetAllowedRarities();
```

### Dropdown Population

Template editor automatically populates dropdowns from settings configuration.

## Best Practices

### Naming Conventions

- Use descriptive display names
- Consistent category naming
- Logical subcategory hierarchy

### Asset Organization

- Group templates by category in project
- Use consistent folder structure
- Prefix template names for sorting

### Performance

- Use soft references for large assets
- Load meshes on-demand for previews
- Cache frequently accessed templates

## Integration

Templates integrate with:

- [Items](Items.md) - Runtime item creation
- [Categories](Categories.md) - Classification system
- [Rarity](Rarity.md) - Visual and economic effects
- [Attachment System](../EquipmentSystem/AttachmentSystem.md) - Equipment modifications
