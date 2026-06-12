# AI PMO

AI PMO is a lightweight WBS-style project-management operating layer for Hermes and human-AI work.

It uses a simple pattern:

- thin Markdown indexes in `~/dev`
- detailed running logs in Apple Notes
- autonomous goals
- tasks that can link to many projects
- subtasks that always belong to exactly one parent task
- AI-assisted subtask creation and maintenance

## Canonical indexes

| Layer | Markdown index | Apple Notes detail |
|---|---|---|
| Projects | `~/dev/project_list.md` | `Projects` folder |
| Goals | `~/dev/goal_list.md` | `Goals` folder |
| Tasks | `~/dev/task_list.md` | `Tasks` folder |
| Subtasks | `~/dev/subtask_list.md` | `SubTasks` folder; exactly one parent task |

## Rules

- Goals are autonomous; they do not need a project parent.
- Tasks can be linked to many projects.
- Subtasks are always linked to exactly one task.
- Creating subtasks is AI PMO's responsibility when task decomposition is useful.
- Markdown files are concise lists/indexes.
- Apple Notes holds the detailed logs in the relevant folder.

## Intake planning pass

For raw tasks, AI PMO performs a research/linking draft before execution:

- write a 2-3 line research summary
- suggest existing or new linked projects
- add one first execution-planning step
- verify the draft with the user before logging to Apple Notes or making it canonical
- avoid creating subtasks unless explicitly requested

## Channel-aware research artifacts

For WhatsApp/iPhone workflows, AI PMO should avoid sending files directly unless the user explicitly asks for a native attachment.

For research projects and file-producing work:

- store artifacts under `~/dev/research/<project-or-topic-slug>/`
- add a README linking the folder to the project/task/subtasks
- update the Markdown indexes and Apple Notes logs with the folder path
- in WhatsApp, share only the folder path/link, key filenames, brief summary, and next step
- avoid pasting long Markdown or attaching files directly by default

## Hermes skill

The reusable Hermes skill is in `SKILL.md`.

Install or reference it as a standalone skill pack under the user's own GitHub account.
