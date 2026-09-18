# Interactable Component Automatic

## What You'll Learn

- How a no-input interaction completes itself
- Why it still goes through the slot/join system despite not needing a key press

## Core Concepts

`UMounteaInteractableComponentAutomatic` completes on its own after `InteractionPeriod` seconds, once an interactor has joined a slot - no player input required at all. It's built for notification-style interactions: proximity triggers, "you've spotted something" beats, auto-pickup zones.

```cpp
UMounteaInteractableComponentAutomatic : public UMounteaInteractableComponentBase
```

## Behaviour

```cpp
void UMounteaInteractableComponentAutomatic::InteractionStarted_Implementation(...)
{
    Super::InteractionStarted_Implementation(TimeStarted, CausingInteractor);
    GetWorld()->GetTimerManager().SetTimer(Timer_AutoCompletion, this,
        &UMounteaInteractableComponentAutomatic::OnCompletionTimerExpired, InteractionPeriod, false);
}
```

`OnCompletionTimerExpired()` calls `Execute_CompleteInteractable`. `InteractionStopped_Implementation` clears `Timer_AutoCompletion` if the interactor leaves (or is force-released) before the timer fires - a completion that shouldn't happen just because a player briefly walked through the trigger volume and back out.

!!! example "Real-world analogy"
    Think of a landmine's arming delay, or an NPC's "notice the player" beat that fires automatically once they're close enough for long enough - no button press, just proximity plus time.

## Still Goes Through the Slot System

Even though no key press drives it, Automatic still joins through the normal `RequestInteractorJoin` → tag validation → slot assignment pipeline. This means `RequiredInteractorTags`/`ExcludedInteractorTags` and `MaxInteractors` apply exactly as they do for every other type - an Automatic trigger can still be player-only, faction-gated, or capacity-limited.

See [Interactable System](InteractableSystem.md) for the shared slot/state/lifecycle machinery every component type builds on.
