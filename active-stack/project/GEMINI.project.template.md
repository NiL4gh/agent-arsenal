# AGY CLI — PROJECT OPERATING SYSTEM & RULES
# Location: <project_root>/GEMINI.md (or AGENTS.md)
# These rules strictly override or supplement the global ~/.gemini/GEMINI.md rules.

## 1. PROJECT CONTEXT & GROUND TRUTH
- **Permanent Source of Truth:** Specify the directory or files that define absolute architectural truth (e.g. `docs/architecture.md`, `specs/`).
- **Pre-Execution Gate:** Before making code edits or deleting files, verify state against the project context.
- Never guess API shapes, DB schemas, or existing patterns when ground-truth specs exist.

## 2. SECURITY & REPO BOUNDARIES
- **Confidentiality:** Define if this codebase or logic is proprietary/private.
- **Remote & Deployment:**
  - Upstream repo: `<owner>/<repo>`
  - Deployed endpoints: staging / production references.
  - Submodules / nested repos: document any nested or ignored repositories.

## 3. MASTER DOCUMENTATION INDEX
When starting a task, read the relevant document from this index:

| Task / Domain | Path / Reference | Purpose |
|---|---|---|
| Architecture & IPC | `docs/architecture.md` | Core state machines, processes, component graphs |
| API Contracts | `docs/api-specs.md` | Endpoint schemas, request/response models |
| Design System | `docs/design-tokens.md` | Colors, typography, spacing, UI states |
| Platform Quirks | `docs/platforms.md` | OS-specific, runtime, or browser-specific constraints |

## 4. PROJECT CODING STANDARDS & INVARIANTS
- Language/framework specific idioms (e.g., strict TypeScript, zero `any`).
- File write rules: temp files vs build artifacts vs persistent data.
- Error handling & user-facing reporting standards.
