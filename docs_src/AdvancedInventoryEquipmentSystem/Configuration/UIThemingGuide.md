# UI Theming Guide

## What You'll Learn

- Applying themes to widgets automatically
- Creating custom color schemes and visual styles
- Using theme helper functions for buttons, text, and layouts
- Configuring theme levels, states, and corner styling

## Quick Start

```cpp
// Apply theme in widget construction
void UMyInventoryWidget::NativeConstruct()
{
    Super::NativeConstruct();
    UMounteaInventoryUIStatics::ApplyTheme(this);
}

// Use theme helpers for custom styling
FButtonStyle ThemedButton = UMounteaInventoryUIStatics::MakeButtonStyle(
    OriginalStyle, 
    EMounteaThemeLevel::Primary
);
```

!!! tip "Result"
    Consistent visual styling across all inventory UI elements with automatic color coordination.

## Core Concepts

### Theme Application Pattern

All themed widgets follow the same application pattern through the interface system:

```cpp
// Automatic theme application (recommended)
void UMounteaAdvancedInventoryBaseWidget::NativeConstruct()
{
    Super::NativeConstruct();
    Execute_ApplyTheme(this);
}

// Manual theme application
void UMyCustomWidget::ApplyTheme_Implementation()
{
    auto ThemeConfig = UMounteaInventoryUIStatics::GetThemeConfig();
    if (!ThemeConfig) return;
    
    // Apply theme colors and styles to your widgets
    MyButton->SetColorAndOpacity(ThemeConfig->PrimaryText);
}
```

!!! info "Key Points"
    - Widgets must implement `IMounteaInventoryGenericWidgetInterface` or inherit from `UMounteaAdvancedInventoryBaseWidget`
    - Theme application happens in `NativeConstruct()` for consistent timing
    - Override `ApplyTheme_Implementation()` for custom theming logic

### Theme Configuration Structure

Themes use a three-level system for organizing visual elements:

**Theme Levels:**

- **Primary:** Main UI elements, important buttons
- **Secondary:** Supporting elements, secondary buttons  
- **Tertiary:** Background elements, subtle details

**Theme States:**

- **Normal:** Default appearance
- **Hovered:** Mouse-over appearance
- **Active:** Pressed/selected appearance
- **Disabled:** Inactive appearance

**Theme Types:**

- **Default:** Standard UI element coloring
- **Background:** Container and panel backgrounds
- **Text:** Typography and text elements

## Common Patterns

### Pattern 1: Button Styling

!!! note "When & Why"
    - Creating themed buttons that match inventory style
    - Automatic state transitions (normal → hover → pressed)

```cpp
// Create complete button style
FButtonStyle ThemedButton = UMounteaInventoryUIStatics::MakeButtonStyle(
    BaseButtonStyle, 
    EMounteaThemeLevel::Primary
);
MyButton->SetStyle(ThemedButton);

// Apply selective corner rounding
FButtonStyle CustomButton = UMounteaInventoryUIStatics::ApplyButtonStyle(
    BaseButtonStyle,
    EMounteaThemeLevel::Secondary,
    true,  // Top-left corner
    true,  // Top-right corner  
    false, // Bottom-left corner
    false  // Bottom-right corner
);
```

### Pattern 2: Text Block Theming

!!! note "When & Why"
    - Consistent typography across all text elements
    - Automatic font sizing based on hierarchy

```cpp
// Direct text block application
UMounteaInventoryUIStatics::ApplyTextBlockTheme(
    MyTextBlock,
    EMounteaThemeLevel::Primary,
    EMounteaThemeState::Normal
);

// Style-based approach for custom widgets
FTextBlockStyle ThemedTextStyle = UMounteaInventoryUIStatics::ApplyTextBlockStyle(
    OriginalStyle,
    EMounteaThemeLevel::Secondary,
    EMounteaThemeState::Hovered
);
```

### Pattern 3: Custom Brush Creation

!!! note "When & Why"
    - Creating themed backgrounds and borders
    - Custom visual elements that match theme

```cpp
// Create themed background brush
FSlateBrush BackgroundBrush = UMounteaInventoryUIStatics::MakeSlateBrush(
    OriginalBrush,
    EMounteaThemeLevel::Primary,
    EMounteaThemeState::Normal,
    EMounteaThemeType::Background
);

// Apply themed outline
FSlateBrush BorderedBrush = UMounteaInventoryUIStatics::ApplySlateBrushOutline(
    BackgroundBrush,
    EMounteaThemeLevel::Primary,
    EMounteaThemeState::Hovered
);
```

## Advanced Usage

### Theme Config Access

Access theme configuration for custom styling if predefined preset are not enough:

```cpp
void UMyWidget::ApplyTheme_Implementation()
{
    auto ThemeConfig = UMounteaInventoryUIStatics::GetThemeConfig();
    if (!ThemeConfig) return;
    
    // Direct color access
    HeaderText->SetColorAndOpacity(ThemeConfig->PrimaryText);
    BackgroundPanel->SetBrushColor(ThemeConfig->BackgroundPrimary);
    AccentBorder->SetBrushColor(ThemeConfig->Accent);
    
    // Font size access
    TitleText->SetFont(FSlateFontInfo(
        TitleText->GetFont().FontObject,
        ThemeConfig->PrimaryTextSize
    ));
}
```

### Scroll Bar Theming

```cpp
// Complete scrollbar style
FScrollBarStyle ThemedScrollBar = UMounteaInventoryUIStatics::ApplyScrollBarStyle(
    OriginalScrollBarStyle,
    EMounteaThemeLevel::Secondary
);

// State-specific scrollbar styling
FScrollBarStyle HoveredScrollBar = UMounteaInventoryUIStatics::MakeScrollBarStyle(
    OriginalScrollBarStyle,
    EMounteaThemeLevel::Primary,
    EMounteaThemeState::Hovered
);
```

!!! info "Keep in mind"
    - **Performance Impact:** Helper functions are lightweight - safe to call in `ApplyTheme_Implementation()`
    - **Caching:** Theme config loading is expensive - cache results when possible

## Theme Configuration

![Theme Configuration Editor](https://cdn2.unrealengine.com/hlod-water-support-in-unreal-engine-5-1-1920x1080-e402b5c30a87.jpg?resize=1&w=1920)

### Color Categories

**Background Colors:**

- `BackgroundPrimary` - Main container backgrounds
- `BackgroundSecondary` - Panel and section backgrounds  
- `BackgroundTertiary` - Subtle element backgrounds
- `BackgroundDisabled` - Inactive element backgrounds

**State Colors:**

- `PrimaryNormal/Hovered/Active/Disabled` - Primary element states
- `SecondaryNormal/Hovered/Active/Disabled` - Secondary element states
- `TertiaryNormal/Hovered/Active/Disabled` - Tertiary element states

**Text Colors:**

- `PrimaryText` - Headers and important text
- `SecondaryText` - Body text and descriptions
- `TertiaryText` - Subtle text and captions

### Visual Settings

```cpp
// Border configuration
FVector4 BaseBorderRadius = FVector4(6.f);  // Corner radius
float BaseBorderWidth = 1.f;                // Border thickness

// Text sizing
int32 PrimaryTextSize = 16;    // Large text (headers)
int32 SecondaryTextSize = 14;  // Medium text (body)  
int32 TertiaryTextSize = 12;   // Small text (captions)
```

## Blueprint Integration

### Theme Helper Usage

```cpp
// Blueprint-callable theme functions
UFUNCTION(BlueprintCallable, Category="UI|Theming")
void ApplyInventoryTheme()
{
    // Apply to all child widgets
    UMounteaInventoryUIStatics::ApplyTheme(this);
    
    // Custom styling for specific elements  
    if (CustomButton)
    {
        FButtonStyle ThemedStyle = UMounteaInventoryUIStatics::MakeButtonStyle(
            CustomButton->GetStyle(),
            EMounteaThemeLevel::Primary
        );
        CustomButton->SetStyle(ThemedStyle);
    }
}
```

### Widget Interface Implementation

```cpp
// Required interface implementation
class MYGAME_API UMyInventoryWidget : public UUserWidget, public IMounteaInventoryGenericWidgetInterface
{
    GENERATED_BODY()

protected:
    virtual void NativeConstruct() override;
    
    // Theme interface
    UFUNCTION(BlueprintImplementableEvent, Category="Theme")
    void ApplyTheme_Implementation() override;
};
```

## Troubleshooting

### Theme Not Applied

!!! tip "Problem & Solution"
    - Widget doesn't receive theming
    - Verify widget implements `IMounteaInventoryGenericWidgetInterface`
    - Check `ApplyTheme()` call in `NativeConstruct()`

### Color Not Changing

!!! tip "Problem & Solution"
    - Theme colors not updating
    - Ensure theme config is assigned in Project Settings
    - Verify theme config data asset exists and has valid colors

![Theme Troubleshooting](https://cdn2.unrealengine.com/hlod-water-support-in-unreal-engine-5-1-1920x1080-e402b5c30a87.jpg?resize=1&w=1920)

### Performance Issues

!!! tip "Problem & Solution"
    - Slow theme application
    - Cache `GetThemeConfig()` results in member variables
    - Avoid calling theme helpers in `Tick()` functions

## Best Practices

- **Apply Early:** Call `ApplyTheme()` in `NativeConstruct()` for consistent timing
- **Use Helpers:** Prefer static helper functions over manual color assignment
- **Cache Config:** Store theme config reference to avoid repeated loading  
- **Test States:** Verify all theme states (normal, hovered, active, disabled) look correct
- **Consistent Levels:** Use primary for important elements, secondary for supporting elements
