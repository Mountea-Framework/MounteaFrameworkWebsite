# Dialogue Manager Component

The Dialogue Manager Component orchestrates dialogue flow and handles the conversation state.

## What Does It Do
- Initializes and manages dialogue sessions
- Controls UI creation and destruction
- Processes player input and choices
- Manages dialogue state transitions
- Provides events for game logic integration

## Critical Requirements

!!! danger inline "Player State Only"
    The Manager Component **must** be attached to Player State for proper replication and persistence.

!!! warning inline end "Interface Implementation"
    Implements `IMounteaDialogueManagerInterface` which contains essential flow functions.

## Adding the Component

### Step 1: Open Player State
1. **Open** your Player State Blueprint
2. **Click** Add Component button
3. **Search** for "Mountea Dialogue Manager"

### Step 2: Select Component Type
Choose between:

- **Mountea Dialogue Manager** - Basic C++ component
- **BP_MounteaDialogueManager** - Pre-configured Blueprint version

!!! tip "Quick Setup"
    BP version includes predefined WBP class and additional settings for faster setup.

### Step 3: Component Added
That's all needed for Player State setup.

## Component Configuration

### Main Settings

#### Dialogue Widget Class
- **Type:** Widget Blueprint Class
- **Purpose:** UI class for this specific manager
- **Requirement:** Either this OR Project Settings default must be set

!!! info "Widget Class Rules"
    Widget must implement `IMounteaDialogueWBPInterface` to appear in dropdown.

#### Default Manager State
- **Type:** Enum
- **Options:** Ready, Disabled
- **Purpose:** Initial state when component starts
- **Default:** Ready

!!! warning "Active State Restriction"
    Active state cannot be set as default - it's runtime only.

### Debug Information

Read-only values for debugging:

- Current manager state
- Active participants
- Current dialogue context
- UI references

## Manager Events

The component provides extensive events for dialogue integration:

### Core Dialogue Events

#### On Dialogue Initialized
- Called when dialogue successfully starts
- Provides Dialogue Context
- Use for setup logic

#### On Dialogue Started
- Called when participants enter dialogue
- Provides Dialogue Context
- Use for gameplay state changes

#### On Dialogue Closed
- Called when dialogue ends (any reason)
- Provides Dialogue Context  
- Use for cleanup logic

#### On Dialogue Context Updated
- Called when any dialogue data changes
- Provides updated Dialogue Context
- Use for reactive UI updates

### UI Events

#### On Dialogue UI Changed
- Called when UI is created or destroyed
- Provides UI Class and Reference
- May contain null values - validate before use

### Node Events

#### On Dialogue Node Selected
- Called when any node becomes active
- Provides Dialogue Context
- Use for node-specific logic

#### On Dialogue Node Started
- Called when node begins execution
- Triggers before dialogue rows execute
- Provides Dialogue Context

#### On Dialogue Node Finished
- Called when node completes
- Triggers after all rows finish
- Provides Dialogue Context

### Row Events

#### On Dialogue Row Started
- Called for each dialogue row
- Provides Dialogue Context
- Use for row-specific effects

#### On Dialogue Row Finished
- Called when row completes
- Provides Dialogue Context
- Triggers before next row or node finish

### Audio Events

#### On Dialogue Voice Start Request
- Called when voice should play
- Provides Voice Sound Base
- Use for custom audio implementation

#### On Dialogue Voice Skip Request
- Called when voice should stop
- Provides Voice Sound Base
- Use for audio interruption logic

### Error Handling

#### On Dialogue Failed
- Called when dialogue cannot proceed
- Provides Error Message
- Use for error recovery or user feedback

#### On Dialogue Manager State Changed
- Called when manager state updates
- Provides new state value
- Use for state-dependent logic

## Event Implementation Example

```txt
// On Dialogue Started event
Event On Dialogue Started
├── Set Input Mode (UI Only)
├── Hide HUD
└── Enable Dialogue Controls
```

## Best Practices

### Setup
- Use BP version for standard implementations
- Set Widget Class in Manager for dialogue-specific UI
- Keep Manager on Player State always

### Event Usage
- Use Initialize for one-time setup
- Use Started/Closed for state management  
- Use Row events for subtitle/audio timing
- Validate UI references before use

### Debugging
- Monitor debug values during development
- Use Failed event for error handling
- Test state transitions thoroughly

## Common Issues

### UI Not Appearing
- Check Widget Class is set (Manager or Project Settings)
- Verify widget implements required interface
- Ensure Manager is on Player State

### Events Not Firing
- Confirm component is properly added
- Check Manager state (must be Ready/Active)
- Verify dialogue has valid participants

### State Problems
- Don't set Active as default state
- Use events to track state changes
- Reset states properly on dialogue end

## What's Next

With Manager Component configured:

1. **Add Participant Components** - Set up NPCs and Player
2. **Create Dialogue Content** - Build trees and data
3. **Test Integration** - Verify events work correctly

---

## Next Steps
[Setup Dialogue Participant Component →](SetupDialogueParticipant.md) Setup Dialogue Participants so NPCs can talk with the Player
