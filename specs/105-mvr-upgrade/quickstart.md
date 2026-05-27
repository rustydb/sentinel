# Quickstart: MVR Upgrade Testing

## Dashboard

1. Ensure the `.env` or `import.meta.env` contains the fallback `VITE_UTOPIA_TURRET_PACKAGE_ID` (this is the original-id).
2. Start the dashboard: `bun run dev`
3. Open `http://127.0.0.1:5174` (or your configured port).
4. Verify that turrets load without errors. Check the network tab or console to confirm the `@suins/mvr` SDK fires a resolution query before fetching data.

## Indexer

1. Ensure `EVE_PACKAGE_ID` is set in the environment or `.env` file.
2. Run the indexer: `cargo run`
3. Observe the startup logs to verify the dynamic package ID resolution message before it starts the event polling loop.
