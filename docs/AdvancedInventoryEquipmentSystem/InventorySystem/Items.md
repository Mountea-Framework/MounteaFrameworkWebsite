# Inventory Items

Runtime item instances with network replication and state management.

## Core Data Structures

### `FInventoryItem`

Runtime item instance containing:

- **Template Reference** - Links to static item definition
- **Quantity** - Current stack size for stackable items
- **Durability** - Current condition (0.0 to 1.0)
- **Custom Data** - Gameplay tags for item-specific metadata
- **Affector Slots** - Map of attached items by slot
- **Owning Inventory** - Reference to container inventory

### `FInventoryItemSnapshot`

Lightweight replication tracking for:

- Quantity changes
- Durability modifications
- Custom data updates

### `FInventoryItemArray`

Replicated container using FastArraySerializer for efficient network updates.

## Item Creation

### From Template

```cpp
// Create item from template
FInventoryItem NewItem(ItemTemplate, Quantity, Durability, OwningInventory);

// Using static function
FInventoryItem Item = UMounteaInventoryStatics::NewInventoryItem(ItemGuid);
```

### Manual Construction

```cpp
FInventoryItem Item;
Item.SetTemplate(WeaponTemplate);
Item.SetQuantity(5);
Item.SetDurability(0.8f);
Item.SetCustomData(CustomTags);
```

## Item Properties

### Template Data Access

```cpp
// Get item name from template
FText ItemName = Item.GetItemName();

// Get descriptions
FText ShortInfo = Item.GetItemShortInfo();
FText LongInfo = Item.GetItemLongInfo();

// Get visual assets
UTexture2D* Cover = Item.GetCover();
```

### Runtime Data

```cpp
// Current state
FGuid ItemGuid = Item.GetGuid();
int32 CurrentQuantity = Item.GetQuantity();
float CurrentDurability = Item.GetDurability();

// Validation
bool IsValid = Item.IsItemValid();
bool IsInInventory = Item.IsItemInInventory();
```

## Quantity Management

### Stack Operations

```cpp
// Modify quantities
Item.SetQuantity(NewQuantity);

// Through inventory interface
Inventory->IncreaseItemQuantity(ItemGuid, Amount);
Inventory->DecreaseItemQuantity(ItemGuid, Amount);
```

### Stack Rules

Items stack based on template flags:

- `EIIF_Stackable` - Can combine with identical items
- `MaxStackSize` - Maximum items per stack
- Template matching required for stacking

## Durability System

### Durability Operations

```cpp
// Set durability
Item.SetDurability(0.5f); // 50% condition

// Modify through inventory
Inventory->ModifyItemDurability(ItemGuid, DeltaDurability);
```

### Durability Events

- `OnItemDurabilityChanged` - Fired when durability changes
- Automatic notifications for threshold events
- Integration with item condition visuals

## Custom Data System

### Metadata Tags

```cpp
// Set custom data
FGameplayTagContainer CustomTags;
CustomTags.AddTag(FGameplayTag::RequestGameplayTag("Item.State.Enchanted"));
Item.SetCustomData(CustomTags);

// Check for specific tags
bool IsEnchanted = Item.GetCustomData().HasTag(EnchantedTag);
```

### Use Cases

- Item states (broken, enchanted, blessed)
- Temporary effects and buffs
- Quest-specific markers
- Player customization data

## Affector Slots

### Attachment System

```cpp
// Get affector mappings
const TMap<FGameplayTag, FGuid>& Slots = Item.GetAffectorSlots();

// Set affector slots
TMap<FGameplayTag, FGuid> NewSlots;
NewSlots.Add(GemSlotTag, GemItemGuid);
Item.SetAffectorSlots(NewSlots);
```

### Integration

Affector slots link to the [Attachment System](../EquipmentSystem/AttachmentSystem.md) for:

- Weapon modifications
- Armor enhancements  
- Tool upgrades

## Network Replication

### Delta Serialization

`FInventoryItemArray` provides efficient replication:

- Only changed items replicated
- Automatic bandwidth optimization
- Conflict resolution on authority

### Replication Events

```cpp
// Called on replication
void PreReplicatedRemove(const FInventoryItemArray& ArraySerializer);
void PostReplicatedAdd(const FInventoryItemArray& ArraySerializer);
void PostReplicatedChange(const FInventoryItemArray& ArraySerializer);
```

## Item Validation

### Checks

```cpp
// Validate item instance
bool IsValid = UMounteaInventoryStatics::IsInventoryItemValid(Item);

// Template validation
bool HasTemplate = IsValid(Item.GetTemplate());

// Quantity validation
bool ValidQuantity = Item.GetQuantity() > 0;
```

### Common Issues

- Invalid template references
- Negative quantities
- Invalid durability values (< 0.0 or > 1.0)
- Missing owning inventory for networked items
