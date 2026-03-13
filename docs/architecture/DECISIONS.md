# Architectural Decision Records (ADRs)
Format: ### ADR-XXX: [Title] | Date | Status | Context | Decision | Consequences

### ADR-001: Strict 500-Line Limit Policy | 2026-03-13 | Accepted | Context: Several admin pages and components have grown beyond 500 lines, making them difficult to maintain and triggering `drift_check` failures. | Decision: We will enforce a strict 500-line limit per file (excluding auto-generated files). Large files will be decomposed into smaller, specialized sub-components and hooks. | Consequences: Improved maintainability, faster linting/scanning, and adherence to v26.2 safety standards. Initial refactoring effort required for `BlogPosts.tsx`, `Settings.tsx`, `sidebar.tsx`, `AnalyticsDetail.tsx`, and `LeadDetail.tsx`.
