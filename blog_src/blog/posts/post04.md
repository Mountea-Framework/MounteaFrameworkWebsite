---
title: Data Contracts for Blueprints
date: 2026-06-25
authors:
  - DominikMorse
categories:
  - Inventory
tags:
  - Inventory
  - UI
  - Architecture
  - JSON
  - Blueprint
  
---

# Data Contracts for Blueprints: Eliminating Payload Boilerplate

Sometimes the best features don't start with a grand architectural vision.

Sometimes they start with frustration.

While building the Inventory & Equipment framework, I kept creating payload UObject after payload UObject just to move data between gameplay systems and UI. Every new widget seemed to require another payload class, even though most of them did nothing more than describe **what data a widget expected to receive**.

That raised a simple question:

> Why am I creating a UObject just to describe data?

That question became the foundation of a completely different approach.

<!-- more -->

---

## The Payload Problem

Consider a typical inventory system.

Gameplay data might live inside an Inventory Component or an Item object and contain everything imaginable:

- Item Identifier
- Display Name
- Description
- Weight
- Stack Count
- Durability
- Equipment Type
- Gameplay Tags
- Inventory Reference
- Value
- Effects
- ...

Now imagine several different widgets.

An inventory slot might only need:

- Icon
- Name
- Stack Count

A tooltip needs:

- Name
- Description

A merchant entry needs:

- Name
- Price

An equipment slot needs:

- Icon
- Equipment Type

Each widget consumes a different subset of exactly the same gameplay data.

Traditionally, this often leads to a growing collection of payload objects:

```text
UInventorySlotPayload
UTooltipPayload
UEquipmentPayload
UMerchantPayload
UCraftingPayload
...
```

None of these objects actually *do* anything.

They're simply containers.

After repeating this pattern enough times, I couldn't help thinking:

> Surely there has to be a better way.

---

## The Idea: Data Contracts

Instead of creating payload classes, what if we simply described the shape of the data?

Not as code.

Not as USTRUCTs.

But as reusable assets.

That idea became **JSON Definitions**.

A JSON Definition behaves similarly to a JSON Schema or an OpenAPI schema.

It simply describes:

- Which properties exist
- Their types
- Which properties are required
- Which other definitions are included

For example:

```text
Inventory Slot
 ├ Title
 ├ Icon
 ├ Stack Count
 ├ Inventory Reference
```

Or:

```text
Tooltip
 ├ Title
 ├ Description
```

These definitions become reusable contracts shared between gameplay systems and UI.

---

## Building Larger Definitions

A particularly useful aspect of the system is composition.

Definitions can include other definitions.

For example:

```text
Item Metadata
 ├ Name
 ├ Description

Equipment Metadata
 ├ Slot
 ├ Durability

Inventory Entry
 ├ Includes Item Metadata
 ├ Includes Equipment Metadata
 ├ Stack Count
```

Instead of copying properties between payload classes, larger contracts are assembled from smaller reusable pieces.

Even recursive definitions are supported, allowing hierarchical data structures without duplicated schemas.

---

## Dynamic Blueprint Nodes

At first, JSON generation was the goal.

But the feature became much more interesting once Blueprint entered the picture.

Instead of manually creating Blueprint nodes for every payload type, Blueprint nodes can simply read a selected JSON Definition.

The result?

The node automatically generates its pins.

Selecting:

```text
Tooltip
```

might expose:

```text
Title
Description
```

Changing the definition to:

```text
Inventory Slot
```

immediately changes the node into:

```text
Title
Icon
Stack Count
Inventory Reference
```

The Blueprint interface literally changes shape based on the selected definition.

No custom node creation.

No generated C++.

No duplicated Blueprint nodes.

---

## Construct Object From Definition

The first custom K2 node is **Construct Object From Definition**.

Given a selected definition, it dynamically creates typed input pins matching that schema.

Gameplay systems simply connect the values they want to expose.

The node constructs a JSON object that conforms to the selected contract.

The Blueprint graph becomes self-documenting.

You immediately know:

- what data is expected
- which fields are available
- which values are being supplied

without opening a single payload class.

---

## Break Object By Definition

The opposite operation is just as useful.

**Break Object By Definition** accepts:

- A JSON object
- A JSON Definition

It validates the incoming object against the schema before exposing any data.

If validation succeeds:

- Typed output pins become available.

If validation fails:

- The node reports validation errors.
- Blueprint execution can react accordingly.

This means UI systems never consume malformed payloads.

They only consume validated contracts.

---

## Inventory as the Perfect Test Bed

This system was born while developing the Inventory & Equipment framework, so naturally that's where it shines the most.

Imagine a merchant interface.

The merchant doesn't care whether an item originated from:

- Player Inventory
- Storage Chest
- Loot Window
- Vendor Inventory
- Crafting Output

The UI only expects a payload matching:

```text
Merchant Entry
 ├ Title
 ├ Icon
 ├ Price
 ├ Item Reference
```

As long as gameplay provides that contract, the widget works.

It doesn't know where the data came from.

It doesn't need to.

Exactly the same applies to:

- Inventory Slots
- Equipment Widgets
- Crafting Ingredients
- Shopping Entries
- Tooltips
- Quickbars
- Context Menus

Every widget simply defines the contract it expects.

Gameplay produces the contract.

UI consumes the contract.

Both remain completely independent.

---

## Why JSON?

A common question is:

> Why JSON?

Ironically...

JSON isn't really the feature.

It just happens to be an excellent transport format.

The real feature is the definition itself.

The definition becomes:

- Documentation
- Validation
- Blueprint Interface
- Contract
- Payload Generator

all at the same time.

JSON is simply the representation used to move that data around.

---

## Where This Can Go

Although the original motivation was inventory systems, the same approach applies almost anywhere.

Definitions can describe:

- Inventory Entries
- Equipment Data
- Crafting Recipes
- Shopping Entries
- Dialogue Payloads
- Notification Messages
- Modal Windows
- UI Requests
- UI Responses
- Runtime Configuration

Anywhere gameplay needs to exchange structured information with UI, definitions can replace dedicated payload objects.

---

## Final Thoughts

This feature wasn't born because I wanted JSON schemas inside Unreal.

It was born because I got tired of creating payload UObjects whose only responsibility was carrying data from one Blueprint to another.

JSON Definitions turned that frustration into something far more useful:

Reusable, validated, asset-driven data contracts that automatically generate Blueprint interfaces.

Gameplay no longer needs to know which widget consumes the data.

Widgets no longer need to know where the data originated.

Both simply agree on a contract.

Sometimes the best architectural improvements aren't about adding new systems.

They're about removing the ones you no longer need.

---

If you've built large UI-heavy systems in Unreal, I'd be interested to hear how you've approached payload objects and UI communication. This is still an evolving system, and I'm looking forward to seeing where it leads next.

