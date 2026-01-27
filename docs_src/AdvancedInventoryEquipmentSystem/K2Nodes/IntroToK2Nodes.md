# Intro to K2Nodes

## What You’ll Learn

- What K2Nodes are (in plain terms)
- How they show up in your Blueprints
- Why they exist in the first place
- How they help keep your graphs clean and expressive

## Overview

If you’ve ever dragged a node into a Blueprint, you’ve already used a K2Node.

K2Nodes are simply the “brains” behind Blueprint nodes. They decide how a node looks, what pins it has, and how it behaves when you connect things together.

You usually don’t need to think about K2Nodes directly — they’re working quietly in the background. From your point of view, they just show up as useful Blueprint nodes that help you build gameplay, UI, and systems visually.

In short:

K2Nodes turn complex engine or framework logic into friendly Blueprint nodes.

## The Big Idea

K2Nodes exist to make advanced systems feel simple.

Instead of forcing you to wire together lots of small technical functions, a K2Node can wrap everything into a single, purpose-built node that fits naturally into your Blueprint flow.

This keeps graphs:

- Easier to read  
- Faster to build  
- Less cluttered  
- More designer-friendly  

They’re all about workflow.

!!! example "Real-World Analogy"

    Think of Blueprints like LEGO.

    Regular Blueprint functions are standard bricks. K2Nodes are custom pieces designed for specific jobs — they snap into place intelligently and help you build bigger things with fewer parts.

## Why You Care

From a designer or Blueprint developer perspective, K2Nodes are what give you:

- Nodes that adapt based on what you connect
- Cleaner graphs with fewer helper functions
- Smart switches and routing nodes
- Dynamic behavior without manual setup
- Framework features exposed directly to Blueprints

Any time you notice pins appearing or disappearing, or a node behaving differently depending on context — that’s usually a K2Node at work.

They exist to remove friction from your Blueprint workflow.

## How They’re Different from Regular Nodes

Many Blueprint nodes come directly from functions.

K2Nodes go further.

They can:

- Change their layout dynamically
- Validate connections for you
- Create multiple outputs automatically
- Drive editor behavior
- Act as visual controllers for larger systems

This makes them perfect for things like switching logic, UI routing, and dynamic data access.

!!! example "Dynamic Property Access"

    A K2Node can present a **Get Property by Name** Blueprint node where you select an object and provide a property name to dynamically read its value at runtime.

    This is more flexible than normal Blueprint functions, because the property isn’t hard-wired ahead of time — it’s resolved dynamically.

    In Mountea, nodes like **GetPropertyByName** and **SetPropertyByName** use this approach to let you access and modify data without creating custom Blueprint functions for every variable.

## K2Nodes in Mountea

Inside the Mountea Framework, K2Nodes are used to expose higher-level workflows directly to Blueprints.

Instead of giving you raw systems and asking you to assemble everything yourself, Mountea provides focused nodes such as:

- Getting and setting properties by name
- Switching widgets using commands
- Routing widget input via gameplay tags

These nodes are designed to:

- Reduce boilerplate
- Keep graphs readable
- Encourage consistent patterns
- Let designers work without touching C++

You don’t need to know how they’re implemented.

Just drop them in and build.

## When Should You Think About Them?

You’ll feel the impact of K2Nodes when:

- Your Blueprint graphs stay small instead of exploding
- You can express complex behavior with a few nodes
- Systems feel intuitive instead of technical
- Framework features “just work” visually

If you’ve ever thought:

“I wish this was just one node.”

That’s exactly what K2Nodes are for.

## Summary

K2Nodes are what turn powerful systems into usable Blueprint tools.

They hide complexity, improve workflows, and help you focus on design instead of wiring.

You may never create one — but every time you build with Blueprints, you’re benefiting from them.

## Next Steps

<div class="card-grid">

    <div class="card next-steps k2node">
        <h4 class="card-title">GetPropertyByName</h4>
        <p class="card-description">Custom node to get data from Target without casting</p>
        <a href="../K2Node_GetPropertyByName" class="card-link"></a>
    </div>

    <div class="card next-steps k2node">
        <h4 class="card-title">SetPropertyByName</h4>
        <p class="card-description">Custom node to set data to Target without casting</p>
        <a href="../K2Node_SetPropertyByName" class="card-link"></a>
    </div>

    <div class="card next-steps k2node">
        <h4 class="card-title">SwitchOnInputTag</h4>
        <p class="card-description">Custom node to switch on tags (using pre-filtered input tags only)</p>
        <a href="../K2Node_SwitchOnInputTag" class="card-link"></a>
    </div>

    <div class="card next-steps k2node">
        <h4 class="card-title">SwitchOnCommand</h4>
        <p class="card-description">Custom node to switch on Command (using pre-defined widget commands)</p>
        <a href="../K2Node_SwitchOnCommand" class="card-link"></a>
    </div>

    <div class="card next-steps k2node">
        <h4 class="card-title">ProcessWidgetCommand</h4>
        <p class="card-description">Custom node to process Widget Command (using pre-defined widget commands)</p>
        <a href="../K2Node_ProcessWidgetCommand" class="card-link"></a>
    </div>

</div>
