# Inventory UI Component

## What You'll Learn

- Setting up UI components for headless inventory systems
- Creating and managing widget hierarchies
- Implementing event-driven UI updates
- Building notification and feedback systems
- Managing category filtering and item selection
- Handling grid slot persistence and layout
- Integrating with configuration systems
- Performance optimization for UI responsiveness

## Quick Start

```cpp
// Add UI component to actor (alongside inventory component)
UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Inventory")
TObjectPtr<class UMounteaInventoryUIComponent> InventoryUIComponent;

// Create main UI
bool Success = InventoryUIComponent->Execute_CreateMainUIWrapper(InventoryUIComponent);

// Optionally handle selection events
InventoryUIComponent->OnItemSelected.AddDynamic(this, &AMyActor::OnItemSelected);
InventoryUIComponent->OnCategorySelected.AddDynamic(this, &AMyActor::OnCategorySelected);
```

!!! tip "Result"
    Complete UI management layer that automatically creates, updates, and synchronizes inventory interfaces with underlying data changes.

## Core Concepts

### UI Component Role

The Inventory UI Component serves as the presentation layer for the headless Inventory Component. Think of it as the display manager that translates data changes into visual updates.

!!! example "Real-World Analogy"
    Like a smart TV that connects to various streaming services - the TV (UI Component) handles display, menus, and user interaction, while the streaming service (Inventory Component) manages the actual content and data.

!!! question "Why separated UI COmponent?"
    Explanation is very simple - to actually simplify things! Your NPCs and lootable chests do not need to have UI elements available to them, as those
    objects are being interacted with, therefore the UI element should be displayed to player only.<br>
    Imagine this as a webpage - Inventory Component is a server which has all the data, your browser is the UI Component which shows the data to you.

### Architecture Overview

The UI Component acts as a bridge between data and presentation:

```cpp
class UMounteaInventoryUIComponent : public UActorComponent, public IMounteaAdvancedInventoryUIInterface
{
    // Core Properties
    TScriptInterface<IMounteaAdvancedInventoryInterface> ParentInventory;  // Data source
    TObjectPtr<UUserWidget> InventoryWidget;                               // Main UI widget
    TObjectPtr<UUserWidget> InventoryNotificationContainerWidget;          // Notification display
    TObjectPtr<UUserWidget> ActiveItemWidget;                              // Currently selected item
    
    // State Management
    FString ActiveCategoryId;                                              // Current filter
    FGuid ActiveItemGuid;                                                  // Selected item
    TSet<FMounteaInventoryGridSlot> SavedGridSlots;                        // Persistent layout of Grid Slots
    
    // Event Delegates
    FInventoryCategorySelected OnCategorySelected;                         // Event called when Category is selected
    FInventoryItemSelected OnItemSelected;                                 // Event called when Item is selected
};
```

!!! info "Key Responsibilities"
    - **Widget Management**: Create, destroy, and organize UI elements
    - **Event Translation**: Convert inventory changes to UI updates
    - **State Synchronization**: Keep visual state aligned with data state
    - **User Interaction**: Handle selection, filtering, and navigation
    - **Persistence**: Save/restore UI preferences and layouts
    - **Notification Display**: Show feedback for user actions

## Component Setup

### Basic Configuration

```cpp
// In your actor's constructor
AMyActor::AMyActor()
{
    // Create inventory component first (data layer)
    InventoryComponent = CreateDefaultSubobject<UMounteaInventoryComponent>(TEXT("InventoryComponent"));
    
    // Create UI component (presentation layer)
    InventoryUIComponent = CreateDefaultSubobject<UMounteaInventoryUIComponent>(TEXT("InventoryUIComponent"));
    
    // UI component doesn't replicate (client-side only)
    InventoryUIComponent->SetIsReplicatedByDefault(false);
}
```

### Automatic Parent Discovery

The UI Component automatically finds and connects to the inventory component:

```cpp
void UMounteaInventoryUIComponent::BeginPlay()
{
    Super::BeginPlay();

    // Only create UI for clients that can show cosmetic events
    if (GetOwner() && UMounteaInventorySystemStatics::CanExecuteCosmeticEvents(GetWorld()))
    {
        // Find parent inventory component
        auto inventoryComponent = GetOwner()->FindComponentByInterface(UMounteaAdvancedInventoryInterface::StaticClass());
        if (!IsValid(inventoryComponent))
        {
            LOG_ERROR(TEXT("Cannot find 'Inventory' component in Parent! UI will NOT work!"))
        }
        else
        {
            // Connect to parent inventory
            Execute_SetParentInventory(this, inventoryComponent);
            
            // Bind to inventory events for automatic UI updates
            ParentInventory->GetOnNotificationProcessedEventHandle().AddUniqueDynamic(this, &UMounteaInventoryUIComponent::CreateInventoryNotification);
            ParentInventory->GetOnItemAddedEventHandle().AddUniqueDynamic(this, &UMounteaInventoryUIComponent::ProcessItemAdded);
            ParentInventory->GetOnItemRemovedEventHandle().AddUniqueDynamic(this, &UMounteaInventoryUIComponent::ProcessItemRemoved);
            ParentInventory->GetOnItemDurabilityChangedEventHandle().AddUniqueDynamic(this, &UMounteaInventoryUIComponent::ProcessItemDurabilityChanged);
            ParentInventory->GetOnItemQuantityChangedEventHandle().AddUniqueDynamic(this, &UMounteaInventoryUIComponent::ProcessItemQuantityChanged);
        }
    }
}
```

!!! warning "Client-Side Only"
    UI components only activate on clients that can display cosmetic events. Dedicated servers skip UI creation entirely.

## Widget Management

### Main UI Creation

The component creates the primary interface widget from configuration:

```cpp
bool UMounteaInventoryUIComponent::CreateMainUIWrapper_Implementation()
{
    // Load widget class from settings
    const UMounteaAdvancedInventorySettingsConfig* Config = GetDefault<UMounteaAdvancedInventorySettings>()->InventorySettingsConfig.LoadSynchronous();
    if (!Config)
    {
        LOG_ERROR(TEXT("Unable to load Inventory Config!"))
        return false;
    }

    auto widgetClass = Config->UserInterfaceWrapperClass.LoadSynchronous();
    if (!IsValid(widgetClass))
    {
        LOG_ERROR(TEXT("Unable to load Inventory UI Class from Config!"))
        return false;
    }
    
    // Validate widget implements required interface
    if (!widgetClass->ImplementsInterface(UMounteaInventorySystemBaseWidgetInterface::StaticClass()))
    {
        LOG_ERROR(TEXT("Base Inventory UI Class must implement `MounteaInventorySystemBaseWidgetInterface`!"))
        return false;
    }

    // Find player controller for widget creation
    int searchDepth = 0;
    APlayerController* playerController = UMounteaInventoryUIStatics::FindPlayerController(GetOwner(), searchDepth);
    if (!playerController || !playerController->IsLocalController())
    {
        LOG_ERROR(TEXT("Failed to find Player Controller"))
        return false;
    }

    // Create and initialize widget
    auto newWidget = CreateWidget<UUserWidget>(playerController, widgetClass);
    if (!newWidget->Implements<UMounteaInventorySystemBaseWidgetInterface>())
    {
        LOG_ERROR(TEXT("Base Inventory UI must implement `MounteaInventorySystemBaseWidgetInterface`!"))
        return false;
    }

    InventoryWidget = newWidget;
    TScriptInterface<IMounteaInventorySystemBaseWidgetInterface> inventoryInterface = InventoryWidget;
    
    // Initialize widget with this UI component
    inventoryInterface->Execute_InitializeMainUI(InventoryWidget, this);
    
    // Send creation command if widget supports generic commands
    if (InventoryWidget->Implements<UMounteaInventoryGenericWidgetInterface>())
    {
        TScriptInterface<IMounteaInventoryGenericWidgetInterface> genericWidget = InventoryWidget;
        genericWidget->Execute_ProcessInventoryWidgetCommand(InventoryWidget, InventoryUICommands::CreateWrapper, nullptr);
    }

    return true;
}
```

### Visibility Management

```cpp
// Get current visibility state
ESlateVisibility UMounteaInventoryUIComponent::GetMainUIVisibility_Implementation() const
{
    return IsValid(InventoryWidget) && InventoryWidget->Implements<UMounteaInventorySystemBaseWidgetInterface>()
        ? IMounteaInventorySystemBaseWidgetInterface::Execute_GetMainUIVisibility(InventoryWidget) 
        : ESlateVisibility::Hidden;
}

// Set visibility state
void UMounteaInventoryUIComponent::SetMainUIVisibility_Implementation(const ESlateVisibility NewVisibility)
{
    if (IsValid(InventoryWidget) && InventoryWidget->Implements<UMounteaInventorySystemBaseWidgetInterface>())
        IMounteaInventorySystemBaseWidgetInterface::Execute_SetMainUIVisibility(InventoryWidget, NewVisibility);
}

// Common usage patterns
void ToggleInventoryUI()
{
    auto CurrentVisibility = InventoryUIComponent->Execute_GetMainUIVisibility(InventoryUIComponent);
    auto NewVisibility = (CurrentVisibility == ESlateVisibility::Visible) 
        ? ESlateVisibility::Collapsed 
        : ESlateVisibility::Visible;
    InventoryUIComponent->Execute_SetMainUIVisibility(InventoryUIComponent, NewVisibility);
}
```

### Widget Cleanup

```cpp
void UMounteaInventoryUIComponent::RemoveMainUIWrapper_Implementation()
{
    if (!IsValid(InventoryWidget))
        return;
    
    TScriptInterface<IMounteaInventorySystemBaseWidgetInterface> inventoryInterface = InventoryWidget;
    
    // Clean up widget through interface
    inventoryInterface->Execute_RemoveMainUI(InventoryWidget);
    
    // Send removal command if supported
    if (InventoryWidget->Implements<UMounteaInventoryGenericWidgetInterface>())
    {
        TScriptInterface<IMounteaInventoryGenericWidgetInterface> genericWidget = InventoryWidget;
        genericWidget->Execute_ProcessInventoryWidgetCommand(InventoryWidget, InventoryUICommands::RemoveWrapper, nullptr);
    }
    
    InventoryWidget = nullptr;
}
```

!!! note "Widget Lifecycle"
    Widgets are created from configuration classes, initialized with the UI component reference, and cleaned up through interface calls to ensure proper resource management.

## Event-Driven Updates

### Inventory Event Processing

The UI component automatically responds to inventory changes:

```cpp
// Item added to inventory
void UMounteaInventoryUIComponent::ProcessItemAdded_Implementation(const FInventoryItem& AddedItem)
{
    if (!IsValid(InventoryWidget))
    {
        LOG_WARNING(TEXT("Invalid Inventory UI!"))
        return;
    }

    // Send command to widget if it supports generic commands
    if (InventoryWidget->Implements<UMounteaInventoryGenericWidgetInterface>())
    {
        // Create payload with item data
        UMounteaAdvancedInventoryWidgetPayload* newPayload = NewObject<UMounteaAdvancedInventoryWidgetPayload>();
        newPayload->PayloadData.Add(AddedItem.Guid);
        
        // Send item added command
        IMounteaInventoryGenericWidgetInterface::Execute_ProcessInventoryWidgetCommand(
            InventoryWidget, 
            InventoryUICommands::ItemAdded, 
            newPayload
        );
    }
}

// Item removed from inventory
void UMounteaInventoryUIComponent::ProcessItemRemoved_Implementation(const FInventoryItem& RemovedItem)
{
    if (!IsValid(InventoryWidget))
        return;

    if (InventoryWidget->Implements<UMounteaInventoryGenericWidgetInterface>())
    {
        UMounteaAdvancedInventoryWidgetPayload* newPayload = NewObject<UMounteaAdvancedInventoryWidgetPayload>();
        newPayload->PayloadData.Add(RemovedItem.Guid);
        
        IMounteaInventoryGenericWidgetInterface::Execute_ProcessInventoryWidgetCommand(
            InventoryWidget, 
            InventoryUICommands::ItemRemoved, 
            newPayload
        );
    }
}

// Item properties changed
void UMounteaInventoryUIComponent::ProcessItemModified_Implementation(const FInventoryItem& ModifiedItem)
{
    if (!IsValid(InventoryWidget))
        return;

    if (InventoryWidget->Implements<UMounteaInventoryGenericWidgetInterface>())
    {
        UMounteaAdvancedInventoryWidgetPayload* newPayload = NewObject<UMounteaAdvancedInventoryWidgetPayload>();
        newPayload->PayloadData.Add(ModifiedItem.Guid);
        newPayload->PayloadQuantities.Add(ModifiedItem.Quantity);
        
        IMounteaInventoryGenericWidgetInterface::Execute_ProcessInventoryWidgetCommand(
            InventoryWidget, 
            InventoryUICommands::ItemModified, 
            newPayload
        );
    }
}
```

### Change Event Routing

Specific property changes route to the generic modifier:

```cpp
// Quantity changes trigger modification event
void UMounteaInventoryUIComponent::ProcessItemQuantityChanged(const FInventoryItem& Item, const int32 OldQuantity, const int32 NewQuantity)
{
    Execute_ProcessItemModified(this, Item);
}

// Durability changes trigger modification event
void UMounteaInventoryUIComponent::ProcessItemDurabilityChanged(const FInventoryItem& Item, const float OldDurability, const float NewDurability)
{
    Execute_ProcessItemModified(this, Item);
}
```

!!! info "Command Pattern"
    The UI system uses a command pattern where inventory changes become widget commands with payload data, allowing widgets to respond appropriately to different types of updates.

## Selection Management

### Category Selection

```cpp
void UMounteaInventoryUIComponent::CategorySelected_Implementation(const FString& SelectedCategoryId)
{
    // Avoid duplicate selections
    if (ActiveCategoryId.Equals(SelectedCategoryId, ESearchCase::IgnoreCase)) 
        return;
    
    // Update active category
    ActiveCategoryId = SelectedCategoryId;
    
    // Clear item selection when category changes
    ActiveItemGuid = FGuid();    
    ActiveItemWidget = nullptr;
    
    // Notify widget of category change
    if (IsValid(InventoryWidget) && InventoryWidget->Implements<UMounteaInventoryGenericWidgetInterface>())
    {
        TScriptInterface<IMounteaInventoryGenericWidgetInterface> genericWidget = InventoryWidget;
        genericWidget->Execute_ProcessInventoryWidgetCommand(InventoryWidget, InventoryUICommands::CategorySelected, nullptr);
    }

    // Broadcast to external listeners
    OnCategorySelected.Broadcast(SelectedCategoryId);
}

// Get current category
FString GetSelectedCategory()
{
    return InventoryUIComponent->Execute_GetSelectedCategoryId(InventoryUIComponent);
}
```

### Item Selection

```cpp
void UMounteaInventoryUIComponent::ItemSelected_Implementation(const FGuid& SelectedItem)
{
    // Avoid duplicate selections
    if (ActiveItemGuid == SelectedItem) 
        return;
    
    // Update active item
    ActiveItemGuid = SelectedItem;
    
    // Notify widget of item selection
    if (IsValid(InventoryWidget) && InventoryWidget->Implements<UMounteaInventoryGenericWidgetInterface>())
    {
        TScriptInterface<IMounteaInventoryGenericWidgetInterface> genericWidget = InventoryWidget;
        genericWidget->Execute_ProcessInventoryWidgetCommand(InventoryWidget, InventoryUICommands::ItemSelected, nullptr);
    }

    // Broadcast to external listeners
    OnItemSelected.Broadcast(SelectedItem);
}

// Set active item widget (for focus management)
void UMounteaInventoryUIComponent::SetActiveItemWidget_Implementation(UUserWidget* NewActiveItemWidget)
{
    if (ActiveItemWidget != NewActiveItemWidget)
    {
        ActiveItemWidget = NewActiveItemWidget;
        NewActiveItemWidget->SetFocus();  // Automatically focus new active widget
    }
}
```

!!! tip "Selection State"
    Category changes automatically clear item selection to prevent invalid states where an item from a different category appears selected.

## Notification System

### Notification Creation

```cpp
void UMounteaInventoryUIComponent::CreateInventoryNotification_Implementation(const FInventoryNotificationData& NotificationData)
{
    if (!IsValid(InventoryNotificationContainerWidget))
    {
        LOG_WARNING(TEXT("Invalid Notification Container!"))
        return;
    }

    // Get notification container interface
    TScriptInterface<IMounteaInventoryNotificationContainerWidgetInterface> notificationContainerInterface = InventoryNotificationContainerWidget;
    
    // Load notification widget class from config
    const UMounteaAdvancedInventorySettingsConfig* Config = GetDefault<UMounteaAdvancedInventorySettings>()->InventorySettingsConfig.LoadSynchronous();
    if (!Config || Config->NotificationWidgetClass.IsNull())
    {
        LOG_ERROR(TEXT("Unable to load `NotificationWidgetClass` from Config!"))
        return;
    }
    
    // Create notification widget
    auto notificationClass = Config->NotificationWidgetClass.LoadSynchronous();
    auto notificationWidget = CreateWidget(InventoryNotificationContainerWidget, notificationClass);
    if (!IsValid(notificationWidget))
    {
        LOG_ERROR(TEXT("Failed to Create Inventory Notification!"))
        return;
    }

    // Initialize notification with data
    IMounteaInventoryNotificationWidgetInterface::Execute_CreateNotification(
        notificationWidget, 
        NotificationData, 
        InventoryNotificationContainerWidget
    );

    // Add to container
    notificationContainerInterface->Execute_AddNotification(InventoryNotificationContainerWidget, notificationWidget);
}
```

### Notification Management

```cpp
// Set notification container widget
void UMounteaInventoryUIComponent::SetNotificationContainer_Implementation(UUserWidget* NewNotificationContainer)
{
    if (InventoryNotificationContainerWidget != NewNotificationContainer)
        InventoryNotificationContainerWidget = NewNotificationContainer;
}

// Clear all notifications
void UMounteaInventoryUIComponent::RemoveInventoryNotifications_Implementation()
{
    if (!IsValid(InventoryNotificationContainerWidget))
        return;

    TScriptInterface<IMounteaInventoryNotificationContainerWidgetInterface> notificationContainerInterface = InventoryNotificationContainerWidget;
    IMounteaInventoryNotificationContainerWidgetInterface::Execute_ClearNotifications(InventoryNotificationContainerWidget);
}

// Example notification usage
void ShowItemAddedNotification(const FInventoryItem& Item)
{
    FInventoryNotificationData NotificationData;
    NotificationData.Type = MounteaInventoryNotificationBaseTypes::ItemAdded;
    NotificationData.ItemGuid = Item.GetGuid();
    NotificationData.DeltaAmount = Item.GetQuantity();
    
    InventoryUIComponent->Execute_CreateInventoryNotification(InventoryUIComponent, NotificationData);
}
```

!!! example "Notification Flow"
    Inventory Component → UI Component → Notification Container → Individual Notification Widgets. Each layer handles its specific responsibilities in the notification chain.

## Grid Slot Persistence

### Slot Management

The UI component handles persistent storage of grid slot layouts:

```cpp
// Add single slot
void UMounteaInventoryUIComponent::AddSlot_Implementation(const FMounteaInventoryGridSlot& SlotData)
{
    SavedGridSlots.Add(SlotData);
}

// Remove single slot
void UMounteaInventoryUIComponent::RemoveSlot_Implementation(const FMounteaInventoryGridSlot& SlotData)
{
    SavedGridSlots.Remove(SlotData);
}

// Batch operations
void UMounteaInventoryUIComponent::AddSlots_Implementation(const TSet<FMounteaInventoryGridSlot>& SlotData)
{
    SavedGridSlots.Append(SlotData);
}

void UMounteaInventoryUIComponent::RemoveSlots_Implementation(const TSet<FMounteaInventoryGridSlot>& SlotData)
{
    SavedGridSlots = SavedGridSlots.Difference(SlotData);
}

// Update existing slot
void UMounteaInventoryUIComponent::UpdateSlot_Implementation(const FMounteaInventoryGridSlot& SlotData)
{
    // Remove old version if it exists
    if (SavedGridSlots.Contains(SlotData))
        SavedGridSlots.Remove(SlotData);
    
    // Add updated version
    SavedGridSlots.Add(SlotData);
}
```

### Slot Persistence

```cpp
// Slots automatically save due to SaveGame tag
UPROPERTY(SaveGame, VisibleAnywhere, BlueprintReadOnly, Category="Inventory")
TSet<FMounteaInventoryGridSlot> SavedGridSlots;

// Restore slot layout after loading
void RestoreGridLayout()
{
    auto SavedSlots = InventoryUIComponent->Execute_GetSavedSlots(InventoryUIComponent);
    for (const auto& Slot : SavedSlots)
    {
        ApplySlotToGrid(Slot);
    }
}

// Save custom layout
void SaveCurrentLayout()
{
    TSet<FMounteaInventoryGridSlot> CurrentSlots;
    // ... collect current grid slots from UI
    
    InventoryUIComponent->Execute_AddSlots(InventoryUIComponent, CurrentSlots);
}
```

!!! note "Automatic Persistence"
    Grid slots are marked with SaveGame, so they automatically persist across sessions without additional save/load code.

## Configuration Integration

### Settings-Based Widget Creation

The system loads widget classes from centralized configuration:

```cpp
// Configuration structure (in settings)
UPROPERTY(EditAnywhere, Category="UI")
TSoftClassPtr<UUserWidget> UserInterfaceWrapperClass;

UPROPERTY(EditAnywhere, Category="UI") 
TSoftClassPtr<UUserWidget> NotificationWidgetClass;

// Runtime loading
const UMounteaAdvancedInventorySettingsConfig* Config = GetDefault<UMounteaAdvancedInventorySettings>()->InventorySettingsConfig.LoadSynchronous();
auto WidgetClass = Config->UserInterfaceWrapperClass.LoadSynchronous();
```

### Dynamic Widget Discovery

```cpp
// Find appropriate player controller for widget creation
APlayerController* FindPlayerControllerForUI(AActor* Owner)
{
    int searchDepth = 0;
    return UMounteaInventoryUIStatics::FindPlayerController(Owner, searchDepth);
}

// Validate widget interface compatibility
bool ValidateWidgetInterface(UClass* WidgetClass, UClass* RequiredInterface)
{
    return WidgetClass && WidgetClass->ImplementsInterface(RequiredInterface);
}
```

!!! warning "Interface Requirements"
    All inventory widgets must implement required interfaces (`MounteaInventorySystemBaseWidgetInterface` for main widgets, etc.) or creation will fail with detailed error messages.

## Advanced Patterns

### Pattern 1: Custom UI Commands

!!! example "Use Case"
    Adding custom behavior to widget command processing

```cpp
// Custom command enumeration
namespace CustomInventoryUICommands
{
    const FString SortInventory = TEXT("SortInventory");
    const FString FilterByRarity = TEXT("FilterByRarity");
    const FString ExpandCategories = TEXT("ExpandCategories");
}

// Send custom command to widget
void SendCustomCommand(const FString& Command, UObject* Payload = nullptr)
{
    if (IsValid(InventoryWidget) && InventoryWidget->Implements<UMounteaInventoryGenericWidgetInterface>())
    {
        TScriptInterface<IMounteaInventoryGenericWidgetInterface> genericWidget = InventoryWidget;
        genericWidget->Execute_ProcessInventoryWidgetCommand(InventoryWidget, Command, Payload);
    }
}

// Usage examples
void SortInventoryByName()
{
    SendCustomCommand(CustomInventoryUICommands::SortInventory);
}

void FilterByRarity(const FString& RarityName)
{
    UMounteaAdvancedInventoryWidgetPayload* Payload = NewObject<UMounteaAdvancedInventoryWidgetPayload>();
    Payload->PayloadStrings.Add(RarityName);
    SendCustomCommand(CustomInventoryUICommands::FilterByRarity, Payload);
}
```

### Pattern 2: Multi-Panel UI Management

!!! example "Use Case"
    Managing complex UIs with multiple inventory panels

```cpp
class UMultiPanelInventoryUIComponent : public UMounteaInventoryUIComponent
{
protected:
    UPROPERTY(VisibleAnywhere, Category="Multi-Panel")
    TMap<FString, TObjectPtr<UUserWidget>> SecondaryPanels;
    
public:
    UFUNCTION(BlueprintCallable, Category="Multi-Panel")
    void CreateSecondaryPanel(const FString& PanelName, UClass* WidgetClass)
    {
        if (auto PlayerController = UMounteaInventoryUIStatics::FindPlayerController(GetOwner(), 0))
        {
            auto NewPanel = CreateWidget<UUserWidget>(PlayerController, WidgetClass);
            SecondaryPanels.Add(PanelName, NewPanel);
            
            // Initialize panel if it supports inventory interface
            if (NewPanel->Implements<UMounteaInventorySystemBaseWidgetInterface>())
            {
                IMounteaInventorySystemBaseWidgetInterface::Execute_InitializeMainUI(NewPanel, this);
            }
        }
    }
    
    UFUNCTION(BlueprintCallable, Category="Multi-Panel")
    void ShowPanel(const FString& PanelName)
    {
        if (auto* Panel = SecondaryPanels.Find(PanelName))
        {
            if (IsValid(*Panel))
                (*Panel)->SetVisibility(ESlateVisibility::Visible);
        }
    }
};
```

### Pattern 3: Event-Driven Animations

!!! example "Use Case"
    Triggering UI animations based on inventory events

```cpp
// Enhanced UI component with animation support
void UAnimatedInventoryUIComponent::ProcessItemAdded_Implementation(const FInventoryItem& AddedItem)
{
    // Call base implementation first
    Super::ProcessItemAdded_Implementation(AddedItem);
    
    // Trigger add animation
    if (IsValid(InventoryWidget))
    {
        PlayItemAddedAnimation(AddedItem);
    }
}

void PlayItemAddedAnimation(const FInventoryItem& Item)
{
    // Find item widget in UI
    if (auto ItemWidget = FindItemWidgetByGuid(Item.GetGuid()))
    {
        // Play entrance animation
        if (auto AnimatableWidget = Cast<UUserWidget>(ItemWidget))
        {
            PlayAnimationForward(AnimatableWidget->GetAnimation(TEXT("ItemAdded")));
        }
    }
}

// Notification animations
void UAnimatedInventoryUIComponent::CreateInventoryNotification_Implementation(const FInventoryNotificationData& NotificationData)
{
    Super::CreateInventoryNotification_Implementation(NotificationData);
    
    // Add screen shake for important notifications
    if (NotificationData.Type == MounteaInventoryNotificationBaseTypes::ItemAdded)
    {
        if (auto PlayerController = UMounteaInventoryUIStatics::FindPlayerController(GetOwner(), 0))
        {
            PlayerController->PlayerCameraManager->StartCameraShake(ItemAddedShake);
        }
    }
}
```

## Performance Optimization

### Widget Pooling

```cpp
// Pool widgets to avoid constant creation/destruction
class UPooledInventoryUIComponent : public UMounteaInventoryUIComponent
{
private:
    TArray<TObjectPtr<UUserWidget>> NotificationWidgetPool;
    int32 PooledWidgetIndex = 0;
    
public:
    UUserWidget* GetPooledNotificationWidget()
    {
        if (NotificationWidgetPool.Num() == 0)
        {
            // Initialize pool
            const int32 PoolSize = 10;
            for (int32 i = 0; i < PoolSize; ++i)
            {
                auto Widget = CreateWidget<UUserWidget>(GetPlayerController(), NotificationWidgetClass);
                NotificationWidgetPool.Add(Widget);
            }
        }
        
        // Return next widget in pool
        UUserWidget* Widget = NotificationWidgetPool[PooledWidgetIndex];
        PooledWidgetIndex = (PooledWidgetIndex + 1) % NotificationWidgetPool.Num();
        return Widget;
    }
};
```

### Efficient Event Binding

```cpp
// Batch event binding to reduce overhead
void BindInventoryEvents()
{
    if (!ParentInventory.GetObject())
        return;
    
    // Store delegate handles for potential unbinding
    static FDelegateHandle ItemAddedHandle;
    static FDelegateHandle ItemRemovedHandle;
    static FDelegateHandle NotificationHandle;
    
    // Bind all events in one operation
    ItemAddedHandle = ParentInventory->GetOnItemAddedEventHandle().AddUniqueDynamic(this, &UMounteaInventoryUIComponent::ProcessItemAdded);
    ItemRemovedHandle = ParentInventory->GetOnItemRemovedEventHandle().AddUniqueDynamic(this, &UMounteaInventoryUIComponent::ProcessItemRemoved);
    NotificationHandle = ParentInventory->GetOnNotificationProcessedEventHandle().AddUniqueDynamic(this, &UMounteaInventoryUIComponent::CreateInventoryNotification);
}

// Unbind when component is destroyed
void UMounteaInventoryUIComponent::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
    if (ParentInventory.GetObject())
    {
        ParentInventory->GetOnItemAddedEventHandle().RemoveAll(this);
        ParentInventory->GetOnItemRemovedEventHandle().RemoveAll(this);
        ParentInventory->GetOnNotificationProcessedEventHandle().RemoveAll(this);
    }
    
    Super::EndPlay(EndPlayReason);
}
```

### Memory Management

```cpp
// Clean up widgets properly
void CleanupUIResources()
{
    // Remove from viewport before destroying
    if (IsValid(InventoryWidget))
    {
        InventoryWidget->RemoveFromParent();
        InventoryWidget = nullptr;
    }
    
    // Clear notification container
    if (IsValid(InventoryNotificationContainerWidget))
    {
        InventoryNotificationContainerWidget->RemoveFromParent();
        InventoryNotificationContainerWidget = nullptr;
    }
    
    // Clear active references
    ActiveItemWidget = nullptr;
}
```

!!! tip "Optimization Guidelines"
    - Pool frequently created widgets (notifications, tooltips)
    - Bind events once and cache delegate handles
    - Clean up widget references properly to prevent memory leaks
    - Use visibility changes instead of widget creation for show/hide

## Troubleshooting

### Common Issues

!!! warning "Widget Not Creating"
    **Problem**: CreateMainUIWrapper returns false  
    **Solution**: Check config validity, widget class interfaces, and player controller availability

!!! warning "Events Not Updating UI"
    **Problem**: Inventory changes don't reflect in UI  
    **Solution**: Verify parent inventory binding and widget interface implementation

!!! warning "Notifications Not Appearing"
    **Problem**: CreateInventoryNotification fails silently  
    **Solution**: Ensure notification container is set and notification widget class is configured

!!! warning "Selection State Issues"
    **Problem**: Category/item selection not working  
    **Solution**: Check if widgets implement required selection interfaces and handle command processing

### Debug Helpers

```cpp
// Console commands for debugging UI state
UFUNCTION(CallInEditor=true, Category="Debug")
void DebugUIState()
{
    LOG_WARNING(TEXT("UI Component Debug:"));
    LOG_WARNING(TEXT("- Main Widget Valid: %s"), IsValid(InventoryWidget) ? TEXT("Yes") : TEXT("No"));
    LOG_WARNING(TEXT("- Parent Inventory: %s"), ParentInventory.GetObject() ? TEXT("Connected") : TEXT("Missing"));
    LOG_WARNING(TEXT("- Active Category: %s"), *ActiveCategoryId);
    LOG_WARNING(TEXT("- Active Item: %s"), *ActiveItemGuid.ToString());
    LOG_WARNING(TEXT("- Saved Slots: %d"), SavedGridSlots.Num());
}

// Validate widget interfaces
UFUNCTION(CallInEditor=true, Category="Debug")
void ValidateWidgetInterfaces()
{
    if (IsValid(InventoryWidget))
    {
        LOG_WARNING(TEXT("Widget Interface Check:"));
        LOG_WARNING(TEXT("- Base Interface: %s"), InventoryWidget->Implements<UMounteaInventorySystemBaseWidgetInterface>() ? TEXT("Yes") : TEXT("No"));
        LOG_WARNING(TEXT("- Generic Interface: %s"), InventoryWidget->Implements<UMounteaInventoryGenericWidgetInterface>() ? TEXT("Yes") : TEXT("No"));
    }
}
```

## Best Practices

!!! tip "Design Guidelines"
    - **Separation of Concerns**: Keep UI components focused on presentation, not data logic
    - **Configuration-Driven**: Use settings for widget classes to enable easy customization
    - **Interface Contracts**: Always validate widget interfaces before calling methods
    - **Event-Driven Updates**: Let inventory events drive UI changes automatically
    - **Resource Cleanup**: Properly dispose of widgets and unbind events

!!! note "Performance Best Practices"
    - Use widget pooling for frequently created/destroyed elements
    - Batch UI updates when processing multiple inventory changes
    - Cache expensive widget lookups and interface casts
    - Prefer visibility changes over widget creation for temporary states

!!! warning "Common Pitfalls"
    - Don't create UI on dedicated servers or non-cosmetic clients
    - Always check widget validity before interface calls
    - Remember to unbind events when components are destroyed
    - Validate configuration data before attempting widget creation

## Integration Examples

### Basic Setup

```cpp
// Complete setup in actor class
class AInventoryActor : public APawn
{
protected:
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Inventory")
    class TObjectPtr<UMounteaInventoryComponent> InventoryComponent;
    
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Inventory")
    class TObjectPtr<UMounteaInventoryUIComponent> InventoryUIComponent;

public:
    AInventoryActor()
    {
        InventoryComponent = CreateDefaultSubobject<UMounteaInventoryComponent>(TEXT("InventoryComponent"));
        InventoryUIComponent = CreateDefaultSubobject<UMounteaInventoryUIComponent>(TEXT("InventoryUIComponent"));
    }
    
    virtual void BeginPlay() override
    {
        Super::BeginPlay();
        
        // Create UI after components are initialized
        InventoryUIComponent->Execute_CreateMainUIWrapper(InventoryUIComponent);
        
        // Bind to selection events
        InventoryUIComponent->OnItemSelected.AddDynamic(this, &AInventoryActor::OnItemSelected);
        InventoryUIComponent->OnCategorySelected.AddDynamic(this, &AInventoryActor::OnCategorySelected);
    }
    
    UFUNCTION()
    void OnItemSelected(const FGuid& ItemGuid)
    {
        // Handle item selection
        auto Item = InventoryComponent->Execute_FindItem(InventoryComponent, FInventoryItemSearchParams(ItemGuid));
        if (Item.IsItemValid())
        {
            ShowItemDetails(Item);
        }
    }
    
    UFUNCTION()
    void OnCategorySelected(const FString& CategoryId)
    {
        // Handle category filtering
        FilterInventoryByCategory(CategoryId);
    }
};
```

## Next Steps

- **[Equipment System](../EquipmentSystem/EquipmentSystem.md):** Equip and manage worn items with dedicated UI
- **[Trading System](../TradingSystem/TBD.md):** Create player-to-player exchange interfaces
- **[Inventory UI](../UserInterface/TBD.md):** Build specialized inventory UI components