---
name: project-vault-workflow
category: productivity
description: Use when managing the current two-layer project system: a thin project vault and Apple Notes project notes. Keep the vault concise and the project note detailed.
version: 1.0.0
author: User & Hermes
license: MIT
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [Productivity, Projects, Apple Notes, Project Management, WBS, Vault]
    related_skills: [obsidian, linear]
---

# Project Vault Workflow

Use this skill for the current project-management setup:

- one thin project vault file in `~/dev/project_wishlist.md`
- one detailed Apple Notes note per project in the `Projects` folder

This is the first layer of a larger human-AI work-management system. For now, it only covers projects. Tasks and goals will be layered on later.

## Overview

The rule is simple:

- the vault stays short, structured, and easy to scan
- Apple Notes stores the richer history, context, and running log for each project
- every project gets exactly one note in the `Projects` folder

The vault is the index. Apple Notes is the journal.

## When to Use

Use this skill when:

- a new project is being added
- a project changes status, scope, priority, or owner
- a project needs a richer narrative than the vault should hold
- you need to reconcile the concise vault with the detailed note
- you want to keep the current project system consistent before expanding to tasks and goals

Do not use this skill for task-level systems yet. That comes later.

## Canonical Layout

### 1) Thin vault

Primary file:

- `/Users/enkay/dev/project_wishlist.md`

Its job is to summarize projects in a compact table or list. Keep it readable at a glance.

Recommended contents:

- project name
- short purpose
- current status
- next step
- Apple Notes reference

Avoid turning the vault into a long log. If the row gets too long, move detail into the project note.

### 2) Detailed project notes

Apple Notes folder:

- `Projects`

One note per project. Use the project name as the note title. Store:

- background
- decisions
- status history
- milestones
- open questions
- references to related work

The project note is the durable source of detail.

## Workflow

### Add a new project

1. Create or update the Apple Note in `Projects`.
2. Add a concise row to `project_wishlist.md`.
3. Link the vault row to the Apple Note by name or reference.
4. Keep both representations aligned.

### Update an existing project

1. Update the Apple Note first if the change is detailed or contextual.
2. Update the vault second if the summary/status changed.
3. Keep the vault terse; do not copy the full log into it.

### Resolve drift

If the vault and the note disagree:

1. Treat the Apple Note as the richer source of context.
2. Rewrite the vault to match the current summary.
3. Preserve only the durable high-level facts in the vault.

## Practical Rules

- One project, one note.
- Keep the vault thin.
- Keep the Apple Note rich.
- Prefer stable naming.
- Use the `Projects` folder exactly as spelled, with capital P.
- Avoid inventing a tasks layer inside this skill.
- Treat WBS as the eventual structure: project → task → goal.

## Common Pitfalls

1. Mixing the vault and the journal.
   - Fix: move long-form detail back into Apple Notes.

2. Using the wrong Apple Notes folder name.
   - Fix: use `Projects`, not lowercase `projects`.

3. Letting the vault become a log file.
   - Fix: keep only summary fields and the note reference.

4. Creating multiple notes for the same project.
   - Fix: maintain exactly one note per project unless the naming scheme is intentionally changed.

5. Expanding into tasks too early.
   - Fix: keep tasks/goals out of scope until the dedicated skill exists.

## Verification Checklist

- [ ] `~/dev/project_wishlist.md` has a concise project summary entry
- [ ] The project has exactly one Apple Note in `Projects`
- [ ] The note contains the detailed history/context
- [ ] The vault and note agree on current status
- [ ] The vault stays shorter than the detailed note
- [ ] No task-layer conventions were introduced prematurely

## Future Direction

This skill is intentionally stage 1 of a broader human-AI work-management interface based on WBS.

Future layers can add:

- task management
- goal management
- dependency tracking
- progress rollups
- review and planning loops

When those layers exist, keep this skill focused on the project layer only.
