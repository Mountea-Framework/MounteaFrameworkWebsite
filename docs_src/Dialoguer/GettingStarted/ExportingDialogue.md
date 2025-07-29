---
tags:
  - export
  - download
  - dialoguer
---

# Exporting dialogue

Finalize your project into a single file for sharing or import.

## 1. Trigger Export

- Click the **↓** export button in the toolbar.
- `mnteadlg` file gets downloaded

!!! info "ZIP file"
    The `mnteadlg` file is just `zip` file under the hood, so you should be able to open the file with you favourite program, be it WinRAR or 7zip or any other.

---

## 2. What Gets Bundled

- **Metadata** (name, participants, categories)
- **Nodes & Rows** (all text, order, links)
- **Audio Files** (per dialogue row folder under `audio` folder)

| File              | Description                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| dialogueData.json | This file contains the dialogue header info, like title and its unique id.                                                              |
| participants.json | This file contains list of all participants in the dialogue with name of the participant and their category.                            |
| categories.json   | This file contains list of all categories in the dialogue with display name (combination of Name and Parent), name and parent category. |
| nodes.json        | This file contains all Nodes, including unique id of the node, position and data of the node.                                           |
| edges.json        | This file contains list of all edges, including name, id and what nodes each edge connects.                                             |
| dialogueRows.json | This is list of all dialogue rows with unique ids and what nodes those rows belong to.                                                  |

---

<p align="center" width="100%" class="preview-container grid">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/DownloadButton.webp">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/DownloadButton2.webp">  
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/DownloadFileContent.webp">
</p>

---

<p align="center" width="100%" class="preview-container grid">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/DialogueDataJson.webp">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/DialogueParticipantsJson.webp">  
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/DialogueCategoriesJson.webp">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/DialogueEdgesJson.webp">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/DIalogueNodesJson.webp">  
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialoguer/refs/heads/master/DocumentationSource/DialogueRowsExport.webp">  
</p>
