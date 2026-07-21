---
tags:
  - reference
  - dialogue
  - decorators
  - data
---

# Select Random Dialogue Row

`UMounteaDialogueDecorator_SelectRandomDialogueRow` picks a random index into the active Dialogue Row's data array each time its Node is processed - useful for barks, idle lines, or any row with several interchangeable variants.

!!! info
    Its in-editor `DisplayName` is **"Use Random Dialogue Row Data"** - that's the label you'll see in the Decorator dropdown, even though the nav and class name both say "Select Random."

---

## 1. Introduction

### What You'll Learn
- What index gets picked, and where it comes from
- The `Random Range` property and a real gotcha in how it's applied
- What happens when the active row has no data

---

## 2. What It Does

On `ExecuteDecorator`, this Decorator reads the Context's active Dialogue Row and picks a random index into its `RowData` array, then updates the Context's active row-data index to that value. If there's no valid Context, no valid active row, or the row's data array is empty, it logs and skips - it never crashes on missing data.

| Property | Description | Default |
| --- | --- | --- |
| `Use Range` | Inline toggle that makes `Random Range` editable in the Details panel. | `false` |
| `Random Range` | An `(X, Y)` pair narrowing the random pick. If `X` is greater than `Y` the two are swapped before use. | `(0, 0)` |

!!! bug "Random Range always applies"
    `Use Range` only controls whether `Random Range` is editable in the Details panel - `ExecuteDecorator` does not check `Use Range` at runtime, it always uses whatever `Random Range` currently holds. Left untouched, `Random Range` defaults to `(0, 0)`, which means this Decorator will deterministically pick index `0` every time rather than randomizing across the whole row. To get a pick across the entire data array, enable `Use Range` and set `Random Range` to cover it (e.g. `X = 0`, `Y` set high enough - the upper bound is clamped to the row's actual last index either way).

The final index is clamped so it never exceeds the row's actual last valid index, regardless of what `Random Range` is set to - an overly wide or inverted range degrades gracefully rather than picking an invalid index.

---

## 3. Next Steps

<div class="card-grid">
  <div class="card next-steps sendCommand">
    <h4 class="card-title">Send Command</h4>
    <p class="card-description">Fire a stackable command and payload out to the Participant</p>
    <a href="../SendCommand" class="card-link"></a>
  </div>
</div>
