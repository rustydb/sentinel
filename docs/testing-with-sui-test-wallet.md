# Testing With Sui Test Wallet

This project requires the EVE Wallet extension for the intended production connection flow.

For local QA and browser automation, we also support using the Sui Test Wallet extension as a stand-in wallet when the real EVE Wallet extension is not available in the test browser.

## Test Wallet Extension

- Release URL:
  `https://github.com/Scetrov/sui-test-wallet/releases/download/v0.2.0/sui-test-wallet-v0.2.0.zip`
- Purpose:
  local development and Playwright-style automation only

Do not treat the test wallet as a production wallet path.

## Recommended Usage

1. Install the EVE Wallet extension when validating the real user flow.
2. Use the Sui Test Wallet extension only for local QA or automation where loading the real extension is impractical.
3. Keep wallet-specific assertions separate:
    - EVE Wallet: production-intended UX validation
    - Sui Test Wallet: test harness and automation support

## Notes

- If the browser does not expose EVE Wallet, the dashboard should make that requirement explicit rather than silently falling back for normal users.
- If we later add dedicated automation hooks for the Sui Test Wallet flow, document them here alongside the extension setup steps.
