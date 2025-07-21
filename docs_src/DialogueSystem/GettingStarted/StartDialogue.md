---
tags:
  - tutorial
  - dialogue
  - authoring
---

# Start Dialogue

Learn how to invoke the Mountea Dialogue System to kick‑off a conversation at runtime, including setup requirements, API calls, and common pitfalls.

---

## 1. Prerequisites

Before starting a dialogue, ensure you have:

- A **Mountea Dialogue Manager** component attached to your **Player State** and configured (see [Setup Dialogue Manager](./SetupDialogueManager.md)).  
- **Mountea Dialogue Participant** components on every Actor that will speak or respond (see [Setup Dialogue Participant](./SetupDialogueParticipant.md)).    
- The Dialogue Manager’s **Manager State** set to **Enabled** (default on BeginPlay).

### 1.1. Game Mode

Let's get started with initial setup. The initial setup starts with `Game Mode`, which bundles the base core classes of your game. You can use the Example Game Mode which comes bundled with the plugin itself. You can setup the Game Mode in the `World Settings` and those settings will be saved for the specific level.

<p align="center" width="100%" class="preview-container">
  <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/0929aecd00fa69d913401f2381911eb9dffa173e/DocumentationResources/ExampleMap.webp">
  <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/0929aecd00fa69d913401f2381911eb9dffa173e/DocumentationResources/WorldSettings.webp">
</p>

### 1.2. Player State

Player State is the first class you need to setup in order to make the Dialogue work. Player State is automatically replicated and all Players can see other Players' States-ideal for information that is shared between all Players. That means all Players know each others data. Player State must implement the **Dialogue Manager**.

<p align="center" width="100%" class="preview-container">
  <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/0929aecd00fa69d913401f2381911eb9dffa173e/DocumentationResources/SetupPlayerState.webp">
  <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/0929aecd00fa69d913401f2381911eb9dffa173e/DocumentationResources/SetupPlayerState2.webp">
</p>

### 1.3. Player Controller

For Player Controller the configuration is very simple as it only provides logic to `Skip` and initializes the UI.

<p align="center" width="100%" class="preview-container">
  <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/0929aecd00fa69d913401f2381911eb9dffa173e/DocumentationResources/SetupPlayerController.webp">
  <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/0929aecd00fa69d913401f2381911eb9dffa173e/DocumentationResources/SetupPlayerController2.webp">
</p>

### 1.4. Player Pawn

Player Pawn, which is the Player itself, is responsible for initial setup and input mapping. Player Pawn is also starting the Dialogue, which is described in [Chapter 2.1](#21-blueprint).

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/0929aecd00fa69d913401f2381911eb9dffa173e/DocumentationResources/PlayerInput.webp">
</p>

### 1.5. HUD Class

HUD Class is responsible for managing various HUD layers in a single player-scoped fashion. The HUD Class in Example map is creating an intermediate *empty* canvas which should contain all UI elements-this canvas would then switch visibility and ordering of those layers based on game inputs.

<p align="center" width="75%" class="preview-container">
  <img class="preview" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/0929aecd00fa69d913401f2381911eb9dffa173e/DocumentationResources/SetupHUDClass.webp">
</p>

---

## 2. Invoking “Start Dialogue”

### 2.1 Blueprint

1. **Get** a reference to your Dialogue Manager component (e.g., via “Get Component by Class”).  
2. **Drag off** the component pin and search for **“Request Start Dialogue”**.  
3. **Specify**:
      1. **Dialogue Initiator**: the Actor (often your Player Controller or Pawn) that triggers the conversation.  
      2. **Main Participant**: the Actor implementing `IMounteaDialogueParticipantInterface` whose graph will drive the session.  
      3. **Other Participants**: an array of additional participants (e.g., Player Pawn).  
4. **Bind** to the **OnDialogueStartRequestedResult** event to handle success or failure.

!!! tip "Use Example Code"
    In the **Example** map there is already Player and NPCs setup to start the dialogue. Take a look at those and take some inspiration! Just keep in mind that the code is not production ready, it is meant to be used as inspiration only!

<p align="center" width="100%" class="preview-container">
  <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/0929aecd00fa69d913401f2381911eb9dffa173e/DocumentationResources/StartDialogue.webp">
  <img class="preview" width="49%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaDialogueSystem/0929aecd00fa69d913401f2381911eb9dffa173e/DocumentationResources/StartDialogue2.webp">
</p>

### 2.2 C++ API

This function is responsible for calling the Dialogue to start:

```cpp
UFUNCTION(BlueprintCallable, Category="Mountea|Dialogue")
void RequestStartDialogue(AActor* DialogueInitiator, const FDialogueParticipants& InitialParticipants);
```

* **DialogueInitiator**: Actor that instigates the dialogue.
* **InitialParticipants.MainParticipant**: must implement `CanStartDialogue()` successfully.
* **InitialParticipants.OtherParticipants**: optional array of Actors to add.

Bind to the `OnDialogueStartRequestedResult` delegate:

```cpp
DialogueManager->OnDialogueStartRequestedResult.AddDynamic(this, &UMyClass::HandleStartResult);
```

---

## 3. Under‑the‑Hood Workflow

When you call **RequestStartDialogue**, the manager runs:

1. **Validate Inputs**

   * Checks `DialogueInitiator` isn’t null.
   * Ensures `MainParticipant` is valid and `CanStartDialogue()` returns true.
2. **Gather Participants**

   * Adds the main participant and inspects `OtherParticipants`, filtering by `CanParticipateInDialogue()`.
3. **Setup by Manager Type**

   * **Player Dialogue**: verifies a valid Player Pawn and its Participant component (`SetupPlayerDialogue`).
   * **Environment Dialogue**: ensures a NetSync component on the Player Controller (`SetupEnvironmentDialogue`).
4. **Create Dialogue Context**

   * Calls `CreateDialogueContext(...)`, initializing node pointers, participant list, and the first active node.
5. **Dispatch to Server / Client**

   * On clients, issues a server RPC (`RequestStartDialogue_Server_Implementation`).
   * On server, broadcasts **OnDialogueStartRequestedResult** to signal readiness.

If **all** checks pass, the manager’s `ManagerState` transitions to **Active**, invoking `StartDialogue_Implementation()` and spawning the UI.

---

## 4. Handling the Result

Bind **OnDialogueStartRequestedResult** which supplies:

* **bool bSuccess**: true if dialogue began
* **FString Message**: “OK” or detailed error(s)

Example Blueprint flow:

```text
Request Start Dialogue → OnDialogueStartRequestedResult
  ├─ if Success: proceed to UI
  └─ if Failure: display Message in log or on HUD
```

---

## 5. Authority & Networking

* **Authority (Server)** is responsible for creating the `DialogueContext` and changing `ManagerState` .
* Clients automatically queue their start request and await replication before proceeding.
* The UI creation and node preparation happen once `ManagerState == Active`.

---

## 6. Common Errors

| Error Key                | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `MissingInitiator`       | `DialogueInitiator` was null.                           |
| `MissingParticipant`     | No `MainParticipant` supplied.                          |
| `CannotStart`            | Manager is disabled or already active.                  |
| `InvalidPawn`            | Player Pawn missing Participant component.              |
| `NoNetSync`              | Environment dialogue requires a NetSync component.      |
| `ParticipantCannotStart` | Main Participant’s `CanStartDialogue()` returned false. |

Always check your log output for these keys to quickly pinpoint setup issues.

---

## 7. Next Steps
