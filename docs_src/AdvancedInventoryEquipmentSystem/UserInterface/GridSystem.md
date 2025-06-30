# Grid System

2D spatial inventory layouts with coordinate-based item placement and drag-drop functionality.

## Core Components

### Classes

- **`UMounteaAdvancedInventoryItemsGridWidget`** - Grid implementation
- **`FMounteaInventoryGridSlot`** - Spatial slot data

### Interfaces

- **`IMounteaAdvancedInventoryItemsGridWidgetInterface`** - Grid operations

## Grid Operations

### Item Placement

```cpp
// Add to first empty slot
bool Success = GridWidget->AddItemToEmptySlot(ItemId);

// Add to specific slot
bool Placed = GridWidget->AddItemToSlot(ItemId, SlotIndex);

// Remove from slot
bool Removed = GridWidget->RemoveItemFromSlot(SlotIndex);

// Remove all instances
bool Cleared = GridWidget->RemoveItemFromGrid(ItemId, -1);
```

### Slot Queries

```cpp
// Get item in slot
FGuid ItemId = GridWidget->GetItemInSlot(SlotIndex);

// Check slot state
bool IsEmpty = GridWidget->IsSlotEmpty(SlotIndex);
bool HasItem = GridWidget->IsItemInGrid(ItemId);

// Find item location
int32 SlotIndex = GridWidget->GetSlotIndexByItem(ItemId);
```

### Grid Management

```cpp
// Grid properties
int32 TotalSlots = GridWidget->GetTotalSlots();

// Clear all
GridWidget->ClearAllSlots();

// Swap items
GridWidget->SwapItemsBetweenSlots(SlotIndex1, SlotIndex2);
```

## Coordinate System

### Grid Slots

```cpp
struct FMounteaInventoryGridSlot : public FInventorySlot
{
    FIntPoint SlotPosition;  // X,Y coordinates in grid
};
```

### Coordinate Operations

```cpp
// Get slot by coordinates
int32 SlotIndex = GridWidget->GetGridSlotIndexByCoords(FIntPoint(3, 2));

// Get slot data
FMounteaInventoryGridSlot SlotData = GridWidget->GetGridSlotData(SlotIndex);

// Get all slots
TSet<FMounteaInventoryGridSlot> AllSlots = GridWidget->GetGridSlotsData();
```

## Advanced Features

### Stacking Support

```cpp
// Get total quantity for item across all slots
int32 TotalQuantity = GridWidget->GetStacksSizeForItem(ItemId);

// Get all slots containing specific item
TSet<FMounteaInventoryGridSlot> ItemSlots = GridWidget->GetGridSlotsDataForItem(ItemId);
```

### Widget Access

```cpp
// Find empty slot widget
UUserWidget* EmptySlot = GridWidget->FindEmptyWidgetSlot();

// Get slot widget
UUserWidget* SlotWidget = GridWidget->GetItemSlotWidget(SlotIndex);

// Get item widget in slot
UUserWidget* ItemWidget = GridWidget->GetItemWidgetInSlot(SlotIndex);
```

### Dynamic Slots

```cpp
// Add new slot to grid
GridWidget->AddSlot(NewGridSlotData);

// Update item in slot
GridWidget->UpdateItemInSlot(ItemId, SlotIndex);
```

## Configuration

### Grid Settings

Configured in `UMounteaAdvancedInventorySettingsConfig`:

```cpp
FIntPoint InventoryGridDimensions = FIntPoint(5, 8);  // 5x8 grid
FVector2D ItemSlotSize = FVector2D(128.0f, 128.0f);  // Slot pixel size
float ItemSlotPadding = 5.0f;                        // Spacing between slots
float ItemSlotAspectRatio = 1.0f;                    // Width/height ratio
```

## Helper Functions

### Slot Finding

```cpp
// Find compatible empty slot
int32 EmptyIndex = GridWidget->FindEmptySlotIndex(ItemId);

// Helper with inventory context
int32 SlotIndex = UMounteaInventoryUIStatics::Helper_FindEmptyGridSlotIndex(
    GridWidget, ItemId, ParentInventory);
```

## Use Cases

- **Traditional RPG** - Tetris-style item placement
- **Diablo-style** - Variable size items
- **Simple Grid** - Fixed slot assignments
- **Crafting Tables** - Recipe ingredient placement
