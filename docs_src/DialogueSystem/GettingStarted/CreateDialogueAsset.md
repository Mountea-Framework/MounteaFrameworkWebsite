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

---

## 3. Open & Explore the Dialogue Editor

1. **Double‑click** your new `DT_FirstConversation`.
2. You’ll see the **Start Node** fixed at the top-left—this is the immutable entry point of your conversation.
3. Toolbard shows a list of actions-those will be relevant later.
4. Right side contains **Details** panel with properties of the Dialogue Tree itself
   1. You can change Tree Decorators (explained later)
   2. You can change Tree gameplay tags 

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

### 4.2. Adding Nodes
- **Right‑click** on the canvas or on a node’s output pin.
- Select from **Lead**, **Answer**, **Complete**, etc. 

### 4.3. Connecting Nodes
1. **Drag** from an output pin to another node’s input pin.
2. Release to create the link—invalid links show an error tooltip.

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

!!! warning
    Renaming a row after use will break any nodes bound to it—plan your IDs carefully.

---

## 6. Bind Data to Your Nodes

1. Select a **Lead**, **Answer**, or **Complete** node.
2. In Details → **Data Table**, pick your table.
3. Choose a **Row Name**—the editor previews text/audio inline. 

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

---

## 8. Common Pitfalls

- **No Preview?** Ensure your Data Table uses the correct struct (`DialogueRow`).
- **Broken Links?** Check for renamed nodes or rows.
- **Validation Errors** always point to missing data or improper connections—address them before playtesting.

---

## 9. Next Steps

<div class="card-grid">
  <div class="card next-steps decorators">
    <h4 class="card-title">(Advanced) Decorators for Dialogue</h4>
    <p class="card-description">Add conditional logic & flow controls</p>
    <a href="../Decorators" class="card-link"></a>
  </div>
  <div class="card next-steps flow">
    <h4 class="card-title">Dialogue Flow Overview</h4>
    <p class="card-description">Learn how the system executes your graph at runtime</p>
    <a href="../DialogueFlow" class="card-link"></a>
  </div>
</div>
