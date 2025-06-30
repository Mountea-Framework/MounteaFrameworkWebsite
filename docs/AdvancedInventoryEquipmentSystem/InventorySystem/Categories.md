# Categories

Item classification and organization system with hierarchical subcategories.

## Core Data Structures

### `FInventoryCategoryData`

Category configuration containing:

- **Display Properties** - Localized name, priority, icon
- **Classification** - Gameplay tags for filtering
- **Behavior Flags** - Category-specific properties
- **Allowed Actions** - Available item operations

### `FInventoryCategory`

Complete category with nested subcategories:

- **Primary Category** - Main classification
- **Subcategories** - Hierarchical organization

## Category Configuration

### Basic Setup

```cpp
FInventoryCategoryData CategoryData;
CategoryData.CategoryDisplayName = LOCTEXT("Weapons", "Weapons");
CategoryData.CategoryPriority = 10;
CategoryData.CategoryTags.AddTag(FGameplayTag::RequestGameplayTag("Item.Category.Weapon"));
CategoryData.CategoryFlags = static_cast<uint8>(EInventoryItemFlags::EIIF_Dropable);
```

### Subcategories

```cpp
FInventoryCategory WeaponCategory;
WeaponCategory.CategoryData = WeaponCategoryData;

// Add subcategories
FInventoryCategoryData SwordData;
SwordData.CategoryDisplayName = LOCTEXT("Swords", "Swords");
WeaponCategory.SubCategories.Add("Sword", SwordData);

FInventoryCategoryData BowData;
BowData.CategoryDisplayName = LOCTEXT("Bows", "Bows");
WeaponCategory.SubCategories.Add("Bow", BowData);
```

## Item Actions

### Allowed Actions

Categories define available item operations:

```cpp
// Set allowed actions for category
TSet<TSoftClassPtr<UMounteaInventoryItemAction>> Actions;
Actions.Add(ConsumeActionClass);
Actions.Add(EquipActionClass);
CategoryData.AllowedActions = Actions;
```

### Action Filtering

Items inherit actions from their category:

```cpp
// Get item category
FInventoryCategory Category = UMounteaInventoryStatics::GetInventoryCategory(Item);

// Check available actions
bool CanConsume = Category.CategoryData.AllowedActions.Contains(ConsumeActionClass);
```

## UI Integration

### Category Selection

```cpp
// Handle category selection in UI
void OnCategorySelected(const FString& CategoryId)
{
    InventoryUI->CategorySelected(CategoryId);
    
    // Filter items by category
    FilterItemsByCategory(CategoryId);
}
```

### Category Widgets

Category widgets implement `IMounteaAdvancedInventoryCategoryWidgetInterface`:

```cpp
// Set category data
CategoryWidget->SetInventoryCategoryKey("Weapons");
CategoryWidget->SetActiveState(true);
```

## Configuration

### Settings Integration

Categories configured in `UMounteaAdvancedInventorySettingsConfig`:

```cpp
// Access categories from settings
UMounteaAdvancedInventorySettingsConfig* Config = GetInventoryConfig();
TMap<FString, FInventoryCategory> Categories = Config->AllowedCategories;

// Get specific category
FInventoryCategory* WeaponCategory = Categories.Find("Weapons");
```

### Runtime Access

```cpp
// Get category for item
FString CategoryKey = UMounteaInventoryStatics::GetInventoryCategoryKey(Item);
FInventoryCategory Category = UMounteaInventoryStatics::GetInventoryCategory(Item);
```

## Category Flags

### Behavior Properties

```cpp
// Available category flags (bitmask)
enum class EInventoryItemFlags : uint8
{
    EIIF_Tradeable   = 1 << 0,  // Items can be traded
    EIIF_Stackable   = 1 << 1,  // Items can stack
    EIIF_Craftable   = 1 << 2,  // Used in crafting
    EIIF_Dropable    = 1 << 3,  // Can be dropped
    EIIF_Consumable  = 1 << 4,  // Single-use items
    EIIF_QuestItem   = 1 << 5,  // Quest-related
    EIIF_Unique      = 1 << 6,  // One per inventory
    EIIF_Durable     = 1 << 7   // Has durability
};
```

### Flag Inheritance

Items inherit default behaviors from category flags, overrideable per template.

## Best Practices

### Organization

- Use logical hierarchy (Weapons → Swords → Longswords)
- Consistent naming conventions
- Meaningful priority values for UI sorting

### Performance

- Limit subcategory depth (2-3 levels max)
- Cache category lookups for frequently accessed items
- Use gameplay tags for efficient filtering

### Localization

- Provide localized display names
- Consider cultural differences in categorization
- Test category names across target languages

## Integration

Categories integrate with:

- [Item Templates](ItemTemplates.md) - Template classification
- [Search & Filtering](Search.md) - Category-based queries
- [User Interface](../UserInterface/index.md) - Category selection widgets
