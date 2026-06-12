# Phone-first AI PMO research artifact consolidation

Session-derived pattern from K0 viability / NotebookLM handoff cleanup on 2026-06-02, updated with the user's WhatsApp/iPhone file-sharing preference.

## Trigger

Use this when:

- the user is on WhatsApp or another phone-first channel,
- long Markdown artifacts are hard to review,
- the task is a research project, viability study, source pack, NotebookLM handoff, generated document, or other file-producing workflow,
- the user asks to move research into an appropriate folder and link the task log.

## Channel-aware rule

For WhatsApp, do **not** send files directly unless the user explicitly asks for a native attachment.

Instead:

1. Store the file(s) in a designated local folder.
2. For AI PMO research projects, use:

```text
~/dev/research/<project-or-topic-slug>/
```

3. Share the folder path or link in WhatsApp.
4. Provide a brief summary: what the folder contains, why it matters, and the next action.

This keeps the artifact accessible from iPhone without forcing review inside a WhatsApp message/file attachment.

## Folder pattern

Create one canonical folder:

```text
~/dev/research/<project-or-task-slug>/
```

For example:

```text
~/dev/research/k0-viability/
```

Include a `README.md` that links the folder to AI PMO objects:

- Project
- Parent task
- Related subtasks
- File inventory
- Draft/canonical status
- Blockers such as NotebookLM login or MCP security review

## Consolidation steps

1. Find all related Markdown/CSV/zip artifacts under `~/dev`.
2. Copy/move them into the canonical research folder.
3. Compare duplicates before deleting stale copies. Delete only when represented in the canonical folder and byte-identical or otherwise clearly superseded.
4. Add/update the `README.md` with a compact file inventory and AI PMO links.
5. Update Markdown indexes:
   - `project_list.md` project row
   - `task_list.md` parent task row
   - `subtask_list.md` relevant subtask rows
6. Update Apple Notes logs for the same AI PMO objects, especially:
   - `Projects / <Project>`
   - `Tasks / <Task ID>`
   - `SubTasks / <Subtask ID>`
7. In WhatsApp, report only the path/link, key filenames, short status, and next-step summary. Do not paste the research body and do not attach files directly unless requested.

## Apple Notes linking note

If `memo` numeric edit selection is unreliable, use the `apple-notes` skill's direct AppleScript update-by-title pattern and HTML body content.

## Draft status wording

For unverified viability research, include language like:

```text
As of YYYY-MM-DD, this is a draft research pack. Per AI PMO rules, findings should not be treated as canonical until Nirav verifies assumptions, project links, and strategic direction.
```
