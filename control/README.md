# AI PMO Control

Local black-and-white dashboard for the AI PMO Markdown indexes.

## What it does

- reads `/Users/enkay/dev/project_list.md`
- reads `/Users/enkay/dev/task_list.md`
- reads `/Users/enkay/dev/subtask_list.md`
- reads `/Users/enkay/dev/goal_list.md`
- shows:
  - projects
  - task status board
  - orphan tasks
  - subtasks

## Design rules

- black / white / gray base only
- color is reserved for:
  - project accents
  - status chips
  - action states
- icons use Lucide via CDN

## Run

```bash
python3 /Users/enkay/dev/aipmo/control/backend/app.py
```

Then open:

```text
http://127.0.0.1:8787
```

## Notes

This is intentionally lightweight and local-first. It is a view over the Markdown indexes, not a replacement for them.
