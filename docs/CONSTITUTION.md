---
title: Sentinel - Project Constitution
version: 1.0.0
status: active
created: 2026-03-26
updated: 2026-03-26
author: rustydb
description: Absolute source of truth for all development, architectural decisions, and project conventions within sentinel.
---

This document serves as the absolute source of truth for all development, architectural decisions, and project conventions within the `sentinel` repository. It synthesizes overarching project goals with specific technical guardrails to ensure longevity, security, and maintainability.

## 1. Product Vision & Mission

**Sentinel** is a monitor for EVE Frontier in-game assets that are publically available on the Sui block-chain. We want to provide users with visibility and awareness around their in-game structures, aiming to provide them with a single dashboard and notifications.

---

## 2. Core Intent & Philosophy

- **Respect the Architecture:** Follow established patterns and directory layouts as they are created. Extend existing abstractions before inventing new ones.
- **Explicit over Clever:** Prefer readable, explicit solutions over clever shortcuts. Code should be clean, focused, and prioritize maintainability.
- **Clean State:** Favor immutable data and pure functions when practical. Avoid dynamic code execution from user input to maintain code generation security.

---

## 3. Core Engineering Principles

1. **Type Safety Above All:** The entire application is built with TypeScript (Target ES2022). Avoid `any` completely; prefer `unknown` along with narrowing. Rely on discriminated unions for complex state machines.
1. **Domain-Driven Design:** The component structure and node types directly map to game domain elements (`Aggression`, `Proximity`, `GetTribe`, `PriorityQueue`). The UI speaks the language of the game.
1. **Predictable Code Generation:** The generated Sui Move code must be deterministic, readable, and logically sound based entirely on the node graph state.

---

## 4. UI & Design System Standards

Our application strictly adheres to the core aesthetic and theming principles outlined in the [Design System](./DESIGN_SYSTEM.md). This establishes a high-contrast, technical, "sci-fi industrial" aesthetic inspired by **EVE Frontier**.

### 4.1 Aesthetic & Theming

- **Borders & Shapes:** Favor sharp, angular, technical shapes to align with the sci-fi industrial aesthetic. Border radius is strictly disabled (`0px`) globally on all components (cards, inputs, buttons, nodes, and interactive sockets) without exception.

---

## 5. Security & Configuration Practices

- **Zero Tolerance for Logged Secrets:** Never hardcode secrets in the UI or configuration.
- **Code Generation Safety:** The Sui Move generator must meticulously validate all graph inputs to block injection attacks in the generated smart contracts.
- **Cross-Site Scripting (XSS):** Ensure all untrusted external content (e.g., custom node labels) is sanitized before rendering in the UI. Make use of React's built-in escaping.
- **Asynchronous Operations:** Use `async/await` and handle errors cleanly without deep nesting. Surface user-facing errors via predefined notification patterns or Error Boundaries.

---

## 6. Testing Expectations

- **Comprehensive Unit Tests:** Unit tests are **mandatory**. ALWAYS include tests for utilities, layout algorithms, and code generators. Cover both the happy-path and the not-happy-path.
- **UI Tests:** Visual and interaction tests ALWAYS accompany changes to the User Experience. Playwright is recommended for End-to-End browser testing for UI workflows.
- **Avoid Brittle Tests:** Do not rely on timing assertions. Prefer fake timers, mock clocks, or injected dependencies.

---

## 7. General Guardrails & Workflow

- **Signed Commits:** All commits **MUST** be signed. NEVER attempt to disable GPG signing.
- **Conventional Commits:** Use standard conventional commit formats (e.g., `feat:`, `fix:`, `docs:`).
- **Clean Changes:** Ensure changes are clean and canonical. ALWAYS run linters, type checks (`tsc -b`), and formatters before submitting a PR.
- **Temporary Files:** If you need to write temporary files, write them outside tracked source directories or `ignore` them properly.
- **Search Boundaries:** NEVER run commands like `grep` over auto-generated directories such as `/dist` or `node_modules`.

---

## 8. Naming & Style Conventions

- **PascalCase** for React components, interfaces, classes, enums, and TS type aliases (e.g., `AggressionNode.tsx`).
- **camelCase** for variable names, utility functions, and utility filenames (e.g., `codeGenerator.ts`).
- **kebab-case** for purely organizational directories unless the standard dictates otherwise.
- **Interface Naming:** Skip the 'I' prefix for interfaces (e.g., `SocketDefinition`, not `ISocketDefinition`). Name entities based on behaviour, not implementation.
