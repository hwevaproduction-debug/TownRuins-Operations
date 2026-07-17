# Production Engineering Workflow

## Phase 1 - Inspect

* Read all referenced files.
* Search the repository for related files.
* Never assume repository state.

## Phase 2 - Plan

Before editing:

* List affected files.
* List requirements.
* Define exit criteria.

## Phase 3 - Implement

* Make only the required changes.
* Minimize unrelated modifications.
* Preserve existing architecture unless the task explicitly requires structural changes.

## Phase 4 - Validate

Verify using repository searches.

Check:

* Required files exist.
* Obsolete files removed.
* References updated.
* TODO/FIXME count.
* Duplicate files.
* Broken links or documentation references.
* Build or validation artifacts (where applicable).

Never rely on memory.

## Phase 5 - Repair

If any validation fails:

* Continue editing.
* Repeat validation.

Do not summarize.

Repeat until every validation passes successfully.

## Phase 6 - Changelog Management (Mandatory)

This phase MUST execute after successful validation and before completion.

### Locate Changelog

Search the repository for an existing `CHANGELOG.md`.

Priority locations:

1. Current component or module documentation folder.
2. `docs/`
3. `documentation/`
4. Repository root.

If multiple `CHANGELOG.md` files exist:

* Determine which one is most relevant to the modified files.
* Update only the relevant changelog unless the task explicitly spans multiple modules.

### Create if Missing

If no `CHANGELOG.md` exists:

* Create one inside the most relevant documentation directory.
* Use standard Markdown formatting.
* Reconstruct the latest history using Git.
* Populate the changelog using recent commits only.
* Preserve chronological order.
* Never invent historical entries.
* Use Git history as the authoritative source.

### Gather Repository Evidence

Before generating the changelog:

* Determine the current branch.
* Determine the current commit.
* Determine the files changed.
* Determine commits since the last changelog entry.
* Determine the Git diff associated with the completed work.

Preferred commands:

* `git branch --show-current`
* `git rev-parse --short HEAD`
* `git diff --name-only`
* `git diff HEAD`
* `git log --oneline`
* `git log --since=<last changelog entry>`

Repository state is authoritative.

Never infer changes from memory.

### Update

Append the completed work.

Never:

* overwrite previous entries
* reorder history
* remove historical entries
* duplicate existing entries

If today's date section exists:

* append a new time entry.

Otherwise:

* create today's section.

If the current year section does not exist:

* create it.

Every completed task MUST generate exactly one changelog entry.

If multiple unrelated tasks are completed:

* generate one entry for each task.

No task may be marked complete before the changelog has been updated.

### Entry Format

# YY

## DDMM

### HHMM

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Author     | Tea                                     |
| Identifier | HHMM                                    |
| Date       | DDMM                                    |
| Year       | YY                                      |
| Type       | Feature / Fix / Docs / Refactor / Chore |
| Status     | ✅ Verified                              |
| Validation | Passed                                  |
| Scope      | Component or Module                     |

#### Summary

Concise overview of the completed work.

#### Files Changed

| Action   | File      |
| -------- | --------- |
| Created  | path/file |
| Modified | path/file |
| Deleted  | path/file |

#### Detailed Changes

| Category      | Description |
| ------------- | ----------- |
| Feature       | Description |
| Fix           | Description |
| Refactor      | Description |
| Documentation | Description |
| Validation    | Description |

#### Repository Validation

| Check                  | Result |
| ---------------------- | ------ |
| Required files exist   | ✅      |
| References updated     | ✅      |
| Obsolete files removed | ✅      |
| Duplicate files        | None   |
| TODO/FIXME search      | Result |
| Validation rerun       | Passed |

#### Git

| Field          | Value              |
| -------------- | ------------------ |
| Branch         | branch-name        |
| Commit(s)      | abc123             |
| Generated From | git diff + git log |

---

### Changelog Rules

* Never finish a task before updating the changelog.
* Never duplicate an existing entry.
* Never invent previous history.
* Always summarize Git history faithfully.
* Always use Git as the authoritative source.
* Always append.
* Never rewrite previous entries.
* Every implementation requires exactly one verified changelog entry.

## Phase 7 - Complete

Only report completion after:

* Every validation has passed.
* Repository verification has passed.
* Changelog has been updated successfully.
* Changelog verification has passed.

For every completed requirement provide evidence.

Completion is not permitted until all previous phases have completed successfully.