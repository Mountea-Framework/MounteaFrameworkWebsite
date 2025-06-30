# Notifications

User feedback system for inventory operations with customizable styling and behavior.

## Core Data Structures

### `EInventoryNotificationCategory`

```cpp
enum class EInventoryNotificationCategory : uint8
{
    EINC_Info,      // Success operations
    EINC_Warning,   // Partial success  
    EINC_Error      // Failed operations
};
```

### `FInventoryNotificationData`

```cpp
struct FInventoryNotificationData
{
    FString Type;                           // Notification type ID
    EInventoryNotificationCategory Category; // Visual category
    FText NotificationTitle;                // Main heading
    FText NotificationText;                 // Description
    float Duration;                         // Display time
    FGuid ItemGuid;                        // Related item
    int32 DeltaAmount;                     // Quantity change
    FInventoryNotificationConfig Config;   // Display settings
};
```

### `FInventoryNotificationConfig`

```cpp
struct FInventoryNotificationConfig
{
    uint8 bIsEnabled : 1;           // Show notification
    uint8 bShowProgressBar : 1;     // Duration indicator
    uint8 bCanBeClosed : 1;        // Manual dismissal
    uint8 bHasDuration : 1;        // Auto-dismiss
    
    EInventoryNotificationCategory Category;
    FText MessageTitle;
    FText MessageTemplate;
    float DefaultDuration;
    FLinearColor BackgroundColor;
    TSoftClassPtr<UUserWidget> NotificationWidgetClassOverride;
};
```

## Notification Types

### Built-in Types

```cpp
namespace MounteaInventoryNotificationBaseTypes
{
    const FString ItemAdded("Item Added");
    const FString ItemRemoved("Item Removed");
    const FString ItemPartiallyAdded("Item Partially Added");
    const FString QuantityLimitReached("Quantity Limit Reached");
    const FString InventoryLimitReached("Inventory Limit Reached");
    const FString DurabilityIncreased("Item Durability Increased");
    const FString DurabilityZero("Item Durability Zero");
}
```

## Creating Notifications

### Manual Creation

```cpp
FInventoryNotificationData Notification(
    "ItemAdded",                    // Type
    EInventoryNotificationCategory::EINC_Info,
    LOCTEXT("ItemAdded", "Item Added"),
    LOCTEXT("AddedMsg", "Sword added to inventory"),
    ItemGuid,
    SourceInventory,
    5,                              // Delta amount
    3.0f                           // Duration
);

InventoryUI->CreateInventoryNotification(Notification);
```

### Automatic Notifications

```cpp
// Triggered automatically by inventory operations
bool Success = Inventory->AddItemFromTemplate(Template, 5);
// Automatically creates "ItemAdded" or "ItemPartiallyAdded" notification
```

## Styling System

### Category Styles

```cpp
// Configure visual appearance per category
TMap<EInventoryNotificationCategory, FInventoryNotificationStyle> Styles;

FInventoryNotificationStyle InfoStyle;
InfoStyle.IconBrush = SuccessIcon;
InfoStyle.NotificationSound = SuccessSound;

FInventoryNotificationStyle ErrorStyle;
ErrorStyle.IconBrush = ErrorIcon;
ErrorStyle.NotificationSound = ErrorSound;
```

### Configuration

```cpp
// Per-type configuration in settings
TMap<FString, FInventoryNotificationConfig> NotificationConfigs;

FInventoryNotificationConfig ItemAddedConfig;
ItemAddedConfig.bIsEnabled = true;
ItemAddedConfig.bHasDuration = true;
ItemAddedConfig.DefaultDuration = 3.0f;
ItemAddedConfig.MessageTemplate = LOCTEXT("Added", "{ItemName} x{Quantity} added");
```

## UI Integration

### Container Interface

```cpp
// Implement IMounteaInventoryNotificationContainerWidgetInterface
void AddNotification(UUserWidget* Notification) override;
void RemoveNotification(UUserWidget* Notification) override;
void ClearNotifications() override;
```

### Widget Interface

```cpp
// Implement IMounteaInventoryNotificationWidgetInterface
void CreateNotification(const FInventoryNotificationData& Data, 
                       const TScriptInterface<Container>& Container) override;
void ExpireNotification() override;
void DeleteNotification() override;
```

## Template System

### Message Templates

```cpp
// Use placeholders in message templates
FText MessageTemplate = LOCTEXT("ItemTemplate", "{ItemName} x{Quantity} {Action}");

// Runtime replacement
FString ProcessedMessage = UMounteaInventorySystemStatics::ReplaceRegexInText(
    "{ItemName}", Item.GetItemName(), MessageTemplate
).ToString();
```

### Dynamic Content

```cpp
// Access notification data in widgets
FInventoryNotificationData NotificationData = GetNotificationData();
ItemNameText->SetText(GetItemNameFromGuid(NotificationData.ItemGuid));
QuantityText->SetText(FText::AsNumber(NotificationData.DeltaAmount));
```

## Events

### Processing Events

```cpp
// OnNotificationProcessed fired after notification display
Inventory->GetOnNotificationProcessedEventHandle().AddDynamic(
    this, &AMyActor::OnNotificationProcessed);

void OnNotificationProcessed(const FInventoryNotificationData& Data)
{
    // Handle notification completion
}
```

## Best Practices

- **Configure duration** based on importance
- **Use appropriate categories** for visual consistency  
- **Test notification frequency** to avoid spam
- **Provide dismissal options** for lengthy notifications
- **Localize all text** for international support
