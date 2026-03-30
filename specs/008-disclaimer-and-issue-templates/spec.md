# Feature Specification: Disclaimer and Issue Templates

**Feature Branch**: `008-disclaimer-and-issue-templates`  
**Created**: 2026-03-30
**Status**: Implemented
**Input**: User description: "Add a dislcaimer saying that "Sentinel is in prerelease, and to report all issues to [GitHub](https://github.com/rustydb/sentinel/issues). EVE Frontier is a registered trademark of CCP hf. All rights reserved in all jurisdictions. Sentinel is not affiliated with CCP." The font size should be relatively small compared to the design rules we have established. With these changes we need to add issue templates."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Disclaimer in Dashboard (Priority: P1)

As a Sentinel user, I need to see a clear disclaimer indicating the prerelease status and legal context so that I understand expectations and know where to report issues.

**Why this priority**: It establishes proper legal and expectations context for the entire application, and prevents user confusion.

**Independent Test**: Can be tested by loading the dashboard and verifying the footer/disclaimer area contains the text at an appropriately small size according to the brutalist design rules.

**Acceptance Scenarios**:

1. **Given** any page in the dashboard is loaded, **When** I view the bottom of the screen or designated footer area, **Then** I see the prerelease and legal disclaimer text.
2. **Given** the disclaimer is displayed, **When** I inspect the typography, **Then** it uses a relatively smaller font size compared to the standard body text, while maintaining the designated UI font.
3. **Given** the disclaimer is displayed, **When** I click the "GitHub" link, **Then** it navigates to the Sentinel GitHub issues page.

---

### User Story 2 - Report Issues via GitHub Templates (Priority: P1)

As a Sentinel user or contributor, I need structured issue templates on GitHub so that I can provide all necessary information when reporting bugs or requesting features.

**Why this priority**: Reduces friction in the feedback loop for a prerelease product, improving triage efficiency.

**Independent Test**: Can be verified by checking the `.github/ISSUE_TEMPLATE` directory in the repository and creating a test issue on GitHub to ensure the templates are active.

**Acceptance Scenarios**:

1. **Given** I am creating a new issue on GitHub, **When** I click "New Issue", **Then** I am presented with options for Bug Report and Feature Request.
2. **Given** I select Bug Report, **When** the template loads, **Then** it prompts for reproduction steps, expected behavior, and environment details.
3. **Given** I select Feature Request, **When** the template loads, **Then** it prompts for the problem description and proposed solution.

### Edge Cases

- What happens when a user views the dashboard on a very small mobile screen? (The disclaimer must wrap and remain legible without breaking the layout).
- What happens if a user submits an issue without using the template? (GitHub allows bypassing templates sometimes; we should ensure the template is presented by default).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Dashboard MUST display the exact text: "Sentinel is in prerelease, and to report all issues to GitHub. EVE Frontier is a registered trademark of CCP hf. All rights reserved in all jurisdictions. Sentinel is not affiliated with CCP."
- **FR-002**: The "GitHub" text MUST link to `https://github.com/rustydb/sentinel/issues`.
- **FR-003**: The disclaimer text MUST use a smaller font size than the base body text defined in the design system.
- **FR-004**: System MUST include GitHub issue templates for Bug Reports and Feature Requests.

### Constitution Alignment

- [x] Spec adheres to Brutalist UX constraints (monospace, thick borders, no gradients). (Disclaimer will be small but stark and readable).
- [ ] Performance metrics and scalability goals are defined. (N/A for legal text / template changes).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Disclaimer is present on the dashboard and visible at all viewport sizes without horizontal scrolling.
- **SC-002**: Clicking the GitHub link successfully opens the issues URL.
- **SC-003**: A minimum of two distinct issue templates (Bug Report, Feature Request) are present in the repository.

## Assumptions

- We will place the disclaimer in a logical footer area or persistent bottom panel of the dashboard.
- Standard GitHub issue template formatting (Markdown or YAML) is acceptable.
