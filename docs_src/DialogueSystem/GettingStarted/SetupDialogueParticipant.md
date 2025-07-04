# Dialogue Participant Component

The Participant Component identifies actors that can engage in dialogues.

## What Does It Do
- Links actors to specific dialogue trees
- Manages participant state (Ready, Active, Disabled)
- Handles audio component references for voice playback
- Provides participant-specific data to dialogues

## Key Requirements

!!! warning "Player Pawn Requirement"
    Player Pawn **must** have Participant Component for full functionality.

!!! inline info "Flexible Placement"
    Unlike Manager Component, Participant can be attached to **any Actor**. Once **Player Pawn** has its own, any other Actor that can be part of a dialogue can be granted this Component.

!!! inline end tip "Audio Component Recommended"
    Add Audio Component to parent Actor for voice playback support.

## Actor Preparation

### For NPCs (Active Participants with Dialogue)

!!! info "Components Needed"
    - Dialogue Participant Component
    - Audio Component
    - Visual representation (Static Mesh/Skeletal Mesh)

### For Player (Active Participant without Own Dialogue)

!!! info "Components Needed"
    - Dialogue Participant Component  
    - Audio Component

### Audio Component Setup

#### Required Settings:
- **Auto Activate:** `false`
- **Component Tag:** Add `DialogueAudio` tag
- **Socket Attachment:** Attach to mesh socket if available

!!! question "Why Audio Component?"
    Essential for dialogue voice playback. Without it, no voices will be heard, breaking dialogue immersion.

## Adding the Component

### Step 1: Open Actor Blueprint
1. **Open** your Actor (NPC/Player Pawn)
2. **Add Component** → Search "Mountea Dialogue Participant"
3. **Select** appropriate version:
   - **Mountea Dialogue Participant** - Basic C++ component
   - **BP_MounteaDialogueParticipant** - Pre-configured Blueprint

### Step 2: Add Audio Component
1. **Add Component** → **Audio**
2. **Configure** settings:
   - Name: `DialogueAudio`
   - Auto Activate: `false` 
   - Add Tag: `DialogueAudio`

### Example Setup

For Character class:

<p align="center" width="100%">
    <img width="50%" src="https://user-images.githubusercontent.com/37410226/232331243-5d762dd4-5b0d-41ab-8838-b4deaa353049.png">
</p>

## Component Configuration

### Essential Settings

#### Dialogue Graph
- **Type:** Dialogue Tree Asset
- **Purpose:** Defines what dialogue this participant uses
- **Requirement:** Must not be null for dialogue to work

!!! warning inline "Critical Setting"
    This is the most important variable. Without it, dialogues cannot start.

!!! tip inline end "Instance-Level Configuration"
    Update this per instance in the level, not in class defaults.

#### Default Participant State
- **Type:** Enum (Ready, Active, Disabled)
- **Purpose:** Initial state when component starts
- **Default:** Ready

!!! warning "Active State Restriction" 
    Active state cannot be set as default.

#### Audio Component Identifier
- **Type:** String
- **Purpose:** Name or Tag of the Audio Component
- **Options:** Use component name or tag
- **Alternative:** Use `SetAudioComponent` function instead

!!! tip "Per-Instance Setting"
    Configure this per level instance, not class defaults.

### Runtime Restrictions

!!! warning "Dialogue Graph Changes"
    - Can be changed during gameplay
    - **Not allowed** during active dialogue
    - Validated when dialogue starts

## Participant Events

### On Dialogue Graph Changed
- Triggers when Dialogue Graph updates
- Provides New Graph reference
- Only fires if value actually changes

### On Participant State Changed
- Triggers when state updates
- Provides New State value
- Only fires on actual state change

### On Audio Component Changed
- Triggers when Audio Component updates
- Provides New Component reference
- Can provide null reference

### On Start Node Changed
- Triggers when start node updates  
- Provides New Start Node reference
- Can provide null reference

## Setup Workflow

### 1. Create NPC Blueprint
```
Create Blueprint → Inherit from Pawn/Character → Name: BP_NPC
```

### 2. Add Required Components
- Dialogue Participant Component
- Audio Component (configured properly)
- Visual components (mesh, etc.)

### 3. Configure in Level
1. **Place NPC** in level
2. **Select instance**
3. **Set Dialogue Graph** in Details Panel
4. **Configure Audio Component Identifier**

!!! tip "Level Configuration"
    Always configure Dialogue Graph and Audio settings on level instances, not class defaults.

## Best Practices

### Component Setup
- Use pre-made Blueprint components for faster setup
- Configure audio components properly for voice support
- Don't define dialogues in class defaults

### Level Instance Configuration
- Set unique Dialogue Graph per NPC instance
- Configure Audio Component Identifier per instance
- Test dialogue assignment in-game

### Audio Management
- Use consistent audio component naming/tagging
- Attach audio to appropriate mesh sockets
- Ensure Auto Activate is disabled

## Common Issues

### Dialogue Won't Start
- Check Dialogue Graph is assigned and not null
- Verify participant state is Ready
- Ensure both actors have Participant components

### No Audio Playback
- Confirm Audio Component exists and is configured
- Check Audio Component Identifier matches
- Verify Auto Activate is disabled

### Component Not Found
- Check Audio Component Identifier spelling
- Verify component tag/name exists
- Use SetAudioComponent as alternative

---

## Next Steps
[Dialogue Tree Creation](CreateNewDialogueTree.md)
