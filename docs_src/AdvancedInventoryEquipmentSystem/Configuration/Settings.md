# Mountea Advanced Inventory: Configuration Guide

This guide walks you through configuring the **Mountea Advanced Inventory** plugin—combining clear explanations, default-value tables, and code snippets to help both designers and developers.

---

## 1. Quick Setup

1. **Project Settings**
   Open **Edit → Project Settings → Mountea Framework → Inventory System**.
2. **Assign Data Assets & Mappings**

   | Property                | What to Assign                                       |
   | ----------------------- | ---------------------------------------------------- |
   | Inventory Config        | Your `UMounteaAdvancedInventorySettingsConfig` asset |
   | Equipment Config        | Your `UMounteaAdvancedEquipmentSettingsConfig` asset |
   | Input Mapping           | `UInputMappingContext` for inventory hotkeys         |
   | Equipment Input Mapping | Separate context for equipment panel                 |

---

## 2. Inventory Types & Defaults

Inventories control how items are stored, stacked, and capped. The plugin provides sensible defaults, which you can override in your Data Asset.

| Type            | Slots Min→Max | Limit Type | Default Cap    | Stackable | Persistent | Notes                                    |
| --------------- | ------------- | ---------- | -------------- | --------- | ---------- | ---------------------------------------- |
| **Player**      | 30 → 50       | Weight     | 75.0 kg        | ✔         | ✔          | Speed scales at weight thresholds        |
| **NPC**         | 15 → 30       | Weight     | 50.0 kg        | ✔         | ✘          | Lootable after death                     |
| **Storage**     | 50 → 200      | Weight     | 300.0 kg       | ✔         | ✔          | Shared chest-like inventory              |
| **Merchant**    | 50 → 50       | Value      | 5000.0 credits | ✔         | ✘          | Buy/sell interface                       |
| **Loot**        | 1 → 30        | —          | —              | ✔         | Temporary  | Public pickup container                  |
| **Specialized** | 20 → 20       | —          | —              | ✘         | ✘          | Custom behavior (e.g. quest item holder) |

> **Override example:**
> In your `InventoryConfig` Data Asset, edit the row for `Player` to increase max slots to 60.

---

## 3. Code Usage Examples

### 3.1 Accessing Settings Singleton

```cpp
// Get the project settings instance
UMounteaAdvancedInventorySettings* Settings = GetDefault<UMounteaAdvancedInventorySettings>();

// Read or fall back to defaults
TArray<FString> Categories = Settings->GetAllowedCategories();
TArray<FString> Rarities  = Settings->GetAllowedRarities();
```

### 3.2 Widget Commands

The plugin auto-registers a set of UI commands. You can retrieve or customize them:

```cpp
// After loading settings
const TArray<FString>& Commands = Settings->GetWidgetCommands();
for (const FString& Cmd : Commands) {
    LOG_INFO(TEXT("Inventory listens to: %s"), *Cmd);
}
```

### 3.3 Applying a Theme

Call this in your widget’s `NativeConstruct()` to apply colors defined in your theme Data Asset:

```cpp
Super::NativeConstruct();
// Apply plugin theme to this widget
UMounteaInventoryUIStatics::ApplyTheme(this);
```

!!! warning "Important"

    In order to be able to receive the `ApplyTheme` event, your User widget must implement `IMounteaInventoryGenericWidgetInterface` 
    or be a child of `UMounteaAdvancedInventoryBaseWidget`.

---

## 4. UI Layout & Behavior Defaults

| Setting             | Default Value      | Description                             |
| ------------------- | ------------------ | --------------------------------------- |
| Grid Dimensions     | 5 columns × 8 rows | Number of item slots in inventory panel |
| Item Slot Size      | 128 × 128 px       | Width and height per slot               |
| Slot Padding        | 5 px               | Spacing between slots                   |
| Auto-Stack          | Enabled            | Merge identical items on pick-up        |
| Drag & Drop         | Enabled            | Allow manual rearrangement              |
| Notification Widget | Default class      | Pop-up when items are added/removed     |

> **Tip:** Tweak `Slot Size` and `Padding` for mobile vs desktop layouts.

---

## 5. Categories & Rarities

### Categories (Editor Defaults)

| Key         | Display Name | Priority | Flags                 |
| ----------- | ------------ | -------- | --------------------- |
| Weapons     | Weapons      | 0        | Durable, Droppable    |
| Armors      | Armor        | 1        | Durable, Droppable    |
| Consumables | Consumables  | 2        | Consumable, Stackable |
| Materials   | Materials    | 3        | Craftable, Stackable  |
| Quest Items | Quest Items  | 4        | QuestItem             |
| Keys        | Keys         | 4        | QuestItem             |

### Rarities (Editor Defaults)

| Key       | Display Name | Color (RGB)     | Price × |
| --------- | ------------ | --------------- | ------- |
| Common    | Common       | (0.5, 0.5, 0.5) | 1.0     |
| Uncommon  | Uncommon     | (0.2, 0.8, 0.2) | 2.0     |
| Rare      | Rare         | (0.2, 0.2, 1.0) | 4.0     |
| Epic      | Epic         | (0.6, 0.2, 0.8) | 8.0     |
| Legendary | Legendary    | (1.0, 0.5, 0.0) | 16.0    |

> **Customization:** Drag entries in the Data Asset list to reorder display or change priority.

---

## 6. Equipment Slot Configuration

| Slot Name | Display Name | Tags Allowed    |
| --------- | ------------ | --------------- |
| MainHand  | Main Hand    | Weapon.Tag      |
| OffHand   | Off Hand     | Shield.Tag      |
| Helmet    | Helmet       | Armor.Head.Tag  |
| Chest     | Chest        | Armor.Chest.Tag |

```cpp
// Example: Adding a new "Backpack" slot
FMounteaEquipmentSlotHeaderData Backpack;
Backpack.DisplayName = LOCTEXT("SlotNames_Backpack", "Backpack");
Backpack.TagContainer.AddTag(BackpackTag);
SettingsConfig->AllowedEquipmentSlots.Add("Backpack", Backpack);
```

---

## 7. 3D Preview Widget

| Property             | Default   | Purpose                                    |
| -------------------- | --------- | ------------------------------------------ |
| Rotation Sensitivity | 1.0       | Speed of model rotation                    |
| Zoom Limits          | 0.5 - 2.0 | Min/max camera distance multiplier         |
| Pan Enabled          | Yes       | Whether the model can be dragged on screen |

> **Bind Inputs:** In your `InteractiveWidgetConfig`, map `Rotate`, `Zoom`, and `Pan` actions to player input.

---

## 8. Notification Defaults

| Event                 | Category | Template                       | Duration (s)   | Closeable |
| --------------------- | -------- | ------------------------------ | -------------- | --------- |
| InventoryLimitReached | Warning  | "Inventory Limit Reached"      | Engine default | Yes       |
| QuantityLimitReached  | Warning  | "\${itemName} Max Quantity"    | Engine default | Yes       |
| ItemAdded             | Info     | "\${quantity}x \${itemName}"   | 2.0            | Yes       |
| ItemRemoved           | Info     | "- \${quantity}x \${itemName}" | 2.0            | Yes       |
| ItemNotFound          | Error    | "\${itemName} Not Found"       | Engine default | Yes       |

---

## 9. Best Practices & Tips

* **Define Early:** Set core types and categories before major feature work.
* **Data-First Workflow:** Encourage designers to use Data Assets for tuning.
* **Version Assets:** Track your `.uasset` files in source control.
* **Playtest UI:** Adjust grid and padding based on resolution and aspect ratio.
* **Balance Limits:** Slot counts and weight caps should align with gameplay progression.

---

*For code snippets, defaults, and more details, reference the plugin’s sample content or dive into the C++ classes.*
