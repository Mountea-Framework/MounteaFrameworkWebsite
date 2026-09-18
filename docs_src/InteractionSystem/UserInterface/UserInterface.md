# User Interface

## What You'll Learn

- The one widget interface every interaction widget implements
- How the attention-widget pool works and why it isn't "one widget per detected actor"
- How distance gates the transition between attention and interaction widget modes

## Core Concepts

### The Widget Interface

Every interaction widget - attention or interaction, no distinction in the interface itself - implements `IActorInteractionWidget`:

```cpp
class IActorInteractionWidget
{
    void SetWidgetMode(EInteractionWidgetMode NewMode);       // None / Attention / Interaction
    void SetActionCount(int32 TotalActions);                  // for "1 of 3" cycling indicators
    void SetSelectedActionIndex(int32 SelectedIndex);
    void SetTitleText(const FString& NewTitle);
    FString GetTitleText() const;
    void SetBodyText(const FString& NewBody);
    FString GetBodyText() const;
    void SetKeyText(const FString& NewKey);
    FString GetKeyText() const;
    void SetProgress(const float NewProgress);                // [0..1], widget owns the visual
    float GetProgress() const;
    void ToggleVisibility();                                   // the only BlueprintNativeEvent method
};
```

Every method except `ToggleVisibility` is `BlueprintImplementableEvent` - the plugin never dictates *how* your widget looks, only what data it must be able to receive. Assign your widget class in [Interactor UI Config](../Configuration/InteractorUIConfig.md) (attention) and [Interactable UI Config](../Configuration/InteractableUIConfig.md) (interaction); both fields enforce `MustImplement="IActorInteractionWidget"`.

### Widget Modes

```cpp
UENUM(BlueprintType)
enum class EInteractionWidgetMode : uint8
{
    EWM_None,          // hidden
    EWM_Attention,     // subtle - interactor in attention range
    EWM_Interaction,    // full - interactor in interaction range
};
```

## The Attention Widget Pool

`UMounteaInteractionWorldSubsystem` (`UWorldSubsystem`) owns a pool of pre-spawned attention-widget actors, sized by [Interactor UI Config](../Configuration/InteractorUIConfig.md)'s `AttentionWidgetPoolSize`:

```cpp
struct FAttentionWidgetPoolEntry
{
    AActor* WidgetActor;              // spawned actor hosting the widget component
    UWidgetComponent* WidgetComponent;
    TWeakObjectPtr<AActor> AssignedActor;   // null = idle
};
```

!!! info "Only the focused actor gets one"
    This is not "one widget per detected actor" - only the Tier 1 `FocusedActor` on a given interactor gets a widget assigned. Everything else in the detected set stays silently tracked with no widget at all.

```cpp
bool Assigned = WorldSubsystem->AssignAttentionWidget(FocusedActor);
WorldSubsystem->ReleaseAttentionWidget(OldFocusedActor);
WorldSubsystem->UpdateAttentionWidgetMode(Actor, EInteractionWidgetMode::EWM_Interaction);
```

An interactor calls `AssignAttentionWidget` when its Tier 1 focus changes, and `ReleaseAttentionWidget` when focus shifts away or the actor moves into interaction range and gets its dedicated interaction widget instead. `AssignAttentionWidget` returns `false` if the pool is exhausted - `GetIdlePoolCount()` / `GetTotalPoolSize()` let you monitor headroom, and raising `AttentionWidgetPoolSize` is the fix if it's regularly exhausted for your scene density.

## Distance Gating

Widget visibility is the AND of two independent checks:

```
bWidgetStateEligible (coarse)     : InteractableState permits showing (Active/Awake)
        AND
bWidgetDistanceEligible (fine)    : viewing interactor's distance check confirmed
                                     the actor is within WidgetRanges
        =
RefreshWidgetVisibility() → SetVisibility(both true)
```

The coarse gate is set by `OnRep_InteractableState` on the interactable itself - it's the same for every viewer. The fine-grained gate is set per-viewer: each interactor's `RefreshFocus()` compares its own distance to every detected interactable against `FInteractableWidgetRanges` (`AttentionRange` / `InteractionRange`, with `AttentionRange >= InteractionRange` required) and calls `ToggleWidgetVisibility` locally - so two players standing at different distances from the same interactable can correctly see different widget states simultaneously, without the interactable itself needing to know who's looking.

See [Interactable System](../InteractableSystem/InteractableSystem.md#widget-ranges) for `FInteractableWidgetRanges`, and [Interactor UI Config](../Configuration/InteractorUIConfig.md) / [Interactable UI Config](../Configuration/InteractableUIConfig.md) for the widget class and key-texture configuration.
