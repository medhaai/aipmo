from __future__ import annotations

import json
import mimetypes
from datetime import datetime
from hashlib import md5
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path('/Users/enkay/dev')
CONTROL = Path('/Users/enkay/dev/aipmo/control')
FRONTEND = CONTROL / 'frontend'
TASK_FILE = ROOT / 'task_list.md'
PROJECT_FILE = ROOT / 'project_list.md'
SUBTASK_FILE = ROOT / 'subtask_list.md'
GOAL_FILE = ROOT / 'goal_list.md'


def _split_row(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip('|').split('|')]


def _read_lines(path: Path) -> list[str]:
    return path.read_text(encoding='utf-8').splitlines()


def _table_rows(path: Path) -> list[list[str]]:
    if not path.exists():
        return []
    rows: list[list[str]] = []
    for line in _read_lines(path):
        if not line.startswith('|'):
            continue
        if set(line.replace('|', '').strip()) <= {'-', ' '}:
            continue
        cells = _split_row(line)
        if not cells:
            continue
        if cells[0] in {'Project', 'Task ID', 'Subtask ID', 'Goal ID'}:
            continue
        rows.append(cells)
    return rows


def _source_dates() -> dict[str, str]:
    def fmt(path: Path) -> str:
        return datetime.fromtimestamp(path.stat().st_mtime).date().isoformat() if path.exists() else ''

    return {
        'projects': fmt(PROJECT_FILE),
        'tasks': fmt(TASK_FILE),
        'subtasks': fmt(SUBTASK_FILE),
        'goals': fmt(GOAL_FILE),
    }


SOURCE_DATES = _source_dates()


def _parse_links(text: str) -> list[str]:
    if not text or text == 'None':
        return []
    return [chunk.strip() for chunk in text.split(';') if chunk.strip()]


def _join_links(items: list[str]) -> str:
    cleaned = [item.strip() for item in items if item and item.strip()]
    return '; '.join(cleaned) if cleaned else 'None'


def _project_color(name: str) -> str:
    digest = md5(name.encode('utf-8')).hexdigest()
    hues = ['#111111', '#222222', '#444444', '#666666', '#888888']
    return hues[int(digest[:2], 16) % len(hues)]


def _infer_type(text: str) -> str:
    text = text.lower()
    if any(k in text for k in ['research', 'source pack', 'viability', 'notebooklm', 'paper', 'book']):
        return 'research'
    if any(k in text for k in ['analyze', 'analysis', 'compare', 'evaluate', 'matrix', 'inspect']):
        return 'analysis'
    if any(k in text for k in ['code', 'convert', 'install', 'test', 'repo', 'middleware', 'website', 'app']):
        return 'coding'
    if any(k in text for k in ['apply', 'schedule', 'book appointment', 'call', 'resume', 'role', 'job', 'email']):
        return 'career'
    if any(k in text for k in ['learn', 'listen and write', 'teach', 'study']):
        return 'learning'
    if any(k in text for k in ['health', 'appointment', 'mychart', 'doctor']):
        return 'admin'
    return 'general'


def _icon_for_project(title: str, status: str, description: str = '', next_step: str = '') -> str:
    text = ' '.join([title, status, description, next_step]).lower()
    if 'k0' in text or 'protocol' in text:
        return 'compass'
    if 'book' in text or 'writing' in text:
        return 'book-open-text'
    if 'research' in text or 'source' in text:
        return 'microscope'
    if 'code' in text or 'app' in text or 'repo' in text or 'middleware' in text:
        return 'layout-grid'
    if 'agent' in text or 'ai' in text:
        return 'sparkles'
    if 'health' in text or 'doctor' in text:
        return 'heart-pulse'
    if 'finance' in text or 'payment' in text or 'wallet' in text:
        return 'banknote'
    status = status.lower()
    if 'active' in status:
        return 'rocket'
    if 'planned' in status:
        return 'map-pinned'
    if 'stalled' in status:
        return 'pause-circle'
    if 'abandoned' in status or 'cancelled' in status:
        return 'ban'
    if 'done' in status:
        return 'check-circle-2'
    return 'folder-kanban'


def _icon_for_task(title: str, status: str, next_step: str = '', projects: str = '') -> str:
    text = ' '.join([title, status, next_step, projects]).lower()
    if any(k in text for k in ['research', 'source pack', 'notebooklm', 'source']):
        return 'microscope'
    if any(k in text for k in ['analysis', 'compare', 'matrix', 'evaluate']):
        return 'chart-column'
    if any(k in text for k in ['code', 'convert', 'install', 'test', 'repo', 'website', 'app', 'middleware']):
        return 'code-2'
    if any(k in text for k in ['apply', 'schedule', 'book', 'role', 'job', 'email', 'call', 'resume']):
        return 'briefcase-business'
    if any(k in text for k in ['learn', 'listen and write', 'teach', 'study', 'video']):
        return 'brain-circuit'
    if any(k in text for k in ['health', 'appointment', 'mychart', 'doctor']):
        return 'heart-pulse'
    if any(k in text for k in ['write', 'book', 'article']):
        return 'pen-line'
    if 'active' in status.lower():
        return 'sparkles'
    return 'square-pen'


def _icon_for_subtask(title: str, status: str, next_step: str = '') -> str:
    text = ' '.join([title, status, next_step]).lower()
    if 'research' in text:
        return 'microscope'
    if 'analysis' in text or 'compare' in text:
        return 'diff'
    if 'code' in text or 'middleware' in text or 'repo' in text:
        return 'braces'
    if 'book' in text or 'write' in text:
        return 'file-text'
    if 'review' in text or 'validate' in text:
        return 'badge-check'
    return 'list-checks'


def _read_markdown_table(path: Path) -> tuple[list[str], list[str], list[list[str]]]:
    lines = _read_lines(path)
    header = []
    separator = []
    rows = []
    for line in lines:
        if not line.startswith('|'):
            continue
        cells = _split_row(line)
        if not cells:
            continue
        if cells[0] in {'Project', 'Task ID', 'Subtask ID', 'Goal ID'}:
            header = cells
            continue
        if set(line.replace('|', '').strip()) <= {'-', ' '}:
            separator = cells
            continue
        rows.append(cells)
    return header, separator, rows


def _rewrite_task_projects(task_id: str, new_projects: list[str]) -> dict:
    header, separator, rows = _read_markdown_table(TASK_FILE)
    if not rows:
        raise ValueError('task list is empty or unreadable')

    updated = False
    normalized = _join_links(new_projects)
    new_rows: list[list[str]] = []
    for row in rows:
        if row and row[0] == task_id:
            while len(row) < 7:
                row.append('')
            row[4] = normalized
            updated = True
        new_rows.append(row)

    if not updated:
        raise KeyError(f'{task_id} not found')

    header = header or ['Task ID', 'Task', 'Status', 'Next Step', 'Linked Projects', 'Linked Goals', 'Apple Notes']
    separator = separator or ['---'] * len(header)
    rendered = [
        '# Task List',
        '',
        'Tasks are actionable work units. A task can be linked to many projects and may support one or more autonomous goals.',
        '',
        '| ' + ' | '.join(header) + ' |',
        '| ' + ' | '.join(['---'] * len(header)) + ' |',
    ]
    for row in new_rows:
        row = row[:len(header)] + [''] * max(0, len(header) - len(row))
        rendered.append('| ' + ' | '.join(row) + ' |')
    TASK_FILE.write_text('\n'.join(rendered) + '\n', encoding='utf-8')
    return {'task_id': task_id, 'linked_projects': new_projects, 'linked_projects_text': normalized}


def parse_projects() -> list[dict]:
    out = []
    for cells in _table_rows(PROJECT_FILE):
        if len(cells) < 5:
            continue
        project, description, status, next_step, notes = cells[:5]
        project = project.replace('**', '').strip()
        out.append({
            'project': project,
            'description': description,
            'status': status,
            'next_step': next_step,
            'notes': notes,
            'created': SOURCE_DATES['projects'],
            'created_label': 'Source snapshot',
            'accent': _project_color(project),
            'icon': _icon_for_project(project, status, description, next_step),
        })
    return out


def parse_tasks() -> list[dict]:
    out = []
    for cells in _table_rows(TASK_FILE):
        if len(cells) < 7:
            continue
        task_id, task, status, next_step, linked_projects, linked_goals, notes = cells[:7]
        out.append({
            'id': task_id,
            'task': task,
            'status': status,
            'next_step': next_step,
            'linked_projects': linked_projects,
            'linked_goals': linked_goals,
            'notes': notes,
            'project_links': _parse_links(linked_projects),
            'goal_links': _parse_links(linked_goals),
            'type': _infer_type(' '.join([task, linked_projects, next_step])),
            'created': SOURCE_DATES['tasks'],
            'created_label': 'Source snapshot',
            'icon': _icon_for_task(task, status, next_step, linked_projects),
        })
    return out


def parse_goals() -> list[dict]:
    out = []
    for cells in _table_rows(GOAL_FILE):
        if len(cells) < 6:
            continue
        goal_id, goal, status, next_step, linked_projects, notes = cells[:6]
        out.append({
            'id': goal_id,
            'goal': goal,
            'status': status,
            'next_step': next_step,
            'linked_projects': linked_projects,
            'notes': notes,
            'project_links': _parse_links(linked_projects),
            'created': SOURCE_DATES['goals'],
        })
    return out


def parse_subtasks() -> list[dict]:
    out = []
    for cells in _table_rows(SUBTASK_FILE):
        if len(cells) < 7:
            continue
        subtask_id, subtask, status, parent_task_id, next_step, linked_projects, notes = cells[:7]
        out.append({
            'id': subtask_id,
            'subtask': subtask,
            'status': status,
            'parent_task_id': parent_task_id,
            'next_step': next_step,
            'linked_projects': linked_projects,
            'notes': notes,
            'project_links': _parse_links(linked_projects),
            'created': SOURCE_DATES['subtasks'],
            'created_label': 'Source snapshot',
            'icon': _icon_for_subtask(subtask, status, next_step),
        })
    return out


def build_payload() -> dict:
    projects = parse_projects()
    tasks = parse_tasks()
    goals = parse_goals()
    subtasks = parse_subtasks()

    project_names = {p['project'] for p in projects}
    task_map = {t['id']: t for t in tasks}
    project_map = {p['project']: [] for p in projects}
    subtasks_by_parent: dict[str, list[dict]] = {}

    for task in tasks:
        canonical = [p for p in task['project_links'] if not p.startswith('Suggested:') and p in project_names]
        task['canonical_projects'] = canonical
        task['orphan'] = not canonical
        for proj in canonical:
            project_map.setdefault(proj, []).append(task)

    for st in subtasks:
        parent = task_map.get(st['parent_task_id'])
        st['parent_task'] = parent['task'] if parent else ''
        st['parent_status'] = parent['status'] if parent else ''
        st['parent_projects'] = parent['canonical_projects'] if parent else []
        subtasks_by_parent.setdefault(st['parent_task_id'], []).append(st)

    for project in projects:
        linked = project_map.get(project['project'], [])
        project['task_count'] = len(linked)
        project['active_task_count'] = sum(1 for t in linked if t['status'] == 'Active')
        project['subtask_count'] = sum(len(subtasks_by_parent.get(t['id'], [])) for t in linked)

    orphan_tasks = [t for t in tasks if t['orphan']]

    return {
        'projects': projects,
        'tasks': tasks,
        'goals': goals,
        'subtasks': subtasks,
        'tasks_by_project': project_map,
        'subtasks_by_parent': subtasks_by_parent,
        'summary': {
            'projects': len(projects),
            'tasks': len(tasks),
            'subtasks': len(subtasks),
            'goals': len(goals),
            'orphan_tasks': len(orphan_tasks),
            'source_dates': SOURCE_DATES,
        },
    }


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def _send_json(self, obj: dict, code: int = 200):
        body = json.dumps(obj, ensure_ascii=False, indent=2).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/api/data':
            return self._send_json(build_payload())
        if path == '/api/health':
            return self._send_json({'ok': True})
        if path == '/':
            path = '/index.html'
        file_path = FRONTEND / path.lstrip('/')
        if file_path.is_file():
            content = file_path.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', mimetypes.guess_type(str(file_path))[0] or 'application/octet-stream')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return
        self.send_error(404, 'Not found')

    def do_POST(self):
        path = urlparse(self.path).path
        if path.startswith('/api/tasks/') and path.endswith('/projects'):
            task_id = path.split('/')[3]
            length = int(self.headers.get('Content-Length', '0'))
            raw = self.rfile.read(length) if length else b'{}'
            payload = json.loads(raw.decode('utf-8') or '{}')
            projects = payload.get('projects', [])
            if not isinstance(projects, list):
                return self._send_json({'ok': False, 'error': 'projects must be a list'}, 400)
            try:
                result = _rewrite_task_projects(task_id, [str(p).strip() for p in projects if str(p).strip()])
            except Exception as exc:
                return self._send_json({'ok': False, 'error': str(exc)}, 400)
            return self._send_json({'ok': True, **result, 'data': build_payload()})
        return self._send_json({'ok': False, 'error': 'Not found'}, 404)


def main():
    host = '127.0.0.1'
    port = int(os.environ.get('PORT', '8787'))
    try:
        server = ThreadingHTTPServer((host, port), Handler)
    except OSError as exc:
        if exc.errno == 48:
            print(
                f'Port {port} is already in use. Set PORT to a free port, for example: PORT=8788 python3 /Users/enkay/dev/aipmo/control/backend/app.py',
                flush=True,
            )
            return
        raise
    print(f'AI PMO control app running on http://{host}:{port}', flush=True)
    server.serve_forever()


if __name__ == '__main__':
    main()
