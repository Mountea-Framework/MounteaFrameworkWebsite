---
title: "Contract-Driven Blueprints: From Payload Frustration to Verified Unreal Data Flow"
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

# Contract-Driven Blueprints: From Payload Frustration to Verified Unreal Data Flow

This started with a small annoyance that kept coming back.

While building the Inventory & Equipment framework, I kept creating payload UObject after payload UObject just to move data between gameplay systems and UI. Every new widget seemed to need its own payload class. Most of those classes were almost the same as another one, just different enough to make reuse awkward.

At first, that feels like normal Unreal work.

<!-- more -->

You need a typed object.

Blueprint needs something visible.

The UI needs a clean input.

So you add another payload.

But after doing that enough times, it stops feeling like structure and starts feeling like boilerplate pretending to be architecture.

This is also where my enterprise architecture background keeps leaking into my Unreal work. In enterprise systems, you learn to treat data boundaries very seriously: schemas, contracts, validation, versioning, and predictable integration points are not decoration. They are what keep large systems understandable.

The part that bothered me most was not the typing itself. It was the lack of an explicit contract. The producer and consumer both knew what the payload was supposed to contain, but that agreement lived mostly in naming, convention, and memory.

That is **fragile**.

Especially once you have several gameplay sources, several UI variants, and maybe even external UI systems that need the same data in a predictable shape.

At some point, the question became hard to ignore:

> Why am I creating a UObject just to describe the shape of data?

That question became the foundation of a different approach: asset-defined, reusable, validated data contracts for Blueprints.

!!! note "Core idea"
    Treat UI payloads less like throwaway UObject containers and more like explicit data contracts: named, reusable, inspectable, and validated before consumption.

---

## The Payload Problem

Inventory systems are a perfect place to feel this pain.

Gameplay data might live inside an Inventory Component, an Item object, a data asset, a save game object, or a replicated runtime model. It can contain everything imaginable:

- Item Identifier
- Display Name
- Description
- Icon
- Weight
- Stack Count
- Equipment Type
- Price
- Runtime State

But each UI element usually needs only a slice of that data.

An inventory slot might need:

- Icon
- Name
- Stack Count

A tooltip might need:

- Name
- Description

A merchant entry might need:

- Name
- Icon
- Price

An equipment slot might need:

- Icon
- Equipment Type

The common Unreal answer is to introduce more payload objects:

```text
UInventorySlotPayload
UTooltipPayload
UEquipmentPayload
etc...
```

The other option is to go in the opposite direction and create one huge payload that contains every possible field any widget might need.

That does not really solve the problem either.

It creates a wasteful monolith: one object with too many optional properties, unclear ownership, weak intent, and no clean way to tell which fields are actually required for a specific consumer. ANother huge risk is naming, with huge monoliths wer must have all properties names correctly and clearly, so there won't be any confusion possible.

The problem is that many of these classes do not really do anything.

They are shaped containers. They exist because Blueprint needs something typed and visible. They become the class-per-shape solution to a data-contract problem.

Inheritance does not solve this cleanly either. A shared base payload can help with common fields, but UI data does not usually grow in a neat inheritance tree. It grows sideways. One widget needs title and icon. Another needs title and price. Another needs title, icon, durability, and an item reference. The combinations multiply faster than a clean hierarchy can describe them or, more importantly, maintain them.

That is the inheritance pressure I wanted to get away from. Not because inheritance is bad. Because this specific problem is not really an inheritance problem.

It is a *contract problem*. And as such, it has already been solved by people far superior to me.

---

## The Architectural Intent

My goal was not to put JSON into Unreal for the sake of JSON. The goal was to bring a more unified and verified process to Unreal data exchange.

In larger systems, I do not want gameplay and UI to communicate through informal assumptions:

- "This payload should probably contain this field."
- "This widget expects this object type."
- "This action should pass a value with this name."
- "This data is valid because the previous Blueprint probably built it correctly."

That kind of trust-based workflow works until the project grows.

Then UI variants multiply, gameplay sources multiply, integrations multiply, and the payload layer becomes fragile. The issue is not that Unreal cannot handle the data. The issue is that the process is not explicit enough.

What I wanted instead was a repeatable Unreal process where:

- producers know exactly what contract they are producing
- consumers know exactly what contract they require
- payloads can be validated before use
- Blueprint interfaces can be generated from the contract
- the contract itself becomes documentation

That is where JSON Definitions came from.

!!! tip "The process shift"
    The goal is not to make Unreal feel like enterprise software. The goal is to bring the useful parts of enterprise discipline into Unreal: clear boundaries, verified data, and fewer invisible assumptions.

---

## Data Contracts as Assets

A JSON Definition behaves similarly in spirit to a JSON Schema or an OpenAPI schema. It describes the shape of data:

- Which properties exist
- Which types they use
- Which properties are required
- Which definitions are included
- What a valid payload is expected to look like

For example:

```text
Inventory Slot
|-- Title
|-- Icon
|-- Stack Count
|-- Inventory Reference
```

Or:

```text
Tooltip
|-- Title
|-- Description
```

The important part is that the definition is not hidden inside a random payload class.

It is an asset. It can be named, reused, inspected, validated, composed, and shared between systems.

That changes the role of the payload entirely. Instead of asking "Which UObject class should I create for this widget?", I can ask a better question:

> What contract does this widget need?

!!! example "Contract mindset"
    A widget should not need to know the full gameplay model. It should only know the contract it consumes.

---

## Composition Instead of Payload Inheritance

One of the most useful parts of this approach is composition.

Definitions can include other definitions.

For example:

```text
Item Metadata
|-- Name
|-- Description

Equipment Metadata
|-- Slot
|-- Durability

Inventory Entry
|-- Includes Item Metadata
|-- Includes Equipment Metadata
|-- Stack Count
```

Instead of forcing every payload into an inheritance hierarchy, larger contracts can be assembled from smaller reusable contracts.

That fits UI data much better.

UI data often needs composition, not inheritance. A widget does not always represent a subtype of another widget's payload. It often represents a different projection of the same underlying gameplay data.

This is where the enterprise architecture part of my brain feels much more at home. Define smaller contracts. Compose them. Validate the result. Keep producer and consumer boundaries explicit.

The same thinking applies inside Unreal.

---

## Dynamic Blueprint Nodes

The feature became much more interesting once Blueprint entered the picture.

Instead of creating a custom Blueprint node or payload class for every data shape, Blueprint nodes can read a selected JSON Definition and generate their pins from it.

Selecting:

```text
Tooltip
```

can expose:

```text
Title
Description
```

Changing the selected definition to:

```text
Inventory Slot
```

can expose:

```text
Title
Icon
Stack Count
Inventory Reference
```

The Blueprint interface changes shape based on the contract.

No generated C++.

No duplicated Blueprint nodes.

No new UObject payload class just to express a slightly different set of fields.

The contract drives the node.

---

## Construct Object From Definition

The first custom K2 node is **Construct Object From Definition**.

Given a selected definition, it dynamically creates typed input pins matching that schema. Gameplay systems connect the values they want to expose, and the node constructs a JSON object that conforms to the selected contract.

That makes the Blueprint graph self-documenting.

You can see:

- what data is expected
- which fields are required
- which values are being supplied
- which contract the payload is meant to satisfy

without opening a payload class or guessing what another widget expects.

This is where the workflow starts to feel less like "passing some object around" and more like verified Blueprint data flow.

---

## Break Object By Definition

The opposite operation is just as important.

**Break Object By Definition** accepts:

- A JSON object
- A JSON Definition

It validates the incoming object against the selected definition before exposing any data.

If validation succeeds:

- typed output pins become available
- the consumer can safely use the values

If validation fails:

- the node reports validation errors
- Blueprint execution can react accordingly

This is the part I care about most architecturally.

The consumer does not just hope that the payload is correct.

It verifies the contract first.

That small change matters a lot in large UI-heavy systems, because it turns informal data flow into an explicit producer-consumer contract.

!!! success "Verified before consumed"
    The consumer does not rely on hope, naming, or convention. It receives data only after the payload has been checked against the selected definition.

---

## Inventory as the Proving Ground

This system was born while developing the Inventory & Equipment framework, so naturally that is where it shines first.

Imagine a merchant interface.

The merchant UI does not need to care whether an item originated from:

- Player Inventory
- Storage Chest
- Loot Window
- Vendor Inventory
- Crafting Output

The UI only expects a payload matching:

```text
Merchant Entry
|-- Title
|-- Icon
|-- Price
|-- Item Reference
```

As long as gameplay produces that contract, the widget works.

It does not know where the data came from.

It does not need to.

The same idea applies to:

- Inventory Slots
- Equipment Widgets
- Crafting Ingredients
- Shopping Entries
- Tooltips
- Quickbars
- Context Menus
- Modal Windows

Every widget defines the contract it expects.

Gameplay produces the contract.

UI consumes the contract.

The boundary stays explicit.

---

## External UI Systems

There is another reason this design matters: Unreal is not always the final UI runtime.

Modern Unreal projects may use external UI systems or presentation layers such as Rive.app, Noesis, web-based overlays, custom tooling, or other runtime UI frameworks. Those systems do not benefit from Unreal-specific payload inheritance. They benefit from predictable structured input.

That is exactly what contract-shaped JSON payloads provide.

If Unreal can produce a validated payload from a known definition, an external UI runtime can consume that payload without needing to understand the original gameplay object model.

For example:

```text
Unreal Gameplay System
|-- Produces validated Merchant Entry payload
|-- Sends JSON-shaped data to UI layer
|-- External UI runtime consumes predictable fields
```

This reduces custom adapter logic.

It also keeps the integration boundary honest. The external system receives a clear input shape, not a vague object with implicit expectations.

For Rive, Noesis, or any other external UI runtime, this kind of contract-driven payload becomes a practical bridge between Unreal gameplay state and UI presentation.

!!! info "External UI benefit"
    The same contract that makes Blueprint safer can also become the data boundary for Rive.app, Noesis, web UI, tools, or any other system that prefers predictable structured input.

---

## Why JSON?

A fair question is:

> Why JSON?

The honest answer is that JSON is not the main feature.

The definition is the feature.

JSON is simply a useful transport representation:

- readable
- inspectable
- easy to serialize
- easy to validate
- easy for external systems to consume

The real value is that the definition becomes several things at once:

- Documentation
- Validation
- Blueprint Interface
- Contract
- Payload Generator
- Integration Boundary

That is why JSON makes sense here.

Not because Unreal needs more JSON.

Because Unreal benefits from explicit, verifiable data contracts.

---

## Where This Can Go

Although the original motivation was inventory systems, the same approach applies almost anywhere structured data needs to move between systems.

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
- External UI Inputs
- Tooling Messages

Anywhere gameplay needs to exchange structured information with UI, tools, or runtime presentation layers, definitions can replace dedicated payload objects.

This is not limited to one framework.

It is a pattern for making Unreal communication more explicit.

---

## Final Thoughts

I did not start this because I woke up one day thinking Unreal needed JSON schemas.

I started it because I was annoyed.

I had too many payload objects that existed only because some widget needed a slightly different shape of data. I had too many almost-the-same classes. Too many places where the contract was obvious in my head, but not actually written down anywhere useful.

That is the kind of thing that slowly makes a system harder to trust.

The nice part is that the solution did not end up being bigger payloads or more inheritance. It ended up being something much simpler to reason about:

- define the shape
- build data against that shape
- validate it before something consumes it

That is the bit I like.

Gameplay can produce data without caring which widget will use it. UI can consume data without caring where it came from. External UI runtimes can receive predictable inputs without needing to understand Unreal's internal object model.

And if the data is wrong, the system can say so.

That alone makes the whole workflow feel calmer.

For me, this is the direction I want to keep pushing in Unreal: fewer invisible assumptions, fewer throwaway payload classes, and more small pieces of process that make large systems easier to work with.

Not because Unreal should become enterprise software.

Because some of those enterprise habits are useful when a project stops being small.

---

If you have built large UI-heavy systems in Unreal, especially ones that communicate with external UI layers, I would be interested to hear how you have approached payload objects, validation, and data contracts. This is still an evolving system, and I am looking forward to seeing where it leads next.
