# GetPropertyByName

Use **Get Property by Name** when you want to read a value from an object **without casting** and without making a dedicated getter for every possible variable. You tell it **who** (Target) and **what** (Property Name), and it tries to pull the value out for you.

!!! warning "Use with caution"
    This node reads the value **directly**. It does **not** call any getter function. If your project relies on getters for validation, clamping, events, or side-effects, this node will bypass all of that.

## Why you’d use it

- You’re working with a variety of object types and don’t want a pile of casts.
- You want one “universal” read node for UI, debugging, or tooling.
- You’re building flexible systems where the property name comes from data (tables, configs, tags, etc.).

!!! example "Real-World Analogy"
    Like checking a label on a storage box and reading what’s inside - without needing to know who packed it or what brand the box is.

## Where to find it

!!! Blueprint context menu category

    **Mountea → Inventory & Equipment → Helpers**

## Pins (what you connect)

- **Execute / Then**: Standard execution flow.
- **Target**: The object you want to read from.
- **PropertyName**: The *exact* property name to read. If it doesn’t exist, the node fails.
- **Value**: The output value (type is decided by what you connect it to).
- **ReturnValue**: **true/false** result - false means “property not found” or “type mismatch”.

!!! tip "Important"
    **Value must be connected** to something typed (like a `Float`, `Bool`, `FVector`, etc.).  
    If you leave it unconnected, the node can’t know what type you expect and it will error during compilation.

## Quick use

1. Plug your object into **Target**
2. Type the **PropertyName** (case-sensitive, must match the real property name)
3. Connect **Value** into something that defines the type you expect (a variable, a setter, a print formatting node, etc.)
4. Check **ReturnValue** before using the output

!!! example "Common pattern"
    Use **ReturnValue** → **Branch**  
    - **True**: use `Value`  
    - **False**: fall back to defaults / show debug message

<p align="center" width="100%" class="preview-container">
  <img class="preview" width="90%" src="https://raw.githubusercontent.com/Mountea-Framework/MounteaInventoryEquipment/refs/heads/main/DocumentationResources/GetPropertyByName.webp">
</p>

## Supported output types

This node supports reading these kinds of values (and more structs):

- Int / Int64
- Float
- Bool
- String / Name
- Byte
- Object / Soft Object
- Class / Soft Class
- **Any UStruct** (FVector, FGuid, your own structs, etc.)

!!! note "Objects / Classes"
    For **Object/SoftObject** and **Class/SoftClass** values, you’ll typically still need to **cast the output** to your specific type after reading it.

## Gotchas (things that bite)

- **Spelling matters**: if the property name is wrong, you’ll just get **ReturnValue = false**.
- **Type must match**: asking for a `Float` when the property is actually an `Int` will fail.
- **Not a “safe getter”**: it bypasses getter logic and any side effects.
