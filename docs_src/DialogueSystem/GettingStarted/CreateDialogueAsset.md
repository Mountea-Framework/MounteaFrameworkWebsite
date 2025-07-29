---
tags:
  - tutorial
  - dialogue
  - authoring
  - graph
---

# Crafting Your First Dialogue

A step‑by‑step guide to creating and testing your first dialogue tree with the Mountea Dialogue System. This chapter covers topics of creation, validation and orientation with Mountea Dialogue Tree assets and its properties.

---

## 1. Introduction

### What You’ll Learn
- Creating a **Dialogue Tree** asset
- Navigating the **Dialogue Editor**
- Adding and connecting **Nodes**
- Binding **Data Tables** for text & audio
- Using **Auto‑Arrange** and **Validate** tools

---

## 2. Create a Dialogue Tree Asset

1. In the **Content Browser**, right‑click in your desired folder.
2. Choose **Miscellaneous → Mountea → Dialogue Tree**.
3. Name it (e.g. `DT_FirstConversation`). 

!!! tip
    Dialogue Trees appear under **🗣️ Mountea Dialogue System** in the right‑click menu—no need to hunt through submenus.

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/CreatePanel.webp">
</p>

---

## 3. Open & Explore the Dialogue Editor

1. **Double‑click** your new `DT_FirstConversation`.
2. You’ll see the **Start Node** fixed at the top-left—this is the immutable entry point of your conversation.
3. Toolbard shows a list of actions-those will be relevant later.
4. Right side contains **Details** panel with properties of the Dialogue Tree itself
   1. You can change Tree Decorators (explained later)
   2. You can change Tree gameplay tags 

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/DialogueTreeWindow.webp">
</p>

---

## 4. Add and Connect Nodes

### 4.1. Node Types
In order to understand what Dialogue Tree actually is and how does it work you must understand what Dialogue Nodes are.

Dialogue Nodes are definitions of certain points in the Dialogue Flow. Each Node holds certain data and has different behaviour baked into it.

| Node Type              | Node Description                                                                                                                                                                                                                                                                | Node Details                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Start Node             | <ul><li>This Node will be added to the Dialogue Graph automatically when the Graph is created.</li><li>This Node cannot be created manually.</li><li>This Node cannot be deleted from Graph.</li><li>Does not implement any logic, works as an Anchor starting point.</li></ul> | <ul><li>Documentation</li></ul>                                            |
| Answer Node            | <ul><li>This Node represents the Player's answers.</li><li>This Node requires the Player's input to be started.</li><li>Requires Dialogue Data Table to work properly.</li><ul>                                                                                                 | <ul><li>Documentation</li><li>Dialogue Data</li><li>Data Preview</li></ul> |
| Complete Dialogue Node | <ul><li>This Node will complete Dialogue after the Player's input.</li><li>Indicates that Dialogue can be manually closed.</li><li>Requires Dialogue Data Table to work properly.</li></ul>                                                                                     | <ul><li>Documentation</li><li>Dialogue Data</li><li>Data Preview</li></ul> |
| Lead Node              | <ul><li>This Node represents NPC lines.</li><li>This Node starts automatically upon reaching the Dialogue Tree.</li><li>Requires Dialogue Data Table to work properly.</li></ul>                                                                                                | <ul><li>Documentation</li><li>Dialogue Data</li><li>Data Preview</li></ul> |
| Return To Node         | <ul><li>Provides the ability to return from Dialogue Node to a different one.</li><li>Useful when dialogue branching disallows pin connections.</li></ul>                                                                                                                       | <ul><li>Documentation</li><li>Return Node Preview</li></ul>                |

<p align="center" width="100%" class="preview-container grid">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/AnswerNode.webp">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/CompleteNode.webp">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/DelayNode.webp">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/NodeDetails.webp">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/ReturnNode.webp">
</p>

### 4.2. Adding Nodes
- **Right‑click** on the canvas or on a node’s output pin.
- Select from **Lead**, **Answer**, **Complete**, etc. 

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/NewNode.webp">
</p>

### 4.3. Connecting Nodes
1. **Drag** from an output pin to another node’s input pin.
2. Release to create the link—invalid links show an error tooltip.

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/CreatePanelV2.webp">
</p>

### 4.4. Quick Flow Example
Build a simple greeting with Yes/No choices:

- **Start → Lead Node** (“NPC: Hello!”)
- **Lead → Answer** (“Yes”) → **Lead** (+ NPC reply) → **Complete**
- **Lead → Answer** (“No”) → **Complete**

Save—and expect a validation warning until you bind data!

---

## 5. Populate Dialogue Data

!!! question "Why Use Data Tables?"
    - **Centralized text/audio** for localization & reuse
    - Keeps your graph clean of hard‑coded strings 

### 5.1. Create & Fill a Data Table
1. **Right‑click** → **Miscellaneous → Data Table**.
2. Select the **DialogueRow** struct.
3. Add rows with:
   - **Row Name** (identifier)
   - **Title Text** (choice label)
   - **Dialogue Row Data** (text & optional sound)
   - **Optional Icon** or **Data Asset**

<p align="center" width="100%" class="preview-container">
  <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/CreateDataTable.webp">
  <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/DataTable.webp">
</p>

!!! warning
    Renaming a row after use will break any nodes bound to it—plan your IDs carefully.

#### 5.1. Dialogue Data

Dialogue Data is a structure which contains the whole node data. Each Dialogue Data structure is meant to be unique with clear definition who (using Gameplay Tags) can use this data. 

!!! info
    Imagine `Dialogue Data` to be a `header` of some sort, which only defines the communication between dialogue participants.

| Property Name                | Description                                                                                                                                                                                                                                                                                                                                         | Default Value |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Compatible Tags              | List of GameplayTags which distinguish participants. Should be unique for each Dialogue Row for the specific speaker.                                                                                                                                                                                                                               | empty         |
| UI Row ID                    | Optional Row type ID. Could be used to visually differentiate rows which are using same UI Class.                                                                                                                                                                                                                                                   | 0             |
| Row Optional Icon            | Could be used to mark special dialogue options, like "Open Store" or "Leave conversation" with special icon.                                                                                                                                                                                                                                        | `nullptr`     |
| Dialogue Participant         | Name of the Dialogue Participant. If left empty, Dialogue will ignore it and use its default Participant name.                                                                                                                                                                                                                                      | empty         |
| Row Title                    | This should summarize what is this row about, let's say "Accept offering" is a title for "Thank you very much, kind sir, it would be pleasure to join you on your adventure!".                                                                                                                                                                      | empty         |
| Row GUID                     | Read-only unique Key when searching and binding this Row.                                                                                                                                                                                                                                                                                           | random         |
| Dialogue Row Additional Data | Generic Data Asset reference which could hold some more data. Any Data Asset can be used here and no logic is tied to this attribute.                                                                                                                                                                                                               | `nullptr`     |
| Dialogue Row Data            | List of Dialogue Row Data. Each Dialogue Row can contain multiple of those, where each Data Row represents: <ul><li>What Sound should be played</li><li>What text should be displayed</li></ul> Each Data Row has its Duration, which could be based on the Sound, directly set, calculated on generic formula or added atop of the sound duration. | empty         |

#### 5.2. Dialogue Row Data

Dialogue Row Data is a structure which contains the actual Dialogue body. This is what data is going to be displayed/played on screen.

!!! info
    Image `Dialogue Row Data` to be a `body` of the Dialogue interaction. While `header` defines **WHO** speaks, this `body` defines **WHAT** is said.

| Property Name           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Default Value |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Row Text                | Multi-line localizable Row Text contains data Players will see in the UI.                                                                                                                                                                                                                                                                                                                                                                                                             | empty         |
| Row Sound               | Sound to be triggered once this Row Data has been displayed in UI. It is expected to be the *voice* of the Participant.                                                                                                                                                                                                                                                                                                                                                               | `nullptr`     |
| Row Duration Mode       | Determines how the `Row Duration` is calculated. Values: <ul><li>**Manual:** Row won't start automatically and will wait for `NextDialogueRow` request.</li><li>**Duration:** Uses either duration of `Row Sound` or value from `Duration`</li><li>**Override:** Uses `Duration Override` value.</li><li>**Add Time:** Adds `Duration Override` value to `Duration`.</li><li>**Calculate:** Calculates Duration automatically. Base value is: 100 characters per 8 seconds.</li></ul> | `Duration`    |
| Row Duration            | Determines for how long the UI will display this Row Data. Using *seconds* as unit.                                                                                                                                                                                                                                                                                                                                                                                                   | 0.f           |
| Row Duration Override   | Determines how much time is added to the Row Duration if any.                                                                                                                                                                                                                                                                                                                                                                                                                         | 0.f           |
| Row Execution Behaviour | If set to true this Row will stop the whole Node execution and next row won't start. Values: <ul><li>**Automatic:** Next row will be executed if any is present.</li><li>**Await Input:** Next row will be executed once request is triggered.</li><li>**Stopping:** Row will stop execution of whole Node and will finish both.</li></ul>                                                                                                                                            | `Automatic`   |
| Row GUID                | Unique Key when searching and binding this Row.                                                                                                                                                                                                                                                                                                                                                                                                                                       | random         |

---

## 6. Bind Data to Your Nodes

1. Select a **Lead**, **Answer**, or **Complete** node.
2. In Details → **Data Table**, pick your table.
3. Choose a **Row Name**—the editor previews text/audio inline. 

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/UsingTables.webp">
</p>

---

## 7. Graph Utilities

### 7.1. Auto‑Arrange
- Click **Auto Arrange** in the toolbar to neatly layout your nodes.

!!! info "Experimental Feature"
    Auto-arrange is experimental feature which *might* sometimes freeze the entire Editor. 

### 7.2. Validate Graph
- Click **Validate Graph**.
- Inspect errors/warnings in the Output Log.
- Format: `{ComponentName}: {ErrorMessage}`—fix missing data or broken links.

### 7.3. Export Graph
- Click **Export Dialogue Graph**.
- Select destination to save the files to.
- Exported file should have the same name as your graph with `mnteadlg` extension.

!!! feature "Import & Export"
    Mountea Dialogue provides a way to import/export Graphs. We also provide online dialogue editor <a href="https://mountea.tools/dialoguer" target="_blank">Mountea Dialoguer</a>.

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/ToolbarActions.webp">
</p>

---

## 8. Common Pitfalls

!!! bug "Common Issues"
    **No Preview?**
    
    - Ensure your Data Table uses the correct struct (`DialogueRow`).
    
    **Broken Links?**
    
    - Check for renamed nodes or rows.

    **Validation Errors** 
    
    - Always point to missing data or improper connections—address them before playtesting.

---

## 9. Next Steps
<!--
<div class="card-grid">
  <div class="card next-steps decorators advanced">
    <h4 class="card-title">(Advanced) Decorators for Dialogue</h4>
    <p class="card-description">Add conditional logic & flow controls</p>
    <a href="../Decorators" class="card-link"></a>
  </div>
  -->
  <div class="card next-steps startDialogue">
    <h4 class="card-title">Start Dialogue</h4>
    <p class="card-description">Learn how to start the dialogue</p>
    <a href="../StartDialogue" class="card-link"></a>
  </div>
</div>
