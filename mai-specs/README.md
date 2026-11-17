# SDD specification and Feature workspace

English | [中文](README.zh.md)

my-ai-infra manages workspace conventions in `mai-specs/`, keeping specifications and related development, testing, and acceptance records per Feature. Project initialization or synchronization writes this guide, ROADMAP, and `_templates/`. Calling `my-create-feature` independently creates this directory and initial Feature files, using the bundled contract when no project contract exists.

Each Feature uses `NNN-<slug>/`. The my-create-feature initialization script assigns numbers downward from 999, wraps below 000 to 999, and skips identifiers occupied by directories or the index. Directory names and IDs have no Feature- prefix. Starting with `BRIEF.md` and `context/_INDEX.md`, the Prompt combines PRD, technical design, review, testing, and implementation according to inputs, risk, and complexity. An individually invoked Skill completes only its current stage. A test plan may precede implementation; close a Feature only when current passing evidence covers every condition promised for this delivery.

Use the `my-create-feature` initialization script to create a Feature. That Skill's `template/feature/` is the source of directory structure and BRIEF; the initial ROADMAP copy comes from the same Skill. `_templates/` provides starting outlines for subsequent PRD, design, and test plans and may follow project conventions. Legacy BRIEF template copies remain user files and are not read during new initialization.

## On-demand creation and the central path contract

Feature initialization generates only BRIEF.md and context/_INDEX.md. Later Skills use their bundled layout by default. If FEATURE_LAYOUT.json exists here, they read it first and create parent directories only when writing the current stage's registered artifact path. initialFiles defines initialization files. Auxiliary directories such as spec/diagrams are also created on demand, without .gitkeep. To customize artifact paths, copy the installed my-create-feature/template/FEATURE_LAYOUT.json here and edit artifacts paths; keep initialFiles aligned with the initialization template. Reinstallation preserves an existing contract.

Without a contract, each Skill uses its default paths; initialization and synchronization do not automatically copy a contract. Preserve existing files when project conventions, files, and registered paths conflict and ask the user to resolve the choice. The installed my-create-feature/scripts/validate-feature.mjs checks paths with --feature and optionally --artifact. It requires only initial files and explicitly requested artifacts. Missing future-stage directories are normal, and existing files or directories do not prove completion. Old empty directories and placeholders produce advice, not automatic cleanup. When the Skill is absent, check against the same contract without claiming that its script is available.

## Profiles and the index

BRIEF records the default Feature specification profile in Profile. Constants live in the installed my-create-feature references/FEATURE_PROFILES.json; a missing field uses the registry default (standard). simple / standard is independent of stage selection; both use NNN-slug directories and share the identifier pool. New ROADMAP files have five columns: Feature, title, profile, priority, and notes. Existing four-column indexes keep their structure and prefix the target row's notes with `规格：simple；` or `规格：standard；`. Changing a profile does not rename the Feature; synchronize an out-of-date index from BRIEF.

A new simple PRD or technical design first uses the project's `_templates/simple/PRD.tmpl.md` / `TECH_DESIGN.tmpl.md`, otherwise the owning Skill's simple template under assets/templates/. An explicit template takes precedence, and an invalid override is not bypassed. Preserve existing documents incrementally; overriding one artifact does not change the Feature default. Both profiles share artifact paths. Without a PRD, the design records sufficient requirements and AC, which become the effective source for later stages. Adding a PRD later preserves AC IDs and synchronizes references.
