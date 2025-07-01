# Item Categories & Rarities

## What You'll Learn

- Setting up item categories and subcategory hierarchies
- Configuring rarity systems with visual and economic properties
- Using categories and rarities in code for validation and UI
- Managing item flags and allowed actions per category

## Quick Start

```cpp
// Access category data for items
FInventoryCategory Category = UMounteaInventoryStatics::GetInventoryCategory(Item);
FString CategoryKey = UMounteaInventoryStatics::GetInventoryCategoryKey(Item);

// Get rarity information
FInventoryRarity Rarity = UMounteaInventoryStatics::GetInventoryRarity(Item);
FLinearColor RarityColor = Rarity.RarityColor;
```

!!! tip "Result"
    Organized item classification system with visual feedback and economic balancing.

## Core Concepts

### Category System Structure

Categories provide hierarchical item organization with main categories and optional subcategories:

```cpp
// Category structure
struct FInventoryCategory
{
    FInventoryCategoryData CategoryData;                  // Main category properties
    TMap<FString, FInventoryCategoryData> SubCategories;  // Optional subcategories
};

// Category properties
struct FInventoryCategoryData
{
    FText CategoryDisplayName;                                       // Localized display name
    int32 CategoryPriority;                                          // Sorting order
    FGameplayTagContainer CategoryTags;                              // Gameplay tags
    TSoftObjectPtr<UTexture> DisplayIcon;                            // UI icon
    uint8 CategoryFlags;                                             // Behavioral flags
    TSet<TSoftClassPtr<UMounteaInventoryItemAction>> AllowedActions; // Available actions
};
```

### Rarity System Properties

Rarities define visual appearance and economic value:

```cpp
// Rarity structure
struct FInventoryRarity
{
    FText RarityDisplayName;          // Localized name
    FLinearColor RarityColor;         // Visual color
    float BasePriceMultiplier;        // Economic scaling
    FGameplayTagContainer RarityTags; // Gameplay tags
};
```

!!! info "Key Points"
    - Categories organize items functionally (Weapons, Armor, Consumables)
    - Rarities define item quality and value (Common, Rare, Legendary)
    - Both support gameplay tags for advanced filtering and behavior

## Configuration Setup

### Default Categories

![Category Configuration](https://cdn2.unrealengine.com/hlod-water-support-in-unreal-engine-5-1-1920x1080-e402b5c30a87.jpg?resize=1&w=1920)

| Category | Priority | Flags | Typical Items |
|----------|----------|-------|---------------|
| **Weapons** | 0 | Durable, Droppable | Swords, guns, tools |
| **Armor** | 1 | Durable, Droppable | Helmets, chest pieces |
| **Consumables** | 2 | Consumable, Stackable | Potions, food, ammo |
| **Materials** | 3 | Craftable, Stackable | Ores, gems, components |
| **Quest Items** | 4 | QuestItem | Keys, documents, artifacts |

### Default Rarities

| Rarity | Color (Hex) | Price Multiplier | Usage |
|--------|-------------|------------------|-------|
| **Common** | `#808080` | 1.0× | Basic items, abundant loot |
| **Uncommon** | `#33CC33` | 2.0× | Improved stats, moderate rarity |
| **Rare** | `#3333FF` | 4.0× | Significant upgrades |
| **Epic** | `#9933CC` | 8.0× | Powerful items, rare drops |
| **Legendary** | `#FF8000` | 16.0× | Best-in-class items |

### Data Asset Configuration

```cpp
// Setup in InventorySettingsConfig
void UMounteaAdvancedInventorySettingsConfig::SetDefaultValues()
{
    // Create weapon category
    FInventoryCategory WeaponCategory;
    WeaponCategory.CategoryData.CategoryDisplayName = LOCTEXT("WeaponCategory", "Weapons");
    WeaponCategory.CategoryData.CategoryPriority = 0;
    WeaponCategory.CategoryData.CategoryFlags = static_cast<uint8>(
        EInventoryItemFlags::EIIF_Durable | 
        EInventoryItemFlags::EIIF_Dropable
    );
    AllowedCategories.Add("Weapons", WeaponCategory);
    
    // Create common rarity
    FInventoryRarity CommonRarity;
    CommonRarity.RarityDisplayName = LOCTEXT("CommonRarity", "Common");
    CommonRarity.RarityColor = FLinearColor(0.5f, 0.5f, 0.5f);
    CommonRarity.BasePriceMultiplier = 1.0f;
    AllowedRarities.Add("Common", CommonRarity);
}
```

### How Dropdown Population Works

- `GetAllowedCategories()` is called by Unreal's property system when `meta=(GetOptions="GetAllowedCategories")` is specified
- The function queries your configured categories and returns available options
- If no configuration exists, fallback values ensure the system remains functional
- This creates dynamic dropdowns that update when you modify your data assets

## Common Patterns

### Pattern 1: Category Validation

!!! note "When & Why"
    - Item creation and template validation
    - Ensuring items belong to valid categories

The system uses special functions to populate editor dropdowns and validate categories at runtime:

```cpp
// Template dropdown population
TArray<FString> UMounteaInventoryItemTemplate::GetAllowedCategories()
{
    auto Settings = UMounteaInventoryStatics::GetInventorySettings();
    return IsValid(Settings) ? Settings->GetAllowedCategories() : 
        TArray<FString>{TEXT("Miscellaneous")};
}

// Category existence check
bool IsValidCategory(const FString& CategoryKey)
{
    auto Config = UMounteaInventorySystemStatics::GetMounteaAdvancedInventoryConfig();
    return Config ? Config->AllowedCategories.Contains(CategoryKey) : false;
}
```

### Pattern 2: Subcategory Access

!!! note "When & Why"
    - Hierarchical item organization
    - Specialized filtering within main categories

Subcategories provide fine-grained classification within main categories. The system automatically filters subcategories based on the selected main category:

```cpp
// Get subcategories for current item category
TArray<FString> UMounteaInventoryItemTemplate::GetAllowedSubCategories() const
{
    auto Settings = UMounteaInventoryStatics::GetInventorySettings();
    auto Config = Settings->InventorySettingsConfig.LoadSynchronous();
    
    if (const auto* CategoryConfig = Config->AllowedCategories.Find(ItemCategory))
    {
        TArray<FString> SubCategories;
        CategoryConfig->SubCategories.GetKeys(SubCategories);
        return SubCategories;
    }
    return {};
}
```

**Hierarchical Organization Example:**

- **Weapons** → Melee, Ranged, Magic
- **Armor** → Light, Medium, Heavy
- **Consumables** → Potions, Food, Scrolls

The function dynamically updates subcategory dropdowns when the main category changes, ensuring only relevant subcategories appear for each item type.

### Pattern 3: UI Color Application

!!! note "When & Why"
    - Visual item identification
    - Consistent rarity representation

The rarity system provides immediate visual feedback to players through color coding. This creates intuitive item recognition without reading text:

```cpp
// Apply rarity colors to UI elements
void UItemWidget::UpdateRarityVisuals(const FInventoryItem& Item)
{
    FInventoryRarity Rarity = UMounteaInventoryStatics::GetInventoryRarity(Item);
    
    // Apply color to border/background
    ItemBorder->SetBrushColor(Rarity.RarityColor);
    
    // Update text color for contrast
    ItemNameText->SetColorAndOpacity(Rarity.RarityColor);
    
    // Calculate value with multiplier
    float ItemValue = Item.Template->BaseValue * Rarity.BasePriceMultiplier;
    PriceText->SetText(FText::AsNumber(ItemValue));
}
```

**Visual Design Benefits:**

- **Instant Recognition:** Players identify item quality at a glance
- **Economic Clarity:** Price multipliers provide clear value scaling
- **UI Consistency:** All item representations use the same color system
- **Accessibility:** Color coding supplements text-based information

## Advanced Usage

### Category Flags and Behavior

Category flags define item capabilities using a bitmask system that allows multiple behaviors to be combined:

```cpp
// Flag-based behavior checks
bool CanItemStack(const FInventoryItem& Item)
{
    FInventoryCategory Category = UMounteaInventoryStatics::GetInventoryCategory(Item);
    return UMounteaInventoryStatics::HasInventoryFlags(
        Category.CategoryData.CategoryFlags,
        static_cast<int32>(EInventoryItemFlags::EIIF_Stackable)
    );
}

// Action availability check
bool CanPerformAction(const FInventoryItem& Item, TSubclassOf<UMounteaInventoryItemAction> ActionClass)
{
    FInventoryCategory Category = UMounteaInventoryStatics::GetInventoryCategory(Item);
    return Category.CategoryData.AllowedActions.Contains(ActionClass);
}
```

**Flag System Benefits:**

- **Composite Behavior:** Single item can have multiple flags (Stackable + Tradeable + Durable)
- **Category-Level Control:** All items in category inherit the same behavioral rules
- **Performance:** Bitwise operations provide fast runtime checks
- **Extensibility:** Add new flags without breaking existing categories

**Common Flag Combinations:**

- **Consumables:** `Stackable + Consumable + Tradeable`
- **Weapons:** `Durable + Droppable + Tradeable`
- **Quest Items:** `QuestItem + Unique` (prevents stacking and trading)

### Gameplay Tag Integration

```cpp
// Tag-based filtering
TArray<FInventoryItem> GetItemsByTag(const FGameplayTag& FilterTag)
{
    TArray<FInventoryItem> FilteredItems;

    Algo::CopyIf(AllItems, FilteredItems, [&FilterTag](const FInventoryItem& Item)
    {
        const FInventoryCategory Category = UMounteaInventoryStatics::GetInventoryCategory(Item);
        const FInventoryRarity Rarity = UMounteaInventoryStatics::GetInventoryRarity(Item);

        return Category.CategoryData.CategoryTags.HasTag(FilterTag) ||
               Rarity.RarityTags.HasTag(FilterTag);
    });

    return FilteredItems;
}
```

### Dynamic Category Creation

```cpp
// Runtime category modification
void AddCustomSubcategory(const FString& MainCategory, const FString& SubcategoryKey, 
                         const FInventoryCategoryData& SubcategoryData)
{
    auto Config = UMounteaInventorySystemStatics::GetMounteaAdvancedInventoryConfig();
    if (!Config || !Config->AllowedCategories.Contains(MainCategory)) return;
    
    FInventoryCategory& Category = Config->AllowedCategories[MainCategory];
    Category.SubCategories.Add(SubcategoryKey, SubcategoryData);
}
```

## Item Template Integration

### Category Assignment

The system uses Unreal's metadata system to create dynamic dropdowns that populate from your configured categories and rarities:

```cpp
// In item templates
UPROPERTY(EditAnywhere, Category="Classification", meta=(GetOptions="GetAllowedCategories"))
FString ItemCategory = "Miscellaneous";

UPROPERTY(EditAnywhere, Category="Classification", meta=(GetOptions="GetAllowedSubCategories"))  
FString ItemSubCategory;

UPROPERTY(EditAnywhere, Category="Classification", meta=(GetOptions="GetAllowedRarities"))
FString ItemRarity = "Common";
```

!!! question "How Dynamic Dropdowns Work"
    - The function queries your data from [Inventory Config](Settings.md) and returns available options
    - Dropdowns automatically update when you modify categories/rarities in config

**Editor Workflow:**

1. Configure categories and rarities in your Inventory Settings Config
2. Item templates automatically show available options in dropdowns
3. Changes to config immediately reflect in all item template editors
4. Validation prevents invalid combinations in runtime

### Template Validation

```cpp
bool UMounteaInventoryItemTemplate::ValidateTemplate() const
{
    // Validate category exists
    if (!IsValidCategory(ItemCategory))
    {
        LOG_WARNING(TEXT("Invalid category: %s"), *ItemCategory);
        return false;
    }
    
    // Validate rarity exists  
    auto Config = UMounteaInventorySystemStatics::GetMounteaAdvancedInventoryConfig();
    if (!Config->AllowedRarities.Contains(ItemRarity))
    {
        LOG_WARNING(TEXT("Invalid rarity: %s"), *ItemRarity);
        return false;
    }
    
    return true;
}
```

## Subcategory Hierarchies

### Automatic Inheritance

Subcategories inherit properties from parent categories, reducing configuration overhead and ensuring consistency. This automatic inheritance happens when you modify categories in the editor:

```cpp
// Editor post-edit processing
void UMounteaAdvancedInventorySettingsConfig::PostEditChangeProperty(FPropertyChangedEvent& PropertyChangedEvent)
{
    if (PropertyChangedEvent.GetMemberPropertyName() == GET_MEMBER_NAME_CHECKED(UMounteaAdvancedInventorySettingsConfig, AllowedCategories))
    {
        Algo::ForEach(AllowedCategories, [](TPair<FGameplayTag, FInventoryCategory>& CategoryPair)
        {
            FInventoryCategoryData& ParentData = CategoryPair.Value.CategoryData;
            
            Algo::ForEach(CategoryPair.Value.SubCategories, [&ParentData](TPair<FGameplayTag, FInventoryCategoryData>& SubcategoryPair)
            {
                FInventoryCategoryData& SubCategoryData = SubcategoryPair.Value;

                // Inherit flags if not set
                if (SubCategoryData.CategoryFlags == 0)
                {
                    SubCategoryData.CategoryFlags = ParentData.CategoryFlags;
                }

                // Inherit actions if empty
                if (SubCategoryData.AllowedActions.IsEmpty())
                {
                    SubCategoryData.AllowedActions = ParentData.AllowedActions;
                }

                // Inherit tags
                if (SubCategoryData.CategoryTags.IsEmpty())
                {
                    SubCategoryData.CategoryTags.AppendTags(ParentData.CategoryTags);
                }
            });
        });
    }
}
```

!!! question "Why Inheritance Matters"
    - **Reduced Configuration:** Set flags once on parent, auto-apply to all subcategories
    - **Consistency:** Ensures subcategories behave similarly to parent categories
    - **Flexibility:** Override specific properties on subcategories when needed
    - **Maintenance:** Update parent category to affect all subcategories at once

!!! example "Inheritance Example"
    - **Weapons** category has `Durable` and `Droppable` flags
    - **Melee**, **Ranged**, **Magic** subcategories automatically inherit these flags
    - **Magic** subcategory can override with additional `Consumable` flag for spell scrolls

## Performance Considerations

!!! warning "Optimization Tips"
    - **Cache Category Data:** Store frequently-accessed categories in components
    - **Batch Lookups:** Group category operations to minimize config loading
    - **Index by Priority:** Sort categories once, reuse sorted arrays

```cpp
// Efficient category caching
class UInventoryUIComponent : public UActorComponent
{
private:
    TMap<FString, FInventoryCategory> CachedCategories;
    TArray<FString> SortedCategoryKeys;
    
public:
    void CacheCategories()
    {
        auto Config = UMounteaInventorySystemStatics::GetMounteaAdvancedInventoryConfig();
        if (!Config) return;
        
        CachedCategories = Config->AllowedCategories;
        
        // Sort by priority
        CachedCategories.GetKeys(SortedCategoryKeys);
        SortedCategoryKeys.Sort([&](const FString& A, const FString& B) {
            return CachedCategories[A].CategoryData.CategoryPriority < 
                   CachedCategories[B].CategoryData.CategoryPriority;
        });
    }
};
```

## Troubleshooting

### Category Not Found

!!! tip "Problem & Solution"
    - Item shows "Miscellaneous" category  
    - Verify category key matches exactly in data asset
    - Check for typos in ItemCategory property

### Rarity Colors Not Displaying

!!! tip "Problem & Solution"
    - UI shows default colors instead of rarity colors
    - Ensure rarity key is valid in AllowedRarities map
    - Check color application in widget's ApplyTheme implementation

### Subcategories Not Inheriting Properties

!!! tip "Problem & Solution"
    - Subcategories missing parent flags/actions
    - Editor inheritance happens in PostEditChangeProperty
    - Manually trigger inheritance by modifying parent category

## Best Practices

- **Consistent Naming:** Use clear, descriptive category and rarity names
- **Priority Planning:** Set category priorities to match UI layout needs
- **Flag Combination:** Verify flag combinations make logical sense
- **Icon Consistency:** Use consistent icon styles across categories
- **Economic Balance:** Test rarity price multipliers against game economy

## Next Steps

- **[Inventory Types](InventoryTypes.md):** Configure inventory behavior per type
- **[Item Templates](../InventorySystem/ItemTemplates.md):** Create items with categories and rarities
- **[UI Theming](UIThemingGuide.md):** Apply rarity colors in UI widgets
