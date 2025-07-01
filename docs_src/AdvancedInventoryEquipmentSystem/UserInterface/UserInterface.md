# User Interface Overview

Widget framework for inventory interfaces with comprehensive widget hierarchies and theming.

## Core Widget Interfaces

### Base Widgets

- **`IMounteaAdvancedBaseInventoryWidgetInterface`** - Parent-child relationships
- **`IMounteaInventoryGenericWidgetInterface`** - Command processing, theming
- **`IMounteaInventorySystemBaseWidgetInterface`** - Main system wrapper
- **`UMounteaAdvancedInventoryBaseWidget`** - Base implementation class

### Specialized Interfaces

- **`IMounteaAdvancedInventoryWidgetInterface`** - Main inventory display
- **`IMounteaAdvancedInventoryUIInterface`** - UI management operations

## Widget Hierarchy

```text
UMounteaAdvancedInventoryBaseWidget (Base Class)
├── System Wrapper (IMounteaInventorySystemBaseWidgetInterface)
├── Inventory Widget (IMounteaAdvancedInventoryWidgetInterface)
├── Categories Wrapper (IMounteaAdvancedInventoryCategoriesWrapperWidgetInterface)
│   └── Category Widget (IMounteaAdvancedInventoryCategoryWidgetInterface)
├── Items Container (IMounteaAdvancedInventoryItemSlotsWrapperWidgetInterface)
│   ├── Item Slot (IMounteaAdvancedInventoryItemSlotWidgetInterface)
│   └── Item Widget (IMounteaAdvancedInventoryItemWidgetInterface)
└── Grid System (IMounteaAdvancedInventoryItemsGridWidgetInterface)
```

## Core Implementation

### Base Widget Setup

```cpp
class UMyInventoryWidget : public UMounteaAdvancedInventoryBaseWidget
{
    virtual void ProcessInventoryWidgetCommand_Implementation(const FString& Command, UObject* Payload) override;
    virtual void ApplyTheme_Implementation() override;
    virtual void RefreshWidget_Implementation() override;
};
```

### Command System

```cpp
void ProcessInventoryWidgetCommand_Implementation(const FString& Command, UObject* Payload)
{
    if (Command == "ItemAdded")
    {
        HandleItemAdded(Cast<FInventoryItem>(Payload));
    }
    else if (Command == "CategorySelected")
    {
        HandleCategorySelected(Payload);
    }
}
```

## Widget Commands

Standard UI operations:

- `CreateWrapper` / `RemoveWrapper`
- `OpenInventoryWidget` / `CloseInventoryWidget`
- `ItemAdded` / `ItemRemoved` / `ItemModified`
- `CategorySelected` / `ItemSelected`
- `ShowInventoryNotification`

## Theme Integration

### Applying Themes

```cpp
// Apply theme to any widget
UMounteaInventoryUIStatics::ApplyTheme(MyWidget);

// Get theme configuration
UMounteaAdvancedInventoryThemeConfig* Theme = UMounteaInventoryUIStatics::GetThemeConfig();
```

### Theme Levels & States

- **Levels**: Primary, Secondary, Tertiary
- **States**: Normal, Hovered, Active, Disabled
- **Types**: Text, Background, Default

## Related Systems

- [Inventory UI](InventoryUI.md) - Main interface components
- [Grid System](GridSystem.md) - Spatial item layouts
- [Item Widgets](ItemWidgets.md) - Individual item presentation
- [Item Preview](ItemPreview.md) - 3D visualization
- [Slate Elements](SlateElements.md) - Custom controls
