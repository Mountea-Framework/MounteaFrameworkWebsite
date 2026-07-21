---
tags:
  - reference
  - dialogue
  - ui
---

# Dialogue Options Container

Where most of the widgets in this section hold data and expose Blueprint hooks, `MounteaDialogueOptionsContainer` is the one that does real work in native C++: it's the class that actually spawns [Dialogue Option](DialogueOptionWidget.md) widgets, and it's what keeps exactly one of them focused for gamepad/keyboard players.

---

## 1. What This Widget Is For

`UMounteaDialogueOptionsContainer` (`DisplayName` "Mountea Dialogue Options Container") is a `UUserWidget` implementing `IMounteaDialogueOptionsContainerInterface`. Like every base widget in this section it's implicitly `Blueprintable`, meant to be subclassed in a Widget Blueprint rather than in C++.

The constructor initializes `FocusedOption` and `LastFocusedOption` to `INDEX_NONE`, `bForcedFocusEnabled` to `true`, and calls `SetIsFocusable(true)`.

---

## 2. Spawning Options

`AddNewDialogueOption(Node)` is the only place in this widget set that actually calls `CreateWidget`:

1. It checks the internal `DialogueOptions` map (keyed by node `FGuid`) first - if a widget already exists for this node, it's reused instead of spawning a duplicate.
2. Otherwise it spawns a new instance of `DialogueOptionClass` via `CreateWidget<UUserWidget>(GetOwningPlayer(), ...)`.
3. It binds the new option's `GetDialogueOptionSelectedHandle()` to this container's own `ProcessOptionSelected`, and its `GetOnMounteaFocusClearRequestedEventHandle()` to `ResetFocus` (see [Focus Handling](DialogueOptionWidget.md#3-focus-handling) on the Option page for what fires that second delegate).
4. It pushes the node's data in via `SetNewDialogueOptionData` and `InitializeDialogueOption`, then stores the widget in `DialogueOptions`.

`AddNewDialogueOptions(NewDialogueOptions)` just loops and calls `AddNewDialogueOption` per node. `RemoveDialogueOption`/`RemoveDialogueOptions` unbind the delegates and call `ResetDialogueOptionData` on the target, then remove its map entry - they don't destroy the widget, only reset and forget it. `ClearDialogueOptions` does the same for every entry and empties the map.

!!! info
    `DialogueOptionClass` (`EditAnywhere`, `TSoftClassPtr<UUserWidget>`) is `MustImplement`-gated to `MounteaDialogueOptionInterface`, so the Details panel refuses a class that isn't a valid Option widget. Set it on your Options Container Blueprint subclass before the container can spawn anything.

---

## 3. Forwarding Selection

`ProcessOptionSelected_Implementation(SelectedOption, CallingWidget)` - bound to every spawned Option's own selection delegate in step 3 above - relays the pick further up: if `ParentDialogueWidget` is set, it calls `Execute_OnOptionSelected(ParentDialogueWidget, SelectedOption)` via `IMounteaDialogueWBPInterface`. That's the same `OnOptionSelected(SelectionGUID)` seam documented on the [Dialogue Widget](DialogueWidget.md#3-the-hooks-a-blueprint-subclass-fills-in) page - so a click on any individual Option widget ultimately surfaces as one event on the root `MounteaDialogue` widget.

`SetParentDialogueWidget`/`GetParentDialogueWidget` just store and read that reference; the assignment isn't enforced by this code path itself, only by the `MustImplement` metadata on the property.

---

## 4. Forced Focus

`NativeTick` re-asserts focus on the current option **every frame** when `bForcedFocusEnabled` is true:

1. Resolve the widget at `FocusedOption`'s index in `DialogueOptions`, falling back to `LastFocusedOption` if `FocusedOption` isn't currently valid.
2. If a widget was found and `IMounteaFocusableWidgetInterface::Execute_IsFocusEnabled()` returns true for it, call `Execute_SetFocusState(widget, true)` on it.

This is the actual mechanism that keeps one answer visibly highlighted for gamepad/keyboard players without a widget ever genuinely losing engine focus - it's corrected back every tick rather than relying on focus never being lost in the first place.

`SetFocusedOption(NewFocusedOption)` is the deliberate way to move that highlight: it no-ops if the index hasn't changed, otherwise caches the previous index into `LastFocusedOption`, validates the new index against the spawned widgets array, clears every child's focus (`ClearChildOptionsFocus`, which calls `SetFocusState(false)` on each), and sets focus true on the new target. `GetFocusedOptionIndex()` returns `FocusedOption` directly - `INDEX_NONE` (`-1`) when nothing is focused, matching the interface's own documented contract for an empty container.

`ResetFocus(Requestor)` - bound to each Option's `OnMounteaFocusClearRequestedEventHandle` at spawn time - clears all children's focus, resolves `Requestor`'s index via `UMounteaDialogueHUDStatics::GetOptionIndex`, and calls `SetFocusedOption` on it. As noted on the Option page, nothing in the base `MounteaDialogueOption` class ever broadcasts that delegate, so this path only runs if your own Option subclass fires it.

!!! tip
    Call `ToggleForcedFocus(false)` if you want a mouse-only dialogue UI where hovering, not forced re-focus, drives the highlight - `bForcedFocusEnabled` is the only thing gating the `NativeTick` behavior above.

<!-- TODO(image): capture a populated Dialogue Options Container in a running dialogue, gamepad focus highlight visible on one option. -->

---

## 5. C++ Reference

```cpp
#include "WBP/MounteaDialogueOptionsContainer.h"

class MOUNTEADIALOGUESYSTEM_API UMounteaDialogueOptionsContainer : public UUserWidget,
    public IMounteaDialogueOptionsContainerInterface
{
    // AddNewDialogueOption(Node) calls CreateWidget<UUserWidget>(...).
    // NativeTick re-asserts SetFocusState(true) on FocusedOption/LastFocusedOption
    // every frame while bForcedFocusEnabled is true.
};
```

---

## 6. Next Steps

<div class="card-grid">
  <div class="card next-steps dialogueSkipWidget">
    <h4 class="card-title">Dialogue Skip Widget</h4>
    <p class="card-description">A skip-forward affordance that ships completely inert</p>
    <a href="../DialogueSkipWidget" class="card-link"></a>
  </div>
</div>
