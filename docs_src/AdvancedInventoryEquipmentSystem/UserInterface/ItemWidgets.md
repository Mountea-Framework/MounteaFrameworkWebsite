# Item Widgets

Individual item presentation and slot management widgets.

## Core Interfaces

### Item Display

- **`IMounteaAdvancedInventoryItemWidgetInterface`** - Individual item presentation
- **`IMounteaAdvancedInventoryItemSlotWidgetInterface`** - Slot containers
- **`IMounteaAdvancedInventoryItemSlotsWrapperWidgetInterface`** - Slot collections

### Item Actions

- **`IMounteaAdvancedInventoryItemActionWidgetInterface`** - Action buttons
- **`IMounteaAdvancedInventoryItemActionsContainerWidgetInterface`** - Action panels
- **`IMounteaAdvancedInventoryItemPanelWidgetInterface`** - Detail panels

## Item Widget Operations

### Basic Item Management

```cpp
// Set item identifier
ItemWidget->SetInventoryItemId(ItemGuid);
FGuid CurrentId = ItemWidget->GetInventoryItemId();

// Refresh display
ItemWidget->RefreshItemWidget(NewQuantity);

// Highlight selection
ItemWidget->HighlightItem(true);

// Set parent slot
ItemWidget->SetParentSlot(ParentSlotWidget);
```

## Slot Widget Operations

### Slot Management

```cpp
// Add/remove items
SlotWidget->AddItemToSlot(ItemId);
SlotWidget->RemoveItemFromSlot(ItemId);

// Check state
bool IsEmpty = SlotWidget->IsSlotEmpty();
UUserWidget* ItemInSlot = SlotWidget->GetItemWidgetInSlot();

// Handle selection
SlotWidget->SelectItemInSlot();
```

### Slot Data

```cpp
// Store slot information
SlotWidget->StoreBasicSlotData(SlotData);
SlotWidget->StoreGridSlotData(GridSlotData);

// Retrieve data
FInventorySlot SlotData = SlotWidget->GetSlotData();
FMounteaInventoryGridSlot GridData = SlotWidget->GetGridSlotData();

// Set parent wrapper
SlotWidget->SetParentSlotsWrapper(WrapperWidget);
```

### Tooltips

```cpp
// Get tooltip text
FString Tooltip = SlotWidget->GetSlotTooltip();

// Generate dynamic tooltip
FString GeneratedTooltip = UMounteaInventoryUIStatics::ItemSlot_GenerateSlotTooltip(SlotWidget);
```

## Slots Wrapper Operations

### Collection Management

```cpp
// Add/update items
SlotsWrapper->AddItem(ItemId);
SlotsWrapper->UpdateItem(ItemId, OptionalSlotIndex);
SlotsWrapper->RemoveItem(ItemId, Quantity);

// Selection handling
UUserWidget* Selected = SlotsWrapper->GetSelectedItemWidget();
SlotsWrapper->SetSelectedItemWidget(NewSelection);
```

## Static Helper Functions

### Slot Creation

```cpp
// Create slot data
FInventorySlot SlotData = UMounteaInventoryUIStatics::MakeInventorySlot(
    SlotWidget, ItemId, Quantity);

// Convert between types
FInventorySlot BasicSlot = UMounteaInventoryUIStatics::MakeInventorySlotData(GridSlotData);
FMounteaInventoryGridSlot GridSlot = UMounteaInventoryUIStatics::MakeInventoryGridSlotData(SlotData);
```

### Widget Utilities

```cpp
// Set owning UI
UMounteaInventoryUIStatics::SetItemOwningInventoryUI(ItemWidget, InventoryUI);
UMounteaInventoryUIStatics::SetItemSlotOwningInventoryUI(SlotWidget, InventoryUI);

// Refresh widgets
UMounteaInventoryUIStatics::Item_RefreshWidget(ItemWidget, Quantity);
UMounteaInventoryUIStatics::Item_HighlightItem(ItemWidget, bSelected);
```

## Widget Hierarchy

```text
Slots Wrapper (IMounteaAdvancedInventoryItemSlotsWrapperWidgetInterface)
├── Item Slot (IMounteaAdvancedInventoryItemSlotWidgetInterface)
│   └── Item Widget (IMounteaAdvancedInventoryItemWidgetInterface)
├── Action Container (IMounteaAdvancedInventoryItemActionsContainerWidgetInterface)
│   └── Action Widget (IMounteaAdvancedInventoryItemActionWidgetInterface)
└── Item Panel (IMounteaAdvancedInventoryItemPanelWidgetInterface)
```

## Implementation Example

```cpp
class UMyItemSlotWidget : public UUserWidget, 
    public IMounteaAdvancedInventoryItemSlotWidgetInterface
{
public:
    virtual void AddItemToSlot_Implementation(const FGuid& ItemId) override;
    virtual bool IsSlotEmpty_Implementation() const override;
    virtual FInventorySlot GetSlotData_Implementation() const override;
    
private:
    UPROPERTY(meta=(BindWidget))
    UImage* SlotBackground;
    
    UPROPERTY()
    FInventorySlot SlotData;
};
```
