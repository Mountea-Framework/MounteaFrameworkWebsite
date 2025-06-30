# Item Preview

3D item visualization with interactive camera controls and mesh preview capabilities.

## Core Components

### Classes

- **`UMounteaAdvancedInventoryInteractableObjectWidget`** - Interactive 3D preview widget
- **`AMounteaAdvancedInventoryItemPreviewRenderer`** - Scene capture actor

### Configuration

- **`UMounteaAdvancedInventoryInteractiveWidgetConfig`** - Preview system setup

## Key Features

- **3D Mesh Preview** - Static and skeletal mesh support
- **Interactive Camera** - Mouse/gamepad/slider controls
- **Scene Capture** - Real-time rendering to render target
- **Auto-fit Meshes** - Automatic camera positioning
- **Performance Control** - Configurable update rates

## Basic Setup

### Widget Configuration

```cpp
// Initialize preview widget
bool Success = UMounteaInventoryUIStatics::ItemPreview_InitializeInteractableWidget(PreviewWidget);

// Set preview meshes
UMounteaInventoryUIStatics::ItemPreview_SetPreviewMesh(PreviewWidget, StaticMesh);
UMounteaInventoryUIStatics::ItemPreview_SetPreviewSkeletalMesh(PreviewWidget, SkeletalMesh);

// Clear preview
UMounteaInventoryUIStatics::ItemPreview_ClearPreview(PreviewWidget);

// Reset to defaults
UMounteaInventoryUIStatics::ItemPreview_ResetPreview(PreviewWidget);
```

## Camera Controls

### Mouse Input

```cpp
// Rotation based on mouse movement
UMounteaInventoryUIStatics::ItemPreview_UpdateCameraRotation(PreviewWidget, MouseDelta);

// Height adjustment
UMounteaInventoryUIStatics::ItemPreview_UpdateCameraHeight(PreviewWidget, MouseDelta);

// Zoom with mouse wheel
UMounteaInventoryUIStatics::ItemPreview_UpdateCameraZoom(PreviewWidget, WheelDelta);
```

### Slider Controls

```cpp
// Set absolute values (0.0 to 1.0)
UMounteaInventoryUIStatics::ItemPreview_SetCameraRotationAbsolute(PreviewWidget, YawNormalized, PitchNormalized);
UMounteaInventoryUIStatics::ItemPreview_SetCameraHeightAbsolute(PreviewWidget, HeightNormalized);
UMounteaInventoryUIStatics::ItemPreview_SetCameraZoomAbsolute(PreviewWidget, ZoomNormalized);
```

### Gamepad Controls

```cpp
// Analog input with delta time
UMounteaInventoryUIStatics::ItemPreview_UpdateCameraRotationAnalog(PreviewWidget, AnalogInput, DeltaTime);
UMounteaInventoryUIStatics::ItemPreview_UpdateCameraHeightAnalog(PreviewWidget, AnalogInput, DeltaTime);
UMounteaInventoryUIStatics::ItemPreview_UpdateCameraZoomAnalog(PreviewWidget, AnalogInput, DeltaTime);
```

## Configuration Options

### Performance Settings

```cpp
// Preview update frequency
float PreviewTickFrequency = 30.0f;  // Updates per second

// Idle timeout
float IdleThreshold = 3.0f;  // Seconds before pausing updates

// Auto-start tick
bool bAutoStartTick = false;
```

### Camera Limits

```cpp
// Scale/zoom limits
FVector2D ScaleLimits = FVector2D(0.1f, 10.0f);

// Rotation constraints
float YawLimits = 180.0f;  // Degrees

// Height bounds
float HeightLimit = 100.0f;

// Input sensitivity
float CameraRotationSensitivity = 0.2f;
float CameraHeightSensitivity = 0.2f;
```

## Render Target System

### Preview Rendering

The system uses `UTextureRenderTarget2D` and scene capture for real-time 3D preview rendering into UI widgets.

### Material Integration

Dynamic material instances apply the render target to UI image widgets for seamless 3D-to-2D display.

## Input Handling

### Mouse Events

- **Left Click + Drag** - Rotate camera around object
- **Middle Click + Drag** - Adjust camera height
- **Mouse Wheel** - Zoom in/out

### Focus Management

Preview widgets handle focus for proper input capture and release.

## Use Cases

- **Item Inspection** - Detailed 3D examination
- **Equipment Preview** - See items before equipping
- **Customization** - Preview modifications
- **Shop Displays** - Interactive item showcases
