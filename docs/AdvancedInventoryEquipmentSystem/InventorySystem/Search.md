# Search & Filtering

Advanced item queries with flexible search parameters and efficient filtering.

## Core Structure

### `FInventoryItemSearchParams`

```cpp
struct FInventoryItemSearchParams
{
    // Search criteria flags
    uint8 bSearchByGuid : 1;
    uint8 bSearchByTemplate : 1;
    uint8 bSearchByTags : 1;
    uint8 bSearchByCategory : 1;
    uint8 bSearchByRarity : 1;
    
    // Search values
    FGuid ItemGuid;
    UMounteaInventoryItemTemplate* Template;
    FGameplayTagContainer Tags;
    FString CategoryId;
    FString RarityId;
    
    uint8 bRequireAllTags : 1;  // AND vs OR for tag matching
};
```

## Search Methods

### By GUID

```cpp
FInventoryItemSearchParams SearchByGuid(ItemGuid);
FInventoryItem Item = Inventory->FindItem(SearchByGuid);
```

### By Template

```cpp
FInventoryItemSearchParams SearchByTemplate(WeaponTemplate);
TArray<FInventoryItem> Weapons = Inventory->FindItems(SearchByTemplate);
```

### By Tags

```cpp
// Find items with ANY specified tags
FInventoryItemSearchParams SearchByTags(TagContainer, false);

// Find items with ALL specified tags
FInventoryItemSearchParams SearchByTags(TagContainer, true);
```

### Complex Queries

```cpp
FInventoryItemSearchParams ComplexSearch;
ComplexSearch.bSearchByCategory = true;
ComplexSearch.CategoryId = "Weapons";
ComplexSearch.bSearchByRarity = true;
ComplexSearch.RarityId = "Epic";
ComplexSearch.bSearchByTags = true;
ComplexSearch.Tags.AddTag(EnchantedTag);

TArray<FInventoryItem> EnchantedEpicWeapons = Inventory->FindItems(ComplexSearch);
```

## Search Operations

### Find Single Item

```cpp
// Returns first matching item
FInventoryItem Item = Inventory->FindItem(SearchParams);

// Get item index
int32 Index = Inventory->FindItemIndex(SearchParams);
```

### Find Multiple Items

```cpp
// Returns all matching items
TArray<FInventoryItem> Items = Inventory->FindItems(SearchParams);

// Check existence
bool HasItem = Inventory->HasItem(SearchParams);
```

## Performance Optimization

### Efficient Queries

```cpp
// Fastest: Search by GUID
FInventoryItemSearchParams QuickSearch(KnownItemGuid);

// Fast: Search by template reference
FInventoryItemSearchParams TemplateSearch(CachedTemplate);

// Slower: Tag/text searches
FInventoryItemSearchParams TagSearch(TagContainer);
```

### Caching

```cpp
// Cache frequently searched items
TMap<FString, TArray<FInventoryItem>> CategoryCache;
CategoryCache.Add("Weapons", Inventory->FindItems(WeaponSearch));
```

## UI Integration

### Filter Implementation

```cpp
void FilterInventoryByCategory(const FString& Category)
{
    FInventoryItemSearchParams Search;
    Search.bSearchByCategory = true;
    Search.CategoryId = Category;
    
    TArray<FInventoryItem> FilteredItems = Inventory->FindItems(Search);
    UpdateInventoryDisplay(FilteredItems);
}
```

### Search Bar

```cpp
void OnSearchTextChanged(const FText& SearchText)
{
    FString SearchString = SearchText.ToString();
    
    // Search by name (requires custom implementation)
    TArray<FInventoryItem> AllItems = Inventory->GetAllItems();
    TArray<FInventoryItem> Results;
    
    for (const FInventoryItem& Item : AllItems)
    {
        if (Item.GetItemName().ToString().Contains(SearchString))
        {
            Results.Add(Item);
        }
    }
    
    UpdateInventoryDisplay(Results);
}
```

## Static Helper Functions

### Convenience Methods

```cpp
// Quick category filtering
TArray<FInventoryItem> GetItemsByCategory(
    const TScriptInterface<IMounteaAdvancedInventoryInterface>& Inventory,
    const FString& Category);

// Rarity filtering
TArray<FInventoryItem> GetItemsByRarity(
    const TScriptInterface<IMounteaAdvancedInventoryInterface>& Inventory,
    const FString& Rarity);
```

## Best Practices

- **Cache results** for repeated searches
- **Use GUID searches** when possible for performance
- **Combine search criteria** to reduce result sets
- **Implement text search** separately for name/description filtering
- **Index commonly searched properties** for large inventories
