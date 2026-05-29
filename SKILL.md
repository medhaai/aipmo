---
name: aipmo
description: "AI PMO: WBS-style project, goal, task, and subtask management using thin Markdown indexes plus detailed Apple Notes logs."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [macos]
metadata:
  hermes:
    tags: [AI PMO, Project Management, Goals, Tasks, Subtasks, WBS, Apple Notes]
    related_skills: [apple-notes]
---

# AI PMO

AI PMO is the user's lightweight project-management operating layer.

The canonical pattern is:

- keep short, scan-friendly lists in Markdown files under `/Users/enkay/dev`
- keep detailed running logs in Apple Notes, inside the relevant folder
- use WBS-style links across projects, autonomous goals, tasks, and subtasks
- let the AI PMO create and maintain subtasks as part of breaking work down

## Canonical indexes

| Layer | Markdown index | Apple Notes detail |
|---|---|---|
| Projects | `/Users/enkay/dev/project_wishlist.md` | one note per project in `Projects` |
| Goals | `/Users/enkay/dev/goal_wishlist.md` | one note per goal in `Goals` |
| Tasks | `/Users/enkay/dev/task_wishlist.md` | one note per task in `Tasks` |
| Subtasks | `/Users/enkay/dev/subtask_wishlist.md` | one note per subtask in `SubTasks`, always linked to exactly one parent task |

The Markdown files are indexes, not journals. Apple Notes is the detailed log.

## Data model

### Projects

Projects are durable areas of work or initiatives.

Rules:
- a project can have many linked tasks
- a project can be referenced by many goals, tasks, or subtasks when useful
- every project gets one detailed Apple Note in `Projects`

### Goals

Goals are autonomous.

Rules:
- a goal does not have to belong to a project
- a goal can optionally reference one or more projects if it supports them
- every goal gets one detailed Apple Note in `Goals`
- goals are outcome-oriented, not just task containers

### Tasks

Tasks are actionable work units.

Rules:
- a task can be linked to many projects
- a task can optionally support one or more goals
- every task gets one detailed Apple Note in `Tasks`
- tasks should be measurable enough that completion is clear

### Subtasks

Subtasks are the AI PMO's responsibility to create when a task needs decomposition.

Rules:
- every subtask is linked to exactly one parent task
- a subtask may reference many projects through its parent task or explicit links
- every subtask gets one detailed Apple Note in `SubTasks`
- create subtasks proactively when the user gives a broad task, unless the user asks to keep it atomic

## Status values

Use simple, terminal-friendly statuses:

- Planned
- Active
- Blocked
- Done
- Cancelled
- Backlog

## Index schemas

### Projects

`project_wishlist.md`:

```markdown
| Project | Description | Status | Next Step | Apple Notes |
|---|---|---|---|---|
```

### Goals

`goal_wishlist.md`:

```markdown
| Goal ID | Goal | Status | Next Step | Linked Projects | Apple Notes |
|---|---|---|---|---|---|
```

### Tasks

`task_wishlist.md`:

```markdown
| Task ID | Task | Status | Next Step | Linked Projects | Linked Goals | Apple Notes |
|---|---|---|---|---|---|---|
```

### Subtasks

`subtask_wishlist.md`:

```markdown
| Subtask ID | Subtask | Status | Parent Task ID | Next Step | Linked Projects | Apple Notes / Log Location |
|---|---|---|---|---|---|---|
```

## Task research, project-linking, and first-step planning

When new tasks are captured, AI PMO should perform an intake planning pass before execution:

1. Research each task enough to understand context, opportunity, constraints, and risks.
2. Write a 2-3 line research summary in the task's Apple Notes entry.
3. Suggest linked projects:
   - connect to existing projects when the relationship is clear
   - if no existing project fits, mark a suggested new project rather than creating it automatically
   - tasks may link to many projects
4. Add exactly one first execution-planning step to the task index and task note.
5. Do **not** create subtasks during this intake pass unless the user explicitly asks for decomposition.

This step turns a raw task into a ready-to-plan work item without prematurely moving into execution.

## Workflow

### Add or update a project

1. Update `/Users/enkay/dev/project_wishlist.md`.
2. Create or update the matching note in Apple Notes folder `Projects`.
3. Keep the project note rich: background, decisions, milestones, links, and logs.

### Add or update a goal

1. Treat the goal as autonomous by default.
2. Update `/Users/enkay/dev/goal_wishlist.md`.
3. Create or update the matching note in Apple Notes folder `Goals`.
4. Link projects only when useful; do not force a project parent.

### Add or update a task

1. Update `/Users/enkay/dev/task_wishlist.md`.
2. Link the task to zero, one, or many projects as appropriate.
3. Link goals if the task supports specific autonomous goals.
4. Create or update the matching note in Apple Notes folder `Tasks`.
5. If the task is too broad, AI PMO should create subtasks.

### Add or update subtasks

1. Ensure exactly one parent task exists.
2. Update `/Users/enkay/dev/subtask_wishlist.md`.
3. Create or update the matching subtask note in Apple Notes folder `SubTasks`.
4. Reference the parent task ID clearly in both the index and the note.
5. Do not create orphan subtasks.

## Apple Notes automation

Use the `apple-notes` skill. In Hermes/tool sessions, use the non-interactive `memo` editor wrapper rather than opening vim:

```bash
printf '%s\n' '# Note Title' '' 'Body...' > /tmp/note.md
EDITOR=/Users/enkay/.hermes/skills/apple/apple-notes/scripts/memo_noninteractive_editor.py \
  MEMO_NOTE_CONTENT_FILE=/tmp/note.md \
  memo notes -a -f "Projects"
```

Use the relevant folder: `Projects`, `Goals`, `Tasks`, or `SubTasks`.

Verify with:

```bash
memo notes -f "Projects" -nc
memo notes -f "Projects" -nc -v 1
```

## Practical rules

- Never let the Markdown index become the detailed journal.
- Never create a subtask without exactly one parent task.
- Do not force goals under projects; goals are autonomous.
- Tasks and subtasks can reference multiple projects, but subtasks still have one parent task.
- Prefer stable IDs: `G-001`, `T-001`, `ST-001`.
- If the user sends a broad task, decompose it into subtasks as AI PMO unless told not to.
- Keep updates concise in Markdown and detailed in Apple Notes.

## Verification checklist

- [ ] Correct Markdown index updated
- [ ] Relevant Apple Notes folder/note updated
- [ ] Goal autonomy preserved
- [ ] Task multi-project links preserved where needed
- [ ] Every subtask has exactly one parent task
- [ ] Detailed log lives in Apple Notes, not only in Markdown
