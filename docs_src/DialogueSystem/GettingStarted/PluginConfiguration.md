---
tags:
    - configuration
    - tutorial
    - dialogue
---

# Configuring the Dialogue System

This guide is written for designers, narrative leads, and producers. You’ll learn how to set up your default UI, style subtitles, leverage built‑in and custom commands, adjust editor visuals, and follow best practices to keep your workflow smooth and consistent.

---

## 1. Tutorial Page

In order to simplify the process of setting up the system, we are providing in-engine tutorial which serves a purpose of quick tutorial. You can open the tutorial panel using the **Mountea Dialogue System** toolbar menu. This Tutorial page also has the ability to navigate you to specific parts, for example: *Project Settings*, *Plugin Folder* or specific *Config folder*.

This Tutorial page should provide just enough information to kickstart your project.

<p align="center" width="100%" class="preview-container">
    <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/TutorialPage.webp">
    <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/TutorialWindow.webp">
</p>

!!! tip "Quick Tip"
    You can dock the Tutorial window so it never goes away.

---

## 2. Open the Configuration Panel

1. In the Unreal Editor, go to **Edit → Project Settings**.
2. Scroll down and expand **Mountea Framework** in the sidebar.
3. Click **Mountea Dialogue System** to reveal game‑time and editor‑only settings.

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/SettingsPage.webp">  
</p>

!!! tip "Quick Tip"
    You can use a toolbar menu **Mountea Dialogue System** to access Settings and Configuration.

<p align="center" width="100%" class="preview-container">
    <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/QuickAccess.webp">
    <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/QuickAccess2.webp">
</p>

---

## 3. Dialogue Defaults (Runtime)

These settings define how every conversation behaves in your game. Once set, every Dialogue Manager component uses these values automatically. In newer version of the system (since version `2.x`) the runtime settings are replaced with `Dialogue Configuration` asset which contains all the runtime configuration properties.

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/ConfigPage.webp">
</p>

Runtime settings now provide 3 main categories:

* **Dialogue Configuration:** Asset reference which contains the actual settings
* **Widget Commands:** A list of widget commands used for class-independent communication across the Dialogue System
* **Logging:** Provides a way to allow certain verbosity of logs

### 3.1 Dialogue Configuration

| Property                     | Description                                                                                                                                                                   | Default |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Default Dialogue Widget Class | Select the Blueprint or C++ widget that renders your conversations. Your widget must implement `IMounteaDialogueWBPInterface` to appear in this list.                         | `nullptr`     |
| Input Mode                   | <ul><li>**UI Only**: locks movement and input to the dialogue UI</li><li>**Game and UI**: lets players move freely and use the dialogue UI at once</li></ul>                  | Game and UI   |
| Fade Animations              | Control how quickly the dialogue window fades in and out. Adjust this to match your game’s pacing.                                                                            | 0.2s          |

!!! warning "Define Base Widget"
    If you leave this blank, you’ll need to assign a widget on every Dialogue Manager actor instead.

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/DialogueUISelectionList.webp">
</p>

### 3.2 Subtitle Defaults

* **Update Interval**
  Determines how often subtitle text updates for effects like typewriter or progress bars. Lower values feel smoother but cost more CPU.  *Default: 0.05s*

* **Skip Fade Duration**
  Sets how fast voice‑over stops when a player skips ahead. This helps sync text and audio.  *Default: 0.1s*

* **Enable Subtitles**
  Master switch to show or hide subtitles globally. Toggling at runtime requires a small C++ override to apply immediately.  *Default: On*

* **Row-Level Overrides**
  Give each dialogue row (ID 0–255) its own font, color, or effect. Perfect for highlighting narrator lines, special characters, or tutorial hints without creating new widgets.

!!! tip "Row-Level Highlighting"
    Use a distinct color for tutorial or narrator lines so players immediately know context.

---

## 4. Styling Your Dialogue

Make every line look on‑brand without touching widget Blueprints.

* **Text Color & Opacity**: Match your UI theme and legibility requirements.
* **Font Family & Size**: Pick a readable font that fits your art style.
* **Shadow & Outline**: Improve contrast on busy backgrounds or add a stylistic flair.

!!! note "Design Consistency"
    Keep your dialogue style consistent with HUD and menus for a cohesive experience.

---

## 5. Commands: Built‑In and Custom

Commands are simple text keys in your dialogue data that tell the system which UI actions to run. You won’t need to touch Blueprint wiring inside the plugin itself.

### 5.1 Core Commands (Fixed)

These commands are provided by the plugin’s C++ core. They trigger standard UI behavior and should never be renamed or removed:

| Command                 | What It Does                     |
| ----------------------- | -------------------------------- |
| `CreateDialogueWidget`  | Opens the dialogue window.       |
| `ShowDialogueRow`       | Displays a new line of dialogue. |
| `UpdateDialogueRow`     | Edits the current dialogue line. |
| `AddDialogueOptions`    | Shows player choice buttons.     |
| `RemoveDialogueOptions` | Clears old choice buttons.       |
| `HideDialogueRow`       | Fades out the current line.      |
| `CloseDialogueWidget`   | Closes the dialogue window.      |

!!! warning "Core Commands"
    These are baked into the plugin’s code. Changing them breaks core functionality.

### 5.2 Custom Commands

You can also fire your own commands from dialogue data to hook into game logic. Just list the command name in your text; your Blueprint or C++ must handle it:

```txt
OpenInventory
PlayCameraShake
ShowCharacterPortrait
StartQuest
```

Your game’s code listens for these strings and runs matching events or functions.

---

## 6. Dialogue Editor Defaults

Customize the look and feel of the Dialogue Graph editor for smoother content creation.

### 6.1 Node Settings

* **Corners**: Soft (default) or hard edges.
* **Theme**: Dark (default) or light background.
* **Decorator Style**: Unified bubbles or stacked panels for inheritance and implementation info.
* **Auto Names**: Show class names instead of manual labels.
* **Background Overrides**: Assign custom colors to node types for quick visual grouping.
* **Native Decorator Edit**: If turned on, clicking native C++ decorators opens your IDE.

<p align="center">
  <img class="preview" width="45%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/NodeSettings1.webp">
  <img class="preview" width="45%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/NodeSettings2.webp">
</p>

!!! tip "Visual Workflow"
    Color‑coding nodes by type or purpose helps navigate large dialogue trees at a glance.

### 6.2 Wiring & Layout

* **Wire Thickness**: Increase for clarity in dense graphs.  *Default: 0.5*
* **Wire Color**: Pick a contrasting hue to stand out against your theme.
* **Auto‑Arrange** (Experimental): Let the plugin tidy your nodes automatically—always save before using.

### 5.3 Decorator Display

Toggle whether to show decorator counts, inheritance icons, or both. This keeps your graph clean or richly annotated, depending on your workflow.

---

## 7. Best Practices

1. **Start with Defaults**: Use the out‑of‑the‑box settings and only tweak as needed.
2. **Work Incrementally**: Change one setting at a time and test in‑editor or in‑game immediately.
3. **Document Custom Commands**: Keep a shared list of custom command names and their handlers.
4. **Version Control**: Commit your `DefaultGame.ini` and `DefaultEditor.ini` so team members stay in sync.
5. **Backup Before Auto‑Arrange**: Always save or branch before running experimental layout options.

---

## 8. Next Steps

<div class="card-grid">
  <div class="card next-steps setupDialogueManager">
    <h4 class="card-title">Setup Dialogue Manager</h4>
    <p class="card-description">Connect your widget, data, and events</p>
    <a href="../SetupDialogueManager" class="card-link"></a>
  </div>
</div>
