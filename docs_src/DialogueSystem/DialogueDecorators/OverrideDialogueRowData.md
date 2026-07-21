---
tags:
  - reference
  - dialogue
  - decorators
  - data
---

# Override Dialogue Row Data

`UMounteaDialogueDecorator_OverrideDialogue` unconditionally overwrites the active DataTable and Row on the Dialogue Context every time its Node is processed - no first-visit check, no condition, it just always applies.

---

## 1. Introduction

### What You'll Learn
- What "unconditional" means here compared to [Override Only First Time](OverrideOnlyFristTime.md)
- The properties you configure, and which Node types this Decorator is blocked from

!!! info
    This Decorator is not deprecated. If you want the swap to happen only on a Node's first visit, use [Override Only First Time](OverrideOnlyFristTime.md) instead - this one applies every single time the Node runs.

---

## 2. What It Does

On `ExecuteDecorator`, this Decorator looks up the row matching `Row Name` in `Data Table`, then overwrites the Dialogue Context's active DataTable and active Dialogue Row with it. There's no check against whether the Node has been visited before - every time this Node processes, the swap happens again.

| Property | Description | Default |
| --- | --- | --- |
| `Data Table` | The DataTable to switch to. Must use the `DialogueRow` row structure. | `None` |
| `Row Name` | The row inside that DataTable to activate. Populated from a dropdown once a Data Table is set. | `None` |
| `Row Index` | An index into the row's data array. | `0` |

<!-- TODO(verify): RowIndex is declared and editable but ExecuteDecorator_Implementation in the current source never reads it - only DataTable and RowName are applied. Confirm whether this is intentional (reserved for future use) before documenting it as functional. -->

=== "Blueprint"
    Add **Override Dialogue Row Data** to a Node's **Node Decorators** array, then set **Data Table** and **Row Name** in the Details panel.

=== "C++"
    ```cpp
    UPROPERTY(Category="Override", EditAnywhere, BlueprintReadOnly)
    TObjectPtr<UDataTable> DataTable;

    UPROPERTY(Category="Override", EditAnywhere, BlueprintReadOnly)
    FName RowName;
    ```

---

## 3. Where It's Blocked

`ValidateDecorator` requires both `Data Table` and `Row Name` to be set, and refuses to validate if attached to the **Start Node** or a **Return To Node** - both cases where there's no meaningful "current row" to override yet.

---

## 4. Next Steps

<div class="card-grid">
  <div class="card next-steps selectRandomDialogueRow">
    <h4 class="card-title">Select Random Dialogue Row</h4>
    <p class="card-description">Pick a random index into the active row's data array</p>
    <a href="../SelectRandomDialogueRow" class="card-link"></a>
  </div>
</div>
