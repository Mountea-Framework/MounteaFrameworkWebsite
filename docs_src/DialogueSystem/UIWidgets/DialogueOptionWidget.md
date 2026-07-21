---
tags:
  - reference
  - dialogue
  - ui
---

# Dialogue Option Widget

`MounteaDialogueOption` is one answer button - the smallest widget in this section, and the one that owns focus handling and reports its own selection back up the chain to whatever spawned it.

---

## 1. What This Widget Is For

`UMounteaDialogueOption` (`DisplayName` "Mountea Dialogue Option") is a `UUserWidget` implementing `IMounteaDialogueOptionInterface` and `IMounteaFocusableWidgetInterface`. Like every base widget in this section it's implicitly `Blueprintable`, meant to be subclassed in a Widget Blueprint rather than in C++.

The constructor sets `DialogueOptionState` to `EDOS_Unfocused` and calls `SetIsFocusable(true)`. `NativeSupportsKeyboardFocus()` is overridden to always return `true`, so this widget can receive focus from Tab/gamepad navigation without any extra Blueprint setup.

---

## 2. The Data It Displays

`FDialogueOptionData` is the option's content, set once when the widget is spawned:

| Field | Description | Default |
| --- | --- | --- |
| `OptionGuid` | The GUID of the dialogue node this option represents - not the option widget's own identity. | invalid `FGuid` |
| `OptionTitle` | The text shown on the button. | `"This is dialogue option title text."` |
| `OptionBody` | Optional longer text, e.g. for a tooltip. | `"This is dialogue option body text.\nCan be used as tooltip text etc."` |
| `OptionIcon` | An optional `UTexture`. | `nullptr` |
| `UIRowID` | UI-side ordering/identification value. | `0` |

`SetNewDialogueOptionData_Implementation` only assigns and calls `InitializeDialogueOption` when the incoming data actually differs (`operator!=`) from what's already set - re-applying identical data is a no-op. `ResetDialogueOptionData_Implementation` calls `FDialogueOptionData::ResetOption()`, clearing every field back to default. `InitializeDialogueOption_Implementation` is an empty native hook (`// ...`) - override it in your Widget Blueprint to push `DialogueOptionData` into your visible text/image widgets.

---

## 3. Focus Handling

This widget implements `IMounteaFocusableWidgetInterface` for real, not as a stub:

- **`NativeOnFocusReceived`** is overridden to call `Execute_SetFocusState(this, true)` before falling through to the engine default - so native keyboard/gamepad focus (Tab navigation, D-pad, controller stick) automatically flips this widget's own focus state, no extra wiring needed.
- **`SetFocusState_Implementation(IsSelected)`** guards on `IsFocusable()`, sets `DialogueOptionState` to `EDOS_Focused` or `EDOS_Unfocused`, then broadcasts `OnOptionFocusChanged` (`FOnMounteaFocusChanged`, `BlueprintAssignable`).
- **`NativeConstruct`** binds `OnOptionFocusChanged` straight back to this widget's own `OnOptionFocused(UUserWidget*, bool)` - a `BlueprintImplementableEvent`. This is the actual place to add a focus visual: implement **Event On Option Focused** in your Widget Blueprint to swap a highlight, play a hover animation, etc.
- **`EnableFocus_Implementation(bIsWidgetEnabled)`** just calls `SetIsFocusable(bIsWidgetEnabled)` - the standard way to disable an option (e.g. a locked or already-chosen answer) without removing it from the layout.

!!! info
    `GetOnMounteaFocusClearRequestedEventHandle()` exposes a `BlueprintCallable` delegate (`OnMounteaFocusClearRequested`) that the [Dialogue Options Container](DialogueOptionsContainer.md) listens to, but nothing in this base class ever calls `Broadcast()` on it. Firing it - to ask the Container to clear this option's focus and re-resolve who should be focused instead - is left entirely to a project's own Blueprint or C++ subclass logic.

---

## 4. Selection

`ProcessOptionSelected_Implementation()` broadcasts `OnDialogueOptionSelected(OptionGuid, this)` - a `FOnDialogueOptionSelected` delegate (`BlueprintReadOnly`, `BlueprintCallable`). `GetDialogueOptionSelectedHandle()` exposes that same delegate so the [Dialogue Options Container](DialogueOptionsContainer.md) can bind to it when it spawns this widget.

!!! warning
    Nothing in this class calls `ProcessOptionSelected` automatically - there's no `BindWidget` button and no `OnClicked` wiring in C++. A real button click has to reach this function yourself: add a `Button` to your Widget Blueprint's visual tree and bind its **On Clicked** event to call **Process Option Selected**, or trigger it from whatever input handling your project uses.

---

## 5. C++ Reference

```cpp
#include "WBP/MounteaDialogueOption.h"

class MOUNTEADIALOGUESYSTEM_API UMounteaDialogueOption : public UUserWidget,
    public IMounteaDialogueOptionInterface,
    public IMounteaFocusableWidgetInterface
{
    // ProcessOptionSelected() broadcasts OnDialogueOptionSelected(OptionGuid, this).
    // SetFocusState(bool) broadcasts OnOptionFocusChanged, wired to the
    // BlueprintImplementableEvent OnOptionFocused in NativeConstruct.
};
```

---

## 6. Next Steps

<div class="card-grid">
  <div class="card next-steps dialogueOptionsContainer">
    <h4 class="card-title">Dialogue Options Container</h4>
    <p class="card-description">Spawns Option widgets and keeps exactly one focused</p>
    <a href="../DialogueOptionsContainer" class="card-link"></a>
  </div>
</div>
