# Attachment Containers

## What You'll Learn

- Setting up attachment container components
- Managing slot collections and states
- Implementing network replication patterns
- Using server RPCs for attachment operations
- Handling container events and notifications
- Finding slots with tag-based queries
- Performance optimization techniques

## Quick Start

```cpp
// Add attachment container to actor
UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Equipment")
class UMounteaAttachmentContainerComponent* AttachmentContainer;

// Try to attach object to slot
bool Success = AttachmentContainer->Execute_TryAttach(AttachmentContainer, SlotName, AttachableObject);

// Find compatible slot automatically
FName FreeSlot = AttachmentContainer->Execute_FindFirstFreeSlotWithTags(AttachmentContainer, RequiredTags);
```

!!! tip "Result"
    Network-replicated container managing attachment slots with validation, events, and smart slot finding capabilities.

## Component Architecture

### Core Responsibilities

`UMounteaAttachmentContainerComponent` serves as the central manager for attachment slots:

```cpp
class UMounteaAttachmentContainerComponent : public UActorComponent, public IMounteaAdvancedAttachmentContainerInterface
{
    // Slot Management
    TArray<TObjectPtr<UMounteaAdvancedAttachmentSlot>> AttachmentSlots;
    
    // Target Configuration
    FName DefaultAttachmentTarget;                    // Component name for attachment
    USceneComponent* DefaultAttachmentTargetComponent; // Resolved component reference
    
    // State Management
    EAttachmentSlotState State;                       // Container state
    
    // Events
    FOnAttachmentChanged OnAttachmentChanged;
    FOnSlotStateChanged OnSlotStateChanged;
    FOnContainerCleared OnContainerCleared;
};
```

!!! info "Key Features"
    - **Slot Collection Management**: Add, remove, and organize attachment slots
    - **Network Replication**: Automatic slot state synchronization
    - **Event Broadcasting**: React to attachment changes
    - **Tag-Based Queries**: Find compatible slots automatically
    - **Validation System**: Prevent invalid attachment operations

## Component Setup

### Basic Configuration

```cpp
// In actor constructor
AEquippableActor::AEquippableActor()
{
    // Create attachment container
    AttachmentContainer = CreateDefaultSubobject<UMounteaAttachmentContainerComponent>(TEXT("AttachmentContainer"));
    
    // Configure default attachment target
    AttachmentContainer->DefaultAttachmentTarget = TEXT("StaticMeshComponent");
    
    // Replication enabled by default
    AttachmentContainer->SetIsReplicatedByDefault(true);
}
```

### Slot Configuration

Slots are configured in the editor through the AttachmentSlots array:

```cpp
// Editor configuration creates slots like:
AttachmentSlots = {
    // Weapon slot
    {
        SlotName: "MainHand",
        SlotTags: "Equipment.Weapon.Melee",
        SlotType: EAttachmentSlotType::EAST_Socket,
        SocketName: "weapon_socket",
        State: EAttachmentSlotState::EASS_Empty
    },
    // Shield slot
    {
        SlotName: "OffHand", 
        SlotTags: "Equipment.Shield",
        SlotType: EAttachmentSlotType::EAST_Socket,
        SocketName: "shield_socket",
        State: EAttachmentSlotState::EASS_Empty
    }
};
```

### Initialization Process

```cpp
void UMounteaAttachmentContainerComponent::BeginPlay()
{
    Super::BeginPlay();

    // Resolve default attachment target
    const auto attachmentTargetComponent = UMounteaAttachmentsStatics::GetAvailableComponentByName(
        Execute_GetOwningActor(this), 
        DefaultAttachmentTarget
    );
    
    if (!IsValid(attachmentTargetComponent))
        LOG_ERROR(TEXT("Default attachment target component '%s' is not valid!"), *DefaultAttachmentTarget.ToString());

    Execute_SetDefaultAttachmentTargetComponent(this, attachmentTargetComponent);

    // Initialize all slots
    Algo::ForEach(AttachmentSlots, [this](const auto& AttachmentSlot)
    {
        if (IsValid(AttachmentSlot))
        {
            AttachmentSlot->InitializeAttachmentSlot(this);
            AttachmentSlot->BeginPlay();
        }
    });
}
```

!!! warning "Target Resolution"
    If the default attachment target component isn't found, attachment operations may fail. Ensure the target component name matches an existing component.

## Attachment Operations

### Try Attach

The primary method for attaching objects with validation:

```cpp
bool UMounteaAttachmentContainerComponent::TryAttach_Implementation(const FName& SlotId, UObject* Attachment)
{
    if (!Attachment) return false;

    // Client sends request to server
    if (!GetOwner()->HasAuthority())
    {
        ServerTryAttach(SlotId, Attachment);
        return true;
    }

    // Server validates and executes
    const bool bSuccess = TryAttachInternal(SlotId, Attachment);
    if (bSuccess)
        OnAttachmentChanged.Broadcast(SlotId, Attachment, nullptr);
    return bSuccess;
}

// Internal validation and attachment
bool TryAttachInternal(const FName& SlotId, UObject* Attachment)
{
    auto foundSlot = AttachmentSlots.FindByPredicate([SlotId](const UMounteaAdvancedAttachmentSlot* Slot) {
        return Slot && Slot->SlotName == SlotId;
    });
    
    return foundSlot && (*foundSlot)->Attach(Attachment);
}
```

### Force Attach

Bypass validation for administrative operations:

```cpp
bool UMounteaAttachmentContainerComponent::ForceAttach_Implementation(const FName& SlotId, UObject* Attachment)
{
    if (!Attachment) return false;

    auto foundSlot = *AttachmentSlots.FindByPredicate([SlotId](const UMounteaAdvancedAttachmentSlot* Slot) {
        return Slot->SlotName == SlotId;
    });
    
    if (!foundSlot) return false;

    // Direct state assignment
    foundSlot->Attachment = Attachment;
    foundSlot->State = EAttachmentSlotState::EASS_Occupied;
    return true;
}
```

### Detachment Operations

```cpp
bool UMounteaAttachmentContainerComponent::TryDetach_Implementation(const FName& SlotId)
{
    auto foundSlot = *AttachmentSlots.FindByPredicate([SlotId](const UMounteaAdvancedAttachmentSlot* Slot) {
        return Slot->SlotName == SlotId;
    });
    
    if (!foundSlot) return false;

    // Client requests server action
    if (!GetOwner()->HasAuthority())
    {
        ServerTryDetach(SlotId);
        return true;
    }

    return foundSlot->Detach();
}

// Clear all attachments
void UMounteaAttachmentContainerComponent::ClearAll_Implementation()
{
    for (auto& attachmentSlot : AttachmentSlots)
    {
        attachmentSlot->Detach();
    }
}
```

## Network Replication

### Server RPCs

All attachment operations use server authority:

```cpp
UFUNCTION(Server, Reliable)
void ServerTryAttach(const FName& SlotId, UObject* Attachment);

UFUNCTION(Server, Reliable) 
void ServerTryDetach(const FName& SlotId);

// Implementations
void UMounteaAttachmentContainerComponent::ServerTryAttach_Implementation(const FName& SlotId, UObject* Attachment)
{
    Execute_TryAttach(this, SlotId, Attachment);
}

void UMounteaAttachmentContainerComponent::ServerTryDetach_Implementation(const FName& SlotId)
{
    Execute_TryDetach(this, SlotId);
}
```

### Sub-Object Replication

Slots replicate as sub-objects for efficient delta synchronization:

```cpp
bool UMounteaAttachmentContainerComponent::ReplicateSubobjects(UActorChannel* Channel, FOutBunch* Bunch, FReplicationFlags* RepFlags)
{
#if ENGINE_MAJOR_VERSION == 5 && ENGINE_MINOR_VERSION >= 1
    bool wroteSomething = Super::ReplicateSubobjects(Channel, Bunch, RepFlags);
    
    // Register slots for replication
    for (auto& Slot : AttachmentSlots)
    {
        if (IsValid(Slot))
            AddReplicatedSubObject(Slot);
    }
    return wroteSomething;
#else
    // Legacy replication support
    bool wroteSomething = true;
    for (UORReplicatedObject* ReplicatedObject : ReplicatedObjects)
    {
        if (IsValid(ReplicatedObject))
            wroteSomething |= Channel->ReplicateSubobject(ReplicatedObject, *Bunch, *RepFlags);
    }
    return wroteSomething;
#endif
}
```

### Replication Properties

```cpp
void UMounteaAttachmentContainerComponent::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);

    DOREPLIFETIME(UMounteaAttachmentContainerComponent, State);
    DOREPLIFETIME(UMounteaAttachmentContainerComponent, AttachmentSlots);
}
```

!!! note "Replication Strategy"
    Container state and slot collection replicate, while individual slot states use sub-object replication for granular updates.

## Slot Management

### Slot Queries

```cpp
// Check if slot exists and is valid
bool UMounteaAttachmentContainerComponent::IsValidSlot_Implementation(const FName& SlotId) const
{
    const auto foundSlot = *AttachmentSlots.FindByPredicate([SlotId](const UMounteaAdvancedAttachmentSlot* Slot) {
        return Slot->SlotName == SlotId;
    });
    return foundSlot && foundSlot->IsSlotValid();
}

// Get slot reference
UMounteaAdvancedAttachmentSlot* UMounteaAttachmentContainerComponent::GetSlot_Implementation(const FName& SlotId) const
{
    const auto foundSlot = *AttachmentSlots.FindByPredicate([SlotId](const UMounteaAdvancedAttachmentSlot* Slot) {
        return Slot->SlotName == SlotId;
    });
    return foundSlot ? foundSlot : nullptr;
}

// Check occupancy status
bool UMounteaAttachmentContainerComponent::IsSlotOccupied_Implementation(const FName& SlotId) const
{
    const auto foundSlot = *AttachmentSlots.FindByPredicate([SlotId](const UMounteaAdvancedAttachmentSlot* Slot) {
        return Slot->SlotName == SlotId;
    });
    return foundSlot && foundSlot->IsOccupied();
}
```

### Smart Slot Finding

```cpp
// Find first compatible slot with tags
FName UMounteaAttachmentContainerComponent::FindFirstFreeSlotWithTags_Implementation(const FGameplayTagContainer& RequiredTags) const
{
    const auto* found = Algo::FindByPredicate(AttachmentSlots, [&](const UMounteaAdvancedAttachmentSlot* slot) {
        return slot != nullptr && slot->CanAttach() && slot->MatchesTags(RequiredTags, true);
    });

    return found ? (*found)->SlotName : NAME_None;
}

// Find first empty slot
FName UMounteaAttachmentContainerComponent::GetFirstEmptySlot_Implementation() const
{
    const auto* Found = Algo::FindByPredicate(AttachmentSlots, [&](const UMounteaAdvancedAttachmentSlot* Slot) {
        return Slot != nullptr && !Slot->IsOccupied();
    });

    return Found ? (*Found)->SlotName : NAME_None;
}

// Find slot by attachable object
FName UMounteaAttachmentContainerComponent::GetSlotIdForAttachable_Implementation(const UMounteaAttachableComponent* Attachable) const
{
    if (!Attachable) return NAME_None;

    const auto* Found = Algo::FindByPredicate(AttachmentSlots, [&](const UMounteaAdvancedAttachmentSlot* Slot) {
        return Slot != nullptr && Slot->IsOccupied() && Slot->Attachment == Attachable;
    });

    return Found ? (*Found)->SlotName : NAME_None;    
}
```

## Event System

### Event Delegates

```cpp
// Attachment change events
UPROPERTY(BlueprintAssignable, Category="Attachment Container")
FOnAttachmentChanged OnAttachmentChanged;

UPROPERTY(BlueprintAssignable, Category="Attachment Container")
FOnSlotStateChanged OnSlotStateChanged;

UPROPERTY(BlueprintAssignable, Category="Attachment Container")
FOnContainerCleared OnContainerCleared;
```

### Event Binding

```cpp
// Bind to container events
void AEquippedCharacter::BeginPlay()
{
    Super::BeginPlay();
    
    if (AttachmentContainer)
    {
        AttachmentContainer->OnAttachmentChanged.AddDynamic(this, &AEquippedCharacter::OnAttachmentChanged);
        AttachmentContainer->OnSlotStateChanged.AddDynamic(this, &AEquippedCharacter::OnSlotStateChanged);
        AttachmentContainer->OnContainerCleared.AddDynamic(this, &AEquippedCharacter::OnContainerCleared);
    }
}

// Event handlers
UFUNCTION()
void AEquippedCharacter::OnAttachmentChanged(const FName& SlotId, UObject* NewAttachment, UObject* OldAttachment)
{
    if (NewAttachment)
    {
        // Handle new attachment
        ProcessNewAttachment(SlotId, NewAttachment);
    }
    
    if (OldAttachment)
    {
        // Handle removed attachment
        ProcessRemovedAttachment(SlotId, OldAttachment);
    }
}
```

## Common Patterns

### Pattern 1: Equipment Auto-Assignment

!!! example "Use Case"
    Automatically equipping items to the best available slot

```cpp
bool AutoEquipItem(UObject* Equipment, const FGameplayTagContainer& ItemTags)
{
    // Find best matching slot
    FName BestSlot = AttachmentContainer->Execute_FindFirstFreeSlotWithTags(AttachmentContainer, ItemTags);
    
    if (BestSlot.IsNone())
    {
        // No compatible slots available
        return false;
    }
    
    // Attempt attachment
    return AttachmentContainer->Execute_TryAttach(AttachmentContainer, BestSlot, Equipment);
}
```

### Pattern 2: Slot Validation

!!! example "Use Case"
    Validating attachment operations before execution

```cpp
bool ValidateAttachment(const FName& SlotId, UObject* Equipment)
{
    // Check slot exists
    if (!AttachmentContainer->Execute_IsValidSlot(AttachmentContainer, SlotId))
    {
        UE_LOG(LogTemp, Warning, TEXT("Slot %s does not exist"), *SlotId.ToString());
        return false;
    }
    
    // Check slot availability
    if (AttachmentContainer->Execute_IsSlotOccupied(AttachmentContainer, SlotId))
    {
        UE_LOG(LogTemp, Warning, TEXT("Slot %s is already occupied"), *SlotId.ToString());
        return false;
    }
    
    // Check equipment compatibility
    if (auto AttachableComp = Equipment->FindComponentByClass<UMounteaAttachableComponent>())
    {
        auto Slot = AttachmentContainer->Execute_GetSlot(AttachmentContainer, SlotId);
        if (!Slot->MatchesTags(AttachableComp->GetTags_Implementation(), true))
        {
            UE_LOG(LogTemp, Warning, TEXT("Equipment not compatible with slot %s"), *SlotId.ToString());
            return false;
        }
    }
    
    return true;
}
```

### Pattern 3: Batch Operations

!!! example "Use Case"
    Equipping multiple items efficiently

```cpp
void EquipItemSet(const TArray<TPair<FName, UObject*>>& EquipmentPairs)
{
    // Disable events temporarily
    bool bEventsEnabled = AttachmentContainer->bBroadcastEvents;
    AttachmentContainer->bBroadcastEvents = false;
    
    // Perform all attachments
    for (const auto& Pair : EquipmentPairs)
    {
        AttachmentContainer->Execute_TryAttach(AttachmentContainer, Pair.Key, Pair.Value);
    }
    
    // Re-enable events and send batch notification
    AttachmentContainer->bBroadcastEvents = bEventsEnabled;
    OnBatchEquipmentChanged.Broadcast(EquipmentPairs);
}
```

## Performance Optimization

### Slot Caching

```cpp
// Cache frequently accessed slots
class UOptimizedAttachmentContainer : public UMounteaAttachmentContainerComponent
{
private:
    mutable TMap<FName, UMounteaAdvancedAttachmentSlot*> SlotCache;
    
public:
    virtual UMounteaAdvancedAttachmentSlot* GetSlot_Implementation(const FName& SlotId) const override
    {
        if (auto* CachedSlot = SlotCache.Find(SlotId))
            return *CachedSlot;
        
        auto* Slot = Super::GetSlot_Implementation(SlotId);
        if (Slot)
            SlotCache.Add(SlotId, Slot);
            
        return Slot;
    }
};
```

### Efficient Queries

```cpp
// Pre-filter slots by common tags
TArray<UMounteaAdvancedAttachmentSlot*> GetSlotsByTag(const FGameplayTag& Tag) const
{
    TArray<UMounteaAdvancedAttachmentSlot*> FilteredSlots;
    
    for (auto* Slot : AttachmentSlots)
    {
        if (Slot && Slot->HasTag(Tag))
        {
            FilteredSlots.Add(Slot);
        }
    }
    
    return FilteredSlots;
}
```

### Memory Management

Optional memory management would look like this, however, Unreal native reflection system should handle the memory for you.

```cpp
// Clean up container and slots
void CleanupContainer()
{
    // Clear all attachments first
    Execute_ClearAll(this);
    
    // Clean up slot references
    for (auto& Slot : AttachmentSlots)
    {
        if (IsValid(Slot))
        {
            Slot->MarkPendingKill();
        }
    }
    
    AttachmentSlots.Empty();
}
```

## Troubleshooting

!!! warning "Slots Not Replicating"
    - Verify sub-object replication setup
    - Check slot validation passes
    - Ensure server authority for operations

!!! warning "Attachment Failures"
    - Validate slot names and tags
    - Check component target resolution
    - Verify attachment interface implementation

!!! warning "Performance Issues"
    - Cache frequent slot lookups
    - Batch attachment operations
    - Limit unnecessary event broadcasts

!!! warning "Memory Leaks"
    - Clean up slot references properly
    - Unbind event delegates
    - Clear attachment references

## Best Practices

!!! tip "Design Guidelines"
    - **Server Authority**: Always validate on server for multiplayer
    - **Event Efficiency**: Batch operations to reduce event spam
    - **Validation Early**: Check compatibility before attempting attachment
    - **Clean Separation**: Keep container logic separate from slot implementation
    - **Performance Aware**: Cache expensive operations and validate optimization

!!! note "Configuration Tips"
    - Use descriptive slot names for debugging
    - Group related slots with consistent tag prefixes
    - Configure attachment targets carefully
    - Test slot configurations in editor validation

## Next Steps

- **[Attachment Slots](AttachmentSlots.md):** Configure individual attachment points
- **[Attachable Components](AttachableComponents.md):** Create attachable items and objects
- **[Equipment Component](EquipmentComponent.md):** Extend containers for equipment systems
