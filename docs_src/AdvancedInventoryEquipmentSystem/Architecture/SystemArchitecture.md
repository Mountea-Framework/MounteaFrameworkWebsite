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