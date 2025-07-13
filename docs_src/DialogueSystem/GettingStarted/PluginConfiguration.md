# Configuration Reference

Complete reference for all Mountea Dialogue System settings and their effects.

## Project Settings Overview

Access via: **Window** → **Project Settings** → **Mountea Framework**

The system provides two configuration categories:

- **Dialogue Defaults:** Runtime (game) settings
- **Dialogue Editor Defaults:** Editor appearance and behavior

## Runtime Settings (Dialogue Defaults)

### User Interface Settings

<p align="center" width="100%">
    <img width="42.5%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/SettingsPage.webp">
    <img width="42.5%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/ConfigPage.webp">
</p>

#### Default Dialogue Widget Class
**Type:** Widget Blueprint Class  
**Default:** None  
**Purpose:** Sets the default UI class for all dialogues

```cpp
// Must implement IMounteaDialogueWBPInterface
```

!!! inline warning inline "Important"
    Either this setting OR the Manager Component's Widget Class must be set for UI to appear.

!!! inline end tip inline end "Best Practice"
    Set this globally if you have one standard dialogue UI. Use Manager Component setting for special cases.

#### Input Mode
**Type:** Enum  
**Options:**

- `UI Only` - Player can only interact with dialogue UI
- `Game and UI` - Player can use both game and UI inputs

**Default:** `Game and UI`

!!! question "How to use Input Mode?"  
    This setting is informational only. Implement actual input restriction logic in your UI or input handling code.

### Subtitle Settings

#### Update Frequency
**Type:** Float (seconds)  
**Range:** 0.01 - 1.0  
**Default:** 0.05  
**Purpose:** How often UI elements update (progress bars, color lerping, etc.)

**Performance Impact:**

- Lower values = Smoother visuals, higher performance cost
- Higher values = Less smooth visuals, better performance

#### Audio Cut Off Speed  
**Type:** Float (seconds)  
**Default:** 0.1  
**Purpose:** How quickly voice audio stops when player skips dialogue

!!! tip "Recommendation"  
    Leave at default unless you experience audio timing issues.

#### Allow Subtitles
**Type:** Boolean  
**Default:** True  
**Purpose:** Global toggle for subtitle display

!!! warning "Runtime Changes" 
    If changed during runtime, you must override this in C++ for the change to take effect.

### Subtitle Appearance

Configure default subtitle styling that propagates to Widget Classes:

#### Text Styling
- **Subtitles Color and Opacity** - Base text appearance
- **Font Family** - Typography settings  
- **Font Size** - Text scale
- **Font Material** - Advanced font rendering

#### Text Effects
- **Shadow Offset** - Drop shadow positioning
- **Shadow Color** - Shadow appearance

#### Subtitle Overrides

**Row ID System** allows specific styling per dialogue row:

- **int index** (0-255) - Custom row type identifier
- **Widget Class** - Specific widget for this override

**Use Case:** Different styling for narrator vs character dialogue, important choices, etc.

### Dialogue Widget Commands

**Purpose:** String commands that define UI actions, simplifying the codebase with generic functionality.

#### Core Commands (Cannot be deleted)
- `CreateDialogueWidget` - Initialize dialogue UI
- `CloseDialogueWidget` - Destroy dialogue UI  
- `ShowDialogueRow` - Display dialogue content
- `UpdateDialogueRow` - Refresh dialogue content
- `HideDialogueRow` - Hide dialogue content
- `AddDialogueOptions` - Show player choices
- `RemoveDialogueOptions` - Hide player choices

!!! warning "System Critical"
    These commands are hardcoded in C++ libraries. Do not delete or modify.

#### Custom Commands
You can add custom commands for specialized UI behavior:

```text
CustomFadeIn
PlayCameraShake  
ShowPortrait
```

## Editor Settings (Dialogue Editor Defaults)

### Nodes Settings

#### Node Type
**Options:**

- `Soft Corners` (Default) - Rounded node edges
- `Hard Corners` - Sharp rectangular nodes

#### Node Theme  
**Options:**

- `Dark Theme` (Default) - Dark background, light text
- `Light Theme` - Light background, dark text

!!! note "Visual Impact"
    Theme affects node validation colors and overall editor readability.

#### Node Style
**Options:**

- `Unified` (Default) - Single large bubble with icons for inheritance
- `Stack` - Separate text chunks for each element (Inheritance, Implementation, Node name)

#### Show Node Class Names
**Type:** Boolean  
**Default:** False  
**Purpose:** Display technical class names instead of user-friendly labels

!!! tip "Non-Destructive"
    Toggling this won't lose custom node names.

#### Node Color Customization
**Purpose:** Assign custom background colors to specific node types

**Example Use Cases:**

- Highlight important story nodes
- Color-code different character types
- Mark conditional or special nodes

#### Native Decorators Edit
**Type:** Boolean  
**Default:** False  
**Purpose:** Allow opening C++ decorators in IDE

**When Enabled:** C++ decorators show tool icon for direct IDE access

### Decorators Info Display

Control what information appears on dialogue nodes:

#### Show Number of Decorators
**Type:** Boolean  
**Default:** True  
**Purpose:** Display decorator count on nodes

#### Show Decorator Inheritance  
**Type:** Boolean  
**Default:** True  
**Purpose:** Display whether node inherits decorators

**Visibility Combinations:**

- `Yes/Yes` - Show count and inheritance
- `Yes/False` - Show count only  
- `False/False` - Show nothing
- `False/Yes` - Show inheritance only

### Wiring Settings

#### Wire Width
**Type:** Float  
**Range:** 0.1 - 1.5  
**Default:** 0.5  
**Purpose:** Thickness of connection lines between nodes

#### Arrow Type
**Options:**

- `Simple Arrow` - Basic directional indicator
- `Hollow Arrow` (Default) - Outlined arrow
- `Fancy Arrow` - Stylized arrow design
- `Bubble` - Circular indicator
- `Nothing` - No arrow indicator

### Auto Arrange Settings

#### Node Distance
**Type:** Float  
**Default:** 100  
**Purpose:** Spacing between nodes during auto-arrangement

!!! inline warning "Clipping Warning"
    Lower values may cause visual overlap between nodes.

!!! inline end example "Alpha Feature"  
    Auto-arrange is experimental and may cause editor crashes.

## Configuration Best Practices

### For Development
1. **Start with defaults** - Don't over-configure initially
2. **Test incrementally** - Change one setting at a time
3. **Use validation** - Always run Graph Validation after changes

### For Production
1. **Lock down UI settings** - Avoid runtime subtitle changes
2. **Optimize update frequency** - Balance visuals vs performance
3. **Standardize themes** - Consistent editor experience for team

### For Teams
1. **Version control settings** - Include config files in source control
2. **Document customizations** - Note any non-default settings
3. **Test across platforms** - Verify settings work on target devices

## Advanced Configuration

### Custom Decorator Commands
Add specialized UI commands for your game's needs:

```text
OpenShop
StartMinigame
TriggerCutscene
UpdateQuestLog
```

### Subtitle Localization Setup
1. Configure base subtitle settings
2. Create override entries for different languages
3. Use String Tables for text content
4. Test with longest/shortest target languages

### Performance Optimization
- **Update Frequency:** 0.1s for 60fps, 0.05s for smooth animations
- **Audio Cut Off:** Increase for longer voice lines
- **Node Distance:** Increase for complex dialogue trees

## Troubleshooting Configuration

!!! warning "Settings Not Applied"
    - Restart editor after major changes
    - Check if settings require runtime override
    - Verify configuration file permissions

## Configuration Files Location

Settings are stored in:
```text
YourProject/Config/DefaultGame.ini
YourProject/Config/DefaultEditor.ini
```

!!! tip "Backup Recommendation"
    Keep backups of working configuration files before major changes.

---

## Next Steps
<div class="card-grid">
    <div class="card next-steps setupDialogueManager">
        <div class="card-icon">💬</div>
        <h3 class="card-title">Setup Dialogue Manager →</h3>
        <p class="card-description">HSetup Dialogue Manager with bindable events and replication authority</p>
        <a href="../SetupDialogueManager" class="card-link"></a>
    </div>
</div>
