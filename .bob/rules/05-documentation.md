# Rule 05: Documentation & Open-Source Attribution

## 1. Living Documentation
- Maintain single-source-of-truth documentation under `docs/`.
- Never claim features in README or PRD that are not verifiable in the codebase.
- Keep `docs/KNOWN_ISSUES.md`, `docs/API.md`, `docs/SECURITY.md`, and `docs/BOB_DEVELOPMENT.md` synchronized with actual implementation state.

## 2. Open-Source Licensing Compliance
- Respect third-party software licenses.
- Document all external dependencies, architectural inspirations, and library usages in `docs/THIRD_PARTY_NOTICES.md` and `docs/OPEN_SOURCE_RESEARCH.md`.
- Ensure permissive licensing (MIT, Apache 2.0, BSD-3-Clause). Avoid embedding AGPL/copyleft-tainted code in proprietary core services.
