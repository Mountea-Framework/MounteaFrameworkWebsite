---
tags:
  - reference
  - dialogue
  - ui
---

# Dialogue Skip Widget

`MounteaDialogueSkip` is a skip-forward affordance - and it's the one widget in this section that ships doing genuinely nothing. Both of its methods have empty bodies, on purpose. This page exists mainly to make sure that's clear before you go looking for a bug that isn't there.

---

## 1. What This Widget Is For

`UMounteaDialogueSkip` is a `UUserWidget` implementing `IMounteaDialogueSkipInterface`. It's declared with a bare `UCLASS()` - no `DisplayName` or `ClassGroup` metadata like its four siblings in this section - but it's still implicitly `Blueprintable`, so the intended workflow is the same: subclass it in a Widget Blueprint. The constructor calls `SetIsFocusable(true)`.

---

## 2. What "Empty" Actually Means

The entire `.cpp` file is this:

```cpp
void UMounteaDialogueSkip::RequestShowWidget_Implementation(const FVector2D& FadeProgressDuration)
{
}

void UMounteaDialogueSkip::RequestHideWidget_Implementation()
{
}
```

Both are called via `UMounteaDialogueHUDStatics::RequestShowWidget`/`RequestHideWidget` - Blueprint-callable static helpers that forward to `IMounteaDialogueSkipInterface::Execute_RequestShowWidget`/`Execute_RequestHideWidget` on whatever object implements the interface. On a base, unmodified `MounteaDialogueSkip` instance, calling either of these does **nothing visible at all** - no fade, no visibility toggle, nothing.

!!! warning
    This widget is inert by design, not by omission. A project **must** add its own show/hide visuals - a fade-in/out animation, a simple `SetVisibility` toggle, anything - or the skip affordance will simply never appear or disappear on screen no matter how many times these functions are called.

---

## 3. How To Make It Do Something

Both interface functions are declared `BlueprintImplementableEvent` on `IMounteaDialogueSkipInterface`:

| Function | Purpose |
| --- | --- |
| `RequestShowWidget(FadeProgressDuration)` | Asks the widget to show, with a fade-in. |
| `RequestHideWidget()` | Asks the widget to hide, with a fade-out. |

Implement **Event Request Show Widget** and **Event Request Hide Widget** in your Widget Blueprint subclass's event graph - that's the intended integration point, the same way `MounteaDialogueRow` expects you to implement `OnTypeWriterEffectUpdated`. Drive a Widget Animation, a timeline, or a plain visibility change from there.

<!-- TODO(verify): confirm what FadeProgressDuration's X and Y components represent - the header only documents it as "a vector specifying the fade-in progress duration," with no concrete caller in this module passing real values to check against. -->

---

## 4. C++ Reference

```cpp
#include "WBP/MounteaDialogueSkip.h"

class MOUNTEADIALOGUESYSTEM_API UMounteaDialogueSkip : public UUserWidget,
    public IMounteaDialogueSkipInterface
{
    // RequestShowWidget(FadeProgressDuration) / RequestHideWidget() -
    // both BlueprintImplementableEvent, both empty by default here.
};
```

---

## 5. Next Steps

<div class="card-grid">
  <div class="card next-steps participantUIComponent">
    <h4 class="card-title">Participant UI Component</h4>
    <p class="card-description">The runtime component that owns and drives your dialogue widgets</p>
    <a href="../ParticipantUIComponent" class="card-link"></a>
  </div>
</div>
