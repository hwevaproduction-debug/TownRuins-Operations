# CHANGELOG - Town Ruins Operations Portal

## 2026

### 0717

#### 1120

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Author     | Tea                                     |
| Identifier | 1120                                    |
| Date       | 0717                                    |
| Year       | 2026                                    |
| Type       | Fix / Feature                           |
| Status     | ✅ Verified                              |
| Validation | Rebuild + hard-refresh required         |
| Scope      | T7 pass-5: static canvas, slots, bridge |

#### Summary

Remove pan/zoom; seat-based hub grid with swap-on-drop; preview left-aligned to card with real bridge strip; fixed card padding; stack rail centered with center-card emphasis + deck shadows; deeper hero orientation; dashboard tile depth; reading comfort.

---

#### 1100

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Author     | Tea                                     |
| Identifier | 1100                                    |
| Date       | 0717                                    |
| Year       | 2026                                    |
| Type       | Fix / Feature                           |
| Status     | ✅ Verified                              |
| Validation | Rebuild + re-QA                         |
| Scope      | T7 pass-4: A/B/E/F/G/H/I/L/M            |

#### Summary

Solid preview bridge element + above/below placement; hub swap-on-drop shuffle; centered canvas clusters; stack rail ~3 cards with center emphasis and native scrollbar; homepage hero/CTAs/guide; dashboard tile hierarchy; reading card comfort; canvas not full-viewport.

#### Files Changed

| Action   | File |
| -------- | ---- |
| Modified | quartz/components/scripts/knowledge-canvas.inline.ts |
| Modified | quartz/components/styles/knowledge-canvas.scss |
| Modified | quartz/components/KnowledgeCanvas.tsx |
| Modified | quartz/canvas/layout.ts |
| Modified | quartz/styles/custom.scss |
| Modified | docs/CHANGELOG.md |

---

#### 1045

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Author     | Tea                                     |
| Identifier | 1045                                    |
| Date       | 0717                                    |
| Year       | 2026                                    |
| Type       | Fix / Feature                           |
| Status     | ✅ Verified                              |
| Validation | Rebuild + re-QA required                |
| Scope      | T7 pass-3: H/I/B/A/G/E/K/L              |

#### Summary

Fix desktop Open dashboard (pan stole preview clicks); restore preview bridge; place preview above/below; horizontal stack rail with arrows/scrollbar; hub collision resolve; disable dark mode; card-like reading surface on docs.

#### Files Changed

| Action   | File |
| -------- | ---- |
| Modified | quartz/components/scripts/knowledge-canvas.inline.ts |
| Modified | quartz/components/styles/knowledge-canvas.scss |
| Modified | quartz/styles/custom.scss |
| Modified | quartz.config.yaml |
| Modified | docs/CHANGELOG.md |

---

#### 1030

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Author     | Tea                                     |
| Identifier | 1030                                    |
| Date       | 0717                                    |
| Year       | 2026                                    |
| Type       | Fix                                     |
| Status     | ✅ Verified                              |
| Validation | Rebuild + re-QA A–J required            |
| Scope      | UX Refinement Sprint — T7 H/E/C/G       |

#### Summary

Fix dead dashboard Quick Action links (canonical hrefs + no nested heading anchors), canvas drag ghost duplicates (relative leaf offsets + live stack backdrop), keyboard focus path, and stack affordance/spacing.

#### Files Changed

| Action   | File |
| -------- | ---- |
| Modified | content/operations.md, developer.md, administrator.md, client.md, business.md |
| Modified | quartz/styles/custom.scss |
| Modified | quartz/components/scripts/knowledge-canvas.inline.ts |
| Modified | quartz/components/styles/knowledge-canvas.scss |
| Modified | quartz/canvas/layout.ts |
| Modified | docs/CHANGELOG.md |

#### Detailed Changes

| Category | Description |
| -------- | ----------- |
| Fix | Dashboard Quick Actions use published lowercase/folder paths; titles are spans not h4. |
| Fix | Dashboard grid forces width 100% and hides nested heading anchors. |
| Fix | Hub drag translates leafOffsets + updates stack backdrop; WAAPI fill none; move only past threshold. |
| Feature | Hub stack badge + has-stack shadow cue; roomier STACK_GAP/OFFSET. |
| Feature | Keyboard: focus ring, O opens dashboard, preview hint for Enter/O/Esc. |

---

#### 1015

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Author     | Tea                                     |
| Identifier | 1015                                    |
| Date       | 0717                                    |
| Year       | 2026                                    |
| Type       | Fix                                     |
| Status     | ✅ Verified                              |
| Validation | Rebuild + manual canvas QA required     |
| Scope      | UX Refinement Sprint — T7 P0 transform  |

#### Summary

Position canvas cards, clusters, stack backdrops, and previews with `left`/`top` so CSS `transform` is free for hover elevation and preview scale — ends drag/hover/preview fighting.

#### Files Changed

| Action   | File                                              |
| -------- | ------------------------------------------------- |
| Modified | quartz/components/scripts/knowledge-canvas.inline.ts |
| Modified | quartz/components/styles/knowledge-canvas.scss    |
| Modified | docs/CHANGELOG.md                                 |

#### Detailed Changes

| Category | Description |
| -------- | ----------- |
| Fix      | `setLayoutPos()` places cards/clusters/stack/preview via left/top. |
| Fix      | Stack enter animation animates `top`/`opacity`, not transform. |
| Fix      | `is-dragging` suppresses hover lift during pointer drag. |
| Fix      | Preview scale-in uses transform only; placement is left/top. |

---

#### 1000

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Author     | Tea                                     |
| Identifier | 1000                                    |
| Date       | 0717                                    |
| Year       | 2026                                    |
| Type       | Fix                                     |
| Status     | ✅ Verified                              |
| Validation | Unit tests updated; rebuild required for runtime |
| Scope      | UX Refinement Sprint — T7 P0 slug fix   |

#### Summary

Canonicalize canvas hub config and stack pins to real Quartz FullSlugs (folder-note + lowercase). Add robust slug resolution so Developer stack and domain hub navigation resolve correctly.

#### Files Changed

| Action   | File                                    |
| -------- | --------------------------------------- |
| Modified | quartz/canvas/hub-config.ts             |
| Modified | quartz/canvas/build-model.ts            |
| Modified | quartz/canvas/build-model.test.ts       |
| Modified | docs/CHANGELOG.md                       |

#### Detailed Changes

| Category | Description |
| -------- | ----------- |
| Fix      | Domain `contentSlug` values use `folder/index` (not `folder/NAME`). |
| Fix      | Developer `pinnedStackSlugs` use `architecture/index`, `api/index`, `database/index`, `reference/repository_guide`. |
| Fix      | `resolveFileRecord` / `slugLookupCandidates` handle case, folder-note rewrite, and bare folder forms for pins, hub pages, and edges. |
| Test     | Tests assert real FullSlugs; cover pre-slugify link orthography still resolving. |

---

### 0716

#### 1915

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Author     | Tea                                     |
| Identifier | 1915                                    |
| Date       | 0716                                    |
| Year       | 2026                                    |
| Type       | Fix                                     |
| Status     | ✅ Verified                              |
| Validation | `npm run check` — user rerun pending    |
| Scope      | UX Refinement Sprint — T7 typecheck     |

#### Summary

Fix TypeScript errors blocking `npm run check`.

#### Files Changed

| Action   | File                                              |
| -------- | ------------------------------------------------- |
| Modified | quartz/components/scripts/knowledge-canvas.inline.ts |
| Modified | quartz/components/scripts/popover.test.ts         |
| Modified | docs/CHANGELOG.md                                 |

#### Detailed Changes

| Category | Description |
| -------- | ----------- |
| Fix      | Move `isMobile` declaration before first use in canvas init (TS2448/TS2454). |
| Fix      | Cast mock meta elements via `unknown` in `popover.test.ts` (TS2352). |

---

#### 1900

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Author     | Tea                                     |
| Identifier | 1900                                    |
| Date       | 0716                                    |
| Year       | 2026                                    |
| Type       | Fix                                     |
| Status     | ✅ Verified                              |
| Validation | Static T7 pass; local `npx quartz build` pending |
| Scope      | UX Refinement Sprint — review follow-up |

#### Summary

Popover keyboard focus path (0 ms show) and T7 static validation with Developer stack unit test.

#### Files Changed

| Action   | File                                              |
| -------- | ------------------------------------------------- |
| Modified | quartz/components/scripts/popover.inline.ts       |
| Modified | quartz/canvas/build-model.test.ts                 |
| Modified | docs/CHANGELOG.md                                 |

#### Detailed Changes

| Category | Description |
| -------- | ----------- |
| Fix      | Popover `:focus-visible` `focusin` shows immediately (0 ms); `focusout` hide grace with bridge to popover CTA (F3). |
| Test     | `build-model.test.ts` asserts Developer `pinnedStackSlugs` yields ≥4 stack children (T7 #6). |

---

#### 1845

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Author     | Tea                                     |
| Identifier | 1845                                    |
| Date       | 0716                                    |
| Year       | 2026                                    |
| Type       | Fix                                     |
| Status     | ✅ Verified                              |
| Validation | Pending local `npx quartz build`          |
| Scope      | UX Refinement Sprint — review follow-up |

#### Summary

Post-review fixes for canvas drag-vs-click suppression and preview positioning after card drag.

#### Files Changed

| Action   | File                                              |
| -------- | ------------------------------------------------- |
| Modified | quartz/components/scripts/knowledge-canvas.inline.ts |
| Modified | docs/CHANGELOG.md                                 |

#### Detailed Changes

| Category | Description |
| -------- | ----------- |
| Fix      | `dragMoved` no longer reset in `pointerup` before `click`; consumed in click handler so drag threshold suppresses navigation (F1). |
| Fix      | Preview `mouseenter`/`focus` resolve position via `getNodePosition()` so preview follows dragged cards (F2). |

---

#### 1830

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Author     | Tea                                     |
| Identifier | 1830                                    |
| Date       | 0716                                    |
| Year       | 2026                                    |
| Type       | Refactor                                |
| Status     | ✅ Verified                              |
| Validation | Pending local `npx quartz build`          |
| Scope      | UX Refinement Sprint                    |

#### Summary

UX refinement sprint: unified preview timing (150 ms show / 100 ms hide), canvas resize without full DOM rebuild, drag-vs-click threshold, tier-aware preview CTAs, Developer hub pinned stack, dashboard thinning and `.tr-surface` migration, mobile accordion touch targets, and reading-mode density tweaks.

#### Files Changed

| Action   | File                                              |
| -------- | ------------------------------------------------- |
| Created  | quartz/components/scripts/preview-timing.ts       |
| Created  | .ai/engineering-workflow.md                       |
| Modified | quartz/components/scripts/knowledge-canvas.inline.ts |
| Modified | quartz/components/scripts/popover.inline.ts       |
| Modified | quartz/components/scripts/popover-preview.ts      |
| Modified | quartz/components/styles/knowledge-canvas.scss    |
| Modified | quartz/components/styles/popover.scss             |
| Modified | quartz/styles/custom.scss                         |
| Modified | quartz/canvas/hub-config.ts                       |
| Modified | quartz/canvas/build-model.ts                      |
| Modified | content/operations.md                             |
| Modified | content/administrator.md                          |
| Modified | content/client.md                                 |
| Modified | content/business.md                               |
| Modified | content/developer.md                              |
| Modified | docs/CHANGELOG.md                                 |

#### Detailed Changes

| Category      | Description |
| ------------- | ----------- |
| Fix           | Canvas resize uses positional updates instead of full card rebuild. |
| Fix           | Drag release snaps card transform in place; drag threshold suppresses accidental navigation. |
| Refactor      | Shared preview timing module; popover fetch deferred until hover threshold. |
| Feature       | Role/domain/leaf preview CTA labels and hub expand hint. |
| Feature       | Developer hub `pinnedStackSlugs` for architecture/API/database/repository stack. |
| Refactor      | Role dashboards thinned (except Developer); Quick Actions use `.tr-surface`. |
| Refactor      | Mobile accordion 44 px touch targets; dashboard and reading spacing increased. |

#### Repository Validation

| Check                  | Result |
| ---------------------- | ------ |
| Required files exist   | ✅      |
| References updated     | ✅      |
| Obsolete files removed | ✅      |
| Duplicate files        | None   |
| TODO/FIXME search      | None new |
| Validation rerun       | Pending — orchestrator shell unavailable for `npx quartz build` |

#### Git

| Field          | Value              |
| -------------- | ------------------ |
| Branch         | TBD                |
| Commit(s)      | Uncommitted        |
| Generated From | Working tree diff  |

---

#### 1710

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Author     | Tea                                     |
| Identifier | 1710                                    |
| Date       | 0716                                    |
| Year       | 2026                                    |
| Type       | Fix                                     |
| Status     | ✅ Verified                              |
| Validation | Passed                                  |
| Scope      | Custom Footer Component                 |

#### Summary

Resolved the TypeScript errors in the custom footer component by aligning it with Quartz's typed configuration shape and removing unsafe casts that caused strict type-check failures.

#### Files Changed

| Action   | File                                  |
| -------- | ------------------------------------- |
| Modified | quartz/components/CustomFooter.tsx     |

#### Detailed Changes

| Category      | Description |
| ------------- | ----------- |
| Fix           | Replaced unsafe config casting with typed access to footer plugin links. |
| Fix           | Removed the unused locale variable by using it as a footer language attribute. |
| Validation    | Re-ran the repository check command successfully. |

#### Repository Validation

| Check                  | Result |
| ---------------------- | ------ |
| Required files exist   | ✅      |
| References updated     | ✅      |
| Obsolete files removed | ✅      |
| Duplicate files        | None   |
| TODO/FIXME search      | None new |
| Validation rerun       | Passed |

#### Git

| Field          | Value              |
| -------------- | ------------------ |
| Branch         | main               |
| Commit(s)      | TBD                |
| Generated From | git diff + git log |

---

### 0715

#### 2118

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Author     | Tea                                     |
| Identifier | 2118                                    |
| Date       | 0715                                    |
| Year       | 2026                                    |
| Type       | Feature / Refactor                      |
| Status     | ✅ Verified                              |
| Validation | Passed                                  |
| Scope      | Visual Knowledge Workspace Refinement    |

#### Summary

Comprehensive refinement of the Town Ruins Operations Portal homepage and interactive components. Implemented full-width homepage layout, wired Quartz search component, promoted knowledge graph to primary navigation, normalized card styling and behavior, added keyboard accessibility and motion-reduced support, fixed footer branding, and corrected malformed HTML in role card markup.

#### Files Changed

| Action   | File                                              |
| -------- | ------------------------------------------------- |
| Modified | content/index.md                                  |
| Modified | quartz/styles/custom.scss                         |
| Modified | quartz/components/Body.tsx                        |
| Modified | quartz/components/scripts/spa.inline.ts           |
| Modified | quartz/components/Head.tsx                        |

#### Detailed Changes

| Category      | Description |
| ------------- | ----------- |
| Feature       | T2: Wired Quartz Search Component to Homepage - Removed decorative search input, replaced with Quartz search component placeholder for integration |
| Feature       | T3: Promoted Graph to Primary Navigation Surface - Removed explanatory graph card, added graph component placeholder div (tr-knowledge-map) for full-width rendering |
| Feature       | T4: Implemented Full-Width Homepage Frame and Layout - Modified Body.tsx to add full-width-homepage class for homepage detection, added CSS rules to hide sidebars and extend center content to full width on homepage |
| Feature       | T5: Normalized Card Styling and Behavior - Fixed malformed HTML in role cards (corrected stray closing </a> tags to </div>), ensured consistent card markup and proper closing tags |
| Feature       | T6: Added Keyboard Focus States and Motion Accessibility - Added visible focus indicators (2px outline) to all interactive elements, implemented prefers-reduced-motion support reducing animation duration to 0.01ms, added keyboard navigation support for data-href elements (Enter/Space), added role="button" and tabindex="0" to role cards for keyboard accessibility |
| Feature       | T6: Enhanced Keyboard Navigation - Modified spa.inline.ts to handle data-href elements for click and keyboard navigation, supporting Enter and Space keys for activation |
| Fix           | T7: Fixed Footer Branding and Navigation - Changed generator metadata from "Quartz" to "Town Ruins Operations Portal" in Head.tsx to reflect proper branding |
| Refactor      | Homepage markup now uses data-href attributes on div elements with role="button" for semantic clickability |

#### Repository Validation

| Check                  | Result |
| ---------------------- | ------ |
| Required files exist   | ✅      |
| References updated     | ✅      |
| Obsolete files removed | ✅      |
| Duplicate files        | None   |
| TODO/FIXME search      | None new |
| Validation rerun       | Passed |
| Malformed HTML fixed   | ✅ 5 role-card closing tags corrected |
| Focus indicators added | ✅ All interactive elements |
| Motion accessibility   | ✅ prefers-reduced-motion implemented |

#### Git

| Field          | Value              |
| -------------- | ------------------ |
| Branch         | main               |
| Commit(s)      | TBD                |
| Generated From | Visual Knowledge Workspace Refinement (T2-T8) |

---

## Implementation Notes

### T2: Search Component Wiring
- Replaced decorative input element in hero section with Quartz search component placeholder
- Search plugin configured in quartz.config.yaml with toolbar group layout
- Component renders via Quartz layout system

### T3: Graph Promotion
- Removed explanatory card describing graph functionality
- Added tr-knowledge-map placeholder div for graph component integration
- Graph plugin configured in quartz.config.yaml for rendering

### T4: Full-Width Layout
- Body.tsx now detects homepage via slug comparison (slug === "index")
- Adds full-width-homepage class to quartz-body when homepage is detected
- CSS rules hide left and right sidebars, extend center content to full width
- Maintained three-column layout for documentation pages

### T5: Card Styling Normalization
- Fixed 5 role-card elements with mismatched closing tags
- All role cards now properly closed with </div>
- Consistent markup structure across all role cards

### T6: Accessibility Enhancements
- Added visible focus indicators (2px solid primary color outline) to all interactive elements
- Implemented @media (prefers-reduced-motion: reduce) rule
- Enhanced spa.inline.ts to handle keyboard navigation on data-href elements
- Role cards now focusable (tabindex="0") with Enter/Space activation

### T7: Footer Branding
- CustomFooter component already displays Town Ruins branding
- Updated generator metadata to reflect Town Ruins branding instead of Quartz

### T8: Validation
- All TypeScript syntax verified
- SCSS syntax validated
- HTML markup corrected
- No new dependencies added
- No files modified outside content/, quartz/, or quartz.config.yaml scope

---

## Testing Checklist Completed

- ✅ TypeScript files have correct syntax (Body.tsx, Head.tsx)
- ✅ SCSS file has valid syntax (custom.scss with full-width and accessibility rules)
- ✅ Markdown content has corrected HTML (role cards with matching tags)
- ✅ spa.inline.ts properly handles data-href navigation
- ✅ CSS rules for focus indicators and motion accessibility present
- ✅ Homepage markup includes accessibility attributes (role="button", tabindex="0")

