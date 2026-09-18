# Interactor Runtime Config

`UMounteaInteractorRuntimeConfig` (`UDataAsset`) supplies gameplay defaults to every interactor component via `SetDefaults()`.

## Fields

| Field | Type | Default | Purpose |
|---|---|---|---|
| `DefaultInteractorState` | `EInteractorStateV3` | `EIS_Scanning` | State interactors boot into |
| `OverlapCollisionChannelName` | `FName` | `InteractionOverlap` | Overlap channel used by `UMounteaInteractorComponentOverlap` - must match the Interactable Runtime Config's channel of the same name |
| `TraceCollisionChannelName` | `FName` | `InteractionTrace` | Channel used for line-of-sight safety validation |
| `InteractorTag` | `FGameplayTag` | none | Default tag assigned to interactors, checked against interactables' Required/Excluded tag filters |
| `SafetyTracingSetup` | `FSafetyTracingSetup` | `ESTM_None` | Default safety-trace mode (see below) |
| `MaxCandidatesPerActor` | `int32` | `8` | Caps how many action candidates `RefreshFocus()` keeps for the focused actor |
| `CandidateRefreshRate` | `float` (s) | `0.05` | How often the interactor re-evaluates its candidate list |
| `DefaultInputMappingContext` | `TSoftObjectPtr<UInputMappingContext>` | none | See [Enhanced Input helper](#enhanced-input-helper) below |
| `InputMappingPriority` | `int32` | `0` | Priority passed to `AddMappingContext` for the field above |

Both collision channel names carry `NoResetToDefault` and are auto-registered by the editor module on startup if missing from the project's collision profile.

## Safety Tracing

`FSafetyTracingSetup` guards against overlap volumes detecting an interactable through a wall (a common false-positive for the Overlap interactor, since overlap shapes don't respect line-of-sight):

| Mode | Behaviour |
|---|---|
| `ESTM_None` | No secondary trace. Default for Trace/Mouse interactors, since they already trace to detect in the first place. |
| `ESTM_Location` | Traces from `StartLocation` (or the owner's location if unset). Default for the Overlap interactor. |
| `ESTM_Socket` | Traces from a named socket (default `"head"`) on the owner's mesh, falling back to owner location if the socket doesn't exist. |

`OverrideTraceChannelName` on the struct (blank by default) lets a single component override the global trace channel without touching the project-wide config.

## Enhanced Input Helper

`DefaultInputMappingContext` + `InputMappingPriority` back one optional convenience call: `UMounteaInteractorStatics::ApplyDefaultInputMappingContext(Interactor)`.

```cpp
// Blueprint-callable static, taking the interactor by interface
UMounteaInteractorStatics::ApplyDefaultInputMappingContext(Interactor);
```

It adds the configured `UInputMappingContext` via `AddMappingContext` for whichever local player controls the interactor's owning actor - safe no-op if the field is unset, the owner isn't a locally-controlled Pawn, or no Enhanced Input subsystem is available (server-only / AI-controlled actors).

!!! info "It never binds gameplay behaviour"
    This call only makes the mapping context's key bindings - and any Player Mappable Key Settings on them - active and remappable. It does **not** wire `Start Interaction` / `Stop Interaction` / `Cycle Action` to anything; you still bind those yourself. It also isn't called automatically anywhere (not `BeginPlay`, nowhere) - you place the one Blueprint node yourself, wherever your project already sets up input.

## Resolving From Code

```cpp
const UMounteaInteractionSystemSettings* settings = GetDefault<UMounteaInteractionSystemSettings>();
const UMounteaInteractorRuntimeConfig* config = settings ? settings->GetInteractorConfig() : nullptr;
```

See [Interactor System](../InteractorSystem/InteractorSystem.md) for how these values are consumed by `SetDefaults_Implementation()`.
