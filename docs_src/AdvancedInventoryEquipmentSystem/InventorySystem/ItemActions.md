# Item Actions

## What You'll Learn

- Understanding the item action system powered by Gameplay Ability System
- Creating custom actions for inventory items
- Implementing visibility and permission logic
- Using Blueprint and C++ action patterns
- Integrating with GAS for cooldowns, costs, and effects
- Building common action types (consume, equip, drop, split)

## Quick Start

```cpp
// Execute an action on an item
bool Success = ItemAction->ExecuteInventoryAction(TargetItem);

// Check if action is available
bool CanUse = ItemAction->IsActionVisible(Item) && ItemAction->IsAllowed(Item);

// Get user-friendly error message
FText WhyNot = ItemAction->GetDisallowedReason(Item);
```

!!! tip "Result"
    Context-sensitive actions that appear dynamically based on item properties, with full GAS integration for complex gameplay mechanics.

## Core Concepts

### What Are Item Actions?

Item actions define what players can do with inventory items - use a potion, equip a sword, drop an item, or split a stack. Think of them as the verbs in your inventory system: the actions give meaning to the nouns (items).

**Real-World Analogy**: Like context menus on your computer - right-click a file and see relevant actions (Open, Copy, Delete, Rename). The available options change based on what type of file you selected.

### Action System Architecture

The system builds on Unreal's Gameplay Ability System (GAS), inheriting powerful features while adding inventory-specific functionality:

```cpp
// Base action class extends UGameplayAbility
class UMounteaInventoryItemAction : public UGameplayAbility
{
    // Inventory-specific properties
    FText ActionDisplayName;        // "Consume Potion"
    FText ActionDescription;        // "Restores 50 health points"
    TSoftObjectPtr<UTexture2D> ActionIcon;  // Potion drinking icon
    int32 ActionPriority = 0;       // Sort order in UI
    bool bRequiresConfirmation;     // Show "Are you sure?" dialog
    
    // Core functionality
    virtual bool IsActionVisible(const FInventoryItem& TargetItem) const;
    virtual bool IsAllowed(const FInventoryItem& TargetItem) const;
    virtual bool ProcessAction(UObject* ActionInitiator, const FInventoryItem& TargetItem);
};
```

!!! question "Why GAS Integration?"
    - **Cooldowns**: Prevent action spam (can't drink potions too quickly)
    - **Costs**: Actions can consume resources (mana, stamina)
    - **Effects**: Apply gameplay effects (healing, buffs, debuffs)
    - **Targeting**: Support complex targeting systems
    - **Networking**: Automatic client-server synchronization
    - **Modular**: Easy to extend with custom logic

### Action Lifecycle

Every action follows a predictable lifecycle when executed:

1. **Visibility Check**: Should this action appear in the UI?
2. **Permission Check**: Is the action currently allowed?
3. **Confirmation**: Does the action need user confirmation?
4. **Execution**: Run the action logic
5. **Effects**: Apply any gameplay effects
6. **Cleanup**: Handle post-action state

```cpp
// Complete action execution flow
bool ExecuteItemAction(UMounteaInventoryItemAction* Action, const FInventoryItem& Item)
{
    // 1. Check visibility
    if (!Action->IsActionVisible(Item))
        return false;  // Action not applicable to this item
    
    // 2. Check permissions
    if (!Action->IsAllowed(Item))
    {
        ShowErrorMessage(Action->GetDisallowedReason(Item));
        return false;
    }
    
    // 3. Handle confirmation if needed
    if (Action->bRequiresConfirmation)
    {
        if (!ShowConfirmationDialog(Action->ActionDisplayName))
            return false;  // User cancelled
    }
    
    // 4. Execute the action
    return Action->ExecuteInventoryAction(Item);
}
```

## Built-in Action Types

### Consume Action

The consume action handles using consumable items like potions, food, or temporary buffs:

```cpp
// UMounteaConsumeItemAction - Predefined consume behavior
class UMounteaConsumeItemAction : public UMounteaInventoryItemAction
{
protected:
    // Only show for consumable items
    virtual bool IsActionVisible_Implementation(const FInventoryItem& TargetItem) const override
    {
        if (!TargetItem.IsItemValid())
            return false;
            
        // Check if item has consumable flag
        return static_cast<uint8>(TargetItem.GetTemplate()->ItemFlags) & 
               static_cast<uint8>(EInventoryItemFlags::EIIF_Consumable);
    }
    
    // Allow if item has quantity > 0
    virtual bool IsAllowed_Implementation(const FInventoryItem& TargetItem) const override
    {
        return TargetItem.GetQuantity() > 0;
    }
    
    // Reduce quantity and apply effects
    virtual bool ProcessAction_Implementation(UObject* ActionInitiator, const FInventoryItem& TargetItem) override
    {
        // Reduce item quantity by 1
        auto OwningInventory = TargetItem.GetOwningInventory();
        if (!OwningInventory.GetObject())
            return false;
            
        bool Success = OwningInventory->Execute_DecreaseItemQuantity(
            OwningInventory.GetObject(), 
            TargetItem.GetGuid(), 
            1
        );
        
        if (Success)
        {
            // Apply any configured gameplay effects
            ApplyActionEffects();
            
            // Trigger Blueprint event for custom logic
            ReceiveActionCompleted(TargetItem);
        }
        
        return Success;
    }
};
```

!!! tip "Typical Consume Effects"
    - Health potions: Restore HP over time
    - Mana potions: Instantly restore MP
    - Food items: Temporary stat bonuses
    - Scrolls: Cast spells or grant abilities

### Equip Action

The equip action handles putting on armor, weapons, and accessories:

```cpp
// UMounteaEquipItemAction - Equipment functionality
class UMounteaEquipItemAction : public UMounteaInventoryItemAction
{
protected:
    // Show for non-consumable items that can be equipped
    virtual bool IsActionVisible_Implementation(const FInventoryItem& TargetItem) const override
    {
        if (!TargetItem.IsItemValid())
            return false;
            
        // Hide for consumable items
        if (static_cast<uint8>(TargetItem.GetTemplate()->ItemFlags) & 
            static_cast<uint8>(EInventoryItemFlags::EIIF_Consumable))
            return false;
            
        // Show if item has a spawn actor (something to equip)
        return TargetItem.GetTemplate()->SpawnActor.IsValid();
    }
    
    // Allow if equipment system is available and item isn't broken
    virtual bool IsAllowed_Implementation(const FInventoryItem& TargetItem) const override
    {
        // Check for equipment interface
        auto EquipmentInterface = GetEquipmentInterface(GetAvatarActorFromActorInfo());
        if (!EquipmentInterface.GetObject())
            return false;
        
        // Don't equip broken items
        if (TargetItem.GetTemplate()->bHasDurability && 
            FMath::IsNearlyZero(TargetItem.GetDurability()))
            return false;
            
        return true;
    }
    
    // Spawn and attach item actor
    virtual bool ProcessAction_Implementation(UObject* ActionInitiator, const FInventoryItem& TargetItem) override
    {
        auto EquipmentInterface = GetEquipmentInterface(ActionInitiator);
        if (!EquipmentInterface.GetObject())
            return false;
        
        // Load the actor class to spawn
        UClass* ActorClass = TargetItem.GetTemplate()->SpawnActor.LoadSynchronous();
        if (!ActorClass)
            return false;
        
        // Spawn the equipment actor
        AActor* EquipmentActor = GetWorld()->SpawnActor<AActor>(
            ActorClass, 
            FVector::ZeroVector, 
            FRotator::ZeroRotator
        );
        
        if (EquipmentActor)
        {
            // Attach to equipment system
            bool Success = EquipmentInterface->Execute_EquipItem(
                EquipmentInterface.GetObject(),
                TargetItem,
                EquipmentActor
            );
            
            if (Success)
            {
                ReceiveActionCompleted(TargetItem);
                return true;
            }
            else
            {
                // Failed to equip - clean up spawned actor
                EquipmentActor->Destroy();
            }
        }
        
        return false;
    }
};
```

## Creating Custom Actions

### C++ Implementation Pattern

Custom actions follow a consistent pattern for maximum flexibility:

```cpp
// Example: Repair Item Action
UCLASS(BlueprintType, Blueprintable, DisplayName="Repair Item Action")
class URepairItemAction : public UMounteaInventoryItemAction
{
    GENERATED_BODY()

public:
    URepairItemAction()
    {
        // Set display properties
        ActionDisplayName = NSLOCTEXT("ItemActions", "RepairAction", "Repair");
        ActionDescription = NSLOCTEXT("ItemActions", "RepairDesc", "Restore item durability");
        ActionPriority = 10;  // Lower priority than consume/equip
        bRequiresConfirmation = true;  // Confirm before spending resources
    }

protected:
    // Show only for damaged, repairable items
    virtual bool IsActionVisible_Implementation(const FInventoryItem& TargetItem) const override
    {
        if (!TargetItem.IsItemValid())
            return false;
            
        auto Template = TargetItem.GetTemplate();
        
        // Must support durability
        if (!Template->bHasDurability)
            return false;
            
        // Must be damaged
        return TargetItem.GetDurability() < Template->MaxDurability;
    }
    
    // Allow if player has repair materials
    virtual bool IsAllowed_Implementation(const FInventoryItem& TargetItem) const override
    {
        // Check if player has repair kit in inventory
        auto OwningInventory = TargetItem.GetOwningInventory();
        if (!OwningInventory.GetObject())
            return false;
            
        FInventoryItemSearchParams SearchParams;
        SearchParams.SearchByCategory = true;
        SearchParams.CategoryToFind = TEXT("RepairKit");
        
        return OwningInventory->Execute_HasItem(OwningInventory.GetObject(), SearchParams);
    }
    
    virtual FText GetDisallowedReason_Implementation(const FInventoryItem& TargetItem) const override
    {
        return NSLOCTEXT("ItemActions", "NoRepairKit", "You need a repair kit to fix this item");
    }
    
    // Repair logic
    virtual bool ProcessAction_Implementation(UObject* ActionInitiator, const FInventoryItem& TargetItem) override
    {
        auto OwningInventory = TargetItem.GetOwningInventory();
        if (!OwningInventory.GetObject())
            return false;
        
        // Find and consume repair kit
        FInventoryItemSearchParams SearchParams;
        SearchParams.SearchByCategory = true;
        SearchParams.CategoryToFind = TEXT("RepairKit");
        
        FInventoryItem RepairKit = OwningInventory->Execute_FindItem(
            OwningInventory.GetObject(), SearchParams
        );
        
        if (!RepairKit.IsItemValid())
            return false;
        
        // Use one repair kit
        bool KitUsed = OwningInventory->Execute_DecreaseItemQuantity(
            OwningInventory.GetObject(), RepairKit.GetGuid(), 1
        );
        
        if (!KitUsed)
            return false;
        
        // Restore durability
        float NewDurability = FMath::Min(
            TargetItem.GetDurability() + 25.0f,  // Repair 25 points
            TargetItem.GetTemplate()->MaxDurability
        );
        
        bool RepairSuccess = OwningInventory->Execute_ModifyItemDurability(
            OwningInventory.GetObject(),
            TargetItem.GetGuid(),
            NewDurability - TargetItem.GetDurability()
        );
        
        if (RepairSuccess)
        {
            ReceiveActionCompleted(TargetItem);
        }
        
        return RepairSuccess;
    }
};
```

### Blueprint Implementation

Actions can be implemented entirely in Blueprint for rapid prototyping:

```cpp
// Blueprint events you can override
UFUNCTION(BlueprintImplementableEvent, DisplayName="On Execute Action")
void ReceiveExecuteAction(const FInventoryItem& TargetItem);

UFUNCTION(BlueprintImplementableEvent, DisplayName="On Action Completed")
void ReceiveActionCompleted(const FInventoryItem& TargetItem);

UFUNCTION(BlueprintImplementableEvent, DisplayName="On Action Failed")
void ReceiveActionFailed(const FInventoryItem& TargetItem, const FText& Reason);
```

!!! success "Blueprint Action Example - Split Stack"
    1. **Is Action Visible**: Check if item quantity > 1
    2. **Is Allowed**: Check if inventory has empty slots
    3. **Process Action**: Show quantity selection widget, split stack
    4. **On Completed**: Update UI, play sound effect

## Advanced Patterns

### Context-Sensitive Actions

Actions can change behavior based on game context:

```cpp
// Smart equip action that handles different contexts
class USmartEquipAction : public UMounteaInventoryItemAction
{
protected:
    virtual bool ProcessAction_Implementation(UObject* ActionInitiator, const FInventoryItem& TargetItem) override
    {
        auto EquipmentInterface = GetEquipmentInterface(ActionInitiator);
        
        // Check if item is already equipped
        if (IsItemCurrentlyEquipped(TargetItem))
        {
            // Unequip instead of equip
            return EquipmentInterface->Execute_UnequipItem(
                EquipmentInterface.GetObject(), TargetItem.GetGuid()
            );
        }
        else
        {
            // Check if slot is occupied
            FGameplayTag SlotTag = GetRequiredSlotForItem(TargetItem);
            
            if (IsSlotOccupied(SlotTag))
            {
                // Swap with currently equipped item
                return EquipmentInterface->Execute_SwapEquippedItem(
                    EquipmentInterface.GetObject(), TargetItem, SlotTag
                );
            }
            else
            {
                // Normal equip
                return EquipmentInterface->Execute_EquipItem(
                    EquipmentInterface.GetObject(), TargetItem, SlotTag
                );
            }
        }
    }
};
```

### Multi-Step Actions

Complex actions can use GAS tasks for multi-step processes:

```cpp
// Crafting action with confirmation and animation
class UCraftingAction : public UMounteaInventoryItemAction
{
protected:
    virtual bool ProcessAction_Implementation(UObject* ActionInitiator, const FInventoryItem& TargetItem) override
    {
        // Start crafting animation
        StartCraftingAnimation();
        
        // Use GAS task for timed action
        UAbilityTask_WaitDelay* DelayTask = UAbilityTask_WaitDelay::WaitDelay(
            this, 3.0f  // 3 second crafting time
        );
        
        DelayTask->OnFinish.AddDynamic(this, &UCraftingAction::OnCraftingComplete);
        DelayTask->ReadyForActivation();
        
        return true;
    }
    
    UFUNCTION()
    void OnCraftingComplete()
    {
        // Consume materials and create result
        ConsumeCraftingMaterials();
        CreateCraftedItem();
        
        ReceiveActionCompleted(GetTargetItem());
        EndAbility(CurrentSpecHandle, CurrentActorInfo, CurrentActivationInfo, true, false);
    }
};
```

### Action Chaining

Actions can trigger other actions automatically:

```cpp
// Consume action that triggers equipment repair
class UConsumableRepairAction : public UMounteaConsumeItemAction
{
protected:
    virtual bool ProcessAction_Implementation(UObject* ActionInitiator, const FInventoryItem& TargetItem) override
    {
        // First consume the item normally
        bool ConsumeSuccess = Super::ProcessAction_Implementation(ActionInitiator, TargetItem);
        
        if (ConsumeSuccess)
        {
            // Then repair all equipped items
            auto EquipmentInterface = GetEquipmentInterface(ActionInitiator);
            if (EquipmentInterface.GetObject())
            {
                RepairAllEquippedItems(EquipmentInterface);
            }
        }
        
        return ConsumeSuccess;
    }
    
private:
    void RepairAllEquippedItems(TScriptInterface<IMounteaAdvancedEquipmentInterface> Equipment)
    {
        TArray<FInventoryItem> EquippedItems = Equipment->Execute_GetAllEquippedItems(Equipment.GetObject());
        
        for (FInventoryItem& Item : EquippedItems)
        {
            if (Item.GetTemplate()->bHasDurability)
            {
                float RepairAmount = Item.GetTemplate()->MaxDurability * 0.1f;  // 10% repair
                Equipment->Execute_ModifyEquippedItemDurability(
                    Equipment.GetObject(), Item.GetGuid(), RepairAmount
                );
            }
        }
    }
};
```

## Action Management

### Action Registration

Actions are typically registered with items through templates or dynamically:

```cpp
// Static action registration in game mode
class AMyGameMode : public AGameModeBase
{
public:
    virtual void BeginPlay() override
    {
        Super::BeginPlay();
        RegisterItemActions();
    }
    
private:
    void RegisterItemActions()
    {
        // Get action manager
        auto ActionManager = GetWorld()->GetSubsystem<UItemActionManager>();
        
        // Register global actions (available to all items)
        ActionManager->RegisterGlobalAction(UDropItemAction::StaticClass());
        ActionManager->RegisterGlobalAction(USplitStackAction::StaticClass());
        
        // Register category-specific actions
        ActionManager->RegisterCategoryAction(TEXT("Weapon"), UEquipItemAction::StaticClass());
        ActionManager->RegisterCategoryAction(TEXT("Armor"), UEquipItemAction::StaticClass());
        ActionManager->RegisterCategoryAction(TEXT("Consumable"), UMounteaConsumeItemAction::StaticClass());
        
        // Register template-specific actions
        if (UMounteaInventoryItemTemplate* HealthPotionTemplate = LoadHealthPotionTemplate())
        {
            ActionManager->RegisterTemplateAction(HealthPotionTemplate, UHealingAction::StaticClass());
        }
    }
};
```

### Dynamic Action Discovery

Actions can be discovered automatically based on gameplay tags:

```cpp
// Action manager that finds actions based on item tags
TArray<UMounteaInventoryItemAction*> GetAvailableActions(const FInventoryItem& Item)
{
    TArray<UMounteaInventoryItemAction*> AvailableActions;
    
    if (!Item.IsItemValid())
        return AvailableActions;
    
    // Check all registered actions
    for (auto ActionClass : RegisteredActionClasses)
    {
        UMounteaInventoryItemAction* ActionInstance = CreateActionInstance(ActionClass);
        
        if (ActionInstance && ActionInstance->IsActionVisible(Item))
        {
            AvailableActions.Add(ActionInstance);
        }
    }
    
    // Sort by priority
    AvailableActions.Sort([](const UMounteaInventoryItemAction& A, const UMounteaInventoryItemAction& B)
    {
        return A.ActionPriority < B.ActionPriority;
    });
    
    return AvailableActions;
}
```

## UI Integration

### Action Menu Generation

Actions automatically populate context menus:

```cpp
// Widget that shows available actions
class UItemActionMenuWidget : public UUserWidget
{
public:
    void PopulateActionsForItem(const FInventoryItem& Item)
    {
        ActionButtonContainer->ClearChildren();
        
        TArray<UMounteaInventoryItemAction*> Actions = GetAvailableActions(Item);
        
        for (UMounteaInventoryItemAction* Action : Actions)
        {
            // Create button for this action
            UButton* ActionButton = CreateWidget<UButton>(this, ActionButtonClass);
            
            // Set button text and icon
            auto ButtonText = ActionButton->FindChildOfType<UTextBlock>("ActionText");
            if (ButtonText)
                ButtonText->SetText(Action->ActionDisplayName);
            
            auto ButtonIcon = ActionButton->FindChildOfType<UImage>("ActionIcon");
            if (ButtonIcon && Action->ActionIcon.IsValid())
                ButtonIcon->SetBrushFromTexture(Action->ActionIcon.LoadSynchronous());
            
            // Bind click event
            ActionButton->OnClicked.AddDynamic(this, &UItemActionMenuWidget::OnActionClicked);
            
            // Store action reference
            ActionButton->SetTag(FName(*FString::FromInt(Actions.Find(Action))));
            
            // Enable/disable based on permissions
            ActionButton->SetIsEnabled(Action->IsAllowed(Item));
            if (!ActionButton->GetIsEnabled())
            {
                ActionButton->SetToolTipText(Action->GetDisallowedReason(Item));
            }
            
            ActionButtonContainer->AddChild(ActionButton);
        }
    }
    
    UFUNCTION()
    void OnActionClicked()
    {
        UButton* ClickedButton = Cast<UButton>(FSlateApplication::Get().GetUserFocusedWidget());
        if (!ClickedButton)
            return;
        
        int32 ActionIndex = FCString::Atoi(*ClickedButton->GetTag().ToString());
        if (CachedActions.IsValidIndex(ActionIndex))
        {
            CachedActions[ActionIndex]->ExecuteInventoryAction(CurrentItem);
        }
        
        // Close menu after action
        SetVisibility(ESlateVisibility::Collapsed);
    }
};
```

## Best Practices

### Action Design Principles

- **Single Responsibility**: Each action should do one thing well
- **Consistent Interface**: Use the same visibility/permission pattern
- **Clear Feedback**: Provide meaningful error messages
- **Confirmation for Destructive Actions**: Require confirmation for permanent changes
- **Performance Awareness**: Cache expensive checks, avoid heavy operations in visibility checks

### Error Handling

```cpp
// Robust action execution with error handling
bool ExecuteActionSafely(UMounteaInventoryItemAction* Action, const FInventoryItem& Item)
{
    if (!Action || !Item.IsItemValid())
    {
        LOG_ERROR(TEXT("Invalid action or item"));
        return false;
    }
    
    try
    {
        // Pre-execution validation
        if (!Action->IsActionVisible(Item))
        {
            LOG_WARNING(TEXT("Action %s not visible for item %s"), 
                *Action->ActionDisplayName.ToString(), 
                *Item.ToString());
            return false;
        }
        
        if (!Action->IsAllowed(Item))
        {
            FText Reason = Action->GetDisallowedReason(Item);
            ShowUserMessage(Reason);
            return false;
        }
        
        // Execute action
        return Action->ExecuteInventoryAction(Item);
    }
    catch (const std::exception& e)
    {
        LOG_ERROR(TEXT("Action execution failed: %s"), *FString(e.what()));
        return false;
    }
}
```

### Performance Optimization

!!! warning "Problem & Solution"
    - **Action Pooling**: Reuse action instances instead of creating new ones
    - **Lazy Loading**: Load action classes only when needed
    - **Batch Updates**: Group multiple action results for UI updates
    - **Async Operations**: Use GAS tasks for time-consuming actions

## Troubleshooting

### Action Not Appearing

!!! tip "Problem & Solution"
    - Check `IsActionVisible` implementation
    - Verify item flags match expected values
    - Ensure action is registered with the system

### Action Disabled

!!! tip "Problem & Solution"
    - Review `IsAllowed` logic
    - Check prerequisites (inventory space, resources, etc.)
    - Validate item state (durability, quantity)

### GAS Integration Issues

!!! tip "Problem & Solution"
    - Ensure actor has AbilitySystemComponent
    - Check ability tags and requirements
    - Verify network authority for multiplayer

### Performance Problems

!!! tip "Problem & Solution"
    - Profile visibility checks for expensive operations
    - Cache action instances instead of recreating
    - Use gameplay tags for efficient filtering

## Next Steps

- **[Inventory Component](InventoryComponent.md):** Manage collections of item instances
- **[Equipment System](../EquipmentSystem/EquipmentSystem.md):** Equip and manage worn items  
- **[UI System](../UserInterface/InventoryUI.md):** Create responsive inventory interfaces
