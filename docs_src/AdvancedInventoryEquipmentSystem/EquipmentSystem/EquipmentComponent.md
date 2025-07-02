# Equipment Component

## What You'll Learn

- Setting up equipment components for character systems
- Extending attachment containers with equipment functionality
- Implementing equipment-specific interfaces and behaviors
- Integrating with inventory and character systems
- Managing equipment states and configurations
- Performance optimization for character equipment

## Quick Start

```cpp
// Add equipment component to character
UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Equipment")
class UMounteaEquipmentComponent* EquipmentComponent;

// Equipment operations
bool Success = EquipmentComponent->Execute_TryAttach(EquipmentComponent, "MainHand", WeaponActor);
FName FreeSlot = EquipmentComponent->Execute_FindFirstFreeSlotWithTags(EquipmentComponent, WeaponTags);
```

!!! tip "Result"
    Character equipment system with specialized equipment interface extending attachment container functionality.

## Component Architecture

### What Makes Equipment Different

The Equipment Component is essentially a specialized version of the attachment container, designed specifically for character equipment needs. Think of it like upgrading from a basic tool storage box to a professional tradesperson's organized tool belt - same core concept, but with specialized features for the job.

### Equipment Extension

`UMounteaEquipmentComponent` extends the attachment container with equipment-specific functionality:

```cpp
class UMounteaEquipmentComponent : public UMounteaAttachmentContainerComponent, public IMounteaAdvancedEquipmentInterface
{
public:
    UMounteaEquipmentComponent();
    
    // Inherits all attachment container functionality:
    // - Slot management (organize equipment slots)
    // - Network replication (sync across multiplayer)
    // - Attachment operations (equip/unequip items)
    // - Event system (react to equipment changes)
    
    // Adds equipment-specific interface:
    // - Equipment validation (check if character can use item)
    // - Character integration (affect stats, animations)
    // - Loadout management (future feature for equipment sets)
};
```

!!! example "Real-World Analogy"
    Like a knight's armor stand vs a general storage rack. Both can hold items, but the armor stand knows about armor pieces, how they fit together, and what the knight needs to wear them effectively.

### Key Differences from Base Container

!!! info "Equipment Specialization"
    - **Equipment Interface**: Implements `IMounteaAdvancedEquipmentInterface` for character-specific operations
    - **Character Focus**: Designed specifically for character equipment rather than general attachment
    - **Component Tags**: Automatically tagged as "Equipment" for easy identification
    - **Future Extensions**: Prepared for loadout systems and character progression integration

## Component Setup

### Character Integration

Setting up equipment for a character is like outfitting a soldier - you need to know what they can carry, where it attaches, and how it affects their capabilities.

```cpp
// Character with equipment system
APlayerCharacter::APlayerCharacter()
{
    // Create equipment component - this becomes the character's "equipment manager"
    EquipmentComponent = CreateDefaultSubobject<UMounteaEquipmentComponent>(TEXT("EquipmentComponent"));
    
    // Tell the equipment where to attach items (usually the character's mesh)
    EquipmentComponent->DefaultAttachmentTarget = TEXT("CharacterMesh");
    
    // Set up all the equipment slots this character can use
    ConfigureEquipmentSlots();
}

void APlayerCharacter::ConfigureEquipmentSlots()
{
    // Slots are configured in editor or through data assets
    // Think of these as "equipment mounting points" on the character
    
    // Common equipment slots for RPG characters:
    // - MainHand (primary weapon - sword, staff, etc.)
    // - OffHand (secondary items - shield, dual weapon, etc.)
    // - Head (helmets, hats, crowns)
    // - Body (chest armor, robes, shirts)
    // - Legs (leg armor, pants, skirts)
    // - Feet (boots, shoes, sandals)
    // - Ring1, Ring2 (magical rings, jewelry)
    // - Necklace (amulets, pendants)
}
```

!!! note "Why This Approach Works"
    By configuring slots as data rather than hard-coding them, designers can easily create different character types (warrior, mage, archer) with different equipment capabilities without programmer intervention.

### Equipment Interface Implementation

The equipment component adds character-specific validation that the base container doesn't have:

```cpp
// Equipment-specific validation - "Can this character actually use this item?"
virtual bool CanEquipItem_Implementation(const FInventoryItem& Item) const
{
    // Check character-specific requirements (level, class, stats)
    if (!CheckCharacterRequirements(Item))
        return false;
        
    // Then check the basic container validation (slot availability, tag matching)
    return Execute_CanAddItem(this, Item);
}

// Equipment state queries - "Is this specific item currently worn?"
virtual bool IsItemEquipped_Implementation(const FGuid& ItemGuid) const
{
    // Search through all equipment slots to see if this item is equipped
    for (auto* Slot : AttachmentSlots)
    {
        if (Slot && Slot->IsOccupied())
        {
            // Check if the attached item matches the item we're looking for
            if (CheckAttachmentMatchesItem(Slot->Attachment, ItemGuid))
                return true;
        }
    }
    return false;  // Item not found in any equipment slot
}
```

!!! example "Real-World Example"
    Like checking if someone is wearing a specific watch. You look at their wrist (equipment slot), see if there's a watch there (slot occupied), and check if it's the specific watch you're asking about (GUID match).

## Equipment Operations

### Item-Based Equipment

```cpp
// Equip from inventory item
bool EquipInventoryItem(const FInventoryItem& Item)
{
    if (!Item.IsItemValid())
        return false;
        
    // Spawn equipment actor from template
    UClass* ActorClass = Item.GetTemplate()->SpawnActor.LoadSynchronous();
    if (!ActorClass)
        return false;
        
    AActor* EquipmentActor = GetWorld()->SpawnActor<AActor>(ActorClass);
    if (!EquipmentActor)
        return false;
        
    // Configure attachable component
    if (auto AttachableComp = EquipmentActor->FindComponentByClass<UMounteaAttachableComponent>())
    {
        AttachableComp->SetId_Implementation(Item.GetGuid().ToString());
        AttachableComp->SetDisplayName_Implementation(Item.GetItemName());
        AttachableComp->SetTags_Implementation(Item.GetTemplate()->Tags);
    }
    
    // Find compatible slot and attach
    FName CompatibleSlot = Execute_FindFirstFreeSlotWithTags(this, Item.GetTemplate()->Tags);
    if (CompatibleSlot.IsNone())
    {
        EquipmentActor->Destroy();
        return false;
    }
    
    return Execute_TryAttach(this, CompatibleSlot, EquipmentActor);
}
```

### Equipment Swapping

```cpp
// Smart equipment replacement
bool SwapEquipment(const FName& SlotId, AActor* NewEquipment)
{
    auto Slot = Execute_GetSlot(this, SlotId);
    if (!Slot)
        return false;
        
    // Store old equipment for potential return to inventory
    UObject* OldEquipment = Slot->Attachment;
    
    // Detach old equipment
    if (Slot->IsOccupied())
    {
        Execute_TryDetach(this, SlotId);
    }
    
    // Attach new equipment
    bool Success = Execute_TryAttach(this, SlotId, NewEquipment);
    
    if (Success && OldEquipment)
    {
        // Handle old equipment (return to inventory, drop, etc.)
        HandleUnequippedItem(OldEquipment);
    }
    
    return Success;
}
```

### Bulk Equipment Operations

```cpp
// Equip equipment set efficiently
bool EquipEquipmentSet(const TMap<FName, AActor*>& EquipmentSet)
{
    TArray<FName> FailedSlots;
    
    // Validate all equipment can be equipped
    for (const auto& Pair : EquipmentSet)
    {
        if (!Execute_IsValidSlot(this, Pair.Key) || Execute_IsSlotOccupied(this, Pair.Key))
        {
            FailedSlots.Add(Pair.Key);
        }
    }
    
    if (FailedSlots.Num() > 0)
    {
        LOG_WARNING(TEXT("Cannot equip set - slots unavailable: %d"), FailedSlots.Num());
        return false;
    }
    
    // Perform bulk attachment
    bool AllSucceeded = true;
    for (const auto& Pair : EquipmentSet)
    {
        if (!Execute_TryAttach(this, Pair.Key, Pair.Value))
        {
            AllSucceeded = false;
            LOG_WARNING(TEXT("Failed to attach to slot: %s"), *Pair.Key.ToString());
        }
    }
    
    return AllSucceeded;
}
```

## Character System Integration

### Stat Modifications

```cpp
// Apply equipment stat bonuses
void UpdateCharacterStats()
{
    if (!GetOwner())
        return;
        
    auto Character = Cast<ACharacter>(GetOwner());
    if (!Character)
        return;
        
    // Reset equipment bonuses
    ResetEquipmentBonuses(Character);
    
    // Apply bonuses from all equipped items
    for (auto* Slot : AttachmentSlots)
    {
        if (Slot && Slot->IsOccupied())
        {
            ApplyEquipmentBonuses(Character, Slot->Attachment);
        }
    }
}

void ApplyEquipmentBonuses(ACharacter* Character, UObject* Equipment)
{
    // Example: Apply weapon damage bonus
    if (auto WeaponComp = Equipment->FindComponentByClass<UWeaponComponent>())
    {
        auto CharacterStats = Character->FindComponentByClass<UCharacterStatsComponent>();
        if (CharacterStats)
        {
            CharacterStats->AddDamageBonus(WeaponComp->GetDamageBonus());
        }
    }
    
    // Example: Apply armor defense bonus
    if (auto ArmorComp = Equipment->FindComponentByClass<UArmorComponent>())
    {
        auto CharacterStats = Character->FindComponentByClass<UCharacterStatsComponent>();
        if (CharacterStats)
        {
            CharacterStats->AddDefenseBonus(ArmorComp->GetDefenseBonus());
        }
    }
}
```

### Animation Integration

```cpp
// Update character animations based on equipment
void UpdateEquipmentAnimations()
{
    auto Character = Cast<ACharacter>(GetOwner());
    if (!Character)
        return;
        
    auto AnimInstance = Character->GetMesh()->GetAnimInstance();
    if (!AnimInstance)
        return;
        
    // Check main hand weapon type
    auto MainHandSlot = Execute_GetSlot(this, "MainHand");
    if (MainHandSlot && MainHandSlot->IsOccupied())
    {
        if (auto WeaponComp = MainHandSlot->Attachment->FindComponentByClass<UWeaponComponent>())
        {
            EWeaponType WeaponType = WeaponComp->GetWeaponType();
            
            // Set animation blueprint variables
            if (auto CharAnimInstance = Cast<UCharacterAnimInstance>(AnimInstance))
            {
                CharAnimInstance->SetWeaponType(WeaponType);
                CharAnimInstance->SetIsArmed(true);
            }
        }
    }
    else
    {
        // No weapon equipped
        if (auto CharAnimInstance = Cast<UCharacterAnimInstance>(AnimInstance))
        {
            CharAnimInstance->SetIsArmed(false);
        }
    }
}
```

## Event Handling

### Equipment Change Events

```cpp
// Bind to attachment events
void APlayerCharacter::BeginPlay()
{
    Super::BeginPlay();
    
    if (EquipmentComponent)
    {
        EquipmentComponent->OnAttachmentChanged.AddDynamic(this, &APlayerCharacter::OnEquipmentChanged);
    }
}

UFUNCTION()
void APlayerCharacter::OnEquipmentChanged(const FName& SlotId, UObject* NewAttachment, UObject* OldAttachment)
{
    // Update character stats
    EquipmentComponent->UpdateCharacterStats();
    
    // Update animations
    EquipmentComponent->UpdateEquipmentAnimations();
    
    // Update UI
    if (EquipmentUIComponent)
    {
        EquipmentUIComponent->RefreshEquipmentDisplay();
    }
    
    // Broadcast equipment change event
    OnCharacterEquipmentChanged.Broadcast(SlotId, NewAttachment, OldAttachment);
}
```

### Equipment Validation Events

```cpp
// Validate equipment changes
bool ValidateEquipmentChange(const FName& SlotId, UObject* NewEquipment)
{
    // Character level requirements
    if (auto WeaponComp = NewEquipment->FindComponentByClass<UWeaponComponent>())
    {
        if (GetCharacterLevel() < WeaponComp->GetRequiredLevel())
        {
            ShowEquipmentError(TEXT("Level too low for this equipment"));
            return false;
        }
    }
    
    // Class restrictions
    if (auto ClassRestrictedComp = NewEquipment->FindComponentByClass<UClassRestrictedComponent>())
    {
        if (!ClassRestrictedComp->CanBeUsedByClass(GetCharacterClass()))
        {
            ShowEquipmentError(TEXT("Wrong class for this equipment"));
            return false;
        }
    }
    
    return true;
}
```

## Common Patterns

### Pattern 1: Equipment Presets

```cpp
// Save/load equipment configurations
USTRUCT(BlueprintType)
struct FEquipmentPreset
{
    GENERATED_BODY()
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FString PresetName;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    TMap<FName, TSoftObjectPtr<UClass>> EquipmentClasses;
};

bool LoadEquipmentPreset(const FEquipmentPreset& Preset)
{
    // Clear current equipment
    Execute_ClearAll(this);
    
    // Load preset equipment
    for (const auto& Pair : Preset.EquipmentClasses)
    {
        UClass* EquipmentClass = Pair.Value.LoadSynchronous();
        if (EquipmentClass)
        {
            AActor* Equipment = GetWorld()->SpawnActor<AActor>(EquipmentClass);
            Execute_TryAttach(this, Pair.Key, Equipment);
        }
    }
    
    return true;
}
```

### Pattern 2: Equipment Requirements

```cpp
// Character requirement checking
bool CheckEquipmentRequirements(UObject* Equipment)
{
    auto RequirementsComp = Equipment->FindComponentByClass<UEquipmentRequirementsComponent>();
    if (!RequirementsComp)
        return true; // No requirements
        
    auto Character = Cast<ACharacter>(GetOwner());
    if (!Character)
        return false;
        
    // Check level requirement
    if (RequirementsComp->MinLevel > 0)
    {
        auto LevelComp = Character->FindComponentByClass<UCharacterLevelComponent>();
        if (!LevelComp || LevelComp->GetLevel() < RequirementsComp->MinLevel)
            return false;
    }
    
    // Check stat requirements
    if (RequirementsComp->RequiredStats.Num() > 0)
    {
        auto StatsComp = Character->FindComponentByClass<UCharacterStatsComponent>();
        if (!StatsComp || !StatsComp->MeetsRequirements(RequirementsComp->RequiredStats))
            return false;
    }
    
    return true;
}
```

### Pattern 3: Equipment Effects

```cpp
// Apply equipment effects when equipped
void ApplyEquipmentEffects(UObject* Equipment)
{
    auto EffectsComp = Equipment->FindComponentByClass<UEquipmentEffectsComponent>();
    if (!EffectsComp)
        return;
        
    auto Character = Cast<ACharacter>(GetOwner());
    if (!Character)
        return;
        
    // Apply passive effects
    for (const auto& Effect : EffectsComp->PassiveEffects)
    {
        if (auto EffectComp = Character->FindComponentByClass<UStatusEffectComponent>())
        {
            EffectComp->ApplyEffect(Effect);
        }
    }
    
    // Grant abilities
    for (const auto& Ability : EffectsComp->GrantedAbilities)
    {
        if (auto AbilityComp = Character->FindComponentByClass<UAbilitySystemComponent>())
        {
            AbilityComp->GiveAbility(FGameplayAbilitySpec(Ability));
        }
    }
}
```

## Performance Optimization

### Efficient Equipment Queries

```cpp
// Cache equipped items by type
class UOptimizedEquipmentComponent : public UMounteaEquipmentComponent
{
private:
    mutable TMap<FGameplayTag, TArray<UObject*>> EquipmentByType;
    bool bCacheValid = false;
    
public:
    TArray<UObject*> GetEquippedItemsByType(const FGameplayTag& Type) const
    {
        if (!bCacheValid)
            RebuildEquipmentCache();
            
        if (auto* Items = EquipmentByType.Find(Type))
            return *Items;
            
        return TArray<UObject*>();
    }
    
private:
    void RebuildEquipmentCache() const
    {
        EquipmentByType.Empty();
        
        for (auto* Slot : AttachmentSlots)
        {
            if (Slot && Slot->IsOccupied())
            {
                // Categorize by equipment type tags
                if (auto AttachableComp = Slot->Attachment->FindComponentByClass<UMounteaAttachableComponent>())
                {
                    for (const auto& Tag : AttachableComp->GetTags_Implementation().GetGameplayTagArray())
                    {
                        EquipmentByType.FindOrAdd(Tag).Add(Slot->Attachment);
                    }
                }
            }
        }
        
        bCacheValid = true;
    }
};
```

### Memory Management

```cpp
// Clean up equipment actors when unequipped
virtual bool TryDetach_Implementation(const FName& SlotId) override
{
    auto Slot = Execute_GetSlot(this, SlotId);
    if (!Slot || !Slot->IsOccupied())
        return false;
        
    UObject* DetachedEquipment = Slot->Attachment;
    
    // Perform base detachment
    bool Success = Super::TryDetach_Implementation(SlotId);
    
    if (Success && DetachedEquipment)
    {
        // Clean up equipment actor if temporary
        if (AActor* EquipmentActor = Cast<AActor>(DetachedEquipment))
        {
            if (EquipmentActor->ActorHasTag("TemporaryEquipment"))
            {
                EquipmentActor->Destroy();
            }
        }
    }
    
    return Success;
}
```

## Troubleshooting

!!! warning "Equipment Not Attaching"
    - Verify character mesh has required sockets
    - Check equipment template spawn actor configuration
    - Validate tag compatibility between items and slots

!!! warning "Stat Bonuses Not Applying"
    - Ensure character has stats component
    - Verify equipment has bonus components
    - Check stat update is called on equipment changes

!!! warning "Animation Issues"
    - Validate animation blueprint integration
    - Check weapon type enum synchronization
    - Ensure character mesh animation setup

## Best Practices

!!! tip "Design Guidelines"
    - **Character Integration**: Design equipment around character capabilities
    - **Stat Management**: Use event-driven stat updates
    - **Memory Efficiency**: Clean up temporary equipment actors
    - **Validation**: Implement robust requirement checking
    - **Performance**: Cache expensive equipment queries

## Next Steps

- **[Tag Configuration](TagConfiguration.md):** Set up compatibility tag hierarchies