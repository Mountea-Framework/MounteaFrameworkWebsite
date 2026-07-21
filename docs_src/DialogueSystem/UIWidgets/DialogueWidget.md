---
tags:
  - reference
  - dialogue
  - ui
---

# Dialogue Widget

`MounteaDialogue` is the root/panel widget of a dialogue screen - the class every other dialogue widget on this page ultimately hangs off. It's a composition root, not an active controller: it names which widget classes belong to it and exposes a handful of Blueprint hooks, but it never spawns anything itself.

---

## 1. What This Widget Is For

`UMounteaDialogue` (`DisplayName` "Mountea Dialogue") is a `UUserWidget` implementing `IMounteaDialogueWBPInterface` and `IMounteaDialogueUIBaseInterface`. Like all five base widgets in this section it's implicitly `Blueprintable` - there's no `NotBlueprintable` on the class - so the intended workflow is a Widget Blueprint subclass, not a C++ subclass.

The class body itself does almost nothing: the constructor calls `SetIsFocusable(true)` and every interface method it implements is either a one-line no-op or an empty default. **`MounteaDialogue` contains no spawning logic at all** - it doesn't create its own row widget, options container, or skip widget for you. It exists to give a Blueprint author one place to declare which classes those child widgets should be, gated so the wrong widget type can't be assigned.

---

## 2. Naming the Child Widget Classes

Four `EditAnywhere`, `BlueprintReadOnly` properties, each a `TSoftClassPtr<UUserWidget>` constrained with `MustImplement` metadata to a matching interface:

| Property | Must Implement |
| --- | --- |
| `Dialogue Options Container Class` | `MounteaDialogueOptionsContainerInterface` |
| `Dialogue Option Class` | `MounteaDialogueOptionInterface` |
| `Dialogue Row Class` | `MounteaDialogueRowInterface` |
| `Dialogue Skip Class` | `MounteaDialogueSkipInterface` |

Set these in the Details panel of your `MounteaDialogue` Blueprint subclass, pointing each at your own subclass of the matching widget from this section (see the [UI Widgets Intro](UIWidgets.md) table). The Details panel will refuse a class that doesn't implement the required interface, so this is mostly a safety rail rather than something you need to double-check yourself.

!!! info
    These four properties are declarations, not spawn calls. Nothing in `MounteaDialogue` reads them automatically - your own Widget Blueprint graph (or, for the Options Container's child Options specifically, the Container's own native spawn logic covered on the [Dialogue Options Container](DialogueOptionsContainer.md) page) is what actually creates instances from these classes.

---

## 3. The Hooks a Blueprint Subclass Fills In

Two different kinds of override live on this class, and the distinction matters:

- **`IMounteaDialogueUIBaseInterface`'s four `BlueprintNativeEvent`s** already have a trivial C++ default supplied directly in `MounteaDialogue.h` - `BindEvents`/`UnbindEvents` return `true` and do nothing else, `ProcessStringCommand` and `ApplyTheme` are empty. A Blueprint subclass *can* override any of these to do real work: bind/unbind to whatever drives your UI in `BindEvents`/`UnbindEvents`, react to string commands (e.g. from `MounteaDialogueWidgetCommands`) in `ProcessStringCommand`, and restyle the panel in `ApplyTheme`.
- **`IMounteaDialogueWBPInterface`'s two events, `RefreshDialogueWidget` and `OnOptionSelected`, are pure `BlueprintImplementableEvent`s with no C++ body anywhere in this class.** They are the actual seam the [Participant UI Component](ParticipantUIComponent.md) calls into on whatever `UserInterface` object it's holding.

!!! warning
    `RefreshDialogueWidget` and `OnOptionSelected` have no default implementation at all. If your `MounteaDialogue` Blueprint subclass doesn't implement both of these events, the dialogue UI will never update and option clicks will never reach anywhere - there's nothing failing silently underneath, the hook is simply unimplemented.

`RefreshDialogueWidget(DialogueManager, Command)` fires whenever the UI needs to refresh - use `DialogueManager`'s `Get Dialogue Context` to pull the data you need to display, and branch on `Command` (the widget command strings live in Project Settings → Mountea Framework → Mountea Dialogue System) to decide what changed. `OnOptionSelected(SelectionGUID)` fires when a dialogue option was picked - typically relayed here from the Options Container, see [Dialogue Options Container](DialogueOptionsContainer.md).

---

## 4. C++ Reference

```cpp
#include "WBP/MounteaDialogue.h"

class MOUNTEADIALOGUESYSTEM_API UMounteaDialogue : public UUserWidget,
    public IMounteaDialogueWBPInterface,
    public IMounteaDialogueUIBaseInterface
{
    // DialogueOptionsContainerClass / DialogueOptionClass /
    // DialogueRowClass / DialogueSkipClass declared here.
};
```

---

## 5. Next Steps

<div class="card-grid">
  <div class="card next-steps dialogueRowWidget">
    <h4 class="card-title">Dialogue Row Widget</h4>
    <p class="card-description">Displays one line of dialogue with a built-in typewriter effect</p>
    <a href="../DialogueRowWidget" class="card-link"></a>
  </div>
</div>
