---
tags:
  - rows
  - dialoguer
  - tutorial
---

# Adding Dialogue Rows

Populate each node with the actual lines and media.

---

## 1. Select a Node

- Click a node to open its **Details** pane.
- In **Participant** select one from pre-defined values

!!! tip "Change Participants"
    You can always change Participants in Project Settings.

---

## 2. Add & Edit Rows

1. In **Dialogue Rows**, click **+** button.
2. New Dialogue Row is created with Text body propertym duration and optional audio file
3. Once you finish typing body, you can create another row

!!! feature "Suggestions"
    If you type `${}` in the row body, then list of available participants will be displayed. For example Player will be stored in the json as `${player}` allowing you to dynamically replace this text in game engine.

---

## 3. Duration & Audio

- **Duration Slider**: adjust play‑time in seconds.  
- **Audio Upload**: click or drag‑and‑drop a voice‑over file.

---

<p align="center" width="100%" class="preview-container grid">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/SelectNodeParticipant.webp">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/AddDialogueData.webp">  
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/WritingSuggestions.webp">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/DialogueDataDuration.webp">
</p>

!!! info
    Some Nodes don't have Details panel which allows fitting in text.

---

## 4. Next Steps

<div class="card-grid">
  <div class="card next-steps export configuration">
    <h4 class="card-title">Export Your Dialogue</h4>
    <p class="card-description">Bundle everything into a `.mnteadlg` file</p>
    <a href="../ExportingDialogue" class="card-link"></a>
  </div>
</div>
