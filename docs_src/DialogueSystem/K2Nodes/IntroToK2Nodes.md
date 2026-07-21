---
tags:
  - reference
  - dialogue
  - blueprint
---

# K2Nodes Intro

The Mountea Dialogue System ships one custom Blueprint graph node, `K2Node_MounteaDialogueCallFunction`. This page explains what it is, why it exists, and how to read the colors it puts on your graph - there's nothing you need to set up, but it helps to know what you're looking at.

---

## 1. What a K2Node Is

A K2Node is a custom Blueprint graph node implemented through the Blueprint compiler itself, rather than the plain "call this function" node the engine generates automatically for every `BlueprintCallable` function - it can change how a node looks, but that's the only thing this particular one does.

---

## 2. Why This Plugin Has One

A large Blueprint graph can end up with hundreds of grey function-call nodes, and nothing about a stock node's appearance tells you it came from the Dialogue System rather than the engine, another plugin, or your own game code.

!!! question "Why a Custom Node Instead of Just More Functions?"
    The plugin doesn't need a custom node to expose its functions to Blueprint - plain `BlueprintCallable` already does that. The custom node exists purely so those functions are easy to spot once they're on the graph: color-coded by role and branded as coming from the Dialogue System, instead of blending into the grey.

---

## 3. How You Encounter It

You don't do anything to opt in. Any function in the plugin's three modules (`MounteaDialogueSystem`, `MounteaDialogueSystemEditor`, `MounteaDialogueSystemDeveloper`) that carries a recognized `CustomTag` metadata value is automatically registered with this node instead of the engine's default one - the grey call-function node for that function never appears in the right-click menu at all.

!!! info
    The scan covers Blueprint Function Libraries, interfaces, and ordinary classes alike, so the same styling shows up whether you're calling a static helper, an interface function, or a method on a component like `MounteaDialogueManager` or `MounteaDialogueParticipant`.

---

## 4. The Three Roles

The `CustomTag` value on a function decides which role the node takes on, which in turn drives its title color, its icon, and the extra line added to its tooltip:

| Role | `CustomTag` Value | Node Title Color | What It Signals |
| --- | --- | --- | --- |
| Getter | `MounteaK2Getter` | Dark navy blue | Reads and returns a value without changing anything |
| Setter | `MounteaK2Setter` | Deep plum/magenta | Writes or modifies a value or state on the target |
| Validator | `MounteaK2Validate` | Amber/bronze | Checks data against rules and reports whether it's valid |

Each role also gets its own small icon (distinct per role, rendered next to the node title) and, if the engine doesn't already show one, a Mountea logo watermark in the node's corner. Underneath the title, the node adds a context line reading "Source is Mountea Dialogue System" (or the specific class the function lives on, e.g. "Source is Mountea Dialogue System Settings") - a second, textual confirmation that you're not looking at a stock engine node.

<!-- TODO(image): screenshot of a Blueprint graph showing several of these color-coded nodes side by side (a getter, a setter, and a validator) so the color differences are visible together. -->
<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/K2NodesOverview.webp">
</p>

!!! warning
    This is styling and discoverability only, not a different kind of node. It doesn't reshape pins, resolve wildcards, or change execution in any way - calling one of these functions from Blueprint behaves exactly like calling any other `BlueprintCallable` function. The only difference is what the node looks like on your graph.

---

## 5. Blueprint vs C++

This entire feature lives in the Blueprint graph compiler and has no C++ call-site equivalent. A C++ caller just calls the underlying function directly and never sees this node at all - nothing about the function's behavior, signature, or return value changes because of it.

---

## 6. Next Steps

<div class="card-grid">
  <div class="card next-steps home">
    <h4 class="card-title">Dialogue System Home</h4>
    <p class="card-description">Back to the Dialogue System overview</p>
    <a href="../../home" class="card-link"></a>
  </div>
</div>
