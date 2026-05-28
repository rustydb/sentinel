# Data Model: MVR Upgrade

The data models for Sentinel (Turrets, Network Nodes, Killmails) remain unchanged. The only change is the introduction of the Move Version Registry lookup as an environmental prerequisite.

## MVR Resolution Flow

The system conceptually treats the MVR lookup as an asynchronous configuration loader:

1. **Input**: `EVE_PACKAGE_ID` (Rust) or `VITE_UTOPIA_TURRET_PACKAGE_ID` (Dashboard) which serves as the anchor `original-id`.
2. **Action**: Query SuiNS/MVR.
3. **Output**: The active `published-at` Package ID.
4. **Usage**: Passed into the existing Sui / GraphQL client setups.
