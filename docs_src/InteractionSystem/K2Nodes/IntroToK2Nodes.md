# K2Nodes & Statics

## What You'll Learn

- Why three separate static function libraries exist instead of one
- The meta-tag → node colour/icon convention and what each colour means
- How the custom Blueprint node system works under the hood

## The Three Static Libraries

These are the primary, recommended Blueprint API surface for the v5.0 architecture - almost everything you'd otherwise call through raw interface `Execute_*` calls has a friendlier, category-organised static wrapper:

| Library | Scope |
|---|---|
| `UMounteaInteractionStatics` | General-purpose: server time, focus-actor selection, candidate building, channel resolution |
| `UMounteaInteractableStatics` | Full interactable coverage: slots, state, lifecycle, tags, highlight, collision/mesh, setup, debug |
| `UMounteaInteractorStatics` | Full interactor coverage: focus, cycling, state, ignored actors, dependencies, Enhanced Input helper, debug |

```cpp
// Example: everything routes through the interface, by TScriptInterface, never a raw pointer
UMounteaInteractorStatics::CycleInteractorAction(Interactor, +1);
UMounteaInteractableStatics::GetInteractionProgress(this, Interactable);
```

!!! info "Legacy libraries kept, not deleted"
    Two pre-refactor libraries (`UMounteaInteractionFunctionLibrary`, `UMounteaInteractionSystemBFL`) remain fully functional - deprecate-don't-delete, so existing customer Blueprints never break. `CoreRedirects` transparently resolve old function references to their new location where one exists.

## The Meta-Tag Convention

Every function in the three modern Statics classes carries exactly one Mountea role tag, which drives both Blueprint node colour and category grouping:

| Meta tag | Meaning | Node colour |
|---|---|---|
| `meta=(MounteaGetter)` | Read-only query | Blue |
| `meta=(MounteaSetter)` | State mutation | Orange |
| `meta=(MounteaValidate)` | Bool validation, expands to exec pins (`ExpandBoolAsExecs`) | Red |
| `meta=(MounteaCommand)` | Action trigger / side-effecting call | Green |
| `meta=(MounteaBinding)` | Delegate bind/unbind | Purple |

```cpp
UFUNCTION(BlueprintCallable, Category="Mountea|Interaction|Interactor",
    meta=(MounteaCommand))
static void ApplyDefaultInputMappingContext(const TScriptInterface<IMounteaInteractorInterface>& Interactor);
```

Placing this node in a Blueprint graph renders it green, with a matching icon, and a tooltip that appends a role explainer below the function's own description - e.g. for a Command:

> ⚡ **Command:** A command function triggers an action or state transition on the target rather than reading or writing a single value. Commands may have side effects and are not guaranteed to be idempotent.

## How Node Styling Actually Works

`UK2Node_MounteaInteractionCallFunction` (`MounteaInteractionSystemDeveloper` module) is a `UK2Node_CallFunction` subclass that:

1. **Discovers** every `UFunction` in the runtime module carrying one of the five meta tags (`GetMenuActions`, via reflection over `TObjectIterator<UClass>`)
2. **Marks each discovered function** `MD_BlueprintInternalUseOnly` - without this, Unreal's own `FBlueprintActionDatabase` would *also* register the engine's plain default `K2Node_CallFunction` for the same `UFunction`, producing two menu entries with the same name and a coin-flip which one gets placed
3. **Overrides** `GetNodeTitleColor()`, `GetIconAndTint()`, `GetTooltipText()`, and `GetMenuCategory()` to render the role-appropriate colour, icon, and enriched tooltip

```cpp
FLinearColor GetNodeTitleColor() const override
{
    // returns the role colour from the table above, keyed off the function's meta tag
}

FSlateIcon GetIconAndTint(FLinearColor& OutColor) const override
{
    OutColor = FLinearColor(0.823f, 0.823f, 0.823f);  // near-white icon regardless of role -
                                                          // only the node HEADER carries the role colour
    // returns one of five role-specific icon brushes
}
```

!!! tip "If a node still renders plain blue"
    A brand-new `BlueprintCallable` function tagged with a Mountea meta key needs the module to reload (hot-reload or editor restart) before `GetMenuActions` re-discovers it and suppresses the engine's default node. An already-placed node in an existing graph reflects colour/icon/tooltip changes live (they're virtual overrides queried by the graph editor) - but a change to *which node class gets spawned* (like the `BlueprintInternalUseOnly` suppression itself) only takes effect for newly-placed nodes; delete and re-place an existing one to pick that up.

## Practical Guidance

- Reach for the Statics classes first - they're the intended, documented Blueprint surface, and their node colours make a graph's read/write/validate/command/bind pattern visible at a glance
- Fall back to the raw interface `Execute_*` pattern only from C++, or when a Statics wrapper genuinely doesn't exist yet for what you need
- Category strings (`Mountea|Interaction|Interactor|...`) mirror the plugin's own module/domain structure, so the Blueprint context menu's category tree matches this documentation's own page structure

See [Interactor System](../InteractorSystem/InteractorSystem.md) and [Interactable System](../InteractableSystem/InteractableSystem.md) for the interfaces these statics wrap.
