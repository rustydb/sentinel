# Research: Disclaimer and Issue Templates

## Decisions

- **Decision 1: Disclaimer Location**
    - **Rationale**: The spec requires the disclaimer on the dashboard. A footer component or a fixed bottom bar is the standard location for legal and prerelease disclaimers. We will place it in `apps/dashboard/src/App.tsx` or a new `Footer.tsx` component depending on the existing layout.
    - **Alternatives**: A banner at the top (too intrusive), a modal (intrusive).

- **Decision 2: Font styling**
    - **Rationale**: The UI uses brutalist design and Tailwind. We will use `text-xs font-mono` to keep it small and aligned with the designated monospace typography.

- **Decision 3: Issue Templates**
    - **Rationale**: GitHub supports `.github/ISSUE_TEMPLATE/` directory with `.md` or `.yml` files. We will create `bug_report.md` and `feature_request.md` following standard GitHub markdown template formats to satisfy the requirements quickly.
    - **Alternatives**: GitHub issue forms (`.yml`), but `.md` is simpler and perfectly sufficient for this stage.
