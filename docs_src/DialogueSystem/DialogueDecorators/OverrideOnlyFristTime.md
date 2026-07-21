---
tags:
  - reference
  - dialogue
  - decorators
  - deprecated
---

# Override Only First Time

`UMounteaDialogueDecorator_OverrideOnlyFirstTime` swaps the active dialogue row to a configured DataTable/Row on a Node's first visit only. It's deprecated - this page documents it because older content may still reference it, not as a recommendation for new work.

---

## 1. Deprecated - Use an Edge Condition Instead

!!! warning "Deprecated"
    The class's own metadata says it plainly: *"Deprecated. Use edge condition 'Only First Time' for traversal gating and separate row override logic for first-visit behavior."* This subclasses [Only First Time (Base)](OnlyFirstTimeBase.md), and inherits the same problem: nothing about it can stop a branch from being taken. The recommended replacement is an `Only First Time` Edge Condition (a separate mechanism, Edge Conditions, covered on its own page) combined with [Override Dialogue Row Data](OverrideDialogueRowData.md) if you still need a data swap.

### What You'll Learn
- What actually happens on a Node's first visit vs every visit after
- The DataTable/Row properties you configure
- Where it inherits the same Start/Return Node restrictions as its base class

---

## 2. What It Does

On `ExecuteDecorator`, this Decorator checks `IsFirstTime()` (inherited from the base class). If the owning Node has never been traversed before, it overwrites the Dialogue Context's active DataTable and RowName with the ones configured here. On every subsequent visit, `IsFirstTime()` returns `false` and `ExecuteDecorator` does nothing - the Context's existing active row is left untouched.

| Property | Description | Default |
| --- | --- | --- |
| `Data Table` | The DataTable to switch to on first visit. Must use the `DialogueRow` row structure. | `None` |
| `Row Name` | The row inside that DataTable to activate. Populated from a dropdown once a Data Table is set. | `None` |

!!! bug "Validation"
    Both `Data Table` and `Row Name` are required - leaving either unset fails validation and the Dialogue as a whole refuses to start. Check the Output Log for which Decorator and Node.

=== "Blueprint"
    Add **Override Only First Time** to a Node's **Node Decorators** array, then set **Data Table** and **Row Name** in the Details panel.

=== "C++"
    ```cpp
    UPROPERTY(Category="Override", EditAnywhere, BlueprintReadOnly)
    TObjectPtr<UDataTable> DataTable;

    UPROPERTY(Category="Override", EditAnywhere, BlueprintReadOnly)
    FName RowName;
    ```

---

## 3. Inherited Restrictions

Because this class subclasses [Only First Time (Base)](OnlyFirstTimeBase.md), it inherits the same validation blocks: not allowed on the Start Node, not allowed on a Return To Node, not allowed on the Graph directly, and not allowed on the very first Node after Start (trivially always "first time," so the check is meaningless there).

---

## 4. Next Steps

<div class="card-grid">
  <div class="card next-steps overrideDialogueParticipants">
    <h4 class="card-title">Override Dialogue Participants</h4>
    <p class="card-description">Not deprecated - swap in different Player/Dialogue/Active participant Actors</p>
    <a href="../OverrideDialogueParticipants" class="card-link"></a>
  </div>
</div>
