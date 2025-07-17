---
tags:
  - start
  - participant
  - player
  - NPC
  - tutorial
  - dialogue
---

# Dialogue Participant Component

The **Mountea Dialogue Participant** component identifies and configures Actors that engage in dialogues, linking them to specific dialogue trees, managing participant state, and handling voice playback support. :contentReference[oaicite:0]{index=0}

---

## 1. What Does It Do

- Links Actors to specific Dialogue Trees
- Manages participant state (Ready, Active, Disabled)
- Handles Audio Component references for voice playback
- Exposes participant-specific data to the Dialogue system

---

## 2. Critical Requirements

!!! info inline "Flexible Placement"
    Unlike the Manager Component, the Participant Component can be attached to **any Actor**—NPCs, environmental objects, and even the Player Pawn itself.

!!! danger inline end "Player Dialogue"
    Your **Player Pawn** **must** have this component for full functionality and proper interaction with the Dialogue Manager.

!!! tip "Audio Component Recommended"
    It’s recommended to add an **Audio Component** to the parent Actor to enable dialogue voice playback.

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/refs/heads/master/DocumentationResources/PlayerPawn.webp">
</p>

---

## 3. Adding the Component

### Step 1: Actor Preparation

#### For NPCs (Active Participants with Dialogue)

!!! info "Components Needed"
    - **Dialogue Participant Component**
    - **Audio Component**
    - **Visual representation** (Static Mesh or Skeletal Mesh)

#### For Player (Active Participant without Own Dialogue)

!!! info "Components Needed"
    - **Dialogue Participant Component**
    - **Audio Component**

### Step 2: Open Actor Blueprint
1. **Open** your Actor Blueprint (e.g., NPC or Player Pawn).
2. **Click** **Add Component**.
3. **Search** for **Mountea Dialogue Participant**.

### Step 3: Select Component Version
Choose between:

- **Mountea Dialogue Participant** – Basic C++ component.
- **BP_MounteaDialogueParticipant** – Pre-configured Blueprint version.

!!! tip "Quick Setup"
    The blueprint version includes default settings for the Dialogue Graph and Audio Component ID to get you up and running faster.

---

## 4. Audio Component Setup

1. **Add Component** → **Audio**.
2. **Name** the component **DialogueAudio**.
3. **Set** **Auto Activate** to `false`.
4. **Add Tag** `DialogueAudio`.
5. **(Optional)** Attach to a mesh socket for spatial audio.

!!! question "Why Audio Component?"
    This component plays voice lines during dialogue. Without it, no audio will be heard, breaking immersion.

---

## 5. Component Configuration

### Dialogue Graph
- **Type:** Dialogue Tree Asset
- **Purpose:** Defines which dialogue tree this participant uses.
- **Requirement:** Must not be null for dialogue to start.

!!! warning "Critical Setting"
    Without a valid Dialogue Graph, the system cannot initiate a dialogue.

### Default Participant State
- **Type:** Enum (`Enabled`, `Active`, `Disabled`)
- **Purpose:** Initial state on BeginPlay.
- **Default:** `Enabled`

!!! warning "Active State Restriction"
    You **cannot** set `Active` as the default; it's reserved for runtime state transitions.

### Audio Component ID
- **Type:** String (Name or Tag)
- **Purpose:** Links the Participant Component to the correct Audio Component.
- **Alternative:** Use the `SetAudioComponent` function at runtime.

!!! tip "Per-Instance Configuration"
    Set this value per instance in the level, not in class defaults, for greater flexibility.

---

## 6. Component Events

Hook into these Blueprint-assignable events to respond to Participant-specific changes:

| Event                               | Description                                                               |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `OnDialogueGraphChanged`            | Fired when the Dialogue Graph reference is updated.                       |
| `OnDialogueParticipantStateChanged` | Fired when the participant’s state changes (Enabled ↔ Active ↔ Disabled). |
| `OnAudioComponentChanged`           | Fired when the linked Audio Component reference is updated.               |
| `OnStartingNodeSaved`               | Fired when a new start node is saved for later sessions.                  |

---

## 7. Common Issues

### Dialogue Won't Start
- Verify **Dialogue Graph** is assigned and not null.
- Check that participant state is **Ready**.
- Ensure both **Mountea Dialogue Manager** and **Participant** components are attached.

### No Audio Playback
- Confirm the **Audio Component** exists and is tagged correctly.
- Ensure **Auto Activate** is disabled.
- Check **Audio Component ID** matches the component’s name or tag.

### Component Reference Errors
- Double-check spelling of the Audio Component **ID**.
- Use `SetAudioComponent` in Blueprint or C++ as a fallback.

---

## 8. Next Steps

<div class="card-grid">
    <div class="card next-steps createDialogueAsset">
    <h4 class="card-title">Dialogue Tree Creation</h4>
    <p class="card-description">Build your dialogue graphs</p>
    <a href="../CreateDialogueAsset" class="card-link"></a>
    </div>
</div>
