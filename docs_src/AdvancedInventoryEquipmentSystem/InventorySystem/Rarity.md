# Rarity System

Visual and economic item tiers with color coding and price multipliers.

## Core Structure

### `FInventoryRarity`

```cpp
struct FInventoryRarity
{
    FText RarityDisplayName;        // "Common", "Rare", "Epic"
    FLinearColor RarityColor;       // UI color coding
    float BasePriceMultiplier;      // Economic modifier (1.0 = base)
    FGameplayTagContainer RarityTags; // Additional metadata
};
```

## Configuration

### Settings Setup

```cpp
// In UMounteaAdvancedInventorySettingsConfig
TMap<FString, FInventoryRarity> AllowedRarities;

// Example rarities
FInventoryRarity Common;
Common.RarityDisplayName = LOCTEXT("Common", "Common");
Common.RarityColor = FLinearColor::White;
Common.BasePriceMultiplier = 1.0f;

FInventoryRarity Rare;
Rare.RarityDisplayName = LOCTEXT("Rare", "Rare");
Rare.RarityColor = FLinearColor::Blue;
Rare.BasePriceMultiplier = 3.0f;
```

### Runtime Access

```cpp
// Get item rarity
FInventoryRarity Rarity = UMounteaInventoryStatics::GetInventoryRarity(Item);
FString RarityKey = UMounteaInventoryStatics::GetInventoryRarityKey(Item);

// Use rarity properties
FLinearColor ItemColor = Rarity.RarityColor;
float PriceModifier = Rarity.BasePriceMultiplier;
```

## Visual Integration

### UI Color Coding

```cpp
// Apply rarity color to widget
FInventoryRarity ItemRarity = GetInventoryRarity(Item);
Widget->SetColorAndOpacity(ItemRarity.RarityColor);

// Border highlighting
BorderWidget->SetBrushColor(ItemRarity.RarityColor);
```

### Text Styling

```cpp
// Colored item names
FSlateColor TextColor(ItemRarity.RarityColor);
TextBlock->SetColorAndOpacity(TextColor);
```

## Economic Impact

### Price Calculation

```cpp
float CalculateItemPrice(const FInventoryItem& Item)
{
    UMounteaInventoryItemTemplate* Template = Item.GetTemplate();
    FInventoryRarity Rarity = GetInventoryRarity(Item);
    
    float BasePrice = Template->BasePrice;
    float RarityMultiplier = Rarity.BasePriceMultiplier;
    float DurabilityFactor = Item.GetDurability();
    
    return BasePrice * RarityMultiplier * DurabilityFactor;
}
```

### Vendor Integration

```cpp
// Adjust merchant prices by rarity
float SellPrice = BasePrice * Rarity.BasePriceMultiplier * Template->SellPriceCoefficient;
float BuyPrice = BasePrice * Rarity.BasePriceMultiplier;
```

## Gameplay Tags

### Rarity-Specific Behavior

```cpp
// Check for special rarity properties
bool IsLegendary = Rarity.RarityTags.HasTag(FGameplayTag::RequestGameplayTag("Rarity.Legendary"));
bool HasSpecialEffects = Rarity.RarityTags.HasTag(FGameplayTag::RequestGameplayTag("Rarity.Magical"));
```

### Drop Rate Modifiers

```cpp
// Use tags for loot generation
float GetDropChance(const FInventoryRarity& Rarity)
{
    if (Rarity.RarityTags.HasTag(CommonTag)) return 0.6f;
    if (Rarity.RarityTags.HasTag(RareTag)) return 0.3f;
    if (Rarity.RarityTags.HasTag(EpicTag)) return 0.1f;
    return 0.01f; // Legendary
}
```

## Standard Rarity Tiers

### Common Setup

| Rarity | Color | Multiplier | Usage |
|--------|--------|------------|-------|
| Common | White | 1.0x | Basic items |
| Uncommon | Green | 1.5x | Slightly better |
| Rare | Blue | 3.0x | Significant upgrade |
| Epic | Purple | 6.0x | High-end gear |
| Legendary | Orange | 12.0x | Endgame items |

## Integration

### Template Assignment

```cpp
// In UMounteaInventoryItemTemplate
FString ItemRarity = "Rare"; // Dropdown populated from settings
```

### UI Theming

Rarity colors integrate with the theme system for consistent visual presentation across all inventory widgets.

## Best Practices

- Use consistent color schemes across UI
- Balance economic multipliers with gameplay
- Consider accessibility for colorblind players
- Test rarity distribution in loot systems
