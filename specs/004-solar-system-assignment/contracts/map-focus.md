# Contract: Map Focus And Highlight Behavior

## Purpose

Define the `ef-map` iframe messaging behavior for the dashboard’s solar-system assignment feature.

## Base Embed Behavior

- The dashboard keeps a stable `ef-map` iframe mounted.
- The iframe is not reloaded when turret selection changes.
- The dashboard uses the embed postMessage API for all focus/highlight updates.

## Unselected State

When no turret is selected:

- send `ef-map-highlight`
- include every currently assigned solar-system ID
- keep single-system focus unset

**Message**

```js
iframe.contentWindow.postMessage(
    {
        type: 'ef-map-highlight',
        systems: [31002477, 31002478],
    },
    '*',
);
```

## Selected Turret State

When a turret with a resolved solar-system mapping is selected:

- send `ef-map-navigate`
- provide the selected solar-system ID
- optional zoom tuning may be layered on without changing the contract

**Message**

```js
iframe.contentWindow.postMessage(
    {
        type: 'ef-map-navigate',
        systemId: 31002477,
    },
    '*',
);
```

## Selection Clearing

When a selected turret is deselected:

- remove the single-system focus
- return to the all-assigned-systems highlight state

## No-Mapping State

When the selected turret has no current or retained solar-system mapping:

- do not send a single-system navigate message
- leave the map in the current non-focused state or restore the all-assigned-systems highlight state if nothing remains selected
