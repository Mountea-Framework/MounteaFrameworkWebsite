---
tags:
  - reference
  - dialogue
  - ui
---

# Dialogue Row Widget

`MounteaDialogueRow` displays a single line of dialogue - participant name, title, body text, an optional icon - and, unlike the composition-root [Dialogue Widget](DialogueWidget.md), it actually does something in native C++: it owns a fully working typewriter reveal effect you don't have to build yourself.

---

## 1. What This Widget Is For

`UMounteaDialogueRow` (`DisplayName` "Mountea Dialogue Row") is a `UUserWidget` implementing `IMounteaDialogueRowInterface` and `IMounteaDialogueUIBaseInterface`. Like every base widget in this section it's implicitly `Blueprintable` - the intended workflow is a Widget Blueprint subclass, not a C++ subclass. The constructor calls `SetIsFocusable(true)`.

The widget holds one piece of state: `DialogueRowData`, an `FWidgetDialogueRow` struct (`BlueprintReadOnly`, `VisibleAnywhere`, `ExposeOnSpawn`). Everything this widget shows on screen comes from that struct.

---

## 2. The Data It Displays

`FWidgetDialogueRow` is a lightweight, `BlueprintType` copy of the data a dialogue row needs to render - it doesn't hold a reference back into the Graph, just the values:

| Field | Description | Default |
| --- | --- | --- |
| `DialogueRowParticipantName` | The speaking participant's display name. | `"Participant Name"` |
| `DialogueRowTitle` | The row's title text. | `"This is dialogue row title text."` |
| `DialogueRowBody` | The actual line being spoken - what the typewriter effect reveals. | `"This is dialogue option title text."` |
| `RowDuration` | How long the row stays on screen / how long the typewriter effect runs. | `0.f` |
| `UIRowID` | UI-side row identifier, distinct from the row's `RowGuid`. | `0` |
| `RowOptionalIcon` | An optional `UTexture` for a speaker portrait or icon. | `nullptr` |
| `RowGuid` | The row's unique identifier. | new `FGuid` |

Three `BlueprintNativeEvent`s manage this data, each with a trivial native default a Blueprint subclass can build on:

- `GetDialogueWidgetRowData` / `SetNewWidgetDialogueRowData` - get/set the whole struct. The setter only actually assigns when the incoming data differs (`operator!=`), so re-setting identical data is a no-op.
- `ResetWidgetDialogueRow` - calls `FWidgetDialogueRow::ResetRow()`, clearing every field back to empty/default and invalidating `RowGuid`.
- `InitializeWidgetDialogueRow` - an empty native hook (`// ...` in the `.cpp`). Override it in your Widget Blueprint to react the moment new row data is set, e.g. to refresh a speaker portrait image.

---

## 3. The Built-In Typewriter Effect

This is the part of the widget that isn't just a data holder. `StartTypeWriterEffect(SourceText, Duration)` drives a genuine native character-by-character reveal using two engine timers:

1. An **update-interval timer**, firing once per character (`Duration / SourceText.Len()` seconds apart). On each tick it grows the visible substring by one character and fires `OnTypeWriterEffectUpdated(UpdatedText, Alpha)`.
2. A **duration timer**, firing once when the full `Duration` elapses, which forces the text to its complete state and fires `OnTypeWriterEffectFinished()`.

Both `OnTypeWriterEffectUpdated` and `OnTypeWriterEffectFinished` are `BlueprintImplementableEvent`s - there's no native visual behavior at all, only the timing. Your Widget Blueprint reads `UpdatedText` and `Alpha` (0 to 1, elapsed time over total duration) on every update to drive whatever text/opacity animation you want.

!!! info
    `StartTypeWriterEffect_Implementation` guards against re-entry: if either timer handle is already valid, calling Start again is a no-op rather than a restart. Call `StopTypeWriterEffect` first if you need to interrupt an in-progress reveal and start over.

Two more moves worth knowing:

- **`StopTypeWriterEffect`** doesn't just cancel the timers - it calls the same completion path as a natural finish (`CompleteTypeWriterEffect_Callback`), so the full `DialogueRowBody` text is force-shown and `OnTypeWriterEffectFinished` still fires. This is the correct way to implement a "skip to end of line" action - it leaves the widget in a consistent finished state instead of a half-revealed one.
- **`EnableTypeWriterEffect(bEnable)`** toggles the `bUseTypeWriterEffect` flag and broadcasts `OnTypeWriterEffectChanged` (a `BlueprintAssignable` multicast delegate) whenever the value actually changes. Nothing in this class reads `bUseTypeWriterEffect` to conditionally skip the timers - it's a flag your Blueprint checks (via the delegate or the exposed property) to decide whether to call `StartTypeWriterEffect` at all versus just showing the full text immediately.

---

## 4. The Hooks a Blueprint Subclass Fills In

`IMounteaDialogueUIBaseInterface`'s four `BlueprintNativeEvent`s ship the same trivial defaults as on [Dialogue Widget](DialogueWidget.md#3-the-hooks-a-blueprint-subclass-fills-in): `BindEvents`/`UnbindEvents` return `true` and do nothing else, `ProcessStringCommand` and `ApplyTheme` are empty. Override any of them in your Widget Blueprint subclass as needed.

!!! warning
    `OnTypeWriterEffectUpdated` and `OnTypeWriterEffectFinished` have no default implementation. If your Widget Blueprint doesn't implement both events, calling `StartTypeWriterEffect` will run the timers correctly but nothing will visibly update on screen - the timing logic works regardless of whether anything is listening.

<!-- TODO(image): capture a Dialogue Row Widget Blueprint mid-reveal, with the Event Graph nodes for Event On Type Writer Effect Updated visible. -->

---

## 5. C++ Reference

```cpp
#include "WBP/MounteaDialogueRow.h"

class MOUNTEADIALOGUESYSTEM_API UMounteaDialogueRow : public UUserWidget,
    public IMounteaDialogueRowInterface,
    public IMounteaDialogueUIBaseInterface
{
    // StartTypeWriterEffect(SourceText, Duration) / StopTypeWriterEffect() /
    // EnableTypeWriterEffect(bEnable) drive OnTypeWriterEffectUpdated /
    // OnTypeWriterEffectFinished, both BlueprintImplementableEvent.
};
```

---

## 6. Next Steps

<div class="card-grid">
  <div class="card next-steps dialogueOptionWidget">
    <h4 class="card-title">Dialogue Option Widget</h4>
    <p class="card-description">One answer button - focus handling and selection broadcast</p>
    <a href="../DialogueOptionWidget" class="card-link"></a>
  </div>
</div>
