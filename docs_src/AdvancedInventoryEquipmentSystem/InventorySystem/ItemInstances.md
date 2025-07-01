# Item Instances

## What You'll Learn

- Understanding runtime item instances vs static templates
- Creating and managing item instances from templates
- Runtime property modification (quantity, durability, custom data)
- Inventory ownership and relationships
- Network replication and state synchronization
- Affector slots for item attachments
- Instance lifecycle and validation

## Quick Start

```cpp
// Create item instance from template
FInventoryItem Item(Template, Quantity, Durability, OwningInventory);

// Add to inventory
bool Success = UMounteaInventoryStatics::AddItem(InventoryInterface, Item);

// Modify runtime properties
UMounteaInventoryStatics::ModifyItemQuantity(InventoryInterface, Item.GetGuid(), 5);
UMounteaInventoryStatics::ModifyItemDurability(InventoryInterface, Item.GetGuid(), -10.0f);
```

!!! tip "Result"
    Runtime item instances with independent state that can be modified, replicated, and managed dynamically.

## Core Concepts

### What Are Item Instances?

Item instances are the actual items that exist in your game world - the specific sword in a player's backpack, the exact potion sitting in a chest, or the particular armor piece currently equipped. Think of them like individual books in a library: while there might be multiple copies of "Lord of the Rings," each physical book is unique - one might be worn from reading, another might have bookmarks, and a third could be brand new.

### Template vs Instance Relationship

This relationship mirrors real-world manufacturing: templates are like blueprints or molds, while instances are the actual products made from those blueprints.

```cpp
// Template: Static blueprint (shared) - Like a car model specification
UMounteaInventoryItemTemplate* SwordTemplate;                            // "Iron Sword" blueprint

// Instances: Runtime structs (individual) - Like actual cars from that model
FInventoryItem PlayerSword(SwordTemplate, 1, 85.0f, PlayerInventory);    // Player's worn sword
FInventoryItem ChestSword(SwordTemplate, 1, 100.0f, ChestInventory);     // Pristine sword in chest
FInventoryItem BrokenSword(SwordTemplate, 1, 15.0f, PlayerInventory);    // Nearly broken sword
```

!!! quote "Real-World Analogy"
    - **Template** = "iPhone 15 Pro" product specification
    - **Instances** = Your specific iPhone (with your photos, apps, scratches) vs your friend's iPhone (different apps, condition)

!!! info "Key Differences"
    - **Templates**: Static recipes defining what an item can be - shared by all instances
    - **Instances**: Living items with current state - each one is unique and changes over time
    - **Memory**: One template serves thousands of instances efficiently
    - **Network**: Only instance changes replicate, templates sync once

### Instance Structure

FInventoryItem is a C++ struct (not a class or object) that holds all the data for a single item instance. Think of it as a data container that travels with the item wherever it goes:

```cpp
struct FInventoryItem : public FFastArraySerializerItem
{
    // Identity - "Who am I?"
    FGuid Guid;                                             // Unique fingerprint for this specific item
    TObjectPtr<UMounteaInventoryItemTemplate> Template;     // Reference to the "recipe" that defines me
    
    // Current State - "What's my condition?"
    int32 Quantity = 1;                                     // How many items in this stack (like 50 arrows)
    float Durability = 1.0f;                                // My current condition (1.0 = perfect, 0.0 = broken)
    FGameplayTagContainer CustomData;                       // Special notes about me (cursed, blessed, etc.)
    
    // Relationships - "Where do I belong?"
    TScriptInterface<IMounteaAdvancedInventoryInterface> OwningInventory;  // Which inventory owns me
    TMap<FGameplayTag, FGuid> AffectorSlots;                // What's attached to me (gems, enchants)
    
    // Network Magic - "How do I sync across players?"
    mutable FInventoryItemSnapshot PreReplicationSnapshot;  // Remembers my state for network updates
};
```

!!! question "Why Struct Instead of Object?"
    - **Performance**: Structs are lighter weight and faster to copy
    - **Network Friendly**: Easier to replicate efficiently across network
    - **Memory Efficient**: No UObject overhead for thousands of items
    - **Value Semantics**: Items behave like data, not like actors

## Instance Creation

### When Are Instances Created?

Item instances come to life in several scenarios:

- **Loot Generation**: When a monster drops items or chests spawn loot
- **Crafting**: When players create new items from materials  
- **Trading**: When NPCs sell items or players exchange goods
- **World Spawning**: When items exist in the world as pickups
- **Starting Equipment**: When characters begin with initial gear

### Constructor Patterns

There are several ways to create item instances, depending on your needs:

```cpp
// Empty constructor - Creates invalid instance (use for error cases)
FInventoryItem InvalidItem;  // Not ready to use

// GUID-only constructor - Creates shell for later filling
FInventoryItem ItemWithGuid(FGuid::NewGuid());  // Has identity but no properties

// Full constructor - Creates complete, ready-to-use instance (recommended)
FInventoryItem Item(
    Template,          // Which "recipe" to use (UMounteaInventoryItemTemplate*)
    Quantity,          // How many items (automatically clamped to template limits)
    Durability,        // Starting condition (automatically clamped to 0-max range)
    OwningInventory    // Which inventory owns this (can be null initially)
);
```

!!! quote "Real-World Example"
    **Like ordering a custom car:**
    - Empty constructor = Empty order form
    - GUID-only = Order number assigned, but no car details yet
    - Full constructor = Complete order: "Red Tesla Model 3, with premium interior, delivered to John's garage"

### Static Creation Functions

```cpp
// Through inventory statics
bool UMounteaInventoryStatics::AddItemFromTemplate(
    const TScriptInterface<IMounteaAdvancedInventoryInterface>& Target,
    UMounteaInventoryItemTemplate* Template,
    const int32 Quantity = 1,
    const float Durability = 1.0f
);

// Manual construction with validation
FInventoryItem CreateValidatedItem(UMounteaInventoryItemTemplate* Template)
{
    if (!IsValid(Template))
        return FInventoryItem();  // Invalid instance
        
    const int32 SafeQuantity = FMath::Clamp(1, 1, Template->MaxQuantity);
    const float SafeDurability = Template->bHasDurability ? Template->BaseDurability : 1.0f;
    
    return FInventoryItem(Template, SafeQuantity, SafeDurability);
}
```

## Runtime Properties

### Understanding Item State

Item instances are living entities that change over time during gameplay. Unlike templates which never change, instances track current conditions and can be modified by player actions, game events, or time passage.

### Quantity Management

Quantity represents how many identical items are grouped together in a single stack. This is crucial for inventory space management and item economy.

**When Quantity Matters:**

- **Arrows**: Players might have 50 arrows in one inventory slot
- **Potions**: 10 health potions stacked together
- **Coins**: 1000 gold pieces as a single stack
- **Unique Items**: Legendary weapons always have quantity = 1

```cpp
// Get current quantity
int32 CurrentQuantity = Item.GetQuantity();

// Safely modify quantity (with built-in validation)
bool SetQuantity(const int32 InQuantity)
{
    if (InQuantity == Quantity || !IsValid(Template))
        return false;  // No change needed or invalid template

    // Check bounds against template limits
    if (InQuantity >= 0 && InQuantity <= Template->MaxQuantity)
    {
        Quantity = InQuantity;
        return true;  // Successfully changed
    }
    
    return false;  // Requested quantity outside allowed range
}

// Practical usage - adding more arrows to existing stack
bool AddMoreArrows(FInventoryItem& ArrowStack, int32 NewArrows)
{
    const int32 TotalArrows = ArrowStack.GetQuantity() + NewArrows;
    return ArrowStack.SetQuantity(TotalArrows);  // Automatically validates against limits
}
```

!!! quote "Real-World Analogy"
    Like a bag of marbles - you can add or remove marbles, but the bag has a maximum capacity defined by its template.

### Durability System

Durability represents the current condition of an item - how worn, damaged, or pristine it is. This system adds realism and economic depth to your game by making items degrade over time and use.

!!! question "How Durability Works"
    - **1.0 (100%)**: Perfect condition, brand new
    - **0.5 (50%)**: Moderately worn, showing signs of use  
    - **0.1 (10%)**: Nearly broken, barely functional
    - **0.0 (0%)**: Completely broken, unusable

!!! warning "When Durability Works"
    Durability in *Advanced Inventory & Equipment* is rather a concept we implemented in some way.
    We provide ways to manage and modify durability, we provide events to listen to its change, however, the final implementation
    is up to you.

**Common Uses:**

- **Weapons**: Lose sharpness after combat, affecting damage
- **Armor**: Gets dented and cracked, reducing protection
- **Tools**: Wear out from harvesting, mining, or crafting
- **Vehicles**: Engine wear, tire degradation

```cpp
// Check if this item can break down
bool HasDurability() const
{
    return IsValid(Template) && Template->bHasDurability;
}

// Safely change durability with automatic bounds checking
bool SetDurability(const float InDurability)
{
    if (InDurability == Durability || !IsValid(Template))
        return false;  // No change or invalid item

    if (!Template->bHasDurability)
        return false;  // This item type doesn't support durability

    // Clamp to valid range: 0.0 to template's maximum
    if ((FMath::IsNearlyZero(InDurability) || InDurability > 0.0f) && 
        InDurability <= Template->MaxDurability)
    {
        Durability = InDurability;
        return true;
    }
    
    return false;  // Requested durability outside valid range
}

// Practical example - sword takes damage in combat
void DamageSwordInCombat(FInventoryItem& Sword, float CombatDamage)
{
    if (Sword.HasDurability())
    {
        const float NewDurability = FMath::Clamp(
            Sword.GetDurability() - CombatDamage,
            0.0f,  // Can't go below 0 (completely broken)
            Sword.GetTemplate()->MaxDurability  // Can't exceed maximum
        );
        
        Sword.SetDurability(NewDurability);
        
        // Check if sword broke
        if (FMath::IsNearlyZero(NewDurability))
        {
            // Sword is now broken - might disable its use or require repair
        }
    }
}
```

!!! quote "Real-World Analogy"
    Like a smartphone battery - starts at 100% when new, gradually decreases with use, affects performance as it degrades, and eventually needs replacement when it hits 0%.

### Custom Data Tags

Custom data provides a flexible way to attach special information to individual items. Think of it as sticky notes you can put on items to remember important details about their current state, history, or special properties.

!!! question "What Custom Data Is Used For"
    - **Temporary Effects**: "This sword is temporarily enchanted with fire"
    - **Item History**: "This armor was worn by a famous hero"
    - **Current State**: "This potion is poisoned" or "This weapon is blessed"
    - **Player Notes**: "This is my favorite sword" or "Save this for boss fight"
    - **Quest Flags**: "This key opens the royal treasury"

!!! question "Why Use Tags Instead of New Properties?"
    - **Flexibility**: Add any data without changing code
    - **Performance**: Tags are memory-efficient and network-friendly
    - **Extensibility**: Modders can add their own tags easily
    - **Clean Code**: No need for dozens of boolean flags

```cpp
// Adding a tag - mark sword as cursed
FGameplayTag CursedTag = FGameplayTag::RequestGameplayTag("ItemState.Cursed");
FGameplayTagContainer NewData = Item.GetCustomData();
NewData.AddTag(CursedTag);
Item.SetCustomData(NewData);

// Checking for conditions - is this item broken?
bool IsBroken(const FInventoryItem& Item)
{
    return Item.GetCustomData().HasTag(
        FGameplayTag::RequestGameplayTag("ItemState.Broken")
    );
}

// Removing temporary effects after spell expires
void RemoveTemporaryMagic(FInventoryItem& Item)
{
    FGameplayTagContainer CleanedData = Item.GetCustomData();
    
    // Remove all temporary effect tags
    CleanedData.RemoveTag(FGameplayTag::RequestGameplayTag("Effect.FireEnchant"));
    CleanedData.RemoveTag(FGameplayTag::RequestGameplayTag("Effect.IceEnchant"));
    CleanedData.RemoveTag(FGameplayTag::RequestGameplayTag("Effect.LightningEnchant"));
    
    Item.SetCustomData(CleanedData);
}

// Complex example - managing item quality tiers
void UpdateItemQuality(FInventoryItem& Item)
{
    FGameplayTagContainer NewData = Item.GetCustomData();
    
    // Clear old quality tags
    NewData.RemoveTag(FGameplayTag::RequestGameplayTag("Quality.Poor"));
    NewData.RemoveTag(FGameplayTag::RequestGameplayTag("Quality.Common"));
    NewData.RemoveTag(FGameplayTag::RequestGameplayTag("Quality.Rare"));
    NewData.RemoveTag(FGameplayTag::RequestGameplayTag("Quality.Epic"));
    NewData.RemoveTag(FGameplayTag::RequestGameplayTag("Quality.Legendary"));
    
    // Add new quality based on durability and usage
    const float DurabilityPercent = Item.GetDurability() / Item.GetTemplate()->MaxDurability;
    
    if (DurabilityPercent > 0.9f)
        NewData.AddTag(FGameplayTag::RequestGameplayTag("Quality.Legendary"));
    else if (DurabilityPercent > 0.7f)
        NewData.AddTag(FGameplayTag::RequestGameplayTag("Quality.Epic"));
    else if (DurabilityPercent > 0.5f)
        NewData.AddTag(FGameplayTag::RequestGameplayTag("Quality.Rare"));
    else if (DurabilityPercent > 0.2f)
        NewData.AddTag(FGameplayTag::RequestGameplayTag("Quality.Common"));
    else
        NewData.AddTag(FGameplayTag::RequestGameplayTag("Quality.Poor"));
    
    Item.SetCustomData(NewData);
}
```

!!! quote "Real-World Analogy"
    Like putting stickers or labels on your belongings - "Fragile", "Keep Refrigerated", "Property of John", "Urgent", etc. Each tag adds meaning without changing what the item fundamentally is.

## Ownership and Relationships

### Inventory Ownership

Every item instance must know which inventory currently owns it. This ownership relationship is critical for game logic, network replication, and data integrity across multiplayer sessions.

!!! question "Why Ownership Matters"
    - **Authority and Validation:** The owning inventory's component determines who has authority over item changes. Only the inventory's owning actor (usually the server or the player who owns that inventory) can make authoritative changes.
    - **Network Replication Boundaries:** Items replicate within the context of their owning inventory. When you pick up an item, it transfers from a world/chest inventory to your player inventory, changing replication ownership and network relevance.
    - **Callback Routing:** When items change (quantity, durability, etc.), they notify their owning inventory, which can then update UI, trigger effects, or validate game rules.
    - **Reference Integrity:** Prevents orphaned items that exist in memory but belong nowhere, which could cause crashes or data corruption.

```cpp
// Check ownership
bool IsItemInInventory() const
{
    return OwningInventory != nullptr;
}

// Transfer ownership
bool TransferItem(FInventoryItem& Item, 
    TScriptInterface<IMounteaAdvancedInventoryInterface> NewOwner)
{
    if (Item.SetOwningInventory(NewOwner))
    {
        // Ownership changed successfully
        return true;
    }
    return false;
}

// Access owning inventory
void ProcessItemInInventory(const FInventoryItem& Item)
{
    if (auto Inventory = Item.GetOwningInventory())
    {
        // Perform inventory-specific operations
        Inventory->Execute_SomeInventoryFunction(Inventory.GetObject());
    }
}
```

### Affector Slots

Affector slots allow items to have attachments (gems, enchants, modifications):

```cpp
// Define affector slots in template
FGameplayTagContainer AttachmentSlots;  // Weapon.Socket.Gem, Armor.Enchant.Fire

// Attach item to slot
bool AttachToSlot(FInventoryItem& ParentItem, 
    const FGameplayTag& SlotTag, 
    const FGuid& AttachedItemGuid)
{
    // Validate slot exists in template
    if (!ParentItem.GetTemplate()->AttachmentSlots.HasTag(SlotTag))
        return false;
        
    TMap<FGameplayTag, FGuid> NewSlots = ParentItem.GetAffectorSlots();
    NewSlots.Add(SlotTag, AttachedItemGuid);
    return ParentItem.SetAffectorSlots(NewSlots);
}

// Get attached items
TArray<FGuid> GetAttachedItems(const FInventoryItem& Item)
{
    TArray<FGuid> AttachedGuids;
    Item.GetAffectorSlots().GenerateValueArray(AttachedGuids);
    return AttachedGuids;
}

// Remove attachment
bool DetachFromSlot(FInventoryItem& ParentItem, const FGameplayTag& SlotTag)
{
    TMap<FGameplayTag, FGuid> NewSlots = ParentItem.GetAffectorSlots();
    if (NewSlots.Remove(SlotTag) > 0)
    {
        return ParentItem.SetAffectorSlots(NewSlots);
    }
    return false;
}
```

## Network Replication

!!! question "Why Network Replication Matters"
    - In multiplayer games, item instances need to stay synchronized between the server (which has the authoritative "truth") and all connected clients (players' computers). When a player picks up an item, uses a potion, or breaks a weapon, every other player needs to see these changes correctly.

### The Challenge

Sending complete item data over the network every time something changes would be extremely wasteful. Imagine sending the entire inventory every time a player uses one arrow from a stack of 50!

### The Solution

Delta replication - only send what actually changed. This is like sending a text saying "arrow count went from 50 to 49" instead of resending the entire arrow description.

### How Delta Detection Works

The system uses snapshots to detect what changed:

```cpp
// Before any changes happen, take a "photo" of the current state
struct FInventoryItemSnapshot
{
    int32 Quantity = INDEX_NONE;        // How many items were there before?
    float Durability = -1.f;            // What was the durability before?
    FGameplayTagContainer CustomData;   // What tags existed before?
    
    // Smart comparison functions
    bool HasQuantityChanged(const FInventoryItem& Current) const
    {
        return Quantity != Current.GetQuantity();  // Simple: did the number change?
    }
    
    int32 GetQuantityDelta(const FInventoryItem& Current) const
    {
        return Current.GetQuantity() - Quantity;  // How much did it change by?
    }
    
    bool HasDurabilityChanged(const FInventoryItem& Current) const
    {
        return !FMath::IsNearlyEqual(Durability, Current.GetDurability());
    }
    
    float GetDurabilityDelta(const FInventoryItem& Current) const
    {
        return Current.GetDurability() - Durability;  // Damage or repair amount
    }
};
```

!!! quote "Real-World Analogy"
    Like taking before and after photos of your room, then only mentioning what changed: "The bed was made", "Three books were moved", "One lamp was turned on".

### Network Communication Process

When item instances change, they automatically communicate these changes across the network through a sophisticated callback system. Think of it as items "announcing" their changes to everyone who needs to know.

```cpp
// Custom network serialization - efficiently pack data for transmission
bool FInventoryItem::NetSerialize(FArchive& Ar, UPackageMap* Map, bool& bOutSuccess)
{
    // Send/receive the essential data
    Ar << Guid;              // Which specific item this is
    Ar << Template;          // What type of item (reference, not full data)
    Ar << Quantity;          // Current stack size
    Ar << Durability;        // Current condition
    CustomData.NetSerialize(Ar, Map, bOutSuccess);  // Any special tags
    
    // Handle inventory ownership carefully
    UObject* OwningInventoryObj = nullptr;
    if (Ar.IsSaving())  // Sending to network
        OwningInventoryObj = OwningInventory.GetObject();
    Ar << OwningInventoryObj;
    if (Ar.IsLoading())  // Receiving from network
        OwningInventory = TScriptInterface<IMounteaAdvancedInventoryInterface>(OwningInventoryObj);
    
    // Handle attached items (gems, enchants)
    int32 NumPairs = AffectorSlots.Num();
    Ar << NumPairs;
    
    if (Ar.IsLoading())  // Receiving
    {
        for (int32 i = 0; i < NumPairs; ++i)
        {
            FGameplayTag Key;
            FGuid Value;
            Ar << Key << Value;
            AffectorSlots.Add(Key, Value);
        }
    }
    else  // Sending
    {
        for (const auto& Pair : AffectorSlots)
        {
            FGameplayTag Key = Pair.Key;
            FGuid Value = Pair.Value;
            Ar << Key << Value;
        }
    }
    
    bOutSuccess = true;
    return true;
}
```

!!! question "What This Means"
    Instead of sending "Here's a complete Iron Sword with 50 durability, owned by PlayerInventory, with a Fire Gem attached", the system efficiently sends just the changes: "Durability changed from 60 to 50".

### Replication Callbacks

When item changes arrive over the network, the system automatically notifies the owning inventory so it can react appropriately. This is like having a smart notification system that tells you exactly what happened to your items.

```cpp
// When a completely new item appears in inventory
void PostReplicatedAdd(const FInventoryItemArray& InArraySerializer)
{
    if (IsValid(OwningInventory.GetObject()))
    {
        // Take a snapshot for future change detection
        CapturePreReplicationSnapshot();
        
        // Tell the inventory "Hey, you just got a new item!"
        OwningInventory->Execute_ProcessInventoryNotification(
            OwningInventory.GetObject(),
            UMounteaInventoryStatics::CreateNotificationData(
                MounteaInventoryNotificationBaseTypes::ItemAdded,  // What happened
                OwningInventory,  // Who it happened to
                Guid,             // Which item
                Quantity          // How many
            )
        );
    }
}

// When existing item properties change
void PostReplicatedChange(const FInventoryItemArray& InArraySerializer)
{
    if (!IsValid(OwningInventory.GetObject()) || !IsValid(Template))
        return;  // Can't process if inventory or template is missing

    // Check what specifically changed and react accordingly
    
    // Did the stack size change?
    if (PreReplicationSnapshot.HasQuantityChanged(*this))
    {
        const int32 QuantityDelta = PreReplicationSnapshot.GetQuantityDelta(*this);
        
        // Determine if items were added or removed
        const FString NotificationType = QuantityDelta > 0 
            ? MounteaInventoryNotificationBaseTypes::ItemAdded      // Stack grew
            : MounteaInventoryNotificationBaseTypes::ItemRemoved;   // Stack shrank

        OwningInventory->Execute_ProcessInventoryNotification(
            OwningInventory.GetObject(),
            UMounteaInventoryStatics::CreateNotificationData(
                NotificationType, 
                OwningInventory, 
                Guid, 
                QuantityDelta > 0 ? QuantityDelta : -QuantityDelta  // Always positive number
            )
        );
    }

    // Did the durability change?
    if (Template->bHasDurability && PreReplicationSnapshot.HasDurabilityChanged(*this))
    {
        const float DurabilityDelta = PreReplicationSnapshot.GetDurabilityDelta(*this);
        
        // Special notifications for important durability milestones
        if (FMath::IsNearlyZero(GetDurability()))
        {
            // Item completely broke!
            OwningInventory->Execute_ProcessInventoryNotification(
                OwningInventory.GetObject(),
                UMounteaInventoryStatics::CreateNotificationData(
                    MounteaInventoryNotificationBaseTypes::DurabilityZero,
                    OwningInventory, Guid, 0
                )
            );
        }
        else if (FMath::IsNearlyEqual(GetDurability(), GetTemplate()->MaxDurability))
        {
            // Item was fully repaired!
            OwningInventory->Execute_ProcessInventoryNotification(
                OwningInventory.GetObject(),
                UMounteaInventoryStatics::CreateNotificationData(
                    MounteaInventoryNotificationBaseTypes::DurabilityMax,
                    OwningInventory, Guid, DurabilityDelta
                )
            );
        }
        else if (DurabilityDelta > 0)
        {
            // Item was repaired partially
            OwningInventory->Execute_ProcessInventoryNotification(
                OwningInventory.GetObject(),
                UMounteaInventoryStatics::CreateNotificationData(
                    MounteaInventoryNotificationBaseTypes::DurabilityIncreased,
                    OwningInventory, Guid, DurabilityDelta
                )
            );
        }
        else
        {
            // Item took damage
            OwningInventory->Execute_ProcessInventoryNotification(
                OwningInventory.GetObject(),
                UMounteaInventoryStatics::CreateNotificationData(
                    MounteaInventoryNotificationBaseTypes::DurabilityDecreased,
                    OwningInventory, Guid, -DurabilityDelta  // Make positive
                )
            );
        }
    }
    
    // Update our snapshot for the next round of changes
    CapturePreReplicationSnapshot();
}

// When an item is completely removed from inventory
void PreReplicatedRemove(const FInventoryItemArray& InArraySerializer)
{
    if (IsValid(OwningInventory.GetObject()))
    {
        // Tell the inventory "You're about to lose this item"
        OwningInventory->Execute_ProcessInventoryNotification(
            OwningInventory.GetObject(),
            UMounteaInventoryStatics::CreateNotificationData(
                MounteaInventoryNotificationBaseTypes::ItemRemoved,
                OwningInventory,
                Guid,
                -Quantity  // Negative because it's being removed
            )
        );
    }
}
```

!!! quote "Real-World Analogy"
    Like having a smart home system that announces changes: "Kitchen coffee maker turned on", "Living room temperature increased by 3 degrees", "Front door was unlocked". Each notification is specific and tells you exactly what changed.

## Validation and Lifecycle

### Instance Validation

```cpp
// Core validation
bool IsItemValid() const
{
    return Guid.IsValid() && Template != nullptr;
}

// Comprehensive validation
bool ValidateItemInstance(const FInventoryItem& Item, FString& ErrorMessage)
{
    if (!Item.IsItemValid())
    {
        ErrorMessage = TEXT("Invalid item: missing GUID or template");
        return false;
    }
    
    if (Item.GetQuantity() <= 0)
    {
        ErrorMessage = TEXT("Invalid quantity: must be greater than 0");
        return false;
    }
    
    if (Item.GetQuantity() > Item.GetTemplate()->MaxQuantity)
    {
        ErrorMessage = FString::Printf(
            TEXT("Invalid quantity: %d exceeds max %d"), 
            Item.GetQuantity(), 
            Item.GetTemplate()->MaxQuantity
        );
        return false;
    }
    
    if (Item.GetTemplate()->bHasDurability)
    {
        if (Item.GetDurability() < 0.0f || Item.GetDurability() > Item.GetTemplate()->MaxDurability)
        {
            ErrorMessage = TEXT("Invalid durability: outside allowed range");
            return false;
        }
    }
    
    return true;
}
```

### Lifecycle Management

```cpp
// Create and validate
FInventoryItem CreateSafeItem(UMounteaInventoryItemTemplate* Template, 
    int32 RequestedQuantity = 1)
{
    if (!IsValid(Template))
        return FInventoryItem();  // Invalid instance
    
    // Apply template constraints
    const int32 SafeQuantity = FMath::Clamp(RequestedQuantity, 1, Template->MaxQuantity);
    const float StartDurability = Template->bHasDurability ? Template->BaseDurability : 1.0f;
    
    FInventoryItem NewItem(Template, SafeQuantity, StartDurability);
    
    // Validate result
    FString ValidationError;
    if (!ValidateItemInstance(NewItem, ValidationError))
    {
        LOG_ERROR(TEXT("Failed to create item: %s"), *ValidationError);
        return FInventoryItem();
    }
    
    return NewItem;
}

// Cleanup and destruction
void CleanupItem(FInventoryItem& Item)
{
    // Remove from affector slots of other items
    if (Item.IsItemInInventory())
    {
        auto Inventory = Item.GetOwningInventory();
        // Remove this item from any affector slots it occupies
    }
    
    // Clear relationships
    Item.SetOwningInventory(nullptr);
    Item.SetAffectorSlots(TMap<FGameplayTag, FGuid>());
    
    // Reset runtime state
    Item.SetQuantity(0);
    Item.SetDurability(0.0f);
    Item.SetCustomData(FGameplayTagContainer());
}
```

## Common Patterns

### Pattern 1: Item State Management

!!! note "When & Why"
    - Tracking item condition over time
    - Applying temporary effects
    - Managing item degradation

```cpp
// Durability-based state tracking
void UpdateItemCondition(FInventoryItem& Item)
{
    if (!Item.GetTemplate()->bHasDurability)
        return;
    
    const float DurabilityPercent = Item.GetDurability() / Item.GetTemplate()->MaxDurability;
    
    FGameplayTagContainer NewData = Item.GetCustomData();
    
    // Remove old condition tags
    NewData.RemoveTag(FGameplayTag::RequestGameplayTag("Condition.Pristine"));
    NewData.RemoveTag(FGameplayTag::RequestGameplayTag("Condition.Worn"));
    NewData.RemoveTag(FGameplayTag::RequestGameplayTag("Condition.Damaged"));
    NewData.RemoveTag(FGameplayTag::RequestGameplayTag("Condition.Broken"));
    
    // Add current condition
    if (DurabilityPercent > 0.8f)
        NewData.AddTag(FGameplayTag::RequestGameplayTag("Condition.Pristine"));
    else if (DurabilityPercent > 0.5f)
        NewData.AddTag(FGameplayTag::RequestGameplayTag("Condition.Worn"));
    else if (DurabilityPercent > 0.1f)
        NewData.AddTag(FGameplayTag::RequestGameplayTag("Condition.Damaged"));
    else
        NewData.AddTag(FGameplayTag::RequestGameplayTag("Condition.Broken"));
    
    Item.SetCustomData(NewData);
}
```

### Pattern 2: Item Merging and Splitting

!!! note "When & Why"
    - Combining stackable items
    - Splitting stacks for trading
    - Managing inventory space

```cpp
// Merge compatible items
bool MergeItems(FInventoryItem& TargetItem, const FInventoryItem& SourceItem)
{
    // Validate merge compatibility
    if (TargetItem.GetTemplate() != SourceItem.GetTemplate())
        return false;
        
    if (!IsStackable(TargetItem.GetTemplate()))
        return false;
    
    const int32 TotalQuantity = TargetItem.GetQuantity() + SourceItem.GetQuantity();
    const int32 MaxQuantity = TargetItem.GetTemplate()->MaxQuantity;
    
    if (TotalQuantity <= MaxQuantity)
    {
        // Complete merge
        TargetItem.SetQuantity(TotalQuantity);
        return true;
    }
    
    return false;  // Cannot merge completely
}

// Split item stack
FInventoryItem SplitItem(FInventoryItem& OriginalItem, int32 SplitQuantity)
{
    if (SplitQuantity <= 0 || SplitQuantity >= OriginalItem.GetQuantity())
        return FInventoryItem();  // Invalid split
    
    // Create new item with split quantity
    FInventoryItem SplitItem(
        OriginalItem.GetTemplate(),
        SplitQuantity,
        OriginalItem.GetDurability(),
        nullptr  // No owner initially
    );
    
    // Copy custom data
    SplitItem.SetCustomData(OriginalItem.GetCustomData());
    
    // Reduce original quantity
    OriginalItem.SetQuantity(OriginalItem.GetQuantity() - SplitQuantity);
    
    return SplitItem;
}
```

### Pattern 3: Attachment Management

!!! note "When & Why"
    - Weapon gems and enchantments
    - Armor modifications
    - Modular item systems

```cpp
// Attach gem to weapon
bool AttachGemToWeapon(FInventoryItem& Weapon, const FInventoryItem& Gem)
{
    // Find available gem slot
    FGameplayTag GemSlotTag;
    for (const FGameplayTag& SlotTag : Weapon.GetTemplate()->AttachmentSlots)
    {
        if (SlotTag.MatchesTag(FGameplayTag::RequestGameplayTag("Weapon.Socket.Gem")))
        {
            // Check if slot is empty
            if (!Weapon.GetAffectorSlots().Contains(SlotTag))
            {
                GemSlotTag = SlotTag;
                break;
            }
        }
    }
    
    if (!GemSlotTag.IsValid())
        return false;  // No available gem slots
    
    // Attach gem
    TMap<FGameplayTag, FGuid> NewSlots = Weapon.GetAffectorSlots();
    NewSlots.Add(GemSlotTag, Gem.GetGuid());
    return Weapon.SetAffectorSlots(NewSlots);
}

// Calculate total item stats with attachments
float CalculateWeaponDamage(const FInventoryItem& Weapon, 
    const TArray<FInventoryItem>& AllItems)
{
    float BaseDamage = GetWeaponBaseDamage(Weapon.GetTemplate());
    
    // Add gem bonuses
    for (const auto& SlotPair : Weapon.GetAffectorSlots())
    {
        const FGuid& AttachedGuid = SlotPair.Value;
        
        // Find attached item
        const FInventoryItem* AttachedItem = AllItems.FindByPredicate(
            [AttachedGuid](const FInventoryItem& Item) 
            { 
                return Item.GetGuid() == AttachedGuid; 
            }
        );
        
        if (AttachedItem && IsGem(AttachedItem->GetTemplate()))
        {
            BaseDamage += GetGemDamageBonus(AttachedItem->GetTemplate());
        }
    }
    
    return BaseDamage;
}
```

## Debug and Inspection

### Instance Information

```cpp
// Generate debug string
FString FInventoryItem::ToString() const
{
    TStringBuilder<512> Builder;

    if (!IsItemValid())
        return TEXT("Invalid Item!");
    
    Builder.Appendf(TEXT("Item [%s] (GUID: %s)\n"), 
        *GetTemplate()->DisplayName.ToString(), 
        *GetGuid().ToString());
    
    Builder.Appendf(TEXT("Quantity: %d/%d\n"), 
        GetQuantity(), 
        GetTemplate()->MaxQuantity);
    
    if (GetTemplate()->bHasDurability)
    {
        Builder.Appendf(TEXT("Durability: %.1f/%.1f\n"), 
            GetDurability(), 
            GetTemplate()->MaxDurability);
    }
    
    if (!CustomData.IsEmpty())
    {
        Builder.Append(TEXT("Custom Data: "));
        Builder.Append(CustomData.ToString());
        Builder.Append(TEXT("\n"));
    }
    
    if (AffectorSlots.Num() > 0)
    {
        Builder.Append(TEXT("Affectors:\n"));
        for (const auto& Pair : AffectorSlots)
        {
            Builder.Appendf(TEXT("  - %s: %s\n"), 
                *Pair.Key.ToString(), 
                *Pair.Value.ToString());
        }
    }
    
    return Builder.ToString();
}

// Console command for debugging
void DebugPrintItem(const FGuid& ItemGuid)
{
    if (FInventoryItem* Item = FindItemByGuid(ItemGuid))
    {
        UE_LOG(LogTemp, Warning, TEXT("%s"), *Item->ToString());
    }
}
```

## Performance Considerations

!!! warning "Optimization Tips"
    - **Batch Operations:** Group item modifications to reduce replication traffic
    - **Snapshot Efficiency:** Only capture snapshots when needed for replication
    - **Validation Caching:** Cache validation results for frequently-checked items
    - **Affector Lookups:** Use maps for O(1) affector slot access

```cpp
// Efficient batch modification
void BatchModifyItems(TArray<FInventoryItem*>& Items, 
    TFunction<void(FInventoryItem&)> ModifyFunction)
{
    // Disable replication temporarily
    for (FInventoryItem* Item : Items)
    {
        if (Item && Item->IsItemValid())
        {
            ModifyFunction(*Item);
        }
    }
    // Re-enable replication and send batch update
}

// Optimized affector lookup
class FItemAttachmentManager
{
private:
    TMap<FGuid, TMap<FGameplayTag, FGuid>> CachedAttachments;
    
public:
    const FGuid* FindAttachedItem(const FGuid& ParentGuid, const FGameplayTag& SlotTag)
    {
        if (auto* Slots = CachedAttachments.Find(ParentGuid))
        {
            return Slots->Find(SlotTag);
        }
        return nullptr;
    }
};
```

## Troubleshooting

### Instance Not Creating

!!! tip "Problem & Solution"
    - Constructor returns invalid instance
    - Check template validity and parameter ranges
    - Verify template has required properties set

### Replication Issues

!!! tip "Problem & Solution"
    - Changes not syncing to clients
    - Ensure OwningInventory is valid and replicated
    - Check FastArraySerializer setup in inventory component

### Affector Slots Not Working

!!! tip "Problem & Solution"
    - Attachments not applying effects
    - Verify template defines compatible attachment slots
    - Check GUID references remain valid across operations

### Performance Degradation

!!! tip "Problem & Solution"
    - High network traffic from item updates
    - Batch modifications and use delta compression
    - Cache expensive operations and validate optimization

## Best Practices

- **GUID Management:** Always generate unique GUIDs for new instances
- **Template References:** Keep template pointers valid, avoid dangling references
- **Network Efficiency:** Batch modifications to reduce replication overhead
- **Validation:** Validate instances after any modification operation
- **Lifecycle:** Properly clean up relationships when destroying instances
- **State Consistency:** Keep custom data tags synchronized with actual item state

## Next Steps

- **[Item Actions](ItemActions.md):** Define what players can do with items
- **[Inventory Component](InventoryComponent.md):** Implement inventory functionality
- **[Equipment System](../EquipmentSystem/EquipmentSystem.md):** Equip and manage item instances
