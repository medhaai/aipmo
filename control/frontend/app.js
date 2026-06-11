const STATUS_ORDER = ['Active', 'Blocked', 'Planned', 'Backlog', 'Done', 'Cancelled'];

const state = {
  data: null,
  query: '',
  status: 'all',
  type: 'all',
  project: 'all',
  theme: localStorage.getItem('aipmo-theme') || 'dark',
  selected: null,
  sections: JSON.parse(localStorage.getItem('aipmo-sections') || '{}'),
};

const ICON_FALLBACK = 'circle-dot';

function icon(name) {
  return `<i data-lucide="${name || ICON_FALLBACK}" class="icon"></i>`;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function formatDate(dateText) {
  if (!dateText) return '—';
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) return dateText;
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}

function matches(q, fields) {
  if (!q) return true;
  const text = fields.map(v => String(v ?? '')).join(' ').toLowerCase();
  return text.includes(q);
}

function filteredTasks() {
  const q = state.query.trim().toLowerCase();
  return (state.data?.tasks || []).filter(task => {
    if (state.status !== 'all' && task.status !== state.status) return false;
    if (state.type !== 'all' && task.type !== state.type) return false;
    if (state.project !== 'all' && !(task.canonical_projects || []).includes(state.project)) return false;
    return matches(q, [task.id, task.task, task.status, task.next_step, task.notes, task.type, task.created, task.linked_projects, task.linked_goals, ...(task.canonical_projects || [])]);
  });
}

function filteredProjects() {
  const q = state.query.trim().toLowerCase();
  return (state.data?.projects || []).filter(project => matches(q, [project.project, project.description, project.status, project.next_step, project.notes, project.created]));
}

function filteredSubtasks() {
  const q = state.query.trim().toLowerCase();
  return (state.data?.subtasks || []).filter(st => {
    if (state.status !== 'all' && st.status !== state.status) return false;
    return matches(q, [st.id, st.subtask, st.parent_task_id, st.parent_task, st.next_step, st.notes, st.created]);
  });
}

function fillSelect(id, values, currentValue) {
  const el = document.getElementById(id);
  if (!el) return;
  const labels = {
    'status-filter': 'All statuses',
    'type-filter': 'All types',
    'project-filter': 'All projects',
  };
  el.innerHTML = '';
  values.forEach(value => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value === 'all' ? labels[id] || 'All' : value;
    el.appendChild(opt);
  });
  el.value = currentValue;
}

function sectionHidden(key) {
  return Boolean(state.sections[key]);
}

function syncSectionButtons() {
  document.querySelectorAll('[data-toggle]').forEach(btn => {
    const key = btn.dataset.toggle;
    const hidden = sectionHidden(key);
    btn.textContent = hidden ? 'Show' : 'Hide';
  });
  ['projects', 'tasks', 'orphans-subtasks'].forEach(key => {
    const body = document.getElementById(`${key}-body`);
    if (body) body.classList.toggle('hidden', sectionHidden(key));
  });
}

function toggleSection(key) {
  state.sections[key] = !sectionHidden(key);
  localStorage.setItem('aipmo-sections', JSON.stringify(state.sections));
  syncSectionButtons();
}

function projectCard(project) {
  return `
    <article class="card" data-project-name="${escapeHtml(project.project)}">
      <div class="card-top">
        <div class="card-left">
          <span class="icon-badge" style="border-color:${project.accent}; color:${project.accent}">${icon(project.icon)}</span>
          <div>
            <div class="title">${escapeHtml(project.project)}</div>
            <div class="meta">${escapeHtml(project.description)}</div>
          </div>
        </div>
        <div class="status ${escapeHtml(project.status)}">${escapeHtml(project.status)}</div>
      </div>
      <div class="meta-row">
        <span class="badge">${icon('calendar-clock')} Created ${escapeHtml(formatDate(project.created))}</span>
        <span class="badge">${icon('list-tree')} ${project.task_count || 0} tasks</span>
        <span class="badge">${icon('split-square-horizontal')} ${project.subtask_count || 0} subtasks</span>
      </div>
      <div class="meta">${escapeHtml(project.next_step)}</div>
      <div class="submeta">${escapeHtml(project.created_label || 'Created')}</div>
    </article>
  `;
}

function taskCard(task) {
  return `
    <article class="card" data-task-id="${escapeHtml(task.id)}">
      <div class="card-top">
        <div class="card-left">
          <span class="icon-badge">${icon(task.icon)}</span>
          <div>
            <div class="title">${escapeHtml(task.id)} · ${escapeHtml(task.task)}</div>
            <div class="meta">${escapeHtml(task.next_step || '')}</div>
          </div>
        </div>
        <div class="status ${escapeHtml(task.status || '')}">${escapeHtml(task.status || '')}</div>
      </div>
      <div class="meta-row">
        <span class="badge">${icon('tag')} ${escapeHtml(task.type || 'general')}</span>
        <span class="badge">${icon('calendar-clock')} Created ${escapeHtml(formatDate(task.created))}</span>
        ${task.orphan ? '<span class="badge badge-muted">Orphan</span>' : ''}
      </div>
      ${task.canonical_projects?.length ? `<div class="submeta">${icon('folder-kanban')} ${escapeHtml(task.canonical_projects.join(' · '))}</div>` : ''}
    </article>
  `;
}

function subtaskCard(st) {
  return `
    <article class="subcard" data-subtask-id="${escapeHtml(st.id)}">
      <div class="card-top">
        <div class="card-left">
          <span class="icon-badge">${icon(st.icon)}</span>
          <div>
            <div class="title">${escapeHtml(st.id)} · ${escapeHtml(st.subtask)}</div>
            <div class="meta">Parent: ${escapeHtml(st.parent_task_id)}${st.parent_task ? ` · ${escapeHtml(st.parent_task)}` : ''}</div>
          </div>
        </div>
        <div class="status ${escapeHtml(st.status)}">${escapeHtml(st.status)}</div>
      </div>
      <div class="meta-row">
        <span class="badge">${icon('calendar-clock')} Created ${escapeHtml(formatDate(st.created))}</span>
        ${st.parent_projects?.length ? `<span class="badge">${icon('folder-kanban')} ${escapeHtml(st.parent_projects.join(' · '))}</span>` : ''}
      </div>
      <div class="submeta">${escapeHtml(st.next_step || '')}</div>
    </article>
  `;
}

function groupSubtasks() {
  const subtasks = filteredSubtasks();
  const groups = new Map();
  for (const st of subtasks) {
    const key = st.parent_task_id || 'Unassigned';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(st);
  }

  const taskIndex = new Map((state.data?.tasks || []).map(t => [t.id, t]));
  return [...groups.entries()].map(([parentId, items]) => {
    const parent = taskIndex.get(parentId);
    const parentTitle = parent ? `${parent.id} · ${parent.task}` : parentId;
    const parentMeta = parent ? `${parent.status} · ${parent.type || 'general'}` : 'No parent record found';
    return `
      <details class="group-card" open>
        <summary>
          <div class="group-head">
            <div>
              <div class="group-task">${escapeHtml(parentTitle)}</div>
              <div class="group-projects">${escapeHtml(parentMeta)}</div>
            </div>
            <div class="pill">${items.length} subtasks</div>
          </div>
        </summary>
        <div class="group-list">${items.map(subtaskCard).join('')}</div>
      </details>
    `;
  }).join('');
}

async function saveTaskProjects(taskId, projects) {
  const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projects }),
  });
  const payload = await res.json();
  if (!res.ok || !payload.ok) {
    throw new Error(payload.error || 'Failed to save task projects');
  }
  state.data = payload.data;
  render();
  return payload;
}

function renderDrawer(entry, kind) {
  const drawer = document.getElementById('drawer');
  if (!entry) {
    drawer.classList.add('hidden');
    drawer.innerHTML = '';
    state.selected = null;
    return;
  }

  const taskIndex = new Map((state.data?.tasks || []).map(t => [t.id, t]));
  const subtasksByParent = state.data?.subtasks_by_parent || {};
  drawer.classList.remove('hidden');
  state.selected = { entry, kind };

  if (kind === 'task') {
    const subtasks = subtasksByParent[entry.id] || [];
    const projectOptions = (state.data?.projects || []).map(project => `<option value="${escapeHtml(project.project)}">${escapeHtml(project.project)}</option>`).join('');
    const linkedProjects = entry.canonical_projects || [];
    drawer.innerHTML = `
      <button class="drawer-close" id="drawer-close">Close</button>
      <div class="drawer-top">
        <div class="eyebrow">${icon(entry.icon)} Task detail</div>
        <h3>${escapeHtml(entry.id)} · ${escapeHtml(entry.task)}</h3>
        <div class="meta">${escapeHtml(entry.next_step || '')}</div>
      </div>
      <div class="drawer-kv">
        <div><strong>Status</strong><br>${escapeHtml(entry.status)}</div>
        <div><strong>Type</strong><br>${escapeHtml(entry.type || 'general')}</div>
        <div><strong>Created</strong><br>${escapeHtml(formatDate(entry.created))}</div>
        <div><strong>Goals</strong><br>${escapeHtml(entry.goal_links?.join(' · ') || entry.linked_goals || 'None')}</div>
        <div><strong>Next step</strong><br>${escapeHtml(entry.next_step || '—')}</div>
        <div><strong>Notes ref</strong><br>${escapeHtml(entry.notes || '—')}</div>
      </div>
      <div class="source-note">
        <strong>Project links</strong>
        <div class="badge-row" id="linked-projects-row">
          ${linkedProjects.length ? linkedProjects.map(project => `
            <button class="ghost-button" data-remove-project="${escapeHtml(project)}">${escapeHtml(project)} ×</button>
          `).join('') : '<span class="small">No linked projects yet.</span>'}
        </div>
        <div class="link-editor">
          <div class="link-editor-row">
            <select id="project-link-select" class="select">
              <option value="">Add a project…</option>
              ${projectOptions}
            </select>
            <button class="link-button" id="project-link-add">Add link</button>
          </div>
          <div class="small">Links are saved back to <code>task_list.md</code>.</div>
        </div>
      </div>
      <div class="source-note">
        <strong>Subtask deep dive</strong>
        <div class="drawer-list">
          ${subtasks.length ? subtasks.map(st => `
            <div class="drawer-item" data-subtask-id="${escapeHtml(st.id)}">
              <div class="card-top">
                <div>
                  <div class="title">${escapeHtml(st.id)} · ${escapeHtml(st.subtask)}</div>
                  <div class="submeta">${escapeHtml(st.next_step || '')}</div>
                </div>
                <div class="status ${escapeHtml(st.status)}">${escapeHtml(st.status)}</div>
              </div>
            </div>
          `).join('') : '<div class="small">No subtasks linked to this task yet.</div>'}
        </div>
      </div>
    `;

    document.getElementById('project-link-add').onclick = async () => {
      const select = document.getElementById('project-link-select');
      const value = select.value;
      if (!value) return;
      const next = [...new Set([...(entry.canonical_projects || []), value])];
      await saveTaskProjects(entry.id, next);
    };

    document.querySelectorAll('#drawer [data-remove-project]').forEach(el => {
      el.addEventListener('click', async () => {
        const value = el.getAttribute('data-remove-project');
        const next = (entry.canonical_projects || []).filter(project => project !== value);
        await saveTaskProjects(entry.id, next);
      });
    });

    document.querySelectorAll('#drawer [data-subtask-id]').forEach(el => {
      el.addEventListener('click', () => {
        const subtask = (state.data?.subtasks || []).find(st => st.id === el.getAttribute('data-subtask-id'));
        if (subtask) renderDrawer(subtask, 'subtask');
      });
    });
  } else if (kind === 'subtask') {
    const parent = taskIndex.get(entry.parent_task_id);
    drawer.innerHTML = `
      <button class="drawer-close" id="drawer-close">Close</button>
      <div class="drawer-top">
        <div class="eyebrow">${icon(entry.icon)} Subtask detail</div>
        <h3>${escapeHtml(entry.id)} · ${escapeHtml(entry.subtask)}</h3>
        <div class="meta">${escapeHtml(entry.next_step || '')}</div>
      </div>
      <div class="drawer-kv">
        <div><strong>Status</strong><br>${escapeHtml(entry.status)}</div>
        <div><strong>Created</strong><br>${escapeHtml(formatDate(entry.created))}</div>
        <div><strong>Parent task</strong><br>${escapeHtml(entry.parent_task_id)}${parent ? ` · ${escapeHtml(parent.task)}` : ''}</div>
        <div><strong>Parent projects</strong><br>${escapeHtml((entry.parent_projects || []).join(' · ') || 'None')}</div>
        <div><strong>Linked projects</strong><br>${escapeHtml((entry.project_links || []).join(' · ') || 'None')}</div>
        <div><strong>Notes ref</strong><br>${escapeHtml(entry.notes || '—')}</div>
      </div>
      <div class="source-note">This is part of the subtask deep dive view.</div>
    `;
  } else if (kind === 'project') {
    const tasks = (state.data?.tasks_by_project?.[entry.project] || []);
    drawer.innerHTML = `
      <button class="drawer-close" id="drawer-close">Close</button>
      <div class="drawer-top">
        <div class="eyebrow">${icon(entry.icon)} Project detail</div>
        <h3>${escapeHtml(entry.project)}</h3>
        <div class="meta">${escapeHtml(entry.description || '')}</div>
      </div>
      <div class="drawer-kv">
        <div><strong>Status</strong><br>${escapeHtml(entry.status)}</div>
        <div><strong>Created</strong><br>${escapeHtml(formatDate(entry.created))}</div>
        <div><strong>Next step</strong><br>${escapeHtml(entry.next_step || '—')}</div>
        <div><strong>Tasks</strong><br>${tasks.length}</div>
        <div><strong>Active tasks</strong><br>${tasks.filter(t => t.status === 'Active').length}</div>
        <div><strong>Subtasks</strong><br>${entry.subtask_count || 0}</div>
        <div><strong>Notes ref</strong><br>${escapeHtml(entry.notes || '—')}</div>
      </div>
      <div class="source-note">
        <strong>Linked tasks</strong>
        <div class="drawer-list">
          ${tasks.length ? tasks.map(task => `
            <div class="drawer-item" data-task-id="${escapeHtml(task.id)}">
              <div class="card-top">
                <div>
                  <div class="title">${escapeHtml(task.id)} · ${escapeHtml(task.task)}</div>
                  <div class="submeta">${escapeHtml(task.next_step || '')}</div>
                </div>
                <div class="status ${escapeHtml(task.status)}">${escapeHtml(task.status)}</div>
              </div>
            </div>
          `).join('') : '<div class="small">No linked tasks yet.</div>'}
        </div>
      </div>
    `;
    document.querySelectorAll('#drawer [data-task-id]').forEach(el => {
      el.addEventListener('click', () => {
        const task = (state.data?.tasks || []).find(t => t.id === el.getAttribute('data-task-id'));
        if (task) renderDrawer(task, 'task');
      });
    });
  }

  document.getElementById('drawer-close').onclick = () => renderDrawer(null);
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function render() {
  document.getElementById('project-count').textContent = `${state.data.summary.projects} projects`;
  document.getElementById('task-count').textContent = `${state.data.summary.tasks} tasks`;
  document.getElementById('orphan-count').textContent = `${state.data.summary.orphan_tasks} orphans`;
  document.getElementById('last-updated').textContent = new Date().toLocaleString();

  fillSelect('status-filter', ['all', ...new Set((state.data.tasks || []).map(t => t.status).filter(Boolean))], state.status);
  fillSelect('type-filter', ['all', ...new Set((state.data.tasks || []).map(t => t.type).filter(Boolean))], state.type);
  fillSelect('project-filter', ['all', ...new Set((state.data.projects || []).map(p => p.project).filter(Boolean))], state.project);

  document.getElementById('projects').innerHTML = filteredProjects().map(projectCard).join('') || '<div class="small">No projects match the current filters.</div>';

  const visibleTasks = filteredTasks();
  const tasksByStatus = Object.fromEntries(STATUS_ORDER.map(status => [status, []]));
  for (const task of visibleTasks) {
    if (!tasksByStatus[task.status]) tasksByStatus[task.status] = [];
    tasksByStatus[task.status].push(task);
  }
  document.getElementById('board').innerHTML = STATUS_ORDER.map(status => {
    const items = (tasksByStatus[status] || []).map(taskCard).join('') || '<div class="small">No tasks</div>';
    return `
      <div class="column">
        <div class="colhead">
          <div class="coltitle">${icon('layout-list')} ${escapeHtml(status)}</div>
          <div class="pill">${(tasksByStatus[status] || []).length}</div>
        </div>
        <div class="stack">${items}</div>
      </div>
    `;
  }).join('');

  const orphanTasks = visibleTasks.filter(t => t.orphan);
  document.getElementById('orphans').innerHTML = orphanTasks.length ? orphanTasks.map(taskCard).join('') : '<div class="small">No orphan tasks. Nice.</div>';
  document.getElementById('subtask-groups').innerHTML = groupSubtasks() || '<div class="small">No subtasks match the current filters.</div>';

  document.querySelectorAll('[data-task-id]').forEach(el => {
    el.addEventListener('click', () => {
      const task = state.data.tasks.find(t => t.id === el.getAttribute('data-task-id'));
      if (task) renderDrawer(task, 'task');
    });
  });

  document.querySelectorAll('[data-subtask-id]').forEach(el => {
    el.addEventListener('click', event => {
      event.stopPropagation();
      const subtask = state.data.subtasks.find(st => st.id === el.getAttribute('data-subtask-id'));
      if (subtask) renderDrawer(subtask, 'subtask');
    });
  });

  document.querySelectorAll('[data-project-name]').forEach(el => {
    el.addEventListener('click', () => {
      const project = state.data.projects.find(p => p.project === el.getAttribute('data-project-name'));
      if (project) renderDrawer(project, 'project');
    });
  });

  syncSectionButtons();
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

async function load() {
  const res = await fetch('/api/data');
  state.data = await res.json();
  render();
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  document.body.dataset.theme = state.theme;
  localStorage.setItem('aipmo-theme', state.theme);
  const label = document.getElementById('theme-label');
  if (label) label.textContent = state.theme === 'dark' ? 'Dark' : 'Light';
}

function wireControls() {
  document.getElementById('theme-toggle').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
  });
  document.getElementById('search-input').addEventListener('input', e => {
    state.query = e.target.value;
    render();
  });
  document.getElementById('status-filter').addEventListener('change', e => {
    state.status = e.target.value;
    render();
  });
  document.getElementById('type-filter').addEventListener('change', e => {
    state.type = e.target.value;
    render();
  });
  document.getElementById('project-filter').addEventListener('change', e => {
    state.project = e.target.value;
    render();
  });
  document.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => toggleSection(btn.dataset.toggle));
  });
}

applyTheme();
wireControls();
load().catch(err => {
  document.body.innerHTML = `<pre style="color:white;padding:24px">Failed to load dashboard data:
${escapeHtml(err.stack || err.message)}</pre>`;
});
