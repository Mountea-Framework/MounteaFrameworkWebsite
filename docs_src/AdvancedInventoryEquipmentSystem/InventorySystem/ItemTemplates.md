# Item Templates

## What You'll Learn

- Creating item templates as data assets
- Configuring item properties, categories, and rarities
- Understanding template vs runtime item distinction
- Using templates to spawn inventory items
- Editor workflow and template management
- Validation and optimization techniques

## Quick Start

```cpp
// Create item from template
bool Success = UMounteaInventoryStatics::AddItemFromTemplate(
    InventoryInterface, 
    ItemTemplate, 
    Quantity, 
    Durability
);

// Access template properties from item
FText ItemName = UMounteaInventoryStatics::GetInventoryItemName(Item);
FInventoryCategory Category = UMounteaInventoryStatics::GetInventoryCategory(Item);
```

!!! tip "Result"
    Data-driven item system where designers create reusable templates and code spawns runtime instances.

## Core Concepts

### Template vs Item Distinction

The system separates static item definitions from runtime instances:

```cpp
// Template: Static data asset (UMounteaInventoryItemTemplate)
// - Display name, category, rarity
// - Max quantity, stack size, flags
// - Durability settings, price, weight
// - Mesh, textures, special effects

// Item: Runtime instance (FInventoryItem)  
// - Current quantity, durability
// - Custom data tags
// - Owning inventory reference
// - Affector slots for attachments
```

!!! info "Key Benefits"
    - **Memory Efficient:** Templates shared across multiple item instances
    - **Designer Friendly:** Visual editor for item properties
    - **Data Driven:** No code changes needed for new items
    - **Network Optimized:** Templates referenced by ID, not duplicated

### Template Structure

Templates define all static properties items need:

```cpp
// Primary properties
FGuid Guid;                    // Unique template identifier
FText DisplayName;             // Item name shown to players
FString ItemCategory;          // Main category (Weapons, Armor, etc.)
FString ItemSubCategory;       // Subcategory within main category
FString ItemRarity;            // Rarity level (Common, Rare, etc.)
uint8 ItemFlags;               // Behavioral flags (stackable, tradeable)
int32 MaxQuantity;             // Maximum per inventory slot
int32 MaxStackSize;            // Maximum stack size
FGameplayTagContainer Tags;    // Gameplay tags for filtering
TSoftClassPtr<AActor> SpawnActor; // Actor to spawn when used/dropped

// Secondary properties
FText ItemShortInfo;           // Brief description
FText ItemLongInfo;            // Detailed description
TSoftObjectPtr<UTexture2D> ItemThumbnail; // Small icon
TSoftObjectPtr<UTexture2D> ItemCover;     // Large image
TObjectPtr<UStreamableRenderAsset> ItemMesh; // 3D mesh

// Optional systems
bool bHasDurability;           // Enable durability system
float MaxDurability;          // Maximum durability value
bool bHasPrice;               // Enable pricing system
float BasePrice;              // Base monetary value
bool bHasWeight;              // Enable weight system
float Weight;                 // Item weight

// Technical data
FString JsonManifest;           // Includes Json manifest of the data
```

#### Json Manifest

Example JSON:

```json
{
  "guid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890",
  "displayName": "Iron Sword",
  "category": "Weapon",
  "subCategory": "Melee",
  "rarity": "Common",
  "flags": 15,
  "maxQuantity": 1,
  "maxStackSize": 1,
  "tags": ["Weapon.Melee", "Item.Equipable"],
  "spawnActor": {
    "name": "BP_IronSword",
    "path": "/Game/Items/Actors/BP_IronSword.BP_IronSword_C"
  },
  "description": {
    "short": "A sturdy iron blade",
    "long": "Forged from quality iron, this sword serves warriors well in battle."
  },
  "visuals": {
    "thumbnail": {
      "name": "T_IronSword_Icon",
      "path": "/Game/Items/Textures/T_IronSword_Icon.T_IronSword_Icon"
    },
    "cover": {
      "name": "T_IronSword_Large",
      "path": "/Game/Items/Textures/T_IronSword_Large.T_IronSword_Large"
    },
    "mesh": {
      "name": "SM_IronSword",
      "path": "/Game/Items/Meshes/SM_IronSword.SM_IronSword"
    }
  },
  "durability": {
    "enabled": true,
    "max": 100.0,
    "base": 100.0,
    "penalization": 0.5,
    "priceCoefficient": 0.8
  },
  "economy": {
    "enabled": true,
    "basePrice": 150.0,
    "sellCoefficient": 0.5
  },
  "weight": {
    "enabled": true,
    "value": 3.5
  },
  "attachmentSlots": ["Equipment.MainHand"],
  "specialAffects": [
    {
      "name": "BP_SlashEffect",
      "path": "/Game/Items/Effects/BP_SlashEffect.BP_SlashEffect_C"
    }
  ]
}
```

## Configuration Setup

### Creating Item Templates

![Item Template Editor](https://cdn2.unrealengine.com/hlod-water-support-in-unreal-engine-5-1-1920x1080-e402b5c30a87.jpg?resize=1&w=1920)

Templates are Primary Data Assets created through the Content Browser:

1. **Right-click** in Content Browser → **Advanced Inventory & Equipment** → **Templates** → **Item Template**
2. **Select** `Mountea Inventory Item Template` base class
3. **Configure** primary properties (name, category, rarity)
4. **Set** behavioral flags and limits
5. **Add** visual assets (icons, meshes)

### Dynamic Dropdown Integration

The system automatically populates dropdowns from your configuration:

```cpp
// Category dropdown population
UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category="Primary Data",
    meta=(GetOptions="GetAllowedCategories"))
FString ItemCategory;

// Implementation
TArray<FString> UMounteaInventoryItemTemplate::GetAllowedCategories()
{
    auto Settings = GetMutableDefault<UMounteaAdvancedInventorySettings>();
    return IsValid(Settings) ? Settings->GetAllowedCategories() : 
        TArray<FString>{TEXT("Miscellaneous")};
}
```

!!! tip "Dynamic Behavior"
    - **Categories** update when you modify Inventory Settings Config
    - **Subcategories** filter based on selected main category  
    - **Rarities** reflect your configured rarity system

### Automatic Flag Inheritance

Templates inherit flags from their categories automatically:

```cpp
// Editor post-edit processing
void UMounteaInventoryItemTemplate::PostEditChangeProperty(FPropertyChangedEvent& PropertyChangedEvent)
{
    if (PropertyChangedEvent.Property->GetFName() == GET_MEMBER_NAME_CHECKED(UMounteaInventoryItemTemplate, ItemCategory))
    {
        auto Config = GetInventorySettingsConfig();
        if (Config)
        {
            auto CategoryConfig = Config->AllowedCategories.Find(ItemCategory);
            ItemFlags = CategoryConfig->CategoryData.CategoryFlags; // Auto-inherit flags
        }
        ItemSubCategory = TEXT(""); // Reset subcategory
    }
}
```

!!! warning "Flag Inheritance"
    Changing item category automatically updates flags to match category defaults. Override manually if needed.

## Editor Workflow

### Template Editor Interface

![Item Template Editor](https://cdn2.unrealengine.com/hlod-water-support-in-unreal-engine-5-1-1920x1080-e402b5c30a87.jpg?resize=1&w=1920)

The Template Editor provides a comprehensive dual-pane interface for managing item templates efficiently:

#### Left Pane: Template List

- Browse all existing templates with visual status indicators
- Create new transient templates for immediate editing
- Template status indicators:
  - **Yellow text**: Transient (unsaved) templates
  - **Red text**: Modified templates with unsaved changes
  - **White text**: Saved templates
  
##### Quick action buttons per template

- **Folder icon**: Navigate to asset location in Content Browser
- **Duplicate icon**: Create copy with automatic "_Copy" suffix
- **Delete icon**: Remove template from disk (with confirmation)

#### Right Pane: Property Details

- Full property editing with real-time validation
- Multi-select support for bulk template editing
- Dynamic dropdown population from Inventory Settings Config
- Automatic flag inheritance when changing categories
- Live preview of template changes

### Creating New Templates

The editor streamlines template creation with intelligent defaults:

```cpp
// Editor creates transient template automatically
FReply SMounteaInventoryTemplateEditor::OnCreateNewTemplate()
{
    // Check for unsaved changes first
    if (bIsShowingTransient && CurrentTemplate.IsValid() && DirtyTemplates.Contains(CurrentTemplate))
    {
        if (!CheckForUnsavedChanges())
            return FReply::Handled();
    }
    
    CreateTransientTemplate();
    RefreshTemplateList();
    return FReply::Handled();
}
```

**Creation Workflow:**

1. **Click "New Template"** → Creates transient template with default values
2. **Edit Properties** → Real-time validation and dynamic dropdown updates
3. **Category Selection** → Automatic flag inheritance and subcategory reset
4. **Save Template** → Opens asset creation dialog
5. **Choose Location** → Creates permanent data asset in Content Browser

### Template Operations

**Save System:**

```cpp
// Save individual template
FReply SaveTemplate()
{
    FString validationError;
    if (!ValidateTemplateData(validationError))
    {
        ShowTemplateEditorNotification(FString::Printf(TEXT("Cannot save: %s"), *validationError), false);
        return FReply::Unhandled();
    }
    
    return CurrentTemplate.Get()->HasAnyFlags(RF_Transient) 
        ? SaveNewTemplate() 
        : SaveExistingTemplate();
}

// Bulk save all dirty templates
FReply SaveAllDirtyTemplates()
{
    int32 savedCount = 0;
    for (auto& dirtyTemplate : DirtyTemplates)
    {
        if (UMounteaInventoryItemTemplate* itemTemplate = dirtyTemplate.Get())
        {
            // Save logic with error handling
            savedCount++;
        }
    }
    ShowTemplateEditorNotification(FString::Printf(TEXT("Saved %d templates"), savedCount), true);
}
```

**Asset Management Operations:**

- **Duplicate Template**: Creates copy with validation and automatic naming
- **Delete Template**: Removes from disk with confirmation dialog
- **Navigate to Folder**: Opens Content Browser at template location
- **Import/Export**: Bulk operations for template data management

### Validation System

The editor enforces data integrity through comprehensive validation:

```cpp
// Template validation rules
bool ValidateTemplateData(FString& ErrorMessage) const
{
    if (!CurrentTemplate.IsValid())
    {
        ErrorMessage = TEXT("No template selected");
        return false;
    }
    
    UMounteaInventoryItemTemplate* itemTemplate = CurrentTemplate.Get();
    
    if (itemTemplate->DisplayName.IsEmpty())
    {
        ErrorMessage = TEXT("Display name cannot be empty");
        return false;
    }
    
    if (itemTemplate->ItemCategory.IsEmpty())
    {
        ErrorMessage = TEXT("Item category cannot be empty");
        return false;
    }
    
    // Feel free to apply additional validation rules...
    return true;
}
```

!!! question "Validation Rules"
    - Display name must not be empty
    - Category must exist in configuration
    - Max quantity must be greater than 0
    - Durability settings only available when enabled
    - Subcategory must belong to selected category

### Dirty State Tracking

The editor tracks unsaved changes and prevents data loss:

```cpp
// Track template modifications
void TrackDirtyAsset(UMounteaInventoryItemTemplate* Template)
{
    if (Template)
        DirtyTemplates.Add(Template);
}

// Handle unsaved changes on navigation
bool CheckForUnsavedChanges()
{
    if (!HasUnsavedChanges())
        return true;
    
    EAppReturnType::Type result = FMessageDialog::Open(
        EAppMsgType::YesNoCancel, 
        LOCTEXT("UnsavedChangesMessage", "You have unsaved changes. Save them?"),
        LOCTEXT("UnsavedChangesTitle", "Unsaved Changes")
    );
    
    // Handle user choice...
}
```

### External Web Editor

For teams without engine access, use the [Mountea Inventory Manager](https://mountea-framework.github.io/InventoryManager/) web editor:

!!! success "Features"
    - **1:1 Interface Mirror**: Identical property editing experience
    - **Export/Import**: Seamless integration with engine workflow using `mnteaitem` or `mnteaitems` items
    - **Configuration Sync**: Category and rarity system matching
    - **Collaborative Editing**: Multiple team members can create templates
    - **Template Validation**: Same validation rules as engine editor

!!! question "Workflow"
    1. **Configure** categories/rarities in web editor
    2. **Create** templates with full property support
    3. **Export** templates as `mnteaitem` or `mnteaitems` files
    4. **Import** into engine via custom import functionality

## Common Patterns

### Pattern 1: Template-Based Item Creation

!!! note "When & Why"
    - Spawning loot from templates
    - Adding items to player inventory
    - Creating items with specific durability/quantity

```cpp
// Direct template usage
bool UMounteaInventoryStatics::AddItemFromTemplate(
    const TScriptInterface<IMounteaAdvancedInventoryInterface>& Target, 
    UMounteaInventoryItemTemplate* Template, 
    const int32 Quantity, 
    const float Durability)
{
    return Target.GetObject() ? 
        Target->Execute_AddItemFromTemplate(Target.GetObject(), Template, Quantity, Durability) : 
        false;
}

// Manual item construction
FInventoryItem Item(Template, Quantity, Durability, OwningInventory);
bool Success = UMounteaInventoryStatics::AddItem(InventoryInterface, Item);
```

### Pattern 2: Template Property Access

!!! note "When & Why"
    - UI display of item information
    - Gameplay logic based on item properties
    - Validation and filtering

```cpp
// Access template data through items
void UpdateItemUI(const FInventoryItem& Item)
{
    // Direct template access
    UMounteaInventoryItemTemplate* Template = Item.GetTemplate();
    if (!Template) return;
    
    // Static utility functions
    FText Name = UMounteaInventoryStatics::GetInventoryItemName(Item);
    UTexture2D* Icon = UMounteaInventoryStatics::GetInventoryItemCover(Item);
    FInventoryCategory Category = UMounteaInventoryStatics::GetInventoryCategory(Item);
    FInventoryRarity Rarity = UMounteaInventoryStatics::GetInventoryRarity(Item);
    
    // Apply to UI elements
    NameLabel->SetText(Name);
    IconImage->SetBrushFromTexture(Icon);
    BorderWidget->SetColorAndOpacity(Rarity.RarityColor);
}
```

### Pattern 3: Template Validation

!!! note "When & Why"
    - Preventing invalid item creation
    - Editor validation feedback
    - Runtime safety checks

```cpp
// Template validation during creation
bool IsValidTemplate(UMounteaInventoryItemTemplate* Template)
{
    if (!IsValid(Template)) return false;
    
    // Check required properties
    if (Template->DisplayName.IsEmpty()) return false;
    if (Template->ItemCategory.IsEmpty()) return false;
    if (Template->MaxQuantity <= 0) return false;
    
    // Validate category exists
    auto Config = UMounteaInventorySystemStatics::GetMounteaAdvancedInventoryConfig();
    if (!Config || !Config->AllowedCategories.Contains(Template->ItemCategory))
        return false;
    
    // Validate rarity exists
    if (!Config->AllowedRarities.Contains(Template->ItemRarity))
        return false;
    
    return true;
}
```

## Advanced Usage

### Custom Template Properties

Extend templates with game-specific data using gameplay tags:

```cpp
// In template configuration
FGameplayTagContainer Tags;  // Weapon.Type.Sword, Armor.Material.Steel

// Runtime usage
bool IsWeapon = Item.GetTemplate()->Tags.HasTag(FGameplayTag::RequestGameplayTag("Weapon"));
bool IsMagical = Item.GetTemplate()->Tags.HasTag(FGameplayTag::RequestGameplayTag("Enchanted"));
```

### Template-Based Spawning

Templates can specify actors to spawn when used:

```cpp
// Template configuration
TSoftClassPtr<AActor> SpawnActor;  // BP_HealthPotion_Actor

// Runtime spawning
if (Item.GetTemplate()->SpawnActor.IsValid())
{
    UClass* ActorClass = Item.GetTemplate()->SpawnActor.LoadSynchronous();
    AActor* SpawnedActor = GetWorld()->SpawnActor<AActor>(ActorClass, Location, Rotation);
}
```

### Durability System Integration

Templates define durability behavior:

```cpp
// Template setup
bool bHasDurability = true;
float MaxDurability = 100.0f;
float BaseDurability = 100.0f;
float DurabilityPenalization = 5.0f;      // Damage per use
float DurabilityToPriceCoefficient = 0.8f; // Price scaling

// Runtime durability management
bool ModifyDurability(const FInventoryItem& Item, float DamageAmount)
{
    if (!Item.GetTemplate()->bHasDurability) return false;
    
    float NewDurability = FMath::Clamp(
        Item.GetDurability() - DamageAmount,
        0.0f,
        Item.GetTemplate()->MaxDurability
    );
    
    return UMounteaInventoryStatics::ModifyItemDurability(
        Item.GetOwningInventory(),
        Item.GetGuid(),
        -DamageAmount
    );
}
```

## Template Workflow

### Designer Workflow

1. **Configure** categories and rarities in Inventory Settings Config
2. **Open** Template Editor from Tools menu
3. **Create** new template via "New Template" button
4. **Select** category from dropdown (auto-inherits flags)
5. **Choose** rarity level and set behavioral properties
6. **Configure** quantity limits and stack settings
7. **Add** visual assets (icons, meshes)
8. **Save** template to Content Browser location
9. **Test** in-game through template spawning

### Programmer Integration

```cpp
// Load template by reference
UPROPERTY(EditAnywhere, Category="Items")
TSoftObjectPtr<UMounteaInventoryItemTemplate> HealthPotionTemplate;

// Runtime spawning
void SpawnHealthPotion()
{
    UMounteaInventoryItemTemplate* Template = HealthPotionTemplate.LoadSynchronous();
    UMounteaInventoryStatics::AddItemFromTemplate(PlayerInventory, Template, 1, 1.0f);
}
```

### Blueprint Integration

```cpp
// Blueprint-callable functions
UFUNCTION(BlueprintCallable, Category="Inventory")
bool AddItemFromTemplate(UMounteaInventoryItemTemplate* Template, int32 Quantity = 1);

UFUNCTION(BlueprintPure, Category="Inventory")
FText GetItemName(const FInventoryItem& Item);

UFUNCTION(BlueprintPure, Category="Inventory")
bool IsItemValid(const FInventoryItem& Item);
```

## Performance Considerations

!!! warning "Optimization Tips"
    - **Soft References:** Use `TSoftObjectPtr` for template references
    - **Template Caching:** Cache frequently-used templates in memory
    - **Validation Frequency:** Validate templates once at startup, not per-use

```cpp
// Efficient template management
class UTemplateManager : public UGameInstanceSubsystem
{
private:
    TMap<FString, UMounteaInventoryItemTemplate*> CachedTemplates;
    
public:
    UMounteaInventoryItemTemplate* GetTemplate(const FString& TemplateID)
    {
        if (UMounteaInventoryItemTemplate** Found = CachedTemplates.Find(TemplateID))
            return *Found;
        
        // Load and cache
        UMounteaInventoryItemTemplate* Template = LoadTemplateFromID(TemplateID);
        if (Template)
            CachedTemplates.Add(TemplateID, Template);
        
        return Template;
    }
};
```

## Troubleshooting

### Template Not Loading

!!! tip "Problem & Solution"
    - Template reference returns null
    - Verify template asset exists in Content Browser
    - Check soft reference path validity

### Dropdown Shows Wrong Options

!!! tip "Problem & Solution"
    - Category/rarity dropdowns don't match config
    - Refresh editor after modifying Inventory Settings Config
    - Verify `GetAllowedCategories()` implementation

### Flag Inheritance Issues

!!! tip "Problem & Solution"
    - Template flags don't match category
    - Category change triggers automatic flag inheritance
    - Override manually if different behavior needed

### Runtime Item Creation Fails

!!! tip "Problem & Solution"
    - `AddItemFromTemplate` returns false
    - Check template validity and inventory capacity
    - Verify item flags allow addition to target inventory

### Editor Shows Unsaved Changes

!!! tip "Problem & Solution"
    - Templates marked as dirty unexpectedly
    - Automatic tracking triggers on any property change
    - Use "Save All" to bulk save or "Close Template" to discard

## Best Practices

- **Naming Convention:** Use descriptive template names (`T_Sword_Iron`, `T_Potion_Health`)
- **Asset Organization:** Group templates in category-based folders
- **Validation Early:** Validate templates during packaging, not runtime
- **Soft References:** Avoid hard references to prevent memory bloat
- **Default Values:** Set sensible defaults for all template properties
- **Editor Workflow:** Use transient templates for experimentation before saving
- **Bulk Operations:** Leverage multi-select editing for similar templates

## Next Steps

- **[Item Instances](ItemInstances.md):** Instances of Templates which are being managed by Inventory Component
- **[Item Actions](ItemActions.md):** Define what players can do with items
- **[Inventory Component](InventoryComponent.md):** Implement inventory functionality
- **[Equipment System](../EquipmentSystem/EquipmentSystem.md):** Equip items from templates
