# Frequently Asked Questions

## What is the Mountea Framework?

Mountea Framework is an open-source collection of tools and plugins for Unreal Engine developers, created to streamline game development workflows—especially for single-player adventure and RPG titles. It’s maintained by Dominik Morse and the community.

## Which plugins and tools are available?

!!! success "Finished Systems"
    - **[Mountea Interaction System](https://github.com/Mountea-Framework/MounteaInteractionSystem)**  
      Smart, event-driven actor interactions with designer-friendly components.
    - **[Mountea Dialogue System](https://github.com/Mountea-Framework/MounteaDialogueSystem)**  
      Rich dialogue trees with validation and in-editor graph authoring.

## Which plugins and tools are in progress?

!!! danger "Under development"
    - **[Mountea Inventory & Equipment System](https://github.com/Mountea-Framework/MounteaInventoryEquipment)**  
      Modular inventory and equipment management for items, templates, and actions.
    - **[Mountea Documentation System](https://github.com/Mountea-Framework/MounteaDocumentationSystem)**  
      Plugin to embed and manage in-game documentation and tutorials.
    - **[Mountea Tools Library](https://github.com/Mountea-Framework/MounteaToolsLibrary)**  
      Collection of utility functions, blueprint nodes, and editor extensions.
    - **[Mountea Quest System](https://github.com/Mountea-Framework/MounteaQuestSystem)**  
      Framework for quest and story management with progress tracking.

## Auxiliary Tools

!!! feature "Standalone tools & features"
    - **[Mountea Dialoguer](https://github.com/Mountea-Framework/MounteaDialoguer)**  
      Standalone dialogue authoring tool for external story editing.
    - **[Mountea Project Launcher](https://github.com/Mountea-Framework/MounteaProjectLauncher)**  
      CLI-based launcher for quickly opening and testing multiple projects.
    - **[Inventory Manager](https://github.com/Mountea-Framework/InventoryManager)**  
      Browser-based editor for managing item templates from anywhere.
    - **[Examples Repository](https://github.com/Mountea-Framework/Examples)**  
      Sample projects demonstrating how to integrate each plugin.

# How do I install a plugin?
!!! question "Installing from GitHub?"
    - **Clone** the desired repo:
    ```bash
        git clone https://github.com/Mountea-Framework/<PluginRepo>.git
    ```
    - **Copy** the plugin folder into your Unreal project’s `Plugins/` directory.
    - **Reopen** your project in Unreal Engine. The plugin appears under **Edit → Plugins**.

Otherwise use FAB standard installation guide.

## Which Unreal Engine versions are supported?

Most plugins support **UE 5.0 and newer versions**. For exact compatibility and version-specific branches, see the **Releases** or **README** of each plugin’s GitHub page.

## Is Mountea Framework free?

Yes! All plugins and tools are free to use and open-source. If you’d like to support ongoing development, consider sponsoring us on GitHub:
[GitHub Sponsors → Mountea-Framework](https://github.com/sponsors/Mountea-Framework)

## Will multiplayer be supported?

Multiplayer (replication) is planned for **Stage 3** of each plugin’s roadmap. Initial releases focus on solid single-player functionality, with replication added in subsequent updates.

| Replicated | Plugin                   |
|----------|---------------------------|
| ✅       | [Interaction System](index.md)        |
| ✅       | [Dialogue System](index.md)     |
| ✅       | [Advanced Inventory & Equipment](AdvancedInventoryEquipmentSystem/Overview.md)¹      |
| ❌       | [Documentation System](index.md)         |

!!! info "Advanced Inventory & Equipment"
    Once solution is released the replication will be part of the system. System is currently under development.

## Where can I find usage examples?

Browse our **Examples** repo for ready-to-go sample maps and Blueprints that show how to set up and use each plugin:
[Examples Repository](https://github.com/Mountea-Framework/Examples)

## Where can I get support or report issues?

- **Discord**: [Join the Discord Channel](https://discord.com/invite/G66XvQTv3E)
- **GitHub Issues**: Open a ticket on the relevant plugin’s **Issues** tab.

## How can I contribute?

!!! tip inline "If you are developer"
    1. **Fork** the repo you’d like to improve.
    2. Create a **feature branch**, implement your changes, and add tests/docs.
    3. Submit a **Pull Request**—we’ll review and merge.
    4. Thank you for helping make Mountea better!

!!! tip inline end "If you are not developer"
    1. [Join the Discord Channel](https://discord.com/invite/G66XvQTv3E)
    2. Be active part of community
    3. Report **bugs** and **issues**