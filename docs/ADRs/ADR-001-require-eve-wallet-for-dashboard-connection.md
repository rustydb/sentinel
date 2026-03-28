# ADR 001: Require EVE Wallet for Dashboard Connection

- Status: Accepted
- Date: 2026-03-27

## Context

Frontier Sentinel's dashboard originally used the broader `@evefrontier/dapp-kit` provider stack and allowed fallback to any detected Sui-compatible wallet when the EVE Wallet extension was not present.

That caused two practical problems:

1. The product intent is to connect through the EVE Frontier wallet experience, not a generic wallet fallback.
2. In browsers without the custom EVE Wallet extension installed, the app could open Slush, which looked like a valid path even though it was not the intended integration target.

During implementation we also found that the top-level `EveFrontierProvider` mounts `SmartObjectProvider`, which expects smart-object query parameters or `VITE_OBJECT_ID`. The dashboard does not supply those values during initial connection, so the broader provider stack was a poor fit for the app shell.

## Decision

Frontier Sentinel will require EVE Wallet for dashboard connection.

Specifically:

- The dashboard uses a wallet-only provider composition (`DAppKitProvider` + `VaultProvider`) instead of the full `EveFrontierProvider`.
- The UI does not fall back to Slush or any other detected wallet.
- If EVE Wallet is not detected, the connect button is disabled and the user is shown a clear install message and download link.
- If a non-EVE wallet is connected, the dashboard treats it as unsupported and prompts the user to disconnect.

## Consequences

### Positive

- The connect flow now matches product intent exactly.
- The UI is explicit about the required wallet instead of silently sending users into an unintended path.
- The app shell is decoupled from `SmartObjectProvider`, avoiding runtime issues caused by missing object identifiers at startup.

### Negative

- Developers and testers without the EVE Wallet extension cannot exercise the real connection flow until the extension is installed.
- Generic wallet compatibility is intentionally narrowed, which reduces flexibility for ad hoc testing.

## Notes

- Current extension download used by the dashboard:
  `https://github.com/evefrontier/evevault/releases/download/v0.0.6/eve-vault-chrome.zip`
- If wallet naming changes in the extension, the supported-wallet detection in the dashboard must be updated alongside this ADR.
