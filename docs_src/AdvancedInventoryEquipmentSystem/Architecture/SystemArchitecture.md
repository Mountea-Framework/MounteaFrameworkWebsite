# System Architecture

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
│  GAME INSTANCE SUBSYSTEMS (Global, Cached Data)                             │
│  ├─ UInventoryConfigSubsystem                                               │
│  │  └─ Cache configurations & templates for fast access                     │
│                                                                             │
│  LOCAL PLAYER SUBSYSTEMS (Per-Player, Persistent)                           │
│  ├─ URecipeKnowledgeSubsystem (Recipe Storage)                              │
│  │  └─ Operations: Learn/Forget Recipe, Get Known Recipes, Save/Load        │
│  ├─ UNotificationSubsystem (Event Processing)                               │
│  │  └─ Operations: Process/Queue Notifications, Create Widgets              │
│  ├─ UInventoryUISubsystem (Inventory UI Bridge)                             │
│  │  └─ Operations: Open/Close Inventory, Refresh Display, Handle Actions    │
│  └─ UEquipmentUISubsystem (Equipment UI Bridge)                             │
│     └─ Operations: Open/Close Equipment, Refresh Slots, Show Quick Access   │
│                                                                             │
│  WORLD SUBSYSTEMS (Per-Level, Shared Logic)                                 │
│  ├─ ULootingSubsystem (Loot Session Management)                             │
│  │  └─ Operations: Request/Close Loot Access, Transfer Items                │
│  ├─ UVendorSubsystem (Trading Logic)                                        │
│  │  └─ Operations: Buy/Sell Transactions, Calculate Prices                  │
│  └─ UPickupSpawningSubsystem (Pickup Pooling)                               │
│     └─ Operations: Spawn/Despawn Pickups, Object Pooling                    │
│                                                                             │
│  ACTOR COMPONENTS (Per-Actor, Replicated)                                   │
│  ├─ UInventoryManagerComponent (Database)                                   │
│  │  └─ Operations: Add/Remove Items, Modify Quantity, Find/Get, Sort/Filter │
│  ├─ UEquipmentManagerComponent (Attachment Database)                        │
│  │  └─ Operations: Equip/Unequip, Get Slots, Validate Equipment             │
│  └─ UCraftingComponent (Recipe Execution)                                   │
│     └─ Operations: Can Craft, Craft Item, Validate Ingredients              │
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
│           ├─ UPickupSpawningSubsystem    ├─ ULootingSubsystem               │
│           │  (WorldSubsystem)            │  (WorldSubsystem)                │
│           ├─ IMounteaPickupInterface     ├─ UVendorSubsystem                │
│           └─ IMounteaDroppableInterface  │  (WorldSubsystem)                │
│                                          ├─ IMounteaLootableInterface       │
│                                          └─ IMounteaVendorInterface         │
│                                                                             │
│           Operations:                    Operations:                        │
│           - Pickup Item                  - Request Loot Access              │
│           - Drop Item                    - Transfer Items                   │
│           - Spawn Pickup Actor           - Buy/Sell                         │
│           - Pickup Pooling               - Calculate Price                  │
│                                          - Manage Sessions                  │
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
│           ├─ UInventoryUISubsystem       ├─ UEquipmentUISubsystem           │
│           │  (UI Bridge)                 │  (UI Bridge)                     │
│           │  LocalPlayerSubsystem        │  LocalPlayerSubsystem            │
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
│           ├─ UNotificationSubsystem                                         │
│           │  (Event Processing)                                             │
│           │  LocalPlayerSubsystem                                           │
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
┌─────────────────────────────────────────────────────────────────────────────┐
│                   SUBSYSTEM & COMPONENT RELATIONSHIPS                       │
└─────────────────────────────────────────────────────────────────────────────┘

GAME INSTANCE SUBSYSTEMS (Global, Persistent)
    ┌──────────────────────────────┐
    │ UInventoryConfigSubsystem    │
    │ ───────────────────────────  │
    │ Type: GameInstanceSubsystem  │
    │                              │
    │ Contains:                    │
    │ - Cached Inventory Configs   │
    │ - Cached Equipment Configs   │
    │ - Cached Item Templates      │
    │ - Cached Recipe Templates    │
    └──────────────────────────────┘

LOCAL PLAYER SUBSYSTEMS (Per-Player, Persistent)
    ┌──────────────────────────────┐
    │ URecipeKnowledgeSubsystem    │
    │ ───────────────────────────  │
    │ Type: LocalPlayerSubsystem   │
    │ Implements:                  │
    │ - IRecipeKnowledgeInterface  │
    │                              │
    │ Contains:                    │
    │ - Known Recipes (SaveGame)   │
    │                              │
    │ Operations:                  │
    │ - LearnRecipe()              │
    │ - ForgetRecipe()             │
    │ - IsRecipeKnown()            │
    │ - GetKnownRecipes()          │
    └──────────────────────────────┘

    ┌──────────────────────────────┐         ┌──────────────────────────────┐
    │ UInventoryUISubsystem        │         │ UEquipmentUISubsystem        │
    │ ───────────────────────────  │         │ ───────────────────────────  │
    │ Type: LocalPlayerSubsystem   │         │ Type: LocalPlayerSubsystem   │
    │ Implements:                  │         │ Implements:                  │
    │ - IInventoryUIInterface      │         │ - IEquipmentUIInterface      │
    │                              │         │                              │
    │ References:                  │         │ References:                  │
    │ - InventoryManagerComponent  │         │ - EquipmentManagerComponent  │
    │ - Active Inventory Widget    │         │ - Active Equipment Widget    │
    │ - UI State (sort, filters)   │         │ - Quick Access State         │
    └──────────────────────────────┘         └──────────────────────────────┘

    ┌──────────────────────────────┐
    │ UNotificationSubsystem       │
    │ ───────────────────────────  │
    │ Type: LocalPlayerSubsystem   │
    │ Implements:                  │
    │ - INotificationInterface     │
    │                              │
    │ Contains:                    │
    │ - Notification Queue         │
    │ - Active Notifications       │
    │ - Notification Container     │
    └──────────────────────────────┘

WORLD SUBSYSTEMS (Per-Level, Non-Persistent)
    ┌──────────────────────────────┐
    │ ULootingSubsystem            │
    │ ───────────────────────────  │
    │ Type: WorldSubsystem         │
    │ Implements:                  │
    │ - ILootingSystemInterface    │
    │                              │
    │ Contains:                    │
    │ - Active Loot Sessions       │
    │ - Loot Access Rules          │
    └──────────────────────────────┘

    ┌──────────────────────────────┐         ┌──────────────────────────────┐
    │ UVendorSubsystem             │         │ UPickupSpawningSubsystem     │
    │ ───────────────────────────  │         │ ───────────────────────────  │
    │ Type: WorldSubsystem         │         │ Type: WorldSubsystem         │
    │ Implements:                  │         │ Implements:                  │
    │ - IVendorSystemInterface     │         │ - IPickupSystemInterface     │
    │                              │         │                              │
    │ Contains:                    │         │ Contains:                    │
    │ - Active Vendor Sessions     │         │ - Pickup Object Pool         │
    │ - Price Calculation Rules    │         │ - Active Pickups             │
    └──────────────────────────────┘         └──────────────────────────────┘

ACTOR COMPONENTS (Per-Actor, Replicated)
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ACTOR (Player/NPC)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
    ┌───────────────────────┐ ┌───────────────┐ ┌─────────────────────┐
    │ UInventoryManager     │ │ UEquipment    │ │ UCrafting           │
    │ Component             │ │ Manager       │ │ Component           │
    │ ──────────────────    │ │ Component     │ │ ──────────────────  │
    │ Implements:           │ │ ───────────   │ │ Implements:         │
    │ - IInventoryInterface │ │ Implements:   │ │ - ICraftingInterface│
    │                       │ │ - IEquipment  │ │                     │
    │ Contains:             │ │   Interface   │ │ Requires:           │
    │ - FInventoryItemArray │ │ - IAttachment │ │ - InventoryManager  │
    │   (Replicated)        │ │   Container   │ │ - RecipeKnowledge   │
    │                       │ │               │ │   Subsystem         │
    │ References:           │ │ Contains:     │ │                     │
    │ - EquipmentManager ───┼─┼─────────────> │ │ Operations:         │
    │ - NotificationSubsys  │ │ - FEquipment  │ │ - CanCraft()        │
    │ - ConfigSubsystem     │ │   SlotArray   │ │ - CraftItem()       │
    └───────────────────────┘ │   (Replicated)│ │ - ValidateIngr()    │
                              │ - Attachment  │ └─────────────────────┘
                              │   Slots       │
                              └───────────────┘

Widget Hierarchy remains unchanged (see original diagram)


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

### 3.1 Subsystem & Component Hierarchy

```
UGameInstanceSubsystem
│
└─ UInventoryConfigSubsystem
   ├─ Implements: IMounteaConfigProviderInterface
   └─ Contains: Cached Configs & Templates

ULocalPlayerSubsystem
│
├─ URecipeKnowledgeSubsystem
│  ├─ Implements: IMounteaRecipeKnowledgeInterface
│  └─ Contains: TMap<FGuid, FRecipeKnowledge>
│
├─ UInventoryUISubsystem
│  ├─ Implements: IMounteaInventoryUIInterface
│  └─ References: UInventoryManagerComponent
│
├─ UEquipmentUISubsystem
│  ├─ Implements: IMounteaEquipmentUIInterface
│  └─ References: UEquipmentManagerComponent
│
└─ UNotificationSubsystem
   ├─ Implements: IMounteaNotificationInterface
   └─ Contains: TArray<FInventoryNotificationData>

UWorldSubsystem
│
├─ ULootingSubsystem
│  ├─ Implements: IMounteaLootingSystemInterface
│  └─ Contains: TMap<APlayerController*, FActiveLootSession>
│
├─ UVendorSubsystem
│  ├─ Implements: IMounteaVendorSystemInterface
│  └─ Contains: TMap<APlayerController*, FActiveVendorSession>
│
└─ UPickupSpawningSubsystem
   ├─ Implements: IMounteaPickupSystemInterface
   └─ Contains: Pickup Object Pool

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
└─ UCraftingComponent
   ├─ Implements: IMounteaCraftingInterface
   └─ Requires: UInventoryManagerComponent, URecipeKnowledgeSubsystem
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
├─ IMounteaConfigProviderInterface
│  └─ Configuration caching and retrieval
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
├─ IMounteaLootingSystemInterface
│  └─ Loot session management
│
├─ IMounteaVendorSystemInterface
│  └─ Vendor transaction management
│
├─ IMounteaPickupSystemInterface
│  └─ Pickup spawning and pooling
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

**Implementers:** URecipeKnowledgeSubsystem

**Responsibilities:**

- Learn recipe (permanent or temporary)
- Forget recipe
- Check if recipe is known
- Get all known recipes
- Get recipes by category/tags
- Save/load recipe knowledge
- Handle recipe discovery

---

#### IMounteaConfigProviderInterface

**Purpose:** Configuration caching and fast access

**Implementers:** UInventoryConfigSubsystem

**Responsibilities:**

- Cache inventory configurations
- Cache equipment configurations
- Cache item templates
- Cache recipe templates
- Provide fast config lookups
- Preload configurations at startup

---

#### IMounteaLootingSystemInterface

**Purpose:** Loot session management

**Implementers:** ULootingSubsystem

**Responsibilities:**

- Request loot access
- Close loot sessions
- Validate loot distance
- Transfer items between inventories
- Manage active loot sessions
- Apply loot filters

---

#### IMounteaVendorSystemInterface

**Purpose:** Vendor transaction management

**Implementers:** UVendorSubsystem

**Responsibilities:**

- Calculate buy prices
- Calculate sell prices
- Process buy transactions
- Process sell transactions
- Validate transactions
- Manage active vendor sessions

---

#### IMounteaPickupSystemInterface

**Purpose:** Pickup spawning and object pooling

**Implementers:** UPickupSpawningSubsystem

**Responsibilities:**

- Spawn pickup actors
- Despawn pickup actors
- Manage pickup object pool
- Return pickups to pool
- Clear all pickups in level

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

**Implementers:** UInventoryUISubsystem

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

**Implementers:** UEquipmentUISubsystem

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

**Implementers:** UNotificationSubsystem

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
