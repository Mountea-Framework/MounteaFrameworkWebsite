# Attachment Slots

## What You'll Learn

- Configuring attachment slot properties and behaviors
- Understanding socket vs component attachment types
- Implementing tag-based compatibility filtering
- Managing slot states and replication
- Using editor integration and validation
- Optimizing slot performance and memory

## Quick Start

```cpp
// Slot configuration in container
{
    SlotName: "MainHand",
    SlotTags: "Equipment.Weapon.Melee",
    SlotType: EAttachmentSlotType::EAST_Socket,
    SocketName: "weapon_socket",
    State: EAttachmentSlotState::EASS_Empty
}

// Runtime slot operations
auto Slot = Container->Execute_GetSlot(Container, "MainHand");
bool Success = Slot->Attach(WeaponActor);
```

!!! tip "Result"
    Configurable attachment points with tag filtering, state management, and automatic network replication.

## Slot Architecture

### Core Structure

`UMounteaAdvancedAttachmentSlot` defines individual attachment points:

```cpp
class UMounteaAdvancedAttachmentSlot : public UMounteaAdvancedAttachmentSlotBase
{
    // Identity
    FName SlotName;                              // Unique identifier
    FGameplayTagContainer SlotTags;              // Compatibility tags
    FText DisplayName;                           // UI display name
    
    // State
    EAttachmentSlotState State;                  // Empty, Occupied, Locked
    UObject* Attachment;                         // Currently attached object
    
    // Configuration
    EAttachmentSlotType SlotType;                // Socket or Component
    FName AttachmentTargetOverride;              // Custom target component
    FName SocketName;                            // Physical attachment point
    
    // Relationships
    TScriptInterface<IMounteaAdvancedAttachmentContainerInterface> ParentContainer;
};
```

### Slot Types

!!! info "Attachment Types"
    - **Socket**: Attaches to skeletal or static mesh sockets for visual positioning
    - **Component**: Attaches to scene components for logical relationships

```cpp
enum class EAttachmentSlotType : uint8
{
    EAST_Socket,      // Physical socket on mesh
    EAST_Component    // Scene component attachment
};
```

## Slot Configuration

### Basic Setup

Slots are configured as inline objects in attachment containers:

```cpp
// Weapon slot configuration
{
    SlotName: "MainHand",
    SlotTags: "Equipment.Weapon.Melee",
    DisplayName: "Main Hand",
    SlotType: EAttachmentSlotType::EAST_Socket,
    SocketName: "weapon_socket",
    State: EAttachmentSlotState::EASS_Empty
}

// Armor slot configuration  
{
    SlotName: "Chest",
    SlotTags: "Equipment.Armor.Body",
    DisplayName: "Chest Armor", 
    SlotType: EAttachmentSlotType::EAST_Component,
    AttachmentTargetOverride: "ArmorMeshComponent",
    State: EAttachmentSlotState::EASS_Empty
}
```

### Editor Integration

Slots provide dropdown helpers for configuration:

```cpp
// Socket name dropdown
UFUNCTION()
TArray<FName> GetAvailableSocketNames() const
{
    if (SlotType != EAttachmentSlotType::EAST_Socket || !IsValid(ParentContainer.GetObject()))
        return TArray<FName>();

    AActor* parentActor = ParentContainer->Execute_GetOwningActor(ParentContainer.GetObject());
    if (!IsValid(parentActor))
        return TArray<FName>();

    FName targetName = AttachmentTargetOverride.IsNone() ? 
        ParentContainer->Execute_GetDefaultAttachmentTarget(ParentContainer.GetObject()) : 
        AttachmentTargetOverride;
        
    return UMounteaAttachmentsStatics::GetAvailableSocketNames(parentActor, targetName);
}

// Component name dropdown
UFUNCTION()
TArray<FName> GetAvailableTargetNames() const
{
    if (!IsValid(ParentContainer.GetObject()))
        return TArray<FName>();

    AActor* parentActor = ParentContainer->Execute_GetOwningActor(ParentContainer.GetObject());
    return IsValid(parentActor) ? UMounteaAttachmentsStatics::GetAvailableComponentNames(parentActor) : TArray<FName>();
}
```

### Auto-Configuration

Slots auto-populate from equipment settings when slot names are selected:

```cpp
#if WITH_EDITOR
void UMounteaAdvancedAttachmentSlotBase::PostEditChangeProperty(FPropertyChangedEvent& PropertyChangedEvent)
{
    const FName propertyName = PropertyChangedEvent.Property ? PropertyChangedEvent.Property->GetFName() : NAME_None;
    
    if (propertyName == GET_MEMBER_NAME_CHECKED(UMounteaAdvancedAttachmentSlotBase, SlotName))
    {
        if (auto EquipmentConfig = GetDefault<UMounteaAdvancedInventorySettings>()->EquipmentSettingsConfig.LoadSynchronous())
        {
            if (const FMounteaEquipmentSlotHeaderData* HeaderData = EquipmentConfig->AllowedEquipmentSlots.Find(SlotName))
            {
                SlotTags.Reset();
                SlotTags.AppendTags(HeaderData->TagContainer);
                DisplayName = HeaderData->DisplayName;
            }
        }
    }
}
#endif
```

!!! warning "Configuration Dependencies"
    Slot auto-configuration requires valid equipment settings config. Missing config results in empty tags and display names.

## State Management

### Slot States

```cpp
enum class EAttachmentSlotState : uint8
{
    EASS_Empty,      // Available for attachment
    EASS_Occupied,   // Has attached object
    EASS_Locked      // Disabled/unavailable
};
```

### State Queries

```cpp
// State checking methods
bool IsEmpty() const
{
    return State == EAttachmentSlotState::EASS_Empty && Attachment == nullptr;
}

bool IsOccupied() const
{
    return State == EAttachmentSlotState::EASS_Occupied && Attachment != nullptr;
}

bool IsLocked() const
{
    return State == EAttachmentSlotState::EASS_Locked;
}

bool CanAttach() const
{
    return IsSlotValid() && IsEmpty() && !IsLocked();
}
```

### State Transitions

```cpp
// Enable/disable slots
void DisableSlot()
{
    if (!IsEmpty())
        Detach();
    State = EAttachmentSlotState::EASS_Locked;
}

// Attachment state changes
bool Attach(UObject* NewAttachment)
{
    if (!CanAttach() || !IsValid(NewAttachment))
        return false;

    if (PerformAttachmentLogic(NewAttachment))
    {
        Attachment = NewAttachment;
        State = EAttachmentSlotState::EASS_Occupied;
        return true;
    }
    
    return false;
}
```

## Attachment Logic

### Physical Attachment

```cpp
bool PerformPhysicalAttachment(UObject* Object, USceneComponent* Target) const
{
    const FAttachmentTransformRules attachmentRules = FAttachmentTransformRules::SnapToTargetIncludingScale;
    const FName attachmentName = GetAttachmentSocketName();
    
    if (USceneComponent* sceneComp = Cast<USceneComponent>(Object))
    {
        sceneComp->AttachToComponent(Target, attachmentRules, attachmentName);
        return true;
    }
    
    if (AActor* actor = Cast<AActor>(Object))
    {
        actor->AttachToComponent(Target, attachmentRules, attachmentName);
        return true;
    }
    
    LOG_WARNING(TEXT("Unsupported attachment object type: %s"), *Object->GetName());
    return false;
}

FName GetAttachmentSocketName() const
{
    return SlotType == EAttachmentSlotType::EAST_Socket ? SocketName : NAME_None;
}
```

### Attachment Target Resolution

```cpp
void TryResolveAttachmentTarget()
{
    if (AttachmentTargetOverride.IsNone() || !ParentContainer.GetObject())
        return;

    AActor* parentActor = ParentContainer->Execute_GetOwningActor(ParentContainer.GetObject());
    if (IsValid(parentActor))
        AttachmentTargetComponentOverride = UMounteaAttachmentsStatics::GetAvailableComponentByName(parentActor, AttachmentTargetOverride);
}

USceneComponent* GetAttachmentTargetComponent() const
{
    return AttachmentTargetComponentOverride ? 
        AttachmentTargetComponentOverride : 
        ParentContainer->Execute_GetAttachmentTargetComponent(ParentContainer.GetObject());
}
```

### Validation System

```cpp
bool ValidateAttachmentSlot(const USceneComponent* Target) const
{
    if (SlotType == EAttachmentSlotType::EAST_Socket && !Target->DoesSocketExist(SocketName))
    {
        LOG_WARNING(TEXT("Socket '%s' does not exist on target component '%s'!"), *SocketName.ToString(), *Target->GetName());
        return false;
    }
    return true;
}

bool IsValidForAttachment(const UObject* NewAttachment)
{
    if (!IsValid(NewAttachment))
    {
        LOG_ERROR(TEXT("Attachment is not valid!"));
        return false;
    }
    
    if (!NewAttachment->Implements<UMounteaAdvancedAttachmentAttachableInterface>())
    {
        LOG_WARNING(TEXT("Attachable does not implement required interface!"))
        return true; // Allow but warn
    }

    if (!IMounteaAdvancedAttachmentAttachableInterface::Execute_CanAttach(NewAttachment))
    {
        LOG_WARNING(TEXT("Attachable object is not compatible with selected Slot!"));
        return false;
    }
    
    return true;
}
```

## Tag Compatibility

### Tag Matching

```cpp
// Flexible tag matching
bool MatchesTags(const FGameplayTagContainer& Tags, const bool bRequireAll) const
{
    return bRequireAll ? SlotTags.HasAll(Tags) : SlotTags.HasAny(Tags);
}

bool HasTag(const FGameplayTag& Tag) const
{
    return SlotTags.HasTag(Tag);
}
```

### Common Tag Patterns

```cpp
// Hierarchical tags enable flexible matching
SlotTags: "Equipment.Weapon"           // Accepts any weapon
ItemTags: "Equipment.Weapon.Sword"     // Specific weapon type

SlotTags: "Equipment.Weapon.Melee"     // Melee weapons only  
ItemTags: "Equipment.Weapon.Ranged"    // Won't match

SlotTags: "Equipment.Weapon.OneHanded" // Size restriction
ItemTags: "Equipment.Weapon.TwoHanded" // Size mismatch
```

### Interface Integration

```cpp
void HandleAttachableInterface(UObject* NewAttachment)
{
    TScriptInterface<IMounteaAdvancedAttachmentAttachableInterface> attachableInterface = FindAttachableInterface(NewAttachment);
    if (attachableInterface.GetObject())
        IMounteaAdvancedAttachmentAttachableInterface::Execute_AttachToSlot(attachableInterface.GetObject(), ParentContainer, SlotName);
    else
        LOG_WARNING(TEXT("Attachment does not implement the attachable interface!"));
}

TScriptInterface<IMounteaAdvancedAttachmentAttachableInterface> FindAttachableInterface(UObject* Object)
{
    TScriptInterface<IMounteaAdvancedAttachmentAttachableInterface> returnAttachable;

    if (!IsValid(Object))
        return returnAttachable;

    // Check object directly
    if (Object->GetClass()->ImplementsInterface(UMounteaAdvancedAttachmentAttachableInterface::StaticClass()))
    {
        returnAttachable.SetObject(Object);
        returnAttachable.SetInterface(Cast<IMounteaAdvancedAttachmentAttachableInterface>(Object));
        return returnAttachable;
    }

    // Check actor components
    const AActor* targetActor = Cast<AActor>(Object);
    if (IsValid(targetActor))
    {
        const auto actorComponents = UMounteaAttachmentsStatics::GetAvailableComponents(targetActor);
        auto foundComponent = Algo::FindByPredicate(actorComponents, [](const UActorComponent* Comp) {
            return IsValid(Comp) && Comp->GetClass()->ImplementsInterface(UMounteaAdvancedAttachmentAttachableInterface::StaticClass());
        });

        if (foundComponent)
            returnAttachable = *foundComponent;
    }

    return returnAttachable;
}
```

## Network Replication

### Slot Replication

```cpp
// Slot properties replicated automatically
UPROPERTY(ReplicatedUsing=OnRep_State, VisibleAnywhere, BlueprintReadWrite, Category="Settings")
EAttachmentSlotState State;

UPROPERTY(Replicated, BlueprintReadOnly, Category="Debug", AdvancedDisplay)
TObjectPtr<UObject> Attachment;

// Replication registration
void UMounteaAdvancedAttachmentSlotBase::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    UObject::GetLifetimeReplicatedProps(OutLifetimeProps);

    DOREPLIFETIME(UMounteaAdvancedAttachmentSlotBase, Attachment);
    DOREPLIFETIME(UMounteaAdvancedAttachmentSlotBase, State);
}
```

### Replication Callbacks

```cpp
UFUNCTION()
void OnRep_State()
{
    switch (State)
    {
        case EAttachmentSlotState::EASS_Occupied:
            if (Attachment)
                ForceAttach(Attachment);  // Re-attach on client
            break;
        case EAttachmentSlotState::EASS_Empty:
            ForceDetach();                // Remove attachment on client
            break;
    }
    
    // Notify container of change
    if (ParentContainer.GetObject())
        ParentContainer->GetOnAttachmentChangedEventHandle().Broadcast(SlotName, Attachment, LastAttachment);
}
```

### Network Function Support

```cpp
// Support for networked function calls
int32 GetFunctionCallspace(UFunction* Function, FFrame* Stack) override
{
    if (HasAnyFlags(RF_ClassDefaultObject) || !IsSupportedForNetworking())
        return GEngine->GetGlobalFunctionCallspace(Function, this, Stack);
    
    return GetOuter()->GetFunctionCallspace(Function, Stack);
}

bool CallRemoteFunction(UFunction* Function, void* Parms, FOutParmRec* OutParms, FFrame* Stack) override
{
    AActor* owningActor = GetOwningActor();
    if (UNetDriver* netDriver = owningActor->GetNetDriver())
    {
        netDriver->ProcessRemoteFunction(owningActor, Function, Parms, OutParms, Stack, this);
        return true;
    }
    return false;
}
```

## Detachment Operations

### Standard Detachment

```cpp
bool Detach()
{
    if (!IsOccupied())
        return false;

    PerformDetachment();
    Attachment = nullptr;
    State = EAttachmentSlotState::EASS_Empty;
    return true;
}

bool ForceDetach()
{
    PerformDetachment();
    Attachment = nullptr;
    State = EAttachmentSlotState::EASS_Empty;
    return true;
}
```

### Detachment Logic

```cpp
void PerformDetachment()
{
    UObject* targetAttachment = Attachment ? Attachment : LastAttachment;
    
    // Physical detachment
    if (USceneComponent* sceneComp = Cast<USceneComponent>(targetAttachment))
        sceneComp->DetachFromComponent(FDetachmentTransformRules::KeepWorldTransform);
    else if (AActor* actor = Cast<AActor>(targetAttachment))
        actor->DetachFromActor(FDetachmentTransformRules::KeepWorldTransform);

    // Interface state update
    if (IsValid(targetAttachment) && targetAttachment->Implements<UMounteaAdvancedAttachmentAttachableInterface>())
        IMounteaAdvancedAttachmentAttachableInterface::Execute_SetState(targetAttachment, EAttachmentState::EAS_Detached);
}
```

## Validation and Data Integrity

### Editor Validation

```cpp
#if WITH_EDITOR
EDataValidationResult IsDataValid(FDataValidationContext& Context) const override
{
    if (!IsSlotValid())
        Context.AddError(NSLOCTEXT("AttachmentSlot", "AttachmentSlot_SlotInvalid", "Slot is invalid! It must have a valid name and tags."));
    
    if (SlotType == EAttachmentSlotType::EAST_Socket && SocketName.IsNone())
        Context.AddError(NSLOCTEXT("AttachmentSlot", "AttachmentSlot_NoSocket", "Socket-type slots must specify a socket name."));
    
    if (SlotTags.IsEmpty())
        Context.AddWarning(NSLOCTEXT("AttachmentSlot", "AttachmentSlot_NoTags", "Slot has no tags - nothing will be able to attach."));
    
    return Context.GetNumErrors() > 0 ? EDataValidationResult::Invalid : EDataValidationResult::Valid;
}
#endif
```

### Runtime Validation

```cpp
bool IsSlotValid() const
{
    return ParentContainer.GetObject() != nullptr && !SlotName.IsNone() && !SlotTags.IsEmpty();
}
```

## Performance Optimization

### Efficient Queries

```cpp
// Cache attachment target resolution
void BeginPlay_Implementation() override
{
    Super::BeginPlay_Implementation();
    TryResolveAttachmentTarget();  // Cache target component
}

// Inline state checks
FORCEINLINE bool CanAttach() const
{
    return IsSlotValid() && IsEmpty() && !IsLocked();
}

FORCEINLINE bool HasTag(const FGameplayTag& Tag) const
{
    return SlotTags.HasTag(Tag);
}
```

### Memory Management

```cpp
// Clean attachment references
void CleanupSlot()
{
    if (Attachment)
    {
        Detach();
    }
    
    Attachment = nullptr;
    LastAttachment = nullptr;
    AttachmentTargetComponentOverride = nullptr;
}
```

## Common Patterns

### Pattern 1: Conditional Attachment

```cpp
// Override attachment logic for special conditions
bool ConditionalAttach(UObject* NewAttachment)
{
    // Check prerequisites
    if (!CheckAttachmentPrerequisites(NewAttachment))
        return false;
        
    // Perform standard attachment
    return Attach(NewAttachment);
}

bool CheckAttachmentPrerequisites(UObject* NewAttachment)
{
    // Example: Two-handed weapons require empty off-hand
    if (SlotName == "MainHand" && HasTag(FGameplayTag::RequestGameplayTag("Weapon.TwoHanded")))
    {
        auto OffHandSlot = ParentContainer->Execute_GetSlot(ParentContainer.GetObject(), "OffHand");
        return OffHandSlot && OffHandSlot->IsEmpty();
    }
    
    return true;
}
```

### Pattern 2: Smart Socket Selection

```cpp
// Automatically select best socket for attachment type
FName SelectBestSocket(UObject* Attachment)
{
    if (SlotType != EAttachmentSlotType::EAST_Socket)
        return NAME_None;
        
    // Get attachment size/type tags
    if (auto AttachableComp = Attachment->FindComponentByClass<UMounteaAttachableComponent>())
    {
        auto Tags = AttachableComp->GetTags_Implementation();
        
        // Select socket based on item size
        if (Tags.HasTag(FGameplayTag::RequestGameplayTag("Size.Large")))
            return "large_socket";
        else if (Tags.HasTag(FGameplayTag::RequestGameplayTag("Size.Small")))
            return "small_socket";
    }
    
    return SocketName;  // Default socket
}
```

## Troubleshooting

!!! warning "Socket Not Found
    - Verify socket exists on target mesh
    - Check attachment target component resolution
    - Validate socket name spelling

!!! warning "Tag Mismatch"
    - Check tag hierarchy compatibility
    - Verify slot and item tag configuration
    - Use tag debugging tools

!!! warning "Replication Problems"
    - Ensure proper sub-object registration
    - Validate OnRep callbacks fire
    - Check network authority

!!! warning "Validation Failures"
    - Review editor validation messages
    - Check slot configuration completeness
    - Verify parent container setup

## Best Practices

!!! tip "Design Guidelines"
    - **Descriptive Names**: Use clear, descriptive slot names
    - **Hierarchical Tags**: Design tag hierarchies for flexibility
    - **Socket Validation**: Always validate socket existence
    - **Performance**: Cache expensive operations
    - **Network Efficiency**: Minimize replication frequency

## Next Steps

- **[Attachable Components](AttachableComponents.md):** Create attachable items and objects
- **[Equipment Component](EquipmentComponent.md):** Extend containers for equipment systems
- **[Tag Configuration](TagConfiguration.md):** Set up compatibility tag hierarchies
