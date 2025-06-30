# Slate Elements

Custom UI controls and enhanced widgets for inventory interfaces.

## Core Components

### Enhanced Widgets

- **`UMounteaAdvancedInventoryAnimatedSwitcher`** - Animated panel transitions
- **`UMounteaAdvancedInventoryButtonWidget`** - Gameplay tag-based buttons

## Animated Switcher

### Enhanced Functionality

Extends `UCommonAnimatedSwitcher` with completion callbacks:

```cpp
// Event fired when animation completes
UPROPERTY(BlueprintAssignable)
FOnAnimationFinished OnAnimationFinished;

// Delegate signature
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnAnimationFinished, UWidget*, ActiveWidget, int32, ActiveIndex);
```

### Usage

```cpp
// Bind to animation completion
AnimatedSwitcher->OnAnimationFinished.AddDynamic(this, &AMyActor::OnSwitchComplete);

void OnSwitchComplete(UWidget* ActiveWidget, int32 ActiveIndex)
{
    // Handle transition completion
    if (ActiveIndex == InventoryPanelIndex)
    {
        // Focus inventory panel
        ActiveWidget->SetFocus();
    }
}
```

### Use Cases

- **Panel Transitions** - Smooth switching between inventory/equipment/crafting
- **Tab Systems** - Animated category selection
- **Modal Dialogs** - Transition in/out effects

## Inventory Button

### Gameplay Tag Integration

```cpp
// Enhanced button with action context
UPROPERTY(EditAnywhere, BlueprintReadWrite)
FGameplayTag ButtonActionTag;

UPROPERTY(EditAnywhere, BlueprintReadWrite) 
FString ButtonActionContext;
```

### Theme Application

Automatically applies inventory theme when created:

```cpp
virtual void ApplyTheme_Implementation() override;
```

### Tags Usage

```cpp
// Set button action
InventoryButton->ButtonActionTag = FGameplayTag::RequestGameplayTag("UI.Action.Equip");
InventoryButton->ButtonActionContext = "MainHand";

// Handle button press
void OnButtonClicked()
{
    if (ButtonActionTag.MatchesTag(EquipTag))
    {
        EquipItemToSlot(ButtonActionContext);
    }
}
```

## Theme Integration

Both widgets integrate with the inventory theme system for consistent styling:

### Color Application

- Automatic theme color application
- State-based styling (normal/hovered/pressed)
- Level-based theming (primary/secondary/tertiary)

### Runtime Updates

```cpp
// Apply theme to custom widgets
UMounteaInventoryUIStatics::ApplyTheme(CustomWidget);
```

## Best Practices

- Use `UMounteaAdvancedInventoryAnimatedSwitcher` for smooth UI transitions
- Leverage gameplay tags in buttons for flexible action handling
- Apply themes consistently across all custom widgets
