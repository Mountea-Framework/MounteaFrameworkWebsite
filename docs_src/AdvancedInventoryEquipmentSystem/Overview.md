# Advanced Inventory & Equipment System

Comprehensive data-driven inventory and equipment management for Unreal Engine with multiplayer support.

## System Overview

The Mountea Advanced Inventory & Equipment System provides complete item management functionality including storage, equipment handling, UI components, and network replication. Built with modularity and extensibility in mind.

## Core Systems

### [Inventory System](InventorySystem/InventorySystem.md)

Complete item storage and management system with:

- [Core functionality](InventorySystem/InventorySystem.md) - Basic inventory operations
- [Item Instances](InventorySystem/ItemInstances.md) - Runtime item instances and data structures
- [Item Templates](InventorySystem/ItemTemplates.md) - Static item definitions and properties
- [Categories](Configuration/ItemCategoriesRarities.md) - Item classification and organization
- [Rarity System](Configuration/ItemCategoriesRarities.md) - Visual and economic item tiers
- [Search & Filtering](InventorySystem/Search.md) - Advanced item queries
- [Notifications](InventorySystem/Notifications.md) - User feedback system

### [Equipment System](EquipmentSystem/EquipmentSystem.md)

Advanced equipment management featuring:

- [Equipment & Attachment System](EquipmentSystem/EquipmentSystem.md) - Equipment slots and management & Dynamic item attachment with sockets

### [User Interface](UserInterface/UserInterface.md)

Complete widget framework with:

- [UI Overview](UserInterface/UserInterface.md) - Widget interfaces and base classes
- [Inventory UI](UserInterface/InventoryUIComponent.md) - Main inventory interface components
- [Grid System](UserInterface/GridSystem.md) - 2D spatial inventory layouts
- [Item Widgets](UserInterface/ItemWidgets.md) - Individual item presentation
- [Item Preview](UserInterface/ItemPreview.md) - 3D item visualization
- [Slate Elements](UserInterface/SlateElements.md) - Custom UI controls

### [Configuration](Configuration/Settings.md)

System-wide settings and data:

- [Settings](Configuration/Settings.md) - Project configuration and themes
- [Inventory Types](Configuration/InventoryTypes.md) - Different inventory behaviors
- [Replication](Configuration/Replication.md) - Multiplayer synchronization

## Key Features

**📦 Inventory Management**

- Stackable items with quantity tracking
- Durability system with degradation
- Fast item search and filtering
- Efficient network replication

**⚔️ Equipment System**

- RPG-style weapon switching
- Two-handed vs dual-wield logic
- Socket-based attachments
- Gameplay tag filtering

**🎮 User Interface**

- Grid-based inventory layouts
- Drag & drop functionality
- 3D item previews
- Customizable themes

**🌐 Multiplayer Ready**

- Delta compression replication
- Authority validation
- Client prediction support
- Efficient bandwidth usage

## Quick Start

1. **Setup**: Configure system in [Settings](Configuration/Settings.md)
2. **Items**: Create templates using [Item Templates](InventorySystem/ItemTemplates.md)
3. **UI**: Implement widgets with [User Interface](UserInterface/UserInterface.md)
4. **Network**: Enable [Replication](Configuration/Replication.md) for multiplayer

## Architecture
# Mountea Inventory & Equipment System - Architecture Design

## Table of Contents
1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [Component Relationship Diagram](#2-component-relationship-diagram)
3. [Class Hierarchy](#3-class-hierarchy)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [Interface Definitions](#5-interface-definitions)
6. [Core Struct/Class Definitions](#6-core-structclass-definitions)

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MOUNTEA INVENTORY & EQUIPMENT SYSTEM                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            CONFIGURATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  UMounteaAdvancedInventorySettings                                          │
│  ├─ UMounteaAdvancedInventorySettingsConfig                                 │
│  │  ├─ Inventory Types (Player, NPC, Storage, Merchant, Loot, Specialized)  │
│  │  ├─ Item Rarities                                                        │
│  │  ├─ Item Categories                                                      │
│  │  ├─ UI Classes                                                           │
│  │  └─ Notification Configs                                                 │
│  └─ UMounteaAdvancedEquipmentSettingsConfig                                 │
│     ├─ Equipment Slot Definitions                                           │
│     └─ Attachment Rules                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Templates (Data Assets):                                                   │
│  ├─ UMounteaInventoryItemTemplate                                           │
│  ├─ UMoneyItemTemplate : UMounteaInventoryItemTemplate                      │
│  ├─ UCraftingRecipeTemplate : UMounteaInventoryItemTemplate                 │
│  └─ UModifierTemplate : UMounteaInventoryItemTemplate                       │
│                                                                             │
│  Runtime Instances (Structs):                                               │
│  ├─ FInventoryItem                                                          │
│  ├─ FInventoryItemArray (FastArraySerializer)                               │
│  ├─ FEquipmentSlot                                                          │
│  └─ FEquipmentSlotArray (FastArraySerializer)                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          CORE LOGIC LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────┐     ┌──────────────────────┐                      │
│  │  INVENTORY SUBSYSTEM │     │  EQUIPMENT SUBSYSTEM │                      │
│  └──────────────────────┘     └──────────────────────┘                      │
│           │                              │                                  │
│           ├─ UInventoryManagerComponent  ├─ UEquipmentManagerComponent      │
│           │  (Database)                  │  (Attachment Database)           │
│           │                              │                                  │
│           └─ Operations:                 └─ Operations:                     │
│              - Add/Remove Items             - Equip/Unequip                 │
│              - Modify Quantity              - Get Slots                     │
│              - Find/Get Items               - Validate Equipment            │
│              - Sort/Filter                  - Save/Load                     │
│              - Save/Load                                                    │
│                                                                             │
│  ┌──────────────────────┐     ┌──────────────────────┐                      │
│  │   CRAFTING SUBSYSTEM │     │   RECIPE SUBSYSTEM   │                      │
│  └──────────────────────┘     └──────────────────────┘                      │
│           │                              │                                  │
│           ├─ UCraftingComponent          ├─ URecipeKnowledgeComponent       │
│           │  (Recipe Execution)          │  (Recipe Storage)                │
│           │                              │                                  │
│           └─ Operations:                 └─ Operations:                     │
│              - Can Craft                    - Learn Recipe                  │
│              - Craft Item                   - Forget Recipe                 │
│              - Validate Ingredients         - Get Known Recipes             │
│              - Execute Recipe               - Is Recipe Known               │
│                                             - Save/Load                     │
│                                                                             │
│  ┌──────────────────────┐                                                   │
│  │ NOTIFICATION SYSTEM  │                                                   │
│  └──────────────────────┘                                                   │
│           │                                                                 │
│           └─ UNotificationManagerComponent                                  │
│              (Event Processing)                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            INTERACTION LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────┐     ┌──────────────────────┐                      │
│  │   PICKUP/DROP SYSTEM │     │  LOOTING/VENDOR SYS  │                      │
│  └──────────────────────┘     └──────────────────────┘                      │
│           │                              │                                  │
│           ├─ IMounteaPickupInterface     ├─ IMounteaLootableInterface       │
│           └─ IMounteaDroppableInterface  └─ IMounteaVendorInterface         │
│                                                                             │
│           Operations:                    Operations:                        │
│           - Pickup Item                  - Request Loot Access              │
│           - Drop Item                    - Transfer Items                   │
│           - Spawn Pickup Actor           - Buy/Sell                         │
│                                          - Calculate Price                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER (UI)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────┐     ┌──────────────────────┐                      │
│  │   INVENTORY UI       │     │    EQUIPMENT UI      │                      │
│  └──────────────────────┘     └──────────────────────┘                      │
│           │                              │                                  │
│           ├─ UInventoryUIComponent       ├─ UEquipmentUIComponent           │
│           │  (UI Bridge)                 │  (UI Bridge)                     │
│           │                              │                                  │
│           └─ Widget Hierarchy:           └─ Widget Hierarchy:               │
│              - Wrapper Widget               - Equipment Panel               │
│              - Inventory Widget             - Equipment Slots               │
│              - Item Grid                    - Quick Access Slots            │
│              - Item Slots                   - Slot Tooltips                 │
│              - Item Widgets                                                 │
│              - Categories                                                   │
│              - Tooltips                                                     │
│              - Action Menus                                                 │
│                                                                             │
│  ┌──────────────────────┐                                                   │
│  │  NOTIFICATION UI     │                                                   │
│  └──────────────────────┘                                                   │
│           │                                                                 │
│           └─ Notification Widgets                                           │
│              - Container                                                    │
│              - Notification Items                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            REPLICATION LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Server Authority:                                                          │
│  - All inventory operations                                                 │
│  - All equipment operations                                                 │
│  - Crafting execution                                                       │
│  - Item transfers                                                           │
│                                                                             │
│  Client Prediction:                                                         │
│  - Equipment visual attachment (with server confirmation)                   │
│  - UI updates (with rollback on server rejection)                           │
│                                                                             │
│  Replication Method:                                                        │
│  - FastArraySerializer for item arrays                                      │
│  - Delta replication for efficient bandwidth                                │
│  - OnRep functions for client notification                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ACTOR (Player/NPC)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
    ┌───────────────────────┐ ┌──────────────┐ ┌─────────────────────┐
    │ UInventoryManager     │ │ UEquipment   │ │ URecipeKnowledge    │
    │ Component             │ │ Manager      │ │ Component           │
    │ ──────────────────    │ │ Component    │ │ ──────────────────  │
    │ Implements:           │ │ ──────────   │ │ Stores:             │
    │ - IInventoryInterface │ │ Implements:  │ │ - Known Recipes     │
    │                       │ │ - IEquipment │ │ - Recipe States     │
    │ Contains:             │ │   Interface  │ │                     │
    │ - FInventoryItemArray │ │ - IAttachment│ │ Operations:         │
    │                       │ │   Container  │ │ - LearnRecipe()     │
    │ References:           │ │              │ │ - ForgetRecipe()    │
    │ - EquipmentManager ───┼─┼─────────────>│ │ - IsKnown()         │
    │ - NotificationMgr     │ │              │ │ - GetKnownRecipes() │
    └───────────────────────┘ │ Contains:    │ └─────────────────────┘
                │             │ - FEquipment │
                │             │   SlotArray  │           │
                │             │ - Attachment │           │
                │             │   Slots      │           │
                │             └──────────────┘           │
                │                      │                 │
                │                      │                 │
                └──────────┬───────────┴─────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ UCraftingComponent     │
              │ ─────────────────────  │
              │ Implements:            │
              │ - ICraftingInterface   │
              │                        │
              │ Requires:              │
              │ - InventoryManager     │
              │ - RecipeKnowledge      │
              │                        │
              │ Operations:            │
              │ - CanCraft()           │
              │ - CraftItem()          │
              │ - ValidateIngredients()│
              └────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            UI COMPONENTS LAYER                              │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌───────────────────────┐         ┌───────────────────────┐
    │ UInventoryUIComponent │         │ UEquipmentUIComponent │
    │ ────────────────────  │         │ ────────────────────  │
    │ Implements:           │         │ Implements:           │
    │ - IInventoryUI        │         │ - IEquipmentUI        │
    │   Interface           │         │   Interface           │
    │                       │         │                       │
    │ References:           │         │ References:           │
    │ - InventoryManager ───┼────────>│ - EquipmentManager ───┼────┐
    │ - InventoryWidget     │         │ - EquipmentWidget     │    │
    └───────────────────────┘         └───────────────────────┘    │
                │                                │                 │
                │                                │                 │
                ▼                                ▼                 │
    ┌───────────────────────┐         ┌──────────────────────┐     │
    │ Inventory Widget Tree │         │ Equipment Widget Tree│     │
    │ ────────────────────  │         │ ───────────────────  │     │
    │ - WrapperWidget       │         │ - EquipmentPanel     │     │
    │ - InventoryWidget     │         │ - EquipmentSlots     │     │
    │ - ItemGridWidget      │         │ - QuickAccessSlots   │     │
    │ - ItemSlotWidgets     │         │   (tagged slots)     │     │
    │ - ItemWidgets         │         │ - SlotTooltips       │     │
    │ - CategoryWidgets     │         └──────────────────────┘     │
    │ - TooltipWidgets      │                                      │
    │ - ActionMenuWidgets   │                                      │
    └───────────────────────┘                                      │
                                                                   │
┌──────────────────────────────────────────────────────────────────┘
│
│   ┌─────────────────────────────┐
└──>│ UNotificationManager        │
    │ Component                   │
    │ ──────────────────────────  │
    │ Implements:                 │
    │ - INotificationInterface    │
    │                             │
    │ Operations:                 │
    │ - ProcessNotification()     │
    │ - CreateNotificationWidget()│
    │ - QueueNotification()       │
    │                             │
    │ References:                 │
    │ - NotificationContainer     │
    │   Widget                    │
    └─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          INTERACTION INTERFACES                             │
└─────────────────────────────────────────────────────────────────────────────┘

    Actor (with Pickup Interface)          Actor (with Lootable Interface)
           │                                          │
           ▼                                          ▼
    ┌──────────────────┐                  ┌────────────────────┐
    │ Pickup Actor     │                  │ Lootable Container │
    │ ───────────────  │                  │ ─────────────────  │
    │ Implements:      │                  │ Implements:        │
    │ - IPickupable    │                  │ - ILootable        │
    │                  │                  │ - IInventory       │
    │ Contains:        │                  │   Interface        │
    │ - ItemTemplate   │                  │                    │
    │ - Quantity       │                  │ Contains:          │
    │ - Mesh           │                  │ - InventoryManager │
    └──────────────────┘                  └────────────────────┘

    Actor (with Vendor Interface)
           │
           ▼
    ┌──────────────────┐
    │ Vendor NPC       │
    │ ───────────────  │
    │ Implements:      │
    │ - IVendor        │
    │ - IInventory     │
    │   Interface      │
    │                  │
    │ Contains:        │
    │ - InventoryMgr   │
    │ - BuyMultiplier  │
    │ - SellMultiplier │
    └──────────────────┘
```

---

## 3. Class Hierarchy

### 3.1 Component Hierarchy

```
UActorComponent
│
├─ UInventoryManagerComponent
│  ├─ Implements: IMounteaAdvancedInventoryInterface
│  └─ Contains: FInventoryItemArray
│
├─ UEquipmentManagerComponent
│  ├─ Implements: IMounteaAdvancedEquipmentInterface
│  ├─ Implements: IMounteaAdvancedAttachmentContainerInterface
│  └─ Contains: FEquipmentSlotArray, TArray<UAttachmentSlot*>
│
├─ UCraftingComponent
│  ├─ Implements: IMounteaCraftingInterface
│  └─ Requires: UInventoryManagerComponent, URecipeKnowledgeComponent
│
├─ URecipeKnowledgeComponent
│  ├─ Implements: IMounteaRecipeKnowledgeInterface
│  └─ Contains: TMap<FGuid, FRecipeKnowledge>
│
├─ UInventoryUIComponent
│  ├─ Implements: IMounteaInventoryUIInterface
│  └─ References: UInventoryManagerComponent
│
├─ UEquipmentUIComponent
│  ├─ Implements: IMounteaEquipmentUIInterface
│  └─ References: UEquipmentManagerComponent
│
└─ UNotificationManagerComponent
   ├─ Implements: IMounteaNotificationInterface
   └─ Contains: TArray<FInventoryNotificationData>
```

### 3.2 Data Asset Hierarchy

```
UPrimaryDataAsset
│
├─ UMounteaInventoryItemTemplate (base template)
│  │
│  ├─ UMoneyItemTemplate
│  │  ├─ Additional: CurrencyType (GameplayTag)
│  │  └─ Additional: AutoStack = true
│  │
│  ├─ UCraftingRecipeTemplate
│  │  ├─ Additional: TMap<FGuid, int32> RequiredIngredients
│  │  ├─ Additional: TMap<FGuid, int32> OutputItems
│  │  ├─ Additional: bPermanentLearning
│  │  ├─ Additional: CraftingStationTag
│  │  └─ Additional: SuccessRate
│  │
│  └─ UModifierTemplate (for affectors/effects)
│     ├─ Additional: ModifierType (GameplayTag)
│     ├─ Additional: bIsReversible
│     ├─ Additional: TArray<FGameplayEffectSpecHandle> Effects
│     └─ Additional: ModifierStats
│
├─ UMounteaAdvancedInventorySettingsConfig
│  ├─ Contains: Inventory Type Configs
│  ├─ Contains: Item Rarities
│  ├─ Contains: Item Categories
│  ├─ Contains: UI Class References
│  └─ Contains: Notification Configs
│
└─ UMounteaAdvancedEquipmentSettingsConfig
   └─ Contains: Equipment Slot Definitions
```

### 3.3 Struct Hierarchy

```
FFastArraySerializerItem
│
├─ FInventoryItem (existing)
│  ├─ FGuid Guid
│  ├─ UMounteaInventoryItemTemplate* Template
│  ├─ int32 Quantity
│  ├─ float Durability
│  ├─ FGameplayTagContainer CustomData
│  ├─ TMap<FGameplayTag, FGuid> AffectorSlots
│  └─ TScriptInterface<IInventoryInterface> OwningInventory
│
└─ FEquipmentSlot (new)
   ├─ FGuid SlotGuid
   ├─ FName SlotName
   ├─ FGameplayTagContainer SlotTags
   ├─ FGuid EquippedItemGuid
   ├─ EEquipmentSlotState State
   └─ UMounteaAdvancedAttachmentSlot* AttachmentSlot

FFastArraySerializer
│
├─ FInventoryItemArray (existing)
│  └─ TArray<FInventoryItem> Items
│
└─ FEquipmentSlotArray (new)
   └─ TArray<FEquipmentSlot> Slots
```

### 3.4 Widget Hierarchy

```
UUserWidget
│
├─ Inventory UI Hierarchy
│  ├─ UInventoryWrapperWidget (IInventorySystemBaseWidgetInterface)
│  │  └─ Contains: UInventoryWidget
│  │
│  ├─ UInventoryWidget (IInventoryWidgetInterface)
│  │  ├─ Contains: UItemGridWidget
│  │  ├─ Contains: UCategoriesWrapperWidget
│  │  └─ Contains: UItemPanelWidget
│  │
│  ├─ UItemsGridWidget (IInventoryItemsGridWidgetInterface)
│  │  └─ Contains: TArray<UItemSlotWidget>
│  │
│  ├─ UItemSlotWidget (IInventoryItemSlotWidgetInterface)
│  │  └─ Contains: UItemWidget
│  │
│  ├─ UItemWidget (IInventoryItemWidgetInterface)
│  │
│  ├─ UItemTooltipWidget (IInventoryTooltipWidgetInterface)
│  │
│  ├─ UItemActionsContainerWidget (IInventoryItemActionsContainerWidgetInterface)
│  │  └─ Contains: TArray<UItemActionWidget>
│  │
│  ├─ UItemActionWidget (IInventoryItemActionWidgetInterface)
│  │
│  └─ UCategoryWidget (IInventoryCategoryWidgetInterface)
│
├─ Equipment UI Hierarchy
│  ├─ UEquipmentPanelWidget (IEquipmentPanelWidgetInterface)
│  │  └─ Contains: TArray<UEquipmentSlotWidget>
│  │
│  └─ UEquipmentSlotWidget (IEquipmentSlotWidgetInterface)
│     └─ Contains: UItemWidget (reused from inventory)
│
└─ Notification UI Hierarchy
   ├─ UNotificationContainerWidget (INotificationContainerWidgetInterface)
   │  └─ Contains: TArray<UNotificationWidget>
   │
   └─ UNotificationWidget (INotificationWidgetInterface)
```

### 3.5 Interface Inheritance

```
UInterface (Unreal Base)
│
├─ IMounteaAdvancedInventoryInterface
│  └─ Core inventory operations
│
├─ IMounteaAdvancedEquipmentInterface
│  └─ Core equipment operations
│
├─ IMounteaAdvancedAttachmentContainerInterface (existing)
│  └─ Attachment slot container operations
│
├─ IMounteaAdvancedAttachmentAttachableInterface (existing)
│  └─ Attachable object interface
│
├─ IMounteaCraftingInterface
│  └─ Crafting operations
│
├─ IMounteaRecipeKnowledgeInterface
│  └─ Recipe storage and retrieval
│
├─ IMounteaPickupInterface
│  └─ Pickup operations
│
├─ IMounteaDroppableInterface
│  └─ Drop operations
│
├─ IMounteaLootableInterface
│  └─ Looting operations
│
├─ IMounteaVendorInterface
│  └─ Buy/sell operations
│
├─ IMounteaInventoryUIInterface
│  └─ Inventory UI bridge operations
│
├─ IMounteaEquipmentUIInterface
│  └─ Equipment UI bridge operations
│
├─ IMounteaNotificationInterface
│  └─ Notification processing
│
└─ Widget Interfaces (multiple for each widget type)
   ├─ IMounteaInventorySystemBaseWidgetInterface
   ├─ IMounteaInventoryWidgetInterface
   ├─ IMounteaInventoryItemSlotWidgetInterface
   ├─ IMounteaInventoryItemWidgetInterface
   ├─ IMounteaInventoryTooltipWidgetInterface
   ├─ IMounteaEquipmentPanelWidgetInterface
   ├─ IMounteaEquipmentSlotWidgetInterface
   └─ IMounteaNotificationWidgetInterface
```

---

## 4. Data Flow Diagrams (Simplified)

### 4.1 Add Item Flow

```
Player → InventoryManager
    │
    ├─ [Server] Validate Request
    │     ├─ Check Inventory Space
    │     ├─ Check Weight Limit
    │     ├─ Check Item Validity
    │     └─ Check Configuration
    │
    ├─ [Server] Process Item
    │     ├─ Find Existing Stack (if stackable)
    │     ├─ Add to Existing OR Create New Item Instance
    │     └─ Update FInventoryItemArray
    │
    ├─ [Replication] Replicate to Clients
    │     └─ OnRep_InventoryItems()
    │
    ├─ [Server] Fire Notification
    │     └─ NotificationManager→ProcessNotification()
    │
    └─ [Both] Update UI
          └─ InventoryUIComponent→RefreshInventory()
```

### 4.2 Equip Item Flow

```
Player → EquipmentManager
    │
    ├─ [Client] Request Equip (Prediction)
    │     └─ Show Equipment Visual
    │
    ├─ [Server] Validate Request
    │     ├─ Check Item in Inventory
    │     ├─ Check Slot Compatibility
    │     ├─ Check Slot State
    │     └─ Check Configuration
    │
    ├─ [Server] Process Equipment
    │     ├─ Get Item from InventoryManager
    │     ├─ Find Target Equipment Slot
    │     ├─ Unequip Current Item (if any)
    │     ├─ Update FEquipmentSlot
    │     └─ Attach to AttachmentSlot
    │
    ├─ [Replication] Replicate to Clients
    │     ├─ OnRep_EquipmentSlots()
    │     └─ Physical Attachment Update
    │
    ├─ [Both] Update Inventory UI State
    │     └─ Mark Item as Equipped
    │
    └─ [Both] Update Equipment UI
          └─ EquipmentUIComponent→RefreshSlot()
```

### 4.3 Craft Item Flow

```
Player → CraftingComponent
    │
    ├─ [Server] Validate Recipe
    │     ├─ RecipeKnowledge→IsRecipeKnown()
    │     ├─ InventoryManager→ValidateIngredients()
    │     ├─ Check Crafting Station (if required)
    │     └─ Roll Success Chance (if configured)
    │
    ├─ [Server] Execute Crafting
    │     ├─ InventoryManager→RemoveItems(ingredients)
    │     ├─ InventoryManager→AddItems(outputs)
    │     └─ Apply Tool Durability (if configured)
    │
    ├─ [Replication] Replicate Inventory Changes
    │     └─ FInventoryItemArray replication
    │
    └─ [Server] Fire Notification
          └─ NotificationManager→ProcessNotification()
```

### 4.4 Apply Modifier Flow

```
Player → Drag Modifier to Item
    │
    ├─ [Client] UI Validation
    │     ├─ Check Affector Slot Compatibility
    │     └─ Visual Feedback
    │
    ├─ [Server] Validate Modification
    │     ├─ Check Item Has Affector Slot
    │     ├─ Check Slot is Empty/Compatible
    │     └─ Check Modifier Compatibility
    │
    ├─ [Server] Apply Modifier
    │     ├─ Get Target Item from Inventory
    │     ├─ Remove Modifier Item (if configured)
    │     ├─ Add ModifierGuid to Item.AffectorSlots
    │     ├─ Apply Effects to Item.CustomData
    │     └─ Update Item Template (if needed)
    │
    ├─ [Replication] Replicate Item Change
    │     └─ FInventoryItem replication
    │
    └─ [Both] Update UI
          ├─ Refresh Item Display
          └─ Show Modifier Visual
```

### 4.5 Pickup Item Flow

```
Player Interacts with Pickup Actor
    │
    ├─ [Client] Show Pickup Prompt
    │
    ├─ [Server] Pickup Request
    │     └─ PickupActor→IPickupInterface→RequestPickup()
    │
    ├─ [Server] Transfer to Inventory
    │     ├─ Get ItemTemplate + Quantity from Pickup
    │     └─ InventoryManager→AddItem()
    │
    ├─ [Server] Destroy/Update Pickup Actor
    │     └─ Remove from world or reduce quantity
    │
    └─ [Replication] Standard Add Item Flow
          (See 4.1)
```

### 4.6 Loot/Trade Flow

```
Player → Opens Loot/Vendor Interface
    │
    ├─ [Server] Request Access
    │     └─ Target→ILootableInterface→RequestLootAccess()
    │     OR Target→IVendorInterface→RequestTradeAccess()
    │
    ├─ [Server] Validate Access
    │     ├─ Check Distance
    │     ├─ Check Permissions
    │     └─ Check Inventory Flags
    │
    ├─ [Both] Show UI
    │     ├─ Source Inventory UI
    │     └─ Target Inventory UI
    │
    ├─ [Transfer Item] Player Action
    │     ├─ [Server] Validate Transfer
    │     ├─ [Server] Source→RemoveItem()
    │     ├─ [Server] Target→AddItem()
    │     └─ [Server] Process Payment (if vendor)
    │
    └─ [Replication] Both Inventories Update
          └─ FInventoryItemArray replication
```

---

## 5. Interface Definitions

### 5.1 Core Interfaces

#### IMounteaAdvancedInventoryInterface
**Purpose:** Core inventory database operations
**Implementers:** UInventoryManagerComponent

**Responsibilities:**
- Add/Remove items
- Find items by GUID/template/tags
- Modify item quantity/durability
- Get inventory state (weight, value, capacity)
- Sort/filter items
- Save/load inventory data
- Validate inventory operations
- Process inventory notifications

---

#### IMounteaAdvancedEquipmentInterface
**Purpose:** Equipment slot management and attachment
**Implementers:** UEquipmentManagerComponent

**Responsibilities:**
- Equip/unequip items
- Get equipment slots by name/tag
- Validate equipment compatibility
- Get equipped items
- Check slot states
- Save/load equipment data
- Manage quick access slots

---

#### IMounteaCraftingInterface
**Purpose:** Crafting execution and validation
**Implementers:** UCraftingComponent

**Responsibilities:**
- Validate recipe requirements
- Check ingredient availability
- Execute crafting recipe
- Calculate success chance
- Handle crafting failures
- Check crafting station requirements
- Apply tool durability costs

---

#### IMounteaRecipeKnowledgeInterface
**Purpose:** Recipe storage and learning system
**Implementers:** URecipeKnowledgeComponent

**Responsibilities:**
- Learn recipe (permanent or temporary)
- Forget recipe
- Check if recipe is known
- Get all known recipes
- Get recipes by category/tags
- Save/load recipe knowledge
- Handle recipe discovery

---

#### IMounteaPickupInterface
**Purpose:** Item pickup operations
**Implementers:** APickupActor

**Responsibilities:**
- Provide item template
- Provide quantity
- Handle pickup request
- Destroy or update after pickup
- Show pickup prompt
- Validate pickup conditions

---

#### IMounteaDroppableInterface
**Purpose:** Item drop operations
**Implementers:** UInventoryManagerComponent, Player/NPC Actors

**Responsibilities:**
- Validate drop request
- Spawn pickup actor
- Remove item from inventory
- Position pickup in world
- Handle drop permissions

---

#### IMounteaLootableInterface
**Purpose:** Looting system access control
**Implementers:** Actors with InventoryManagerComponent

**Responsibilities:**
- Request loot access
- Validate looter permissions
- Provide inventory reference
- Check loot distance
- Handle loot state (open/closed)
- Apply loot filters

---

#### IMounteaVendorInterface
**Purpose:** Buy/sell operations
**Implementers:** Vendor NPCs, Merchant Actors

**Responsibilities:**
- Calculate buy price
- Calculate sell price
- Validate transaction
- Process payment
- Provide merchant inventory
- Check vendor gold/currency
- Apply price multipliers

---

### 5.2 UI Interfaces

#### IMounteaInventoryUIInterface
**Purpose:** Bridge between inventory logic and UI
**Implementers:** UInventoryUIComponent

**Responsibilities:**
- Create/destroy inventory widgets
- Refresh inventory display
- Handle UI input
- Translate UI commands to inventory operations
- Subscribe to inventory notifications
- Update item slot visuals

---

#### IMounteaEquipmentUIInterface
**Purpose:** Bridge between equipment logic and UI
**Implementers:** UEquipmentUIComponent

**Responsibilities:**
- Create/destroy equipment widgets
- Refresh equipment display
- Handle slot interactions
- Translate UI commands to equipment operations
- Update equipped item visuals
- Show/hide quick access slots

---

#### IMounteaNotificationInterface
**Purpose:** Notification processing and display
**Implementers:** UNotificationManagerComponent

**Responsibilities:**
- Process notification requests
- Create notification widgets
- Queue notifications
- Play notification sounds
- Apply notification styles
- Remove expired notifications

---

### 5.3 Widget Interfaces

#### IMounteaInventorySystemBaseWidgetInterface
**Purpose:** Top-level UI wrapper
**Implementers:** UInventoryWrapperWidget

**Responsibilities:**
- Initialize all child widgets
- Handle widget lifecycle
- Manage input mode
- Toggle visibility
- Coordinate multiple panels

---

#### IMounteaInventoryWidgetInterface
**Purpose:** Main inventory panel
**Implementers:** UInventoryWidget

**Responsibilities:**
- Display item grid
- Show categories
- Handle sorting
- Manage item panel
- Coordinate sub-widgets

---

#### IMounteaInventoryItemSlotWidgetInterface
**Purpose:** Individual inventory slot
**Implementers:** UItemSlotWidget

**Responsibilities:**
- Display item widget
- Handle drag/drop
- Show slot state
- Trigger tooltip
- Execute item actions

---

#### IMounteaEquipmentSlotWidgetInterface
**Purpose:** Individual equipment slot
**Implementers:** UEquipmentSlotWidget

**Responsibilities:**
- Display equipped item
- Show slot type/name
- Handle equip/unequip
- Validate equipment drag/drop
- Show compatibility feedback

---

## 6. Core Struct/Class Definitions

### 6.1 New Structs

#### FEquipmentSlot
```cpp
USTRUCT(BlueprintType)
struct FEquipmentSlot : public FFastArraySerializerItem
{
    GENERATED_BODY()

    UPROPERTY()
    FGuid SlotGuid;

    UPROPERTY()
    FName SlotName;

    UPROPERTY()
    FGameplayTagContainer SlotTags;

    UPROPERTY()
    FGuid EquippedItemGuid;

    UPROPERTY()
    EEquipmentSlotState State;

    UPROPERTY(NotReplicated)
    TObjectPtr<UMounteaAdvancedAttachmentSlot> AttachmentSlot;
};
```

#### FEquipmentSlotArray
```cpp
USTRUCT(BlueprintType)
struct FEquipmentSlotArray : public FFastArraySerializer
{
    GENERATED_BODY()

    UPROPERTY()
    TArray<FEquipmentSlot> Slots;

    bool NetDeltaSerialize(FNetDeltaSerializeInfo& DeltaParams);
};
```

#### FCraftingRecipeData
```cpp
USTRUCT(BlueprintType)
struct FCraftingRecipeData
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    TMap<FGuid, int32> RequiredIngredients;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    TMap<FGuid, int32> OutputItems;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    float SuccessRate = 1.0f;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FGameplayTag CraftingStationTag;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    bool bConsumesTool = false;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    float ToolDurabilityCost = 0.0f;
};
```

#### FRecipeKnowledge
```cpp
USTRUCT(BlueprintType)
struct FRecipeKnowledge
{
    GENERATED_BODY()

    UPROPERTY()
    FGuid RecipeGuid;

    UPROPERTY()
    bool bIsPermanent;

    UPROPERTY()
    FDateTime LearnedAt;

    UPROPERTY()
    FGuid SourceItemGuid;
};
```

#### FInventoryTransferRequest
```cpp
USTRUCT(BlueprintType)
struct FInventoryTransferRequest
{
    GENERATED_BODY()

    UPROPERTY()
    FGuid ItemGuid;

    UPROPERTY()
    int32 Quantity;

    UPROPERTY()
    TScriptInterface<IMounteaAdvancedInventoryInterface> SourceInventory;

    UPROPERTY()
    TScriptInterface<IMounteaAdvancedInventoryInterface> TargetInventory;

    UPROPERTY()
    bool bIsVendorTransaction = false;

    UPROPERTY()
    float TransactionPrice = 0.0f;
};
```

#### FModifierData
```cpp
USTRUCT(BlueprintType)
struct FModifierData
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FGameplayTag ModifierType;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    bool bIsReversible;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FGameplayTagContainer ModifierTags;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    TMap<FName, float> StatModifiers;
};
```

### 6.2 New Enums

#### EEquipmentSlotState
```cpp
UENUM(BlueprintType)
enum class EEquipmentSlotState : uint8
{
    Empty,
    Equipped,
    Locked,
    Disabled
};
```

#### ECraftingResult
```cpp
UENUM(BlueprintType)
enum class ECraftingResult : uint8
{
    Success,
    Failed_MissingIngredients,
    Failed_InsufficientQuantity,
    Failed_NoRecipeKnowledge,
    Failed_NoCraftingStation,
    Failed_ChanceRoll,
    Failed_InsufficientSpace
};
```

#### EInventoryTransferResult
```cpp
UENUM(BlueprintType)
enum class EInventoryTransferResult : uint8
{
    Success,
    PartialSuccess,
    Failed_SourceInvalid,
    Failed_TargetInvalid,
    Failed_ItemNotFound,
    Failed_InsufficientQuantity,
    Failed_TargetFull,
    Failed_InsufficientCurrency,
    Failed_PermissionDenied
};
```

### 6.3 New Data Assets

#### UMoneyItemTemplate
```cpp
UCLASS()
class UMoneyItemTemplate : public UMounteaInventoryItemTemplate
{
    GENERATED_BODY()

public:
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FGameplayTag CurrencyType;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    int32 CurrencyValue = 1;

    virtual bool IsStackable() const override { return true; }
    virtual bool IsAutoStack() const override { return true; }
};
```

#### UCraftingRecipeTemplate
```cpp
UCLASS()
class UCraftingRecipeTemplate : public UMounteaInventoryItemTemplate
{
    GENERATED_BODY()

public:
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FCraftingRecipeData RecipeData;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    bool bPermanentLearning = true;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FText RecipeDescription;
};
```

#### UModifierTemplate
```cpp
UCLASS()
class UModifierTemplate : public UMounteaInventoryItemTemplate
{
    GENERATED_BODY()

public:
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FModifierData ModifierData;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FGameplayTagContainer CompatibleSlotTags;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    bool bConsumeOnApplication = true;
};
```

### 6.4 Component Definitions

#### UInventoryManagerComponent
```cpp
UCLASS()
class UInventoryManagerComponent : public UActorComponent, public IMounteaAdvancedInventoryInterface
{
    GENERATED_BODY()

public:
    UPROPERTY(Replicated)
    FInventoryItemArray InventoryItems;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    EInventoryType InventoryType;

    UPROPERTY()
    TObjectPtr<UEquipmentManagerComponent> EquipmentManager;

    UPROPERTY()
    TObjectPtr<UNotificationManagerComponent> NotificationManager;

    // Configuration loaded from InventorySettingsConfig
    FInventoryTypeConfig TypeConfig;
};
```

#### UEquipmentManagerComponent
```cpp
UCLASS()
class UEquipmentManagerComponent : public UActorComponent
    , public IMounteaAdvancedEquipmentInterface
    , public IMounteaAdvancedAttachmentContainerInterface
{
    GENERATED_BODY()

public:
    UPROPERTY(Replicated)
    FEquipmentSlotArray EquipmentSlots;

    UPROPERTY(NotReplicated)
    TArray<TObjectPtr<UMounteaAdvancedAttachmentSlot>> AttachmentSlots;

    UPROPERTY()
    TObjectPtr<UInventoryManagerComponent> InventoryManager;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    TArray<FName> EnabledSlotNames;
};
```

#### UCraftingComponent
```cpp
UCLASS()
class UCraftingComponent : public UActorComponent, public IMounteaCraftingInterface
{
    GENERATED_BODY()

public:
    UPROPERTY()
    TObjectPtr<UInventoryManagerComponent> InventoryManager;

    UPROPERTY()
    TObjectPtr<URecipeKnowledgeComponent> RecipeKnowledge;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FGameplayTag CurrentCraftingStationTag;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    bool bRequiresCraftingStation = false;
};
```

#### URecipeKnowledgeComponent
```cpp
UCLASS()
class URecipeKnowledgeComponent : public UActorComponent
    , public IMounteaRecipeKnowledgeInterface
{
    GENERATED_BODY()

public:
    UPROPERTY(SaveGame, Replicated)
    TMap<FGuid, FRecipeKnowledge> KnownRecipes;

    UPROPERTY()
    TObjectPtr<UInventoryManagerComponent> InventoryManager;
};
```

#### UNotificationManagerComponent
```cpp
UCLASS()
class UNotificationManagerComponent : public UActorComponent
    , public IMounteaNotificationInterface
{
    GENERATED_BODY()

public:
    UPROPERTY()
    TArray<FInventoryNotificationData> NotificationQueue;

    UPROPERTY()
    TObjectPtr<UUserWidget> NotificationContainerWidget;

    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    int32 MaxVisibleNotifications = 5;
};
```

---

## Interfaces & Components

Each system provides well-defined interfaces for maximum flexibility:

- `IMounteaAdvancedInventoryInterface` - Core inventory operations, lacks UI representation
- `IMounteaAdvancedEquipmentInterface` - Equipment management
- `IMounteaAdvancedInventoryUIInterface` - Inventory UI management, provides elegant way to separate Inventory and its UI
- `IMounteaAdvancedAttachmentContainerInterface` - Attachment handling

Components can be used independently or as part of the complete system, enabling gradual adoption and customization.
