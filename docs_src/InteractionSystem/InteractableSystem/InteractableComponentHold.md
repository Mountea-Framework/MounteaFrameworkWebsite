# Interactable Component Hold

## What You'll Learn

- How hold progress stays consistent across server/client without replicating a timer
- Why releasing the key early cancels rather than pauses
- The idempotency guard that protects against duplicate InteractionStarted calls

## Core Concepts

`UMounteaInteractableComponentHold` requires the interactor to hold the interaction key for `InteractionPeriod` seconds. It's the workhorse type for doors, levers, and any channeled action where duration itself is the point.

```cpp
UMounteaInteractableComponentHold : public UMounteaInteractableComponentBase
```

## Progress Without Timer Replication

```cpp
float Progress = (ServerTime - InteractionStartServerTime) / InteractionPeriod;
```

`InteractionStartServerTime` is stamped once, server-side, on join, and replicated via `OnRep_InteractionStartServerTime`. Every client (and the server itself) computes progress from that single shared timestamp against its own read of `AGameStateBase::GetServerWorldTimeSeconds()` - there's no `FTimerHandle` state to replicate, and no clock-skew risk from comparing a server timestamp against a client's *local* clock.

## Idempotency Guard

```cpp
void UMounteaInteractableComponentHold::InteractionStarted_Implementation(...)
{
    if (GetWorld()->GetTimerManager().IsTimerActive(Timer_Hold))
        return;  // ignore repeat StartInteraction calls while already holding

    Super::InteractionStarted_Implementation(TimeStarted, CausingInteractor);
    GetWorld()->GetTimerManager().SetTimer(Timer_Hold, this,
        &UMounteaInteractableComponentHold::OnHoldCompleted, InteractionPeriod, false);
}
```

The guard sits *before* the `Super::` call deliberately - the base `InteractionStarted_Implementation` unconditionally re-stamps `InteractionStartServerTime` on every invocation, so a guard placed only around the timer setup would still corrupt the client-visible progress percentage on a repeat call (e.g. Enhanced Input firing `Triggered` more than once for a held key in a single frame window).

## Releasing Early Cancels

```cpp
void UMounteaInteractableComponentHold::InteractionStopped_Implementation(...)
{
    GetWorld()->GetTimerManager().ClearTimer(Timer_Hold);
    Super::InteractionStopped_Implementation(TimeStarted, CausingInteractor);
}
```

`StopInteraction` before `InteractionPeriod` elapses clears the timer - there's no partial credit or resume-from-progress; the next `StartInteraction` re-stamps `InteractionStartServerTime` and starts the hold from zero.

See [Interactable Component Hover](InteractableComponentHover.md), which extends this class to trigger from cursor dwell time instead of a held key. See [Interactable System](InteractableSystem.md) for the shared slot/state/lifecycle machinery.
