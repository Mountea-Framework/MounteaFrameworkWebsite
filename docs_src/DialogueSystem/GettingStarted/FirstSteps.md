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
    <img width="42.5%" src="https://media.discordapp.net/attachments/805485498692796436/1390780655876575304/OpenPlugins.webp?ex=686980eb&is=68682f6b&hm=e9717b801851c379402befb4135faf9d2daa4ca6bedd3f69f6d4b391145edd34&=&format=webp&width=1032&height=523">
    <img width="42.5%" src="https://media.discordapp.net/attachments/805485498692796436/1391132763641348147/PluginsView.webp?ex=686ac8d8&is=68697758&hm=4598cd2a4f92d6a02724d8c6a324d872197cb98dc7f4a4c0650c17fef5ad0941&=&format=webp&width=1032&height=523">
</p>

## Project Settings Configuration

After installation, configure basic settings:

### Access Settings
**Window** → **Project Settings** → **Mountea Framework**

<p align="center" width="100%" class="image-preview">
    <img width="42.5%" src="https://media.discordapp.net/attachments/805485498692796436/1390768527161688104/QuickAccess.webp?ex=686975a0&is=68682420&hm=6dec6cc6a944b523565f4cebca8f800a61ca0fa1da39ec962180073ddaa309a0&=&format=webp&width=1672&height=848">

    <img width="42.5%" src="https://media.discordapp.net/attachments/805485498692796436/1390775170762805428/QuickAccess2.webp?ex=68697bd0&is=68682a50&hm=71a92ff32cd838827647bdec74bac5163bb39fb8456f4d40f2ff396dc21c9e42&=&format=webp&width=1032&height=523">
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
[Configuration →](PluginConfiguration.md) How to setup the plugin so everything works
