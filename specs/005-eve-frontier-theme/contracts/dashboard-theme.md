# Contract: Dashboard Theme And Shell Composition

## Purpose

Define the shell-level UI expectations for the EVE Frontier theme overhaul, including branding, surface hierarchy, statistics presentation, and demo/live consistency.

## Branding

- The dashboard shell uses the existing `./assets/logo.svg` as its canonical logo source.
- The header presents a Frontier Sentinel logo treatment in both live and demo routes.
- The unconnected wallet view, connected shell, and fatal fallback surface share the same theme language.

## Theme Documentation

- Final palette, typography, component rules, and accessibility/focus guidance are written to `docs/DESIGN_SYSTEM.md`.
- Color decisions are expressed as explicit hex values and named usage rules.
- Component guidance covers at minimum turret cards, turret detail, network node drawer, and statistics panel.

## Shell Statistics Panel

The shell exposes a compact statistics panel that displays:

- total turrets
- engaged turrets
- online turrets
- offline turrets
- aggressors in the past 24 hours

## Turret Card Additions

The card remains intentionally compact.

Required additions:

- latest target label showing either the resolved character name or `NPC`
- `ENGAGED` status in a red treatment when the latest `behavior_change` is `STARTED_ATTACK`
- aggressor count for the past 24 hours

The card must not expand into the full detail-level target-intelligence surface.

## Turret Detail Additions

The detail panel defaults to the latest `PriorityListUpdatedEvent` and uses it to present:

- target identity (character name or `NPC`)
- tribe name when available
- target type information and icon when available
- aggressor state
- the selected event as the source of truth for those fields

## Demo Consistency

- `/demo` must exercise the same shell styling as the live route.
- Demo fixtures must cover the new intelligence and statistics states instead of leaving those states absent.
