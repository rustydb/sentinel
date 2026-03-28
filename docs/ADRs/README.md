# ADR Naming Convention

Architecture Decision Records in this repository must use the filename format:

`ADR-XXX-<Name of ADR>.md`

Where:

- `ADR` is the fixed prefix
- `XXX` is a zero-padded three-digit sequence number
- `<Name of ADR>` is a short kebab-case summary of the decision

Examples:

- `ADR-001-require-eve-wallet-for-dashboard-connection.md`
- `ADR-002-run-indexer-as-long-lived-service.md`

When adding a new ADR:

1. Use the next available three-digit number.
2. Keep the title concise and descriptive.
3. Prefer kebab-case in the filename.
