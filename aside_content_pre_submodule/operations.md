---
title: Operations
description: Operations dashboard for Town Ruins deployment, runbooks, recovery, smoke tests, and troubleshooting.
tags:
  - operations
  - dashboard
  - deployment
  - runbook
  - troubleshooting
aliases:
  - Ops
  - DevOps
---

<div class="tr-dashboard">

<div class="tr-dashboard-section">
<h3>Overview</h3>
<p>This dashboard centralizes all operational documentation for the Town Ruins platform. Use it to access deployment procedures, operational runbooks, rollback strategies, smoke test plans, and troubleshooting guides.</p>
</div>

<div class="tr-dashboard-section">
<h3>Responsibilities</h3>
<ul>
<li>Execute pre-deployment, deployment, and post-deployment workflows</li>
<li>Maintain operational runbooks and incident response procedures</li>
<li>Coordinate rollback and recovery during incidents</li>
<li>Run smoke tests and verify platform health after changes</li>
</ul>
</div>

<div class="tr-dashboard-section">
<h3>Quick Actions</h3>
<div class="tr-dashboard-grid">
<a class="tr-surface tr-surface--md" href="./deployment/">
<span class="tr-surface__title">Deploy</span>
<span class="tr-surface__summary">Master deployment guide covering architecture, build, env vars, and DNS.</span>
</a>
<a class="tr-surface tr-surface--md" href="./operations/operations_runbook">
<span class="tr-surface__title">Runbook</span>
<span class="tr-surface__summary">Day-to-day operational procedures, monitoring, and incident response.</span>
</a>
<a class="tr-surface tr-surface--md" href="./operations/rollback">
<span class="tr-surface__title">Rollback</span>
<span class="tr-surface__summary">Rollback strategy, database migration safety, and post-rollback verification.</span>
</a>
</div>
</div>

<div class="tr-dashboard-section">
<h3>Common Tasks</h3>
<ul>
<li>Run pre-deployment checklist before every release</li>
<li>Execute deployment and verify with post-deployment checklist</li>
<li>Run smoke tests after major releases</li>
<li>Diagnose and resolve incidents using the troubleshooting guide</li>
<li>Coordinate rollback when deployment issues are detected</li>
</ul>
</div>

<div class="tr-dashboard-section">
<h3>Business Rules</h3>
<ul>
<li>All deployments require sign-off on the pre-deployment checklist</li>
<li>Rollback decisions follow the strategy defined in <a href="./operations/rollback">Rollback</a></li>
<li>Smoke tests must pass before marking a deployment as successful</li>
</ul>
</div>

<div class="tr-dashboard-section">
<h3>See Also</h3>
<ul>
<li><a href="./administrator">Administrator Dashboard</a></li>
<li><a href="./developer">Developer Dashboard</a></li>
<li><a href="./business">Business Dashboard</a></li>
</ul>
</div>

<div class="tr-dashboard-section">
<h3>Next Reading</h3>
<p>Start with the <a href="./operations/documentation_index">Documentation Index</a> for a complete map of operational documentation, then review the <a href="./deployment/">Deployment Guide</a> for the end-to-end deployment flow.</p>
</div>

</div>
