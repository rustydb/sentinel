# Research Findings: MVR Upgrade

## Dashboard SDK Selection

**Decision**: Use `@suins/mvr` SDK.
**Rationale**: The user explicitly confirmed via specification clarifications that they prefer adding the `@suins/mvr` SDK rather than relying solely on the core `@mysten/sui` client. This provides a robust interface out of the box for handling name/MVR resolutions and maintains alignment with official Sui ecosystem standards.
**Alternatives considered**: Building a custom query wrapper around `suiClient.getObject` using the `@mysten/sui` client alone, which was rejected in favor of the specialized SDK.

## Indexer Rust Crate Selection

**Decision**: Use a dedicated MVR or SuiNS crate.
**Rationale**: The user opted to use a dedicated crate to resolve the MVR objects rather than parsing dynamic fields manually with `sui-sdk`. This keeps the MVR resolution logic encapsulated and robust against internal MVR contract changes.
**Alternatives considered**: Using `sui-sdk`'s raw `get_dynamic_field_object` method, rejected because it requires brittle manual mapping of the Move structures.

## Runtime Polling vs Startup Resolution

**Decision**: Only resolve on startup.
**Rationale**: Attempting to dynamically update the package ID for active event polling loops introduces significant complexity and potential race conditions in the indexer's architecture. Resolving at startup acts as an effective MVP that eliminates the need for hardcoded `.env` updates. A separate issue (#113) was opened to track fully dynamic runtime polling in the future.
**Alternatives considered**: Background polling tasks or Sui event subscriptions listening to package upgrade events on the MVR object itself.
