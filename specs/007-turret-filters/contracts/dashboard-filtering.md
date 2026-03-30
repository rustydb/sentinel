# Dashboard Filtering Contract

## Purpose

Define the operator-facing filtering behavior for the turret list in Sentinel.

## Inputs

- current turret list
- resolved solar-system mapping for each turret
- known network node view data
- turret status
- turret class label or class resolution state
- current selected turret, if any

## Required Behaviors

- The dashboard shows filters for solar system, turret identity, known network node, status, and class.
- Filters combine conjunctively, so a turret must match every active facet to remain visible.
- The identity filter matches the turret's `turret.id` and turret name.
- The solar-system facet uses the turret's displayed solar-system assignment and explicit unassigned state.
- The known-network-node facet uses explicit assigned and orphaned states.
- The class facet shows loading and error states when class metadata is unavailable.
- When no turrets match, the dashboard shows an explicit empty state plus a friendly suggestion to remove some filters.
- When the selected turret is still visible, the dashboard keeps it in context and brings it into view when possible.

## Empty State Contract

- Message: no turrets match the current criteria
- Guidance: remove some filters for better results
- The empty state must be visually explicit and not resemble a broken list

## Loading And Error Contract

- Loading states must be explicit and labeled
- A 10-second unresolved class lookup becomes an explicit error state
- Loading and error states must not be silently substituted with guessed class labels

## Non-Goals

- No new backend filter endpoint
- No changes to turret ownership, assignment, or event persistence
- No automatic clearing of operator selection on every filter change
