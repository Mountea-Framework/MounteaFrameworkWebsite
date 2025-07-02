# Equipment System

## What You'll Learn

- Understanding the attachment-based equipment architecture
- How containers, slots, and attachables work together
- Tag-based compatibility and filtering systems
- Network replication patterns for multiplayer
- Integration with inventory and item actions
- Performance considerations and best practices

## Quick Start

```cpp
// Add equipment component to actor
UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Equipment")
class UMounteaEquipmentComponent* EquipmentComponent;

// Attach item to equipment slot
bool Success = EquipmentComponent->Execute_TryAttach(EquipmentComponent, SlotName, AttachableObject);
```

!!! tip "Result"
    Flexible attachment system supporting both visual equipment (weapons, armor) and abstract items (buffs, abilities) with full multiplayer support.

## System Overview

### Core Architecture

The equipment system uses a modular attachment-based architecture with three main components:

!!! info "Component Hierarchy"
    - **Equipment Component**: Main equipment manager extending attachment containers
    - **Attachment Container**: Manages collections of attachment slots with networking
    - **Attachment Slots**: Individual locations where items can be attached
    - **Attachable Components**: Items that can attach to compatible slots

### How It Works

The system operates on a **container-slot-attachable** model similar to a tool belt with specific pockets for different tools.

**Containers** manage multiple attachment slots and handle networking, events, and validation. **Slots** define specific attachment points with rules about what can attach there. **Attachables** are items or components that can attach to compatible slots based on gameplay tags.

### Key Features

!!! example "Equipment Capabilities"
    - **Tag-Based Filtering**: Slots specify compatible items using gameplay tags
    - **Physical Attachment**: Items attach to sockets or components visually
    - **Network Replication**: Full multiplayer support with server authority
    - **Dynamic Management**: Add/remove attachments at runtime
    - **Event System**: React to attachment changes for gameplay and UI
    - **Validation**: Comprehensive editor and runtime validation

## System Components

### Equipment Component

`UMounteaEquipmentComponent` extends the attachment container with equipment-specific functionality. It provides the main interface for equipment management and implements specialized equipment behaviors.

!!! info "Key Responsibilities"
    - Managing equipment slots and their states
    - Handling attachment operations with validation
    - Processing network replication for multiplayer
    - Broadcasting equipment change events
    - Integrating with inventory item actions

### Attachment Container

`UMounteaAttachmentContainerComponent` manages collections of attachment slots with full network support. It handles the core attachment logic and provides the foundation for equipment systems.

!!! success "Core Features"
    - Slot management and validation
    - Network replication with server authority
    - Event broadcasting for attachment changes
    - Smart slot finding based on tags
    - Batch operations for performance

### Attachment Slots

`UMounteaAdvancedAttachmentSlot` defines individual attachment points with specific rules and behaviors. Slots support both socket-based visual attachment and component-based logical attachment.

!!! tip "Slot Properties"
    - Unique name and display text
    - Gameplay tags defining compatibility
    - Current state (Empty, Occupied, Locked)
    - Physical attachment configuration
    - Network replication support

### Attachable Components

`UMounteaAttachableComponent` represents items that can attach to slots. Components define their compatibility through gameplay tags and manage their attachment state.

!!! example "Attachable Features"
    - Identification and display information
    - Compatibility tags for slot matching
    - Attachment state tracking
    - Container relationship management
    - Interface-based attachment operations

## Tag-Based Compatibility

### How Tags Work

The system uses hierarchical gameplay tags to determine compatibility between slots and attachables.

!!! example "Tag Matching"
    - **Slot Tags**: `Equipment.Weapon.Melee` (accepts melee weapons)
    - **Item Tags**: `Equipment.Weapon.Sword` (is a sword weapon)
    - **Result**: Compatible because sword is a type of melee weapon

### Common Tag Hierarchies

```text
Equipment
├── Weapon (MainHand, OffHand slots)
│   ├── Melee (Sword, Axe, Dagger)
│   └── Ranged (Bow, Crossbow)
├── Armor (Head, Body, Legs, Feet slots)
├── Accessory (Ring, Necklace slots)
└── Consumable (Quick-use slots)
```

### Flexible Matching

Tags support both strict and flexible matching. Slots can require exact tags or accept tag hierarchies, enabling both specific and general compatibility rules.

## Network Architecture

### Server Authority

All equipment operations follow server authority patterns. Clients request changes through server RPCs, and the server validates and executes operations before replicating results.

### Efficient Replication

The system uses sub-object replication for slots, only sending changes when attachment states modify. This minimizes network traffic while maintaining synchronization.

### State Synchronization

Slots handle their own replication callbacks, automatically performing physical attachment/detachment when state changes arrive from the server.

## Integration Points

### Inventory System

Equipment integrates seamlessly with the inventory system through item actions. The `UMounteaEquipItemAction` spawns equipment actors from inventory item templates and attaches them to compatible slots.

### Item Actions

Equipment actions automatically find compatible slots using tag matching, providing intelligent equipment behavior without manual slot specification.

### Character Systems

Equipment components integrate with character meshes and skeletal systems, supporting both socket-based visual attachment and component-based logical attachment.

## Advanced Features

### Dynamic Slot Management

The system supports runtime slot creation and modification, enabling modular equipment systems where base items can add additional attachment points.

### Equipment Sets

Built-in support for equipment set bonuses by tracking equipped items and applying bonuses when complete sets are worn.

### Conditional Slots

Slots can have prerequisites, such as off-hand slots only becoming available when specific main-hand weapons are equipped.

### Performance Optimization

The system includes caching mechanisms, batch operations, and efficient memory management for large-scale equipment systems.

## Configuration

### Editor Integration

Slots integrate with the editor through dropdown helpers and automatic configuration from settings. The system validates slot configurations and provides helpful error messages.

### Settings-Driven

Equipment slots and compatibility rules are defined through centralized configuration, enabling designers to modify equipment behavior without code changes.

### Validation System

Comprehensive validation in both editor and runtime ensures equipment configurations are valid and functional.

## Documentation Structure

!!! note "Detailed Guides"
    This overview introduces the equipment system concepts. For implementation details, see:

- **[Attachment Containers](AttachmentContainers.md):** Managing slot collections and networking
- **[Attachment Slots](AttachmentSlots.md):** Configuring individual attachment points  
- **[Attachable Components](AttachableComponents.md):** Creating attachable items and objects
- **[Equipment Component](EquipmentComponent.md):** Creating and managing Actor's equipment
- **[Loadout Configuration](LoadoutConfiguration.md):** Create and manage loadouts to load Equipment from
- **[Tag Configuration](TagConfiguration.md)**: Setting up compatibility tag hierarchies

## Best Practices

!!! tip "Design Guidelines"
    - **Use hierarchical tags** for maximum compatibility flexibility
    - **Design slots around gameplay** rather than visual attachment points
    - **Plan tag hierarchies** before implementing equipment items
    - **Validate configurations** early in the editor
    - **Consider performance** when designing large equipment systems

!!! warning "Common Pitfalls"
    - Don't create overly specific tags that limit compatibility
    - Avoid complex slot dependencies that confuse players
    - Remember server authority for all attachment operations
    - Plan for network bandwidth with large equipment collections

## Next Steps

- **[Attachment Containers](AttachmentContainers.md):** Defines the foundation of the Equipment system
- **[Attachment Slots](AttachmentSlots.md):** Basic configuration for individual Equipment slots
- **[Equipment Settings](../Configuration/Settings.md):** Equip and manage item instances
