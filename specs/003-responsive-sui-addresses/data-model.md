# Data Model

## `ResponsiveAddressProps` (UI contract)

- `address`: string
- `maxAbbreviation`: number (optional, defaults per design system)
- `as`: render element type (optional)
- `children`: optional render override or accessible label content

## `ResponsiveAddressPresentation` (Derived UI state)

- `fullAddress`: string
- `displayAddress`: string
- `isAbbreviated`: boolean
- `containerWidth`: number
- `copyAvailable`: boolean
- `copyIconAsset`: string
- `copied`: boolean
- `copyFeedbackMessage`: string

## `AddressSurface` (Feature scope tracker)

- `surfaceId`: string
- `location`: string
- `addressSource`: string
- `copyInteraction`: string
- `copyVisual`: string
- `responsiveBehavior`: string

### In-scope initial surfaces

- Wallet address summary in `App.tsx`
- Turret identifier in `TurretDetail.tsx`
- Any Sui-address-valued fields rendered in `TurretCard.tsx` and `TurretDetail.tsx`
- Demo/test fixtures in `test-data.ts` and affected component tests
