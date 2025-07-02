# Attachable Components

## What You'll Learn

- Creating attachable components for equipment items
- Implementing attachment interface contracts
- Managing attachment state and relationships
- Using tag-based compatibility systems
- Handling network replication for attachables
- Integrating with container slot systems

## Quick Start

```cpp
// Add attachable component to equipment actor
UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Attachable")
class UMounteaAttachableComponent* AttachableComponent;

// Attach to compatible container
bool Success = AttachableComponent->Execute_AttachToContainer(AttachableComponent, TargetContainer);

// Check attachment state
bool IsAttached = AttachableComponent->Execute_GetState(AttachableComponent) == EAttachmentState::EAS_Attached;
```

!!! tip "Result"
    Equipment items that can intelligently attach to compatible slots with automatic state management and network synchronization.

## Component Architecture

### Core Structure

`UMounteaAttachableComponent` implements the attachable interface:

```cpp
class UMounteaAttachableComponent : public UActorComponent, public IMounteaAdvancedAttachmentAttachableInterface
{
    // Identity
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Mountea|Attachable")
    FName Id;                                    // Unique identifier
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Mountea|Attachable")
    FText DisplayName;                           // UI display name
    
    // Compatibility
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Mountea|Attachable")
    FGameplayTagContainer Tags;                  // Compatibility tags
    
    // State
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Mountea|Attachable")
    EAttachmentState State;                      // Current attachment state
    
    // Relationships
    UPROPERTY(VisibleAnywhere, BlueprintReadWrite, Category="Mountea")
    TScriptInterface<IMounteaAdvancedAttachmentContainerInterface> AttachedTo;  // Current container
};
```

### Attachment States

```cpp
enum class EAttachmentState : uint8
{
    EAS_Detached,    // Not attached to any container
    EAS_Attached     // Currently attached to a container
};
```

## Component Setup

### Basic Configuration

```cpp
// Equipment actor with attachable component
AEquipmentItem::AEquipmentItem()
{
    // Create attachable component
    AttachableComponent = CreateDefaultSubobject<UMounteaAttachableComponent>(TEXT("AttachableComponent"));
    
    // Configure identity
    AttachableComponent->Id = "UniqueItemId";
    AttachableComponent->DisplayName = NSLOCTEXT("Equipment", "SwordName", "Iron Sword");
    
    // Set compatibility tags
    FGameplayTagContainer ItemTags;
    ItemTags.AddTag(FGameplayTag::RequestGameplayTag("Equipment.Weapon.Melee.Sword"));
    AttachableComponent->Tags = ItemTags;
    
    // Initial state
    AttachableComponent->State = EAttachmentState::EAS_Detached;
}
```

### Interface Implementation

The component implements all required interface methods:

```cpp
// Identity accessors
virtual FName GetId_Implementation() const override { return Id; }
virtual void SetId_Implementation(const FName& NewId) override;

virtual FText GetDisplayName_Implementation() const override { return DisplayName; }
virtual void SetDisplayName_Implementation(const FText& NewDisplayName) override;

// Tag management
virtual FGameplayTagContainer GetTags_Implementation() const override { return Tags; }
virtual void SetTags_Implementation(const FGameplayTagContainer& NewTags) override;

// State management
virtual EAttachmentState GetState_Implementation() const override { return State; }
virtual void SetState_Implementation(const EAttachmentState NewState) override;

// Attachment operations
virtual bool AttachToSlot_Implementation(const TScriptInterface<IMounteaAdvancedAttachmentContainerInterface>& Target, const FName& SlotId) override;
virtual bool AttachToContainer_Implementation(const TScriptInterface<IMounteaAdvancedAttachmentContainerInterface>& Target) override;
virtual bool Detach_Implementation() override;
```

## Property Management

### Identity Properties

```cpp
void UMounteaAttachableComponent::SetId_Implementation(const FName& NewId)
{
    if (Id != NewId)
        Id = NewId;
}

void UMounteaAttachableComponent::SetDisplayName_Implementation(const FText& NewDisplayName)
{
    if (!NewDisplayName.EqualTo(DisplayName))
        DisplayName = NewDisplayName;
}
```

### Tag System

```cpp
void UMounteaAttachableComponent::SetTags_Implementation(const FGameplayTagContainer& NewTags)
{
    Tags.Reset();
    Tags.AppendTags(NewTags);
}

bool UMounteaAttachableComponent::HasTag_Implementation(const FGameplayTag& Tag) const
{
    return Tags.HasTag(Tag);
}

bool UMounteaAttachableComponent::MatchesTags_Implementation(const FGameplayTagContainer& OtherTags, const bool bRequireAll) const
{
    return bRequireAll ? Tags.HasAll(OtherTags) : Tags.HasAny(OtherTags);
}
```

### State Management

```cpp
void UMounteaAttachableComponent::SetState_Implementation(const EAttachmentState NewState)
{
    if (NewState != State)
        State = NewState;
}

bool UMounteaAttachableComponent::IsValidAttachable_Implementation() const
{
    return !DisplayName.IsEmpty() && !Id.IsNone();
}

bool UMounteaAttachableComponent::CanAttach_Implementation() const
{
    return IsValidAttachable() && State != EAttachmentState::EAS_Attached;
}
```

## Attachment Operations

### Specific Slot Attachment

```cpp
bool UMounteaAttachableComponent::AttachToSlot_Implementation(
    const TScriptInterface<IMounteaAdvancedAttachmentContainerInterface>& Target, 
    const FName& SlotId)
{
    if (!Execute_CanAttach(this) || !IsValid(Target.GetObject()))
        return false;

    // Attempt attachment through container
    if (!Target->Execute_TryAttach(Target.GetObject(), SlotId, this))
        return false;

    // Update state on success
    AttachedTo = Target;
    Execute_SetState(this, EAttachmentState::EAS_Attached);
    return true;
}
```

### Smart Container Attachment

```cpp
bool UMounteaAttachableComponent::AttachToContainer_Implementation(
    const TScriptInterface<IMounteaAdvancedAttachmentContainerInterface>& Target)
{
    if (!CanAttach() || !Target.GetObject())
        return false;

    // Find compatible slot automatically
    const FName foundSlotId = Target->Execute_FindFirstFreeSlotWithTags(Target.GetObject(), Tags);
    if (foundSlotId.IsNone())
        return false;

    return Execute_AttachToSlot(this, Target, foundSlotId);
}
```

### Detachment

```cpp
bool UMounteaAttachableComponent::Detach_Implementation()
{
    if (State != EAttachmentState::EAS_Attached || !AttachedTo.GetObject())
        return false;

    // Find current slot
    const FName slotId = AttachedTo->Execute_GetSlotIdForAttachable(AttachedTo.GetObject(), this);
    if (!slotId.IsNone())
        AttachedTo->Execute_TryDetach(AttachedTo.GetObject(), slotId);

    // Clear relationship
    AttachedTo = nullptr;
    State = EAttachmentState::EAS_Detached;
    return true;
}
```

## Tag Compatibility

### Tag Hierarchies

```cpp
// Weapon compatibility example
Tags = "Equipment.Weapon.Melee.Sword";

// Compatible with slots tagged:
// "Equipment"                    // Any equipment
// "Equipment.Weapon"             // Any weapon  
// "Equipment.Weapon.Melee"       // Any melee weapon
// "Equipment.Weapon.Melee.Sword" // Swords specifically

// Not compatible with:
// "Equipment.Weapon.Ranged"      // Different weapon type
// "Equipment.Armor"              // Different equipment type
```

### Multi-Tag Compatibility

```cpp
// Multi-compatible item
FGameplayTagContainer MultiTags;
MultiTags.AddTag(FGameplayTag::RequestGameplayTag("Equipment.Weapon.Melee"));
MultiTags.AddTag(FGameplayTag::RequestGameplayTag("Size.Medium"));
MultiTags.AddTag(FGameplayTag::RequestGameplayTag("Material.Steel"));
AttachableComponent->SetTags_Implementation(MultiTags);

// Matches slots requiring:
// - Any melee weapon
// - Medium-sized items
// - Steel equipment
// - Combinations of the above
```

### Conditional Compatibility

```cpp
bool CheckAdvancedCompatibility(const TScriptInterface<IMounteaAdvancedAttachmentContainerInterface>& Target, const FName& SlotId)
{
    auto Slot = Target->Execute_GetSlot(Target.GetObject(), SlotId);
    if (!Slot)
        return false;
        
    // Basic tag matching
    if (!Slot->MatchesTags(Tags, false))
        return false;
        
    // Advanced compatibility checks
    if (HasTag(FGameplayTag::RequestGameplayTag("Weapon.TwoHanded")))
    {
        // Two-handed weapons need both main and off-hand slots free
        auto OffHandSlot = Target->Execute_GetSlot(Target.GetObject(), "OffHand");
        return OffHandSlot && OffHandSlot->IsEmpty();
    }
    
    return true;
}
```

## Integration Patterns

### Inventory Integration

```cpp
// Create attachable from inventory item
UMounteaAttachableComponent* CreateAttachableFromItem(const FInventoryItem& Item)
{
    if (!Item.IsItemValid())
        return nullptr;
        
    // Spawn equipment actor
    UClass* ActorClass = Item.GetTemplate()->SpawnActor.LoadSynchronous();
    if (!ActorClass)
        return nullptr;
        
    AActor* EquipmentActor = GetWorld()->SpawnActor<AActor>(ActorClass);
    if (!EquipmentActor)
        return nullptr;
        
    // Configure attachable component
    auto AttachableComp = EquipmentActor->FindComponentByClass<UMounteaAttachableComponent>();
    if (AttachableComp)
    {
        AttachableComp->SetId_Implementation(Item.GetGuid().ToString()); 
        AttachableComp->SetDisplayName_Implementation(Item.GetItemName());
        AttachableComp->SetTags_Implementation(Item.GetTemplate()->Tags);
    }
    
    return AttachableComp;
}
```

### Equipment Action Integration

```cpp
// Equipment action using attachable
bool ProcessEquipAction(const FInventoryItem& Item, UMounteaEquipmentComponent* Equipment)
{
    // Create attachable from item
    auto AttachableComp = CreateAttachableFromItem(Item);
    if (!AttachableComp)
        return false;
        
    // Attempt smart attachment
    bool Success = AttachableComp->Execute_AttachToContainer(AttachableComp, Equipment);
    
    if (!Success)
    {
        // Clean up on failure
        AttachableComp->GetOwner()->Destroy();
        return false;
    }
    
    return true;
}
```

## Advanced Features

### Custom Attachment Logic

```cpp
class UAdvancedAttachableComponent : public UMounteaAttachableComponent
{
protected:
    virtual bool AttachToContainer_Implementation(const TScriptInterface<IMounteaAdvancedAttachmentContainerInterface>& Target) override
    {
        // Custom pre-attachment logic
        if (!PerformPreAttachmentChecks(Target))
            return false;
            
        // Standard attachment
        bool Success = Super::AttachToContainer_Implementation(Target);
        
        if (Success)
        {
            // Custom post-attachment logic
            PerformPostAttachmentSetup(Target);
        }
        
        return Success;
    }
    
private:
    bool PerformPreAttachmentChecks(const TScriptInterface<IMounteaAdvancedAttachmentContainerInterface>& Target)
    {
        // Example: Check character level requirements
        if (auto Character = Cast<ACharacter>(Target->Execute_GetOwningActor(Target.GetObject())))
        {
            if (auto LevelComp = Character->FindComponentByClass<ULevelComponent>())
            {
                return LevelComp->GetLevel() >= GetRequiredLevel();
            }
        }
        return true;
    }
};
```

### Dynamic Tag Management

```cpp
void UpdateDynamicTags()
{
    FGameplayTagContainer NewTags = Tags;
    
    // Add condition-based tags
    if (IsEnchanted())
        NewTags.AddTag(FGameplayTag::RequestGameplayTag("State.Enchanted"));
        
    if (IsDamaged())
        NewTags.AddTag(FGameplayTag::RequestGameplayTag("State.Damaged"));
        
    if (IsUpgraded())
        NewTags.AddTag(FGameplayTag::RequestGameplayTag("State.Upgraded"));
        
    SetTags_Implementation(NewTags);
}
```

### Attachment Callbacks

```cpp
// Override state changes for custom behavior
virtual void SetState_Implementation(const EAttachmentState NewState) override
{
    EAttachmentState OldState = State;
    Super::SetState_Implementation(NewState);
    
    // React to state changes
    if (OldState != NewState)
    {
        OnAttachmentStateChanged(OldState, NewState);
    }
}

void OnAttachmentStateChanged(EAttachmentState OldState, EAttachmentState NewState)
{
    if (NewState == EAttachmentState::EAS_Attached)
    {
        // Attached to container
        ApplyAttachmentEffects();
        OnAttached.Broadcast();
    }
    else if (NewState == EAttachmentState::EAS_Detached)
    {
        // Detached from container
        RemoveAttachmentEffects();
        OnDetached.Broadcast();
    }
}
```

## Performance Optimization

### Efficient Tag Operations

```cpp
// Cache frequently used tags
class UOptimizedAttachableComponent : public UMounteaAttachableComponent
{
private:
    mutable TMap<FGameplayTag, bool> TagCache;
    
public:
    virtual bool HasTag_Implementation(const FGameplayTag& Tag) const override
    {
        if (bool* CachedResult = TagCache.Find(Tag))
            return *CachedResult;
            
        bool Result = Super::HasTag_Implementation(Tag);
        TagCache.Add(Tag, Result);
        return Result;
    }
    
    virtual void SetTags_Implementation(const FGameplayTagContainer& NewTags) override
    {
        Super::SetTags_Implementation(NewTags);
        TagCache.Empty(); // Invalidate cache
    }
};
```

### Memory Management

```cpp
// Clean up attachable references
void CleanupAttachable()
{
    // Detach if attached
    if (State == EAttachmentState::EAS_Attached)
    {
        Execute_Detach(this);
    }
    
    // Clear references
    AttachedTo = nullptr;
    
    // Reset state
    State = EAttachmentState::EAS_Detached;
}
```

## Common Patterns

### Pattern 1: Equipment Sets

```cpp
// Track equipment set membership
UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Equipment Set")
FString EquipmentSetName;

UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Equipment Set")
int32 SetPieceIndex;

void CheckSetBonus()
{
    if (State == EAttachmentState::EAS_Attached && !EquipmentSetName.IsEmpty())
    {
        // Find other set pieces in same container
        auto Container = AttachedTo.GetObject();
        int32 SetPiecesEquipped = CountEquippedSetPieces(Container, EquipmentSetName);
        
        // Apply set bonuses based on piece count
        ApplySetBonus(EquipmentSetName, SetPiecesEquipped);
    }
}
```

### Pattern 2: Conditional Attachment

```cpp
// Override CanAttach for special requirements
virtual bool CanAttach_Implementation() const override
{
    // Base validation
    if (!Super::CanAttach_Implementation())
        return false;
        
    // Level requirement
    if (RequiredLevel > 0)
    {
        // Check if player meets level requirement
        return CheckPlayerLevel(RequiredLevel);
    }
    
    // Class restriction
    if (!AllowedClasses.IsEmpty())
    {
        return CheckPlayerClass(AllowedClasses);
    }
    
    return true;
}
```

### Pattern 3: Attachment Notifications

```cpp
// Event delegates for attachment changes
UPROPERTY(BlueprintAssignable, Category="Attachable Events")
FOnAttachableStateChanged OnAttached;

UPROPERTY(BlueprintAssignable, Category="Attachable Events")
FOnAttachableStateChanged OnDetached;

// Broadcast events on state changes
virtual void SetState_Implementation(const EAttachmentState NewState) override
{
    EAttachmentState OldState = State;
    Super::SetState_Implementation(NewState);
    
    if (OldState != NewState)
    {
        if (NewState == EAttachmentState::EAS_Attached)
            OnAttached.Broadcast(this);
        else if (NewState == EAttachmentState::EAS_Detached)
            OnDetached.Broadcast(this);
    }
}
```

## Troubleshooting

!!! warning "Attachment Failures"
    - Verify tag compatibility between attachable and slots
    - Check if target container is valid
    - Ensure CanAttach returns true

!!! warning "State Desync"
    - Validate state changes follow proper flow
    - Check container relationship consistency
    - Verify interface implementation completeness

!!! warning "Tag Matching Problems"
    - Review tag hierarchy design
    - Check for typos in tag names
    - Validate tag registration

!!! warning "Memory Leaks"
    - Clean up container references properly
    - Detach before destroying attachables
    - Clear cached data appropriately

## Best Practices

!!! tip "Design Guidelines"
    - **Unique IDs**: Ensure attachable IDs are unique within context
    - **Meaningful Tags**: Use descriptive, hierarchical tag structures
    - **State Consistency**: Always maintain state-relationship consistency
    - **Interface Compliance**: Implement all required interface methods
    - **Performance**: Cache expensive operations and validate optimization

## Next Steps

- **[Equipment Component](EquipmentComponent.md):** Extend containers for equipment systems
- **[Tag Configuration](TagConfiguration.md):** Set up compatibility tag hierarchies
