---
title: Developer
description: Developer dashboard for Town Ruins architecture, APIs, database, repository guide, and UI workflows.
tags:
  - developer
  - dashboard
  - architecture
  - api
  - database
  - repository
aliases:
  - Dev
  - Engineering
---

<div class="tr-dashboard">

<div class="tr-dashboard-section">
<h3>Overview</h3>
<p>This dashboard provides developers with centralized access to architecture documentation, API references, database schemas, repository workflows, and UI guidelines for the Town Ruins platform.</p>
</div>

<div class="tr-dashboard-section">
<h3>Responsibilities</h3>
<ul>
<li>Understand and extend the platform architecture</li>
<li>Implement and consume REST API endpoints</li>
<li>Maintain database schema integrity and migrations</li>
<li>Follow repository workflows and UI guidelines</li>
</ul>
</div>

<div class="tr-dashboard-section">
<h3>Quick Actions</h3>
<div class="tr-dashboard-grid">
<a class="tr-surface tr-surface--md" href="./architecture/">
<span class="tr-surface__title">Architecture</span>
<span class="tr-surface__summary">System design, prerequisites, and derived documents.</span>
</a>
<a class="tr-surface tr-surface--md" href="./api/">
<span class="tr-surface__title">API Reference</span>
<span class="tr-surface__summary">HTTP API surfaces, request/response shapes, and authentication.</span>
</a>
<a class="tr-surface tr-surface--md" href="./database/">
<span class="tr-surface__title">Database</span>
<span class="tr-surface__summary">Prisma schema, models, relationships, and migration history.</span>
</a>
</div>
</div>

<div class="tr-dashboard-section">
<h3>Common Tasks</h3>
<ul>
<li>Review architecture before making cross-cutting changes</li>
<li>Consult API reference when adding or modifying endpoints</li>
<li>Check database schema and migration history for data model changes</li>
<li>Follow repository guide for branching, commits, and PR workflow</li>
<li>Apply UI guidelines when building or reviewing frontend components</li>
</ul>
</div>

<div class="tr-dashboard-section">
<h3>Frequently Used Documentation</h3>
<div class="tr-dashboard-grid">
<a class="tr-surface tr-surface--md" href="./reference/repository_guide">
<span class="tr-surface__title">Repository Guide</span>
<span class="tr-surface__summary">Branching strategy, commit conventions, and pull request workflow.</span>
</a>
<a class="tr-surface tr-surface--md" href="./ui/ui_guidelines">
<span class="tr-surface__title">UI Guidelines</span>
<span class="tr-surface__summary">Frontend design standards, component patterns, and accessibility rules.</span>
</a>
<a class="tr-surface tr-surface--md" href="./workflows/use_cases_and_workflows">
<span class="tr-surface__title">Use Cases & Workflows</span>
<span class="tr-surface__summary">End-to-end user journeys and system interaction flows.</span>
</a>
<a class="tr-surface tr-surface--md" href="./reference/architecture">
<span class="tr-surface__title">Reference — Architecture</span>
<span class="tr-surface__summary">Quick-reference architecture summary for day-to-day development.</span>
</a>
</div>
</div>

<div class="tr-dashboard-section">
<h3>Related Documents</h3>
<div class="tr-related-grid">
<a class="tr-related-card" href="./deployment/">
<span class="tr-related-icon">&#128640;</span>
<span>Deployment</span>
</a>
<a class="tr-related-card" href="./operations/troubleshooting">
<span class="tr-related-icon">&#128295;</span>
<span>Troubleshooting</span>
</a>
<a class="tr-related-card" href="./testing/smoke_test_plan">
<span class="tr-related-icon">&#128270;</span>
<span>Smoke Test Plan</span>
</a>
<a class="tr-related-card" href="./business/token_economy">
<span class="tr-related-icon">&#129689;</span>
<span>Token Economy</span>
</a>
</div>
</div>

<div class="tr-dashboard-section">
<h3>Business Rules</h3>
<ul>
<li>All non-booking premium features consume TR Tokens as defined in <a href="./business/token_economy">Token Economy</a></li>
<li>Temporary stay bookings remain on real payment provider flows</li>
<li>Listing upload authorization is landlord-only regardless of token payer role</li>
</ul>
</div>

<div class="tr-dashboard-section">
<h3>See Also</h3>
<ul>
<li><a href="./operations">Operations Dashboard</a></li>
<li><a href="./administrator">Administrator Dashboard</a></li>
<li><a href="./client">Client Dashboard</a></li>
<li><a href="./business">Business Dashboard</a></li>
</ul>
</div>

<div class="tr-dashboard-section">
<h3>Next Reading</h3>
<p>Start with <a href="./architecture/">Architecture</a> to understand the system design, then review <a href="./api/">API Reference</a> and <a href="./database/">Database</a> to understand the data layer.</p>
</div>

</div>
