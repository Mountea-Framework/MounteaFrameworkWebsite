# Attachment System

Dynamic equipment attachment with socket-based positioning and network replication.

## Core Components

### Attachable Objects

- **`UMounteaAttachableComponent`** - Items that can attach to equipment
- **`IMounteaAdvancedAttachmentAttachableInterface`** - Attachable contract

### Containers

- **`UMounteaAttachmentContainerComponent`** - Manages attachment slots
- **`IMounteaAdvancedAttachmentContainerInterface`** - Container operations

### Slots

- **`UMounteaAdvancedAttachmentSlot`** - Individual attachment points
- **`UMounteaAdvancedAttachmentSlotBase`** - Base slot functionality

### Preview

- **`AMounteaAdvancedInventoryItemPreviewRenderer`** - 3D attachment preview

## Attachment Methods

### Socket-Based

```cpp
// Attach to mesh socket
Slot->SlotType = EAttachmentSlotType::EAST_Socket;
Slot->SocketName = "GemSocket";
Slot->AttachmentTargetOverride = "WeaponMesh";
```

### Component-Based

```cpp
// Attach to scene component
Slot->SlotType = EAttachmentSlotType::EAST_Component;
Slot->AttachmentTargetOverride = "AttachmentPoint";
```

## Basic Usage

### Setup Attachable Item

```cpp
// Add to weapon/equipment actor
UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
UMounteaAttachableComponent* AttachableComponent;

// Configure
AttachableComponent->Id = "Scope";
AttachableComponent->Tags.AddTag(WeaponAttachmentTag);
AttachableComponent->State = EAttachmentState::EAS_Detached;
```

### Container Setup

```cpp
// Add to equipment that accepts attachments
UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
UMounteaAttachmentContainerComponent* AttachmentContainer;

// Create slots
UMounteaAdvancedAttachmentSlot* ScopeSlot = NewObject<UMounteaAdvancedAttachmentSlot>();
ScopeSlot->SlotName = "ScopeMount";
ScopeSlot->SlotTags.AddTag(ScopeCompatibleTag);
AttachmentContainer->AttachmentSlots.Add(ScopeSlot);
```

### Attach Operations

```cpp
// Attach scope to rifle
bool Success = AttachableComponent->AttachToSlot(RifleContainer, "ScopeMount");

// Auto-find compatible slot
bool AutoAttached = AttachableComponent->AttachToContainer(RifleContainer);

// Detach
AttachableComponent->Detach();
```

## Tag Filtering

### Compatibility System

```cpp
// Slot accepts specific attachments
FGameplayTagContainer SlotTags;
SlotTags.AddTag(FGameplayTag::RequestGameplayTag("Attachment.Optic"));
SlotTags.AddTag(FGameplayTag::RequestGameplayTag("Attachment.Rail"));

// Item provides attachment type
FGameplayTagContainer ItemTags;
ItemTags.AddTag(FGameplayTag::RequestGameplayTag("Attachment.Optic.Scope"));
```

### Validation

```cpp
// Check compatibility
bool IsCompatible = Slot->MatchesTags(ItemTags, false); // ANY match
bool ExactMatch = Slot->MatchesTags(ItemTags, true);    // ALL match
```

## Events

```cpp
// Container events
AttachmentContainer->OnAttachmentChanged.AddDynamic(this, &AWeapon::OnAttachmentChanged);
AttachmentContainer->OnSlotStateChanged.AddDynamic(this, &AWeapon::OnSlotStateChanged);

void OnAttachmentChanged(const FName& SlotId, UObject* NewAttachment, UObject* OldAttachment)
{
    // Update weapon stats/appearance
}
```

## Use Cases

- **Weapon Modifications** - Scopes, grips, barrels
- **Armor Enhancements** - Gems, enchantments, plates  
- **Tool Upgrades** - Drill bits, saw blades
- **Vehicle Parts** - Engines, wheels, weapons
