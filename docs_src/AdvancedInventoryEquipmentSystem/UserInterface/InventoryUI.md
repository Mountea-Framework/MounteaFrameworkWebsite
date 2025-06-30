# Inventory UI

Main inventory interface components with slot management and user interaction.

## Core Components

### Classes

- **`UMounteaInventoryUIComponent`** - UI component managing interface state
- **`FInventorySlot`** - Base slot data structure

### Interfaces  

- **`IMounteaAdvancedInventoryUIInterface`** - Main UI operations

## Key Features

- **Widget Creation** - Dynamic UI instantiation
- **Visibility Management** - Show/hide inventory
- **Item Selection** - Track active items
- **Category Filtering** - Organize by item type
- **Notification Display** - User feedback
- **Grid Slot Persistence** - Save slot states

## Basic Operations

### UI Management

```cpp
// Create main interface
bool Success = InventoryUI->CreateMainUIWrapper();

// Control visibility
InventoryUI->SetMainUIVisibility(ESlateVisibility::Visible);
ESlateVisibility Current = InventoryUI->GetMainUIVisibility();

// Remove interface
InventoryUI->RemoveMainUIWrapper();
```

### Item Interaction

```cpp
// Select item
InventoryUI->ItemSelected(ItemGuid);
FGuid ActiveItem = InventoryUI->GetActiveItemGuid();

// Set active widget
InventoryUI->SetActiveItemWidget(MyItemWidget);
UUserWidget* ActiveWidget = InventoryUI->GetActiveItemWidget();
```

### Category System

```cpp
// Handle category selection
InventoryUI->CategorySelected("Weapons");
FString CurrentCategory = InventoryUI->GetSelectedCategoryId();
```

## Slot Management

### Grid Slots

```cpp
// Add/remove slots
InventoryUI->AddSlot(GridSlotData);
InventoryUI->RemoveSlot(GridSlotData);

// Bulk operations
InventoryUI->AddSlots(SlotSet);
InventoryUI->RemoveSlots(SlotSet);

// Update existing
InventoryUI->UpdateSlot(ModifiedSlotData);

// Get saved slots
TSet<FMounteaInventoryGridSlot> SavedSlots = InventoryUI->GetSavedSlots();
```

## Notifications

### Notification Management

```cpp
// Set container
InventoryUI->SetNotificationContainer(NotificationWidget);
UUserWidget* Container = InventoryUI->GetNotificationContainer();

// Create notification
InventoryUI->CreateInventoryNotification(NotificationData);

// Clear all
InventoryUI->RemoveInventoryNotifications();
```

## Events

```cpp
// Category selection
InventoryUI->GetOnCategorySelectedHandle().AddDynamic(this, &AMyActor::OnCategorySelected);

// Item selection  
InventoryUI->GetOnItemSelectedHandle().AddDynamic(this, &AMyActor::OnItemSelected);

void OnCategorySelected(const FString& CategoryId)
{
    // Filter inventory by category
}

void OnItemSelected(const FGuid& ItemGuid)
{
    // Show item details
}
```

## Integration

### With Inventory Component

```cpp
// Link UI to inventory
InventoryUI->SetParentInventory(InventoryComponent);
TScriptInterface<IMounteaAdvancedInventoryInterface> Inventory = InventoryUI->GetParentInventory();
```

### Item Processing

```cpp
// Handle inventory changes
InventoryUI->ProcessItemAdded(AddedItem);
InventoryUI->ProcessItemRemoved(RemovedItem);
InventoryUI->ProcessItemModified(ModifiedItem);
```
