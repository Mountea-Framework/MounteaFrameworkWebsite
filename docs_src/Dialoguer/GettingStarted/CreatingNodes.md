---
tags:
  - start
  - create
  - node
  - tutorial
  - dialoguer
---

# Adding and managing nodes

The whole purpose of this tool is to visually connect nodes in order to create dialogue graphs.

---

## 1. Adding Dialogue Nodes

1. **Open the Editor Canvas**
       - Your canvas loads automatically after setup
      - You canvas contains only `Start Node`
       - `Start Node` cannot be deleted nor modified
2. **Add new Node**
       - **Use Mouse**
        - Right-click the mouse to spawn window with possible Nodes
    - **Use Connector**
        - Bring connection from existing Node and release it somewhere in the canvas
3. **Select Node Type**
     - Node Types are explained in the table below
4. **Place & Connect**
    - Click on the canvas to drop the node.
    - Drag its connector dots to link to other nodes, defining your flow.


<p align="center" width="100%" class="preview-container">
    <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/NewNodeConnection.webp">
    <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/NewNodeMouse.webp">
</p>

!!! feature inline "From Connection"
    If you drag a connector from existing node and release it, the Nodes selection page will appear with Node to select.

!!! info inline end "Right-click"
    The modal window shows if you draw from existing Node or anytime you right-click with a mouse on the canvas.

---

## 2. Node Types

| Node               | Description                  |
| ------------------ | ---------------------------- |
| **Lead**           | Narrator/NPC or system line. |
| **Answer**         | Player response.             |
| **Jump To**        | Branch jump to another Node. |
| **Close Dialogue** | Ends the dialogue with text. |

---

## 3. Next Steps

<div class="card-grid">
  <div class="card next-steps export configuration">
    <h4 class="card-title">Creating Dialogue Rows</h4>
    <p class="card-description">Add and manage Dialogue Row Data for Nodes</p>
    <a href="../CreatingDialogueRows" class="card-link"></a>
  </div>
</div>
