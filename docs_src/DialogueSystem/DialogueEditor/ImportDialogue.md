---
tags:
  - reference
  - dialogue
  - import
  - export
---

# Import & Export Dialogues

The Dialogue System can round-trip a Dialogue Tree to a portable archive and back - both to move dialogues between projects and to hand a conversation off to the standalone **Mountea Dialoguer** web tool. This page documents the archive format and the actual import/export pipeline as implemented in the Editor module.

---

## 1. Introduction

### What You'll Learn
- What actually goes inside a `.mnteadlg` file, and how `.mnteadlgproj` differs
- Where import comes from (there's no "Import" button on the graph editor itself)
- What the importer does, phase by phase, when it populates a Graph
- Where `.mnteadlg` fits alongside Mountea Dialoguer

---

## 2. The .mnteadlg Format

A `.mnteadlg` file is a ZIP archive - the plugin writes it with its own minimal ZIP writer and reads it back with an embedded `miniz`-based unzip, so no external tools are required. Inside:

| File / folder | Required | Contents |
| --- | --- | --- |
| `dialogueData.json` | Yes | The archive's identity: a stable `dialogueGuid` plus the dialogue's display name. This is what lets a later import recognise "update an existing Graph" versus "create a new one." |
| `categories.json`, `participants.json`, `nodes.json`, `edges.json`, `dialogueRows.json` | Yes | The Graph itself: node/edge structure, participants, and the actual dialogue row content. Import refuses the archive outright if any of these is missing. |
| `decorators.json`, `conditions.json` | No | Describes any custom Decorator/Condition types the archive references, so the importer can generate matching Blueprint classes in this project if they don't already exist. |
| `audio/` | No | WAV/MP3/OGG/FLAC files, imported as `SoundWave` assets. |
| `Thumbnails/` | No | PNG files, imported as `Texture2D` assets. |
| `stringTable.json` | No | Localized text, imported into `UStringTable` assets plus a `.po` file per non-default locale for Unreal's localization pipeline. |

A **`.mnteadlgproj`** file is the project-level container: a single `projectData.json`, shared `categories.json`/`participants.json`/`decorators.json`/`conditions.json`, participant thumbnails, and a `dialogues/` folder holding one nested `.mnteadlg` per conversation. Each nested archive is extracted and imported through the same pipeline described below, then every resulting Graph's import record is updated to point back at the parent `.mnteadlgproj` rather than an ephemeral temp file.

---

## 3. Where Import Comes From

There's no dedicated "Import" button inside the Dialogue Tree graph editor. Both file types register as standard Unreal `UFactory` classes instead, so importing uses the engine's usual asset-import surface:

- Drag a `.mnteadlg` or `.mnteadlgproj` file into the **Content Browser** (or use its own Import action) to create one or more new Dialogue Tree assets.
- `UMounteaDialogueGraphFactory` also accepts a bare `.zip` extension - the importer only checks for a valid ZIP file signature past that point, not the specific extension.
- **Reimport**: right-click an existing Dialogue Tree asset → **Reimport**. The factory implements Unreal's `FReimportHandler`, and reimport is also detected automatically through the plain import path - `ImportDialogueGraphFromFiles` looks up any existing Graph carrying the same `dialogueGuid` (via the asset registry's `GraphGUID` tag, falling back to import history kept in `UMounteaDialogueImportConfig`) and updates it in place instead of creating a duplicate asset.

!!! warning
    Reimporting fully replaces the existing Graph's content (`ClearGraph()` runs first) - it is a real reimport, not a merge. Once you start round-tripping a dialogue through Mountea Dialoguer, treat the archive as the source of truth, not the in-editor Graph.

---

## 4. What Happens on Import

Populating a Graph from an extracted archive runs in four phases:

1. **Decorator / Condition Blueprint classes** - for every distinct definition in `decorators.json`/`conditions.json`, the importer looks for an existing Blueprint subclass (matched by a GUID stored on the class's CDO) and creates a new one under `<Project>/Decorators/` or `<Project>/Conditions/` if none exists yet, wiring up its member variables from the definition's declared properties.
2. **Supporting assets** - registers any Gameplay Tags the participants reference, builds string tables plus `.po` localization files for dialogue text, creates the Participants and Dialogue Rows Data Tables, imports audio as `SoundWave`, imports thumbnails as `Texture2D`.
3. **Graph population** - creates every node object from `nodes.json`, every edge (with its Conditions) from `edges.json`, then resolves each `Return To Node`'s target now that every node exists.
4. **Data table fill** - populates the Participants and Dialogue Rows tables with the actual row content and links each dialogue node to its row.

The Graph is saved once population finishes. Any `Open Child Graph` node pointing at another dialogue in the same import batch has its target resolved once every graph in that batch exists on disk.

---

## 5. Exporting

**Export Dialogue Graph**, on the graph editor's own toolbar, packs the currently open Graph into a `.mnteadlg` at a destination you choose (defaulting to the Graph's own name). [Crafting Your First Dialogue](../GettingStarted/CreateDialogueAsset.md) already covers clicking the button - the content it produces is the same file layout described in [section 2](#2-the-mnteadlg-format): the JSON set, each referenced audio asset re-exported alongside the archive, and any available thumbnail data.

---

## 6. Mountea Dialoguer

The `.mnteadlg`/`.mnteadlgproj` formats are shared with **Mountea Dialoguer**, the standalone web-based dialogue editor - build or edit a conversation there and import the result directly into the engine, or export from the engine to hand a writer a version they can edit without installing Unreal at all.

!!! feature "Mountea Dialoguer"
    <a href="https://mountea.tools/dialoguer" target="_blank">https://mountea.tools/dialoguer</a> - a standalone web app companion to this plugin.

<!-- TODO(image): screenshot of dragging a .mnteadlg file into the Content Browser / the resulting import dialog -->
<!-- TODO(image): screenshot of Mountea Dialoguer's own export screen -->

---

## 7. Next Steps

<div class="card-grid">
  <div class="card next-steps setupDefaults">
    <h4 class="card-title">Setup Defaults</h4>
    <p class="card-description">Auto-configure your project's GameMode classes for Dialogue</p>
    <a href="../SetupDefaults" class="card-link"></a>
  </div>
</div>
