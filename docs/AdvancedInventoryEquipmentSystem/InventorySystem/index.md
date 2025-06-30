# Inventory System Core

Core inventory management with item storage, modification, and network replication.

## Core Components

### Classes

- **`UMounteaInventoryComponent`** - Main inventory management component
- **`UMounteaInventoryUIComponent`** - UI interface handling component

### Interfaces

- **`IMounteaAdvancedInventoryInterface`** - Core inventory operations contract
- **`IMounteaAdvancedInventoryUIInterface`** - UI management interface

## Key Features

- **Item Management** - Add, remove, search, and modify items
- **Stack Operations** - Quantity tracking and stack manipulation
- **Durability System** - Item degradation and repair mechanics
- **Network Replication** - Efficient multiplayer synchronization
- **Event System** - Comprehensive operation notifications

## Basic Usage

### Component Setup

```cpp
// Add to Actor
UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Inventory")
UMounteaInventoryComponent* InventoryComponent;

UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Inventory")
UMounteaInventoryUIComponent* InventoryUIComponent;
```

### Item Operations

```cpp
// Add item from template
bool Success = InventoryComponent->AddItemFromTemplate(Template, Quantity, Durability);

// Find item by GUID
FInventoryItem Item = InventoryComponent->FindItem(FInventoryItemSearchParams(ItemGuid));

// Remove item
bool Removed = InventoryComponent->RemoveItem(ItemGuid);

// Modify quantities
InventoryComponent->IncreaseItemQuantity(ItemGuid, Amount);
InventoryComponent->DecreaseItemQuantity(ItemGuid, Amount);
```

### UI Operations

```cpp
// Create main UI
bool Created = InventoryUIComponent->CreateMainUIWrapper();

// Handle item selection
InventoryUIComponent->ItemSelected(SelectedItemGuid);

// Process notifications
InventoryUIComponent->CreateInventoryNotification(NotificationData);
```

## Search System

Advanced item queries using `FInventoryItemSearchParams`:

```cpp
// Search by template
FInventoryItemSearchParams SearchByTemplate(ItemTemplate);

// Search by tags
FInventoryItemSearchParams SearchByTags(TagContainer, bRequireAll);

// Search by category
FInventoryItemSearchParams SearchByCategory("Weapons");

// Complex search
FInventoryItemSearchParams ComplexSearch;
ComplexSearch.bSearchByTemplate = true;
ComplexSearch.Template = WeaponTemplate;
ComplexSearch.bSearchByTags = true;
ComplexSearch.Tags = WeaponTags;
```

## Events

### Inventory Component Events

- `OnItemAdded` - Item added to inventory
- `OnItemRemoved` - Item removed from inventory
- `OnItemQuantityChanged` - Stack size modified
- `OnItemDurabilityChanged` - Durability updated
- `OnNotificationProcessed` - Notification handled

### UI Component Events

- `OnCategorySelected` - Category selection changed
- `OnItemSelected` - Item selection updated

## Network Replication

The system uses FastArraySerializer for efficient replication:

- Delta compression for bandwidth optimization
- Authority validation on server
- Client prediction support
- Automatic conflict resolution

## Configuration

Inventory behavior controlled by:

- **Inventory Types** - Player, NPC, Storage, Merchant, Loot
- **Type Flags** - Weight limits, value limits, stacking rules
- **UI Settings** - Widget classes, grid dimensions, themes
