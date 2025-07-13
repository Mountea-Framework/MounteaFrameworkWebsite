# Installation Guide

Complete installation process for the Mountea Dialogue System plugin.

## 1. Download the Plugin

### Marketplace Download

If you already claimed the plugin, install it to your Engine version. Marketplace releases support the last three major engine versions per Epic Games policies.

!!! info "Engine Version Support"
    If your engine version isn't listed, use the GitHub release instead.

### GitHub Download

For experimental features or older projects, use [GitHub Releases](https://github.com/Mountea-Framework/MounteaDialogueSystem/releases).

**Two versions available:**

- **MounteaDialogueSystem** - Full source code
- **MounteaDialogueSystem_Binaries** - Pre-compiled (recommended for Blueprint projects)

!!! tip "Blueprint Projects"
    Binaries version skips code compilation when opening projects.

## 2. Install the Plugin

### Marketplace Installation

Epic Games Launcher handles installation automatically.

### GitHub Installation

**Two installation methods:**

#### Game Folder Installation
Plugin available only for this specific project.

**Path:** `/ProjectFolder/Plugins/`

!!! note inline "Create Plugins Folder"
    Create `/Plugins/` folder if it doesn't exist.

!!! warning inline end "Blueprint Projects"
    May require creating a dummy C++ class for packaging.

#### Engine Folder Installation  
Plugin available for all projects using this engine version.

**Path:** `/EngineFolder/EngineVersionFolder/Engine/Plugins/`

**Default Engine Location:** `C:/Users/{user}/UnrealEngine/{engine_version}`

## 3. Open the Project

### Welcome Screen

First-time project opening shows the Welcome Screen popup:

- Appears for first-time opens
- Shows when new version is released
- Contains useful links and full changelog
- Fetches data from GitHub (requires internet)

!!! warning "Internet Required"
    Welcome Screen requires internet access to display changelog information.

### 3.1 Enable the Plugin

#### Marketplace

1. **Open project** for the first time
2. Go to **Edit** → **Plugins** → **Mountea Framework**
3. **Enable** the plugin
4. **Restart Editor** when prompted

#### GitHub

Plugin should be enabled by default. If not:

1. **Edit** → **Plugins** → **Mountea Framework** 
2. **Enable** if unchecked
3. **Restart Editor**

<p align="center" width="100%">
    <img width="42.5%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/OpenPlugins.webp">
    <img width="42.5%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/PluginsView.webp">
</p>

## Project Settings Configuration

After installation, configure basic settings:

### Access Settings
**Window** → **Project Settings** → **Mountea Framework**

<p align="center" width="100%" class="image-preview">
    <img width="42.5%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/QuickAccess.webp">
    <img width="42.5%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/QuickAccess2.webp">
</p>

!!! tip "Quick Access"
    You can use the toolbar `Mountea Dialogue System` button to open a dropdown which offers quick access to settings

### Essential Configuration

- **Default Dialogue Widget Class** - Set your UI class (optional)
- **Input Mode** - Choose input restrictions during dialogues
- **Subtitle Settings** - Configure default appearance

!!! tip "Quick Start"
    You can use default settings initially. The system includes example data and widgets.

## Verification

Confirm successful installation:

1. **Components Available** - Search "Mountea Dialogue" in Add Component menu
2. **Content Accessible** - Find `/Plugins/MounteaDialogueSystem/Content/` in Content Browser  
3. **Welcome Screen** - May appear automatically (with internet)

## Troubleshooting

!!! warning "Plugin Not Visible"
    - Verify enabled in Edit → Plugins
    - Check engine version compatibility  
    - Restart editor completely

!!! warning inline "Packiging Issues (Blueprint Projects)"
    - Create dummy C++ class: **File** → **New C++ Class** → **None**
    - Or use Binaries version instead

!!! warning inline end "Packiging Issues (Source Version)"
    - Install Visual Studio or Xcode
    - Verify engine version compatibility
    - Clean and rebuild project

---

## Next Steps
<div class="card-grid">
    <div class="card next-steps configuration">
        <div class="card-icon">💬</div>
        <h3 class="card-title">Configuration →</h3>
        <p class="card-description">How to setup the plugin so everything works</p>
        <a href="../PluginConfiguration" class="card-link"></a>
    </div>
</div>
