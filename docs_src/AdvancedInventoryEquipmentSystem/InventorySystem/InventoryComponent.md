# Inventory Component

## What You'll Learn

- Setting up and configuring inventory components
- Understanding network replication and authority patterns
- Managing item collections with automatic merging and validation
- Implementing search and filtering systems
- Using the event-driven notification system
- Handling server-client synchronization
- Integrating with save systems
- Performance optimization techniques

## Quick Start

```cpp
// Add component to actor
UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Inventory")
class TObjectPtr<UMounteaInventoryComponent> InventoryComponent;

// Add item to inventory
bool Success = InventoryComponent->Execute_AddItem(InventoryComponent, Item);

// Find specific items
FInventoryItem Found = InventoryComponent->Execute_FindItem(InventoryComponent, SearchParams);

// Listen for changes
InventoryComponent->OnItemAdded.AddDynamic(this, &AMyActor::OnItemAdded);
```

!!! tip "Result"
    Fully networked inventory system with automatic replication, validation, and event notifications for seamless multiplayer inventory management.

## Core Concepts

### What Is the Inventory Component?

The Inventory Component is the central manager for collections of item instances. Think of it as a smart container that not only stores items but also handles validation, networking, merging, searching, and notifications.

!!! example "Real-World Analogy"
    Like a warehouse management system - it doesn't just store boxes (items), but tracks what's inside each box, where everything is located, who has access, and automatically updates all connected systems when anything changes.

### Component Architecture

The component extends UActorComponent and implements IMounteaAdvancedInventoryInterface:

```cpp
class UMounteaInventoryComponent : public UActorComponent, public IMounteaAdvancedInventoryInterface
{
    // Core Properties
    FInventoryItemArray InventoryItems;           // Replicated item storage
    EInventoryType InventoryType;                 // Player, Chest, Vendor, etc.
    EInventoryFlags InventoryTypeFlag;            // Private, Public, ReadOnly
    TObjectPtr<UUserWidget> InventoryWidget;      // Associated UI widget
    
    // Event Delegates
    FOnItemAdded OnItemAdded;
    FOnItemRemoved OnItemRemoved;
    FOnItemQuantityChanged OnItemQuantityChanged;
    FOnItemDurabilityChanged OnItemDurabilityChanged;
    FOnNotificationProcessed OnNotificationProcessed;
};
```

!!! info "Key Features"
    - **Network Replication**: Automatic client-server synchronization
    - **Smart Merging**: Automatically combines stackable items  
    - **Validation**: Prevents invalid operations before they happen
    - **Event System**: Reactive notifications for UI and gameplay
    - **Save Integration**: Seamless persistence across sessions
    - **Search Engine**: Powerful filtering and finding capabilities

## Component Setup

### Basic Configuration

```cpp
// In your actor's constructor
AMyActor::AMyActor()
{
    // Create inventory component
    InventoryComponent = CreateDefaultSubobject<UMounteaInventoryComponent>(TEXT("InventoryComponent"));
    
    // Configure replication is done automatically
    // InventoryComponent->SetIsReplicatedByDefault(true);
}

// In BeginPlay or when needed
void AMyActor::BeginPlay()
{
    Super::BeginPlay();
    
    // Bind to inventory events if needed
    if (InventoryComponent)
    {
        InventoryComponent->OnItemAdded.AddDynamic(this, &AMyActor::OnItemAdded);
        InventoryComponent->OnItemRemoved.AddDynamic(this, &AMyActor::OnItemRemoved);
        InventoryComponent->OnItemQuantityChanged.AddDynamic(this, &AMyActor::OnItemQuantityChanged);
    }
}
```

### Network Replication Setup

The component handles replication automatically but understanding the pattern helps with debugging:

```cpp
// Replication configuration
void UMounteaInventoryComponent::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);
    
    // Only replicate to owner and initially
    DOREPLIFETIME_CONDITION(UMounteaInventoryComponent, InventoryItems, COND_InitialOrOwner);
}

// Authority checking
bool UMounteaInventoryComponent::IsAuthority() const
{
    const AActor* Owner = GetOwner();
    if (!Owner || !Owner->GetWorld())
        return false;

    // Standalone games are always authoritative
    if (const ENetMode NetMode = Owner->GetWorld()->GetNetMode(); NetMode == NM_Standalone)
        return true;
    
    // Check server authority
    return Owner->HasAuthority();
}
```

!!! warning "Network Authority"
    Only the server can make authoritative changes to inventory. Clients send requests via Server RPCs, and the server validates and executes them.

## Item Management

### Adding Items

The component provides intelligent item addition with automatic merging:

```cpp
bool UMounteaInventoryComponent::AddItem_Implementation(const FInventoryItem& Item)
{
    // Validation first
    if (!Execute_CanAddItem(this, Item))
    {
        // Send failure notification
        Execute_ProcessInventoryNotification(this, 
            UMounteaInventoryStatics::CreateNotificationData(
                MounteaInventoryNotificationBaseTypes::ItemNotUpdated,
                this, Item.GetGuid(), 0
            )
        );
        return false;
    }

    // Client requests server action
    if (!IsAuthority())
    {
        AddItem_Server(Item);  // Server RPC
        return true;
    }
    
    // Server logic: Try to find existing item to merge with
    auto existingItem = Execute_FindItem(this, FInventoryItemSearchParams(Item.GetGuid()));
    if (!existingItem.IsItemValid()) 
        existingItem = Execute_FindItem(this, FInventoryItemSearchParams(Item.GetTemplate()));

    if (existingItem.IsItemValid())
    {
        // Check if items can be merged
        if (CanMergeItems(existingItem, Item))
        {
            // Calculate how much can be added
            const int32 AvailableSpace = Item.GetTemplate()->MaxQuantity - existingItem.GetQuantity();
            const int32 AmountToAdd = FMath::Min(Item.GetQuantity(), AvailableSpace);

            // Transfer from source inventory if needed
            if (Item.IsItemInInventory())
            {
                Execute_DecreaseItemQuantity(Item.GetOwningInventory().GetObject(), 
                    Item.GetGuid(), AmountToAdd);
            }

            // Add to this inventory
            Execute_IncreaseItemQuantity(this, existingItem.GetGuid(), AmountToAdd);
            return true;
        }
        else
        {
            // Cannot merge (unique items, different types, etc.)
            return false;
        }
    }
    else
    {
        // Create new item entry
        FInventoryItem newItem = Item;
        
        // Transfer from source if needed
        if (Item.IsItemInInventory())
        {
            Execute_DecreaseItemQuantity(Item.GetOwningInventory().GetObject(), 
                Item.GetGuid(), Item.GetQuantity());
        }
        
        // Add to collection
        InventoryItems.Items.Add(newItem);
        InventoryItems.Items.Last().SetOwningInventory(this);
        InventoryItems.MarkArrayDirty();  // Trigger replication
        
        // Notify observers
        OnItemAdded.Broadcast(newItem);
        PostItemAdded_Client(newItem);
        return true;
    }
}
```

!!! note "Smart Merging Logic"
    The system automatically combines compatible items while respecting unique flags, stack limits, and template differences. Non-mergeable items create new entries.<br>
    Unique items are automatically discarded as unique items can exist only once in the Inventory.

### Removing Items

Item removal handles cleanup and notifications:

```cpp
bool UMounteaInventoryComponent::RemoveItem_Implementation(const FGuid& ItemGuid)
{
    if (!IsActive()) return false;
    
    // Find item to remove
    const int32 ItemIndex = Execute_FindItemIndex(this, FInventoryItemSearchParams(ItemGuid));
    if (ItemIndex == INDEX_NONE)
        return false;

    const FInventoryItem RemovedItem = InventoryItems.Items[ItemIndex];
    
    // Notify immediately (before removal for safety)
    OnItemRemoved.Broadcast(RemovedItem);
    
    // Client requests server action
    if (!IsAuthority())
    {
        RemoveItem_Server(ItemGuid);
        return true;
    }
    
    // Server removes and notifies clients
    PostItemRemoved_Client(RemovedItem);
    InventoryItems.Items.RemoveAt(ItemIndex);
    InventoryItems.MarkArrayDirty();

    return true;
}
```

### Quantity Modification

Safe quantity changes with bounds checking:

```cpp
bool UMounteaInventoryComponent::IncreaseItemQuantity_Implementation(const FGuid& ItemGuid, const int32 Amount)
{
    if (!IsActive() || !IsAuthority()) 
        return false;
    
    const int32 index = Execute_FindItemIndex(this, FInventoryItemSearchParams(ItemGuid));
    if (index != INDEX_NONE && InventoryItems.Items.IsValidIndex(index))
    {
        auto& inventoryItem = InventoryItems.Items[index];
        
        const int32 OldQuantity = inventoryItem.GetQuantity();
        
        // Use item's built-in validation
        if (inventoryItem.SetQuantity(OldQuantity + Amount))
        {
            // Mark for replication
            InventoryItems.MarkItemDirty(inventoryItem);
            
            // Notify observers
            OnItemQuantityChanged.Broadcast(inventoryItem, OldQuantity, inventoryItem.GetQuantity());
            PostItemQuantityChanged(inventoryItem, OldQuantity, inventoryItem.GetQuantity());
            return true;
        }
    }
    return false;
}

bool UMounteaInventoryComponent::DecreaseItemQuantity_Implementation(const FGuid& ItemGuid, const int32 Amount)
{
    if (!IsActive() || !IsAuthority()) 
        return false;
    
    const int32 index = Execute_FindItemIndex(this, FInventoryItemSearchParams(ItemGuid));
    if (index != INDEX_NONE && InventoryItems.Items.IsValidIndex(index))
    {
        auto& inventoryItem = InventoryItems.Items[index];
        
        const int32 OldQuantity = inventoryItem.GetQuantity();
        const int32 NewQuantity = OldQuantity - Amount;
                 
        // Auto-remove if quantity reaches zero
        if (NewQuantity <= 0)
            return Execute_RemoveItem(this, ItemGuid);
                         
        if (inventoryItem.SetQuantity(NewQuantity))
        {
            InventoryItems.MarkItemDirty(inventoryItem);
            OnItemQuantityChanged.Broadcast(inventoryItem, OldQuantity, NewQuantity);
            PostItemQuantityChanged(inventoryItem, OldQuantity, NewQuantity);
            return true;
        }
    }
    return false;
}
```

!!! tip "Automatic Cleanup"
    When item quantity reaches zero through DecreaseItemQuantity, the item is automatically removed from the inventory to prevent invalid entries.

## Search and Filtering

### Search Parameters

The component provides a powerful search system using FInventoryItemSearchParams:

```cpp
// Search by unique ID
FInventoryItemSearchParams SearchByGuid(const FGuid& ItemGuid)
{
    FInventoryItemSearchParams Params;
    Params.bSearchByGuid = true;
    Params.ItemGuid = ItemGuid;
    return Params;
}

// Search by template
FInventoryItemSearchParams SearchByTemplate(UMounteaInventoryItemTemplate* Template)
{
    FInventoryItemSearchParams Params;
    Params.bSearchByTemplate = true;
    Params.Template = Template;
    return Params;
}

// Search by category
FInventoryItemSearchParams SearchByCategory(const FString& Category)
{
    FInventoryItemSearchParams Params;
    Params.bSearchByCategory = true;
    Params.CategoryId = Category;
    return Params;
}

// Search by gameplay tags
FInventoryItemSearchParams SearchByTags(const FGameplayTagContainer& Tags, bool bRequireAll = false)
{
    FInventoryItemSearchParams Params;
    Params.bSearchByTags = true;
    Params.Tags = Tags;
    Params.bRequireAllTags = bRequireAll;
    return Params;
}
```

### Search Implementation

```cpp
FInventoryItem UMounteaInventoryComponent::FindItem_Implementation(const FInventoryItemSearchParams& SearchParams) const
{
    const auto foundItem = InventoryItems.Items.FindByPredicate([&SearchParams](const FInventoryItem& Item)
    {
        // GUID search (exact match)
        if (SearchParams.bSearchByGuid && Item.GetGuid() != SearchParams.ItemGuid)
            return false;

        // Template search (same item type)
        if (SearchParams.bSearchByTemplate && Item.GetTemplate() != SearchParams.Template)
            return false;

        // Tag search (custom data matching)
        if (SearchParams.bSearchByTags)
        {
            if (SearchParams.bRequireAllTags)
                return Item.GetCustomData().HasAll(SearchParams.Tags);
            else
                return Item.GetCustomData().HasAny(SearchParams.Tags);
        }
        
        // Category search (item classification)
        if (SearchParams.bSearchByCategory && Item.GetTemplate()->ItemCategory != SearchParams.CategoryId)
            return false;
        
        // Rarity search (item tier)
        if (SearchParams.bSearchByRarity && Item.GetTemplate()->ItemRarity != SearchParams.RarityId)
            return false;

        return true;
    });

    return foundItem ? *foundItem : FInventoryItem();
}
```

### Batch Search Operations

```cpp
// Find multiple items matching criteria
TArray<FInventoryItem> UMounteaInventoryComponent::FindItems_Implementation(const FInventoryItemSearchParams& SearchParams) const
{
    TArray<FInventoryItem> returnResult;
    
    // If no search criteria specified, return all items
    if (!SearchParams.bSearchByGuid && !SearchParams.bSearchByTemplate && 
        !SearchParams.bSearchByTags && !SearchParams.bSearchByCategory && 
        !SearchParams.bSearchByRarity)
    {
        return InventoryItems.Items;
    }
    
    // Filter items using search criteria
    Algo::CopyIf(InventoryItems.Items, returnResult, [&SearchParams](const FInventoryItem& Item) -> bool
    {
        if (!Item.IsItemValid())
            return false;
        
        // Any matching criteria includes the item
        if (SearchParams.bSearchByGuid && Item.GetGuid() == SearchParams.ItemGuid)
            return true;

        if (SearchParams.bSearchByTemplate && Item.GetTemplate() == SearchParams.Template)
            return true;

        if (SearchParams.bSearchByCategory && Item.GetTemplate()->ItemCategory == SearchParams.CategoryId)
            return true;
            
        if (SearchParams.bSearchByRarity && Item.GetTemplate()->ItemRarity == SearchParams.RarityId)
            return true;

        if (SearchParams.bSearchByTags)
        {
            return SearchParams.bRequireAllTags 
                ? Item.GetCustomData().HasAll(SearchParams.Tags)
                : Item.GetCustomData().HasAny(SearchParams.Tags);
        }
        
        return false;
    });
    
    return returnResult;
}

// Practical search examples
TArray<FInventoryItem> FindAllWeapons()
{
    return Execute_FindItems(this, SearchByCategory(TEXT("Weapon")));
}

TArray<FInventoryItem> FindBrokenItems()
{
    FGameplayTagContainer BrokenTag;
    BrokenTag.AddTag(FGameplayTag::RequestGameplayTag("Condition.Broken"));
    return Execute_FindItems(this, SearchByTags(BrokenTag));
}

bool HasHealthPotions()
{
    auto FoundPotion = Execute_FindItem(this, SearchByCategory(TEXT("Consumable")));
    return FoundPotion.IsItemValid();
}
```

!!! example "Search Use Cases"
    - **Equipment Systems**: Find all equippable weapons
    - **Crafting**: Locate required materials
    - **Trading**: Filter items by rarity or category  
    - **Repair**: Find damaged items needing attention
    - **Quests**: Check for specific quest items

## Event System

### Event Delegates

The component provides comprehensive event notifications:

```cpp
// Core item events
UPROPERTY(BlueprintAssignable, Category="Events")
FOnItemAdded OnItemAdded;                          // Item added to inventory

UPROPERTY(BlueprintAssignable, Category="Events")  
FOnItemRemoved OnItemRemoved;                      // Item removed from inventory

UPROPERTY(BlueprintAssignable, Category="Events")
FOnItemQuantityChanged OnItemQuantityChanged;      // Stack size changed

UPROPERTY(BlueprintAssignable, Category="Events")
FOnItemDurabilityChanged OnItemDurabilityChanged;  // Item condition changed

UPROPERTY(BlueprintAssignable, Category="Events")
FOnNotificationProcessed OnNotificationProcessed;  // General notifications
```

### Event Binding Examples

```cpp
// C++ binding
void APlayerCharacter::BeginPlay()
{
    Super::BeginPlay();
    
    if (InventoryComponent)
    {
        // Bind to specific events
        InventoryComponent->OnItemAdded.AddDynamic(this, &APlayerCharacter::OnItemAdded);
        InventoryComponent->OnItemRemoved.AddDynamic(this, &APlayerCharacter::OnItemRemoved);
        InventoryComponent->OnItemQuantityChanged.AddDynamic(this, &APlayerCharacter::OnItemQuantityChanged);
        
        // General notification handler
        InventoryComponent->OnNotificationProcessed.AddDynamic(this, &APlayerCharacter::OnInventoryNotification);
    }
}

// Event handlers
UFUNCTION()
void APlayerCharacter::OnItemAdded(const FInventoryItem& Item)
{
    // Update UI, play sound, show notification
    if (InventoryWidget)
        InventoryWidget->RefreshInventoryDisplay();
        
    PlayItemAddedSound(Item.GetTemplate()->ItemCategory);
    ShowNotification(FText::Format(
        NSLOCTEXT("Inventory", "ItemAdded", "Added {0} x{1}"),
        Item.GetItemName(),
        Item.GetQuantity()
    ));
}

UFUNCTION()
void APlayerCharacter::OnItemRemoved(const FInventoryItem& Item)
{
    // Check if removed item was equipped
    if (EquipmentComponent && EquipmentComponent->IsItemEquipped(Item.GetGuid()))
    {
        EquipmentComponent->UnequipItem(Item.GetGuid());
    }
    
    // Update displays
    if (InventoryWidget)
        InventoryWidget->RefreshInventoryDisplay();
}

UFUNCTION()
void APlayerCharacter::OnItemQuantityChanged(const FInventoryItem& Item, int32 OldQuantity, int32 NewQuantity)
{
    // Handle stack changes
    if (NewQuantity > OldQuantity)
    {
        // Items added to stack
        OnItemAdded(Item);
    }
    else
    {
        // Items removed from stack
        const int32 RemovedAmount = OldQuantity - NewQuantity;
        ShowNotification(FText::Format(
            NSLOCTEXT("Inventory", "ItemUsed", "Used {0} x{1}"),
            Item.GetItemName(),
            RemovedAmount
        ));
    }
}
```

### Notification System

The component includes a sophisticated notification system:

```cpp
void UMounteaInventoryComponent::ProcessInventoryNotification_Implementation(const FInventoryNotificationData& Notification)
{
    // Check if notifications are enabled
    if (!Notification.NotificationConfig.bIsEnabled)
        return;
    
    // Handle based on network context
    if (!IsAuthority() || (IsAuthority() && UMounteaInventorySystemStatics::CanExecuteCosmeticEvents(GetWorld())))
    {
        // Direct broadcast (client or server with cosmetics enabled)
        OnNotificationProcessed.Broadcast(Notification);
    }
    else if (IsAuthority() && !UMounteaInventorySystemStatics::CanExecuteCosmeticEvents(GetWorld()))
    {
        // Server without cosmetics - send to client
        ProcessInventoryNotification_Client(Notification.ItemGuid, Notification.Type, Notification.DeltaAmount);
    }
}

// Client notification handler with timing safety
void UMounteaInventoryComponent::ProcessInventoryNotification_Client_Implementation(const FGuid& TargetItem, const FString& NotifType, const int32 QuantityDelta)
{
    // Wait for next tick to ensure replication has completed
    GetWorld()->GetTimerManager().SetTimerForNextTick([this, NotifType, TargetItem, QuantityDelta]()
    {
        auto targetItem = Execute_FindItem(this, FInventoryItemSearchParams(TargetItem));
        
        OnNotificationProcessed.Broadcast(UMounteaInventoryStatics::CreateNotificationData(
            NotifType,
            this,
            targetItem.GetGuid(),
            QuantityDelta
        ));
    });
}
```

!!! warning "Network Timing"
    Client notifications are delayed by one tick to ensure replicated data has arrived before processing events. This prevents race conditions.

## Network Patterns

### Server RPCs

Client actions are validated and executed on the server:

```cpp
// Client requests item addition
UFUNCTION(Server, Reliable)
void AddItem_Server(const FInventoryItem& Item);

// Client requests item removal  
UFUNCTION(Server, Reliable)
void RemoveItem_Server(const FGuid& ItemGuid);

// Client requests quantity change
UFUNCTION(Server, Reliable)
void ChangeItemQuantity_Server(const FGuid& ItemGuid, const int32 DeltaAmount);

// Implementation with validation
void UMounteaInventoryComponent::AddItem_Server_Implementation(const FInventoryItem& Item)
{
    // Server validates and executes
    Execute_AddItem(this, Item);
}

void UMounteaInventoryComponent::ChangeItemQuantity_Server_Implementation(const FGuid& ItemGuid, const int32 DeltaAmount)
{
    // Route to appropriate function based on delta sign
    if (DeltaAmount < 0)
        Execute_DecreaseItemQuantity(this, ItemGuid, FMath::Abs(DeltaAmount));
    else if (DeltaAmount > 0)
        Execute_IncreaseItemQuantity(this, ItemGuid, FMath::Abs(DeltaAmount));
}
```

### Client RPCs

Server notifies clients of changes and events:

```cpp
// Unreliable notifications (can be lost without breaking gameplay)
UFUNCTION(Client, Unreliable)
void ProcessInventoryNotification_Client(const FGuid& TargetItem, const FString& NotifType, const int32 QuantityDelta);

UFUNCTION(Client, Unreliable)
void PostItemAdded_Client(const FInventoryItem& Item);

UFUNCTION(Client, Unreliable)
void PostItemRemoved_Client(const FInventoryItem& Item);

// Event broadcasting with authority checks
void UMounteaInventoryComponent::PostItemAdded_Client_Implementation(const FInventoryItem& Item)
{
    // Only broadcast if server allows cosmetic events
    if (IsAuthority() && UMounteaInventorySystemStatics::CanExecuteCosmeticEvents(GetWorld()))
    {
        Execute_ProcessInventoryNotification(this, UMounteaInventoryStatics::CreateNotificationData(
            MounteaInventoryNotificationBaseTypes::ItemAdded,
            this,
            Item.GetGuid(),
            Item.Quantity
        ));
    }
    
    // Always broadcast the core event
    OnItemAdded.Broadcast(Item);
}
```

!!! note "RPC Reliability"
    - **Server RPCs**: Reliable to ensure critical operations reach the server
    - **Client RPCs**: Unreliable for notifications since data replication provides the authoritative state

## Advanced Features

### Validation System

```cpp
bool UMounteaInventoryComponent::CanAddItem_Implementation(const FInventoryItem& Item) const
{
    if (!IsActive()) 
        return false;
    
    // Basic item validation
    if (!Item.IsItemValid() || !Item.GetTemplate())
        return false;
    
    // Check for existing item to merge with
    auto existingItem = Execute_FindItem(this, FInventoryItemSearchParams(Item.GetGuid()));
    if (!existingItem.IsItemValid()) 
        existingItem = Execute_FindItem(this, FInventoryItemSearchParams(Item.GetTemplate()));

    if (existingItem.IsItemValid())
    {
        // Can merge if not at max quantity
        return existingItem.GetQuantity() < existingItem.GetTemplate()->MaxQuantity;
    }

    // New item can be added (implement capacity checks here if needed)
    return true;
}

// Template-based validation
bool UMounteaInventoryComponent::CanAddItemFromTemplate_Implementation(UMounteaInventoryItemTemplate* const Template, const int32 Quantity) const
{
    if (!IsValid(Template))
        return false;

    // Create temporary item for validation
    return Execute_CanAddItem(this, FInventoryItem(Template, Quantity, Template->BaseDurability, nullptr));
}
```

### Durability Management

```cpp
bool UMounteaInventoryComponent::ModifyItemDurability_Implementation(const FGuid& ItemGuid, const float DeltaDurability)
{
    if (!IsActive() || !IsAuthority()) 
        return false;
    
    const int32 index = Execute_FindItemIndex(this, FInventoryItemSearchParams(ItemGuid));
    if (index != INDEX_NONE && InventoryItems.Items.IsValidIndex(index))
    {
        auto& inventoryItem = InventoryItems.Items[index];
        const float OldDurability = inventoryItem.GetDurability();
        
        // Clamp to valid range (0 to max durability)
        const float NewDurability = FMath::Clamp(
            OldDurability + DeltaDurability, 
            0.f, 
            inventoryItem.GetTemplate()->MaxDurability
        );
                 
        if (inventoryItem.SetDurability(NewDurability))
        {
            InventoryItems.MarkItemDirty(inventoryItem);
            OnItemDurabilityChanged.Broadcast(inventoryItem, OldDurability, NewDurability);
            PostItemDurabilityChanged(inventoryItem, OldDurability, NewDurability);
            return true;
        }
    }
    return false;
}
```

### Inventory Clearing

```cpp
void UMounteaInventoryComponent::ClearInventory_Implementation()
{
    if (!IsAuthority())
        return;
    
    // Notify for each item being removed
    for (const auto& Item : InventoryItems.Items)
    {
        OnItemRemoved.Broadcast(Item);
    }
    
    // Clear the collection
    InventoryItems.Items.Empty();
    InventoryItems.MarkArrayDirty();
}
```

## Save System Integration

The component supports automatic save/load through UE's save system:

```cpp
// Properties marked with SaveGame automatically persist
UPROPERTY(SaveGame, EditAnywhere, BlueprintReadOnly, Category="Inventory")
EInventoryType InventoryType;

UPROPERTY(SaveGame, EditAnywhere, BlueprintReadOnly, Category="Inventory") 
EInventoryFlags InventoryTypeFlag;

UPROPERTY(SaveGame, VisibleAnywhere, BlueprintReadOnly, Category="Inventory")
FInventoryItemArray InventoryItems;

UPROPERTY(SaveGame, EditAnywhere, BlueprintReadOnly, Category="Inventory")
TObjectPtr<UUserWidget> InventoryWidget;
```

!!! tip "Save Integration"
    All inventory data automatically saves with your game save system. No additional code required for persistence.

## Performance Optimization

### Replication Efficiency

```cpp
// Use COND_InitialOrOwner for player inventories
DOREPLIFETIME_CONDITION(UMounteaInventoryComponent, InventoryItems, COND_InitialOrOwner);

// Mark specific items dirty rather than entire array
InventoryItems.MarkItemDirty(inventoryItem);

// Batch operations to reduce RPC calls
void BatchAddItems(const TArray<FInventoryItem>& Items)
{
    for (const auto& Item : Items)
    {
        Execute_AddItem(this, Item);
    }
    // Single replication update for all changes
}
```

### Search Optimization

```cpp
// Cache search results for repeated queries
TMap<FString, TArray<FInventoryItem>> SearchCache;

TArray<FInventoryItem> GetCachedCategoryItems(const FString& Category)
{
    if (auto* CachedResult = SearchCache.Find(Category))
        return *CachedResult;
    
    auto Results = Execute_FindItems(this, SearchByCategory(Category));
    SearchCache.Add(Category, Results);
    return Results;
}

// Invalidate cache when inventory changes
void InvalidateSearchCache()
{
    SearchCache.Empty();
}
```

### Memory Management

```cpp
// Avoid storing unnecessary references
void CleanupInvalidReferences()
{
    InventoryItems.Items.RemoveAll([](const FInventoryItem& Item)
    {
        return !Item.IsItemValid();
    });
}

// Use object pooling for frequently created search parameters
FInventoryItemSearchParams* GetPooledSearchParams()
{
    static TArray<FInventoryItemSearchParams> SearchParamsPool;
    // Pool management logic...
}
```

## Common Patterns

### Pattern 1: Inventory Transfer

!!! example "Use Case"
    Moving items between player inventory and storage chests

```cpp
bool TransferItemBetweenInventories(
    UMounteaInventoryComponent* SourceInventory,
    UMounteaInventoryComponent* TargetInventory, 
    const FGuid& ItemGuid,
    int32 Quantity = -1)
{
    // Find source item
    auto SourceItem = SourceInventory->Execute_FindItem(SourceInventory, FInventoryItemSearchParams(ItemGuid));
    if (!SourceItem.IsItemValid())
        return false;
    
    // Determine transfer amount
    const int32 TransferAmount = (Quantity <= 0) ? SourceItem.GetQuantity() : FMath::Min(Quantity, SourceItem.GetQuantity());
    
    // Check if target can accept the item
    FInventoryItem TransferItem = SourceItem;
    TransferItem.SetQuantity(TransferAmount);
    
    if (!TargetInventory->Execute_CanAddItem(TargetInventory, TransferItem))
        return false;
    
    // Perform transfer
    if (TargetInventory->Execute_AddItem(TargetInventory, TransferItem))
    {
        // Remove from source (AddItem handles this automatically for items with OwningInventory)
        return true;
    }
    
    return false;
}
```

### Pattern 2: Conditional Item Access

!!! example "Use Case"
    Restricting inventory access based on game state

```cpp
class UConditionalInventoryComponent : public UMounteaInventoryComponent
{
protected:
    virtual bool CanAddItem_Implementation(const FInventoryItem& Item) const override
    {
        // Base validation first
        if (!Super::CanAddItem_Implementation(Item))
            return false;
        
        // Custom conditions
        if (bIsLocked)
            return false;
            
        if (RequiredLevel > 0 && GetOwnerLevel() < RequiredLevel)
            return false;
            
        if (RestrictedCategories.Contains(Item.GetTemplate()->ItemCategory))
            return false;
        
        return true;
    }
    
private:
    UPROPERTY(EditAnywhere, Category="Access Control")
    bool bIsLocked = false;
    
    UPROPERTY(EditAnywhere, Category="Access Control")
    int32 RequiredLevel = 0;
    
    UPROPERTY(EditAnywhere, Category="Access Control")
    TArray<FString> RestrictedCategories;
};
```

### Pattern 3: Smart Auto-Sorting

!!! example "Use Case"
    Automatically organizing inventory by type and rarity

```cpp
void AutoSortInventory()
{
    auto AllItems = Execute_GetAllItems(this);
    
    // Sort by category, then rarity, then name
    AllItems.Sort([](const FInventoryItem& A, const FInventoryItem& B)
    {
        // Primary: Category
        if (A.GetTemplate()->ItemCategory != B.GetTemplate()->ItemCategory)
            return A.GetTemplate()->ItemCategory < B.GetTemplate()->ItemCategory;
        
        // Secondary: Rarity (higher rarity first)
        if (A.GetTemplate()->ItemRarity != B.GetTemplate()->ItemRarity)
            return GetRarityValue(A.GetTemplate()->ItemRarity) > GetRarityValue(B.GetTemplate()->ItemRarity);
        
        // Tertiary: Name
        return A.GetTemplate()->DisplayName.ToString() < B.GetTemplate()->DisplayName.ToString();
    });
    
    // Clear and re-add in sorted order
    InventoryItems.Items.Empty();
    for (const auto& Item : AllItems)
    {
        InventoryItems.Items.Add(Item);
    }
    InventoryItems.MarkArrayDirty();
}
```

## Troubleshooting

### Common Issues

!!! warning "Items Not Replicating"
    **Problem**: Changes don't appear on clients  
    **Solution**: Ensure operations run on server authority, check COND_InitialOrOwner replication

!!! warning "Event Timing Issues"  
    **Problem**: UI updates before item data arrives  
    **Solution**: Use timer delays in client RPCs, bind to OnRep functions

!!! warning "Performance Degradation"
    **Problem**: Frame drops during inventory operations  
    **Solution**: Batch operations, use Unreliable RPCs for notifications, cache search results

!!! warning "Save/Load Problems"
    **Problem**: Inventory doesn't persist between sessions  
    **Solution**: Verify SaveGame tags on properties, check save system integration

### Debug Commands

```cpp
// Console command for debugging
UFUNCTION(CallInEditor=true, Category="Debug")
void DebugPrintInventory()
{
    LOG_WARNING(TEXT("Inventory Contents:"));
    for (int32 i = 0; i < InventoryItems.Items.Num(); ++i)
    {
        const auto& Item = InventoryItems.Items[i];
        LOG_WARNING(TEXT("[%d] %s"), i, *Item.ToString());
    }
}

// Validate inventory integrity
UFUNCTION(CallInEditor=true, Category="Debug")
void ValidateInventoryIntegrity()
{
    int32 ErrorCount = 0;
    for (const auto& Item : InventoryItems.Items)
    {
        if (!Item.IsItemValid())
        {
            UE_LOG(LogTemp, Error, TEXT("Invalid item found: %s"), *Item.ToString());
            ErrorCount++;
        }
    }
    LOG_WARNING(TEXT("Validation complete. %d errors found."), ErrorCount);
}
```

## Best Practices

!!! tip "Design Guidelines"
    - **Authority Pattern**: Always validate on server, execute on authority
    - **Event Driven**: Use delegates for UI updates and game logic reactions  
    - **Validation First**: Check CanAddItem before attempting operations
    - **Batch Operations**: Group related changes to reduce network traffic
    - **Cache Smartly**: Store expensive search results but invalidate appropriately

!!! note "Performance Tips"
    - Use Unreliable RPCs for cosmetic notifications
    - Implement search result caching for repeated queries
    - Mark individual items dirty rather than entire arrays
    - Consider inventory size limits to prevent unbounded growth

!!! warning "Common Pitfalls"
    - Don't forget authority checks in custom implementations
    - Avoid circular dependencies between inventory and equipment systems
    - Remember to handle edge cases like zero quantities and invalid items
    - Test thoroughly in networked environments

## Next Steps

- **[Equipment System](../EquipmentSystem/EquipmentSystem.md):** Equip and manage worn items from inventory
- **[UI System](../UserInterface/InventoryUIComponent.md):** Create responsive inventory interfaces
- **[Trading System](../TradingSystem/TBD.md):** Enable item exchange between players
