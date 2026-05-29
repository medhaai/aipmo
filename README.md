# AI PMO

AI PMO is a lightweight WBS-style project-management operating layer for Hermes and human-AI work.

It uses a simple pattern:

- thin Markdown indexes in `/Users/enkay/dev`
- detailed running logs in Apple Notes
- autonomous goals
- tasks that can link to many projects
- subtasks that always belong to exactly one parent task
- AI-assisted subtask creation and maintenance

## Canonical indexes

| Layer | Markdown index | Apple Notes detail |
|---|---|---|
| Projects | `/Users/enkay/dev/project_wishlist.md` | `Projects` folder |
| Goals | `/Users/enkay/dev/goal_wishlist.md` | `Goals` folder |
| Tasks | `/Users/enkay/dev/task_wishlist.md` | `Tasks` folder |
| Subtasks | `/Users/enkay/dev/subtask_wishlist.md` | `SubTasks` folder; exactly one parent task |

## Rules

- Goals are autonomous; they do not need a project parent.
- Tasks can be linked to many projects.
- Subtasks are always linked to exactly one task.
- Creating subtasks is AI PMO's responsibility when task decomposition is useful.
- Markdown files are concise lists/indexes.
- Apple Notes holds the detailed logs in the relevant folder.

## Hermes skill

The reusable Hermes skill is in `SKILL.md`.

Install or reference it as a standalone skill pack under the user's own GitHub account.
