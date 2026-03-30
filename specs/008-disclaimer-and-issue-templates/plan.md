# Implementation Plan: Disclaimer and Issue Templates

**Branch**: `008-disclaimer-and-issue-templates` | **Date**: 2026-03-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/008-disclaimer-and-issue-templates/spec.md`

## Summary

This feature adds a specific prerelease and legal disclaimer to the Sentinel dashboard UI, prioritizing a small, monospace design constraint. Additionally, it provisions `.github/ISSUE_TEMPLATE` bug report and feature request templates to standardise user issue reporting.

## Technical Context

**Language/Version**: TypeScript 5.8.x + React 19 for dashboard code, Markdown/YAML for GitHub templates  
**Primary Dependencies**: React, Tailwind CSS 4 for the UI  
**Storage**: N/A  
**Testing**: testing-library/react for component rendering verification, Vitest 3  
**Target Platform**: Dashboard Web Application, GitHub Repository  
**Project Type**: Web Application + Repo Config  
**Performance Goals**: N/A (static content addition)  
**Constraints**: Brutalist UI constraints (monospace small font size, no rounding)  
**Scale/Scope**: 1 UI element addition, 2 new markdown files

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Code Quality**: Uses TypeScript, strict typing, and Docker best practices.
- [x] **Testing Standards**: Adheres to TDD and includes CI/CD test gates.
- [x] **UX Consistency**: Follows Brutalist design (monospace, thick borders, no gradients). This feature requires strict adherence to small monospace usage for the disclaimer.
- [x] **Performance**: Designed for scalability (Cloud Run) and CI/CD benchmarks.

## Project Structure

### Documentation (this feature)

```text
specs/008-disclaimer-and-issue-templates/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code

```text
.github/ISSUE_TEMPLATE/
├── bug_report.md
└── feature_request.md

apps/dashboard/
└── src/
    ├── App.tsx (or Footer component containing the new disclaimer)
    └── __tests__/
        └── App.test.tsx (or Footer component test)
```

**Structure Decision**: Add templates to the `.github/ISSUE_TEMPLATE/` root path for native GitHub consumption. The disclaimer text will be integrated cleanly into the root dashboard layout or global `App.tsx` container avoiding large component tree disruption.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
