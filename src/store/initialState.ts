import type { AppState } from './types'

export const initialState: AppState = {
  currentUser: null,
  workspace: { id: 'ws1', name: 'Acme Inc.', slug: 'acme-inc', plan: 'pro' },
  members: [
    { id: 'u1', name: 'Anna Koroleva', email: 'anna@acme.io', role: 'admin',   status: 'active',  joined: '2025-01-10' },
    { id: 'u2', name: 'Bob Smirnov',   email: 'bob@acme.io',  role: 'member',  status: 'active',  joined: '2025-01-15' },
    { id: 'u3', name: 'Carl Morozov',  email: 'carl@acme.io', role: 'manager', status: 'active',  joined: '2025-02-01' },
    { id: 'u4', name: 'Dana Petrova',  email: 'dana@acme.io', role: 'member',  status: 'active',  joined: '2025-02-10' },
    { id: 'u5', name: 'Eve Sidorova',  email: 'eve@acme.io',  role: 'viewer',  status: 'invited', joined: '2025-03-20' },
  ],
  roleLog: [
    { id: 'l1', changedBy: 'Anna Koroleva', target: 'Carl Morozov', from: 'member', to: 'manager', at: '2025-02-02T14:30:00' },
  ],
  projects: [
    { id: 'p1', name: 'ProjectOS v1.0', status: 'active',   startDate: '2025-02-01', endDate: '2025-09-30', progress: 38, type: 'startup' },
    { id: 'p2', name: 'Mobile App',     status: 'planning', startDate: '2025-06-01', endDate: '2025-12-31', progress: 5,  type: 'startup' },
  ],
  activeProjectId: 'p1',
  tasks: [
    { id: 't1', pid: 'p1', type: 'epic',    title: 'Auth Module',         status: 'in_progress', priority: 'high',     assignee: 'Anna', sprintId: 's1', sp: 8,  due: '2025-02-28', pert: { O:3, M:5, P:9  } },
    { id: 't2', pid: 'p1', type: 'story',   title: 'Email registration',  status: 'done',        priority: 'high',     assignee: 'Bob',  sprintId: 's1', sp: 3,  due: '2025-02-15', pert: { O:1, M:2, P:4  } },
    { id: 't3', pid: 'p1', type: 'story',   title: 'OAuth Google login',  status: 'in_progress', priority: 'medium',   assignee: 'Anna', sprintId: 's1', sp: 3,  due: '2025-02-18', pert: { O:2, M:3, P:6  } },
    { id: 't4', pid: 'p1', type: 'subtask', title: 'JWT refresh token',   status: 'done',        priority: 'high',     assignee: 'Bob',  sprintId: 's1', sp: 2,  due: '2025-02-10', pert: null },
    { id: 't5', pid: 'p1', type: 'epic',    title: 'Task Management',     status: 'todo',        priority: 'critical', assignee: 'Carl', sprintId: 's2', sp: 21, due: '2025-04-30', pert: { O:10, M:15, P:25 } },
    { id: 't6', pid: 'p1', type: 'story',   title: 'Kanban board',        status: 'todo',        priority: 'critical', assignee: 'Carl', sprintId: 's2', sp: 8,  due: '2025-04-10', pert: { O:4, M:7, P:12  } },
    { id: 't7', pid: 'p1', type: 'story',   title: 'PERT estimation',     status: 'todo',        priority: 'medium',   assignee: null,   sprintId: null, sp: 5,  due: '2025-05-15', pert: { O:3, M:5, P:8  } },
    { id: 't8', pid: 'p1', type: 'story',   title: 'SEMATIC radar chart', status: 'review',      priority: 'medium',   assignee: 'Dana', sprintId: 's1', sp: 5,  due: '2025-02-28', pert: { O:2, M:4, P:7  } },
    { id: 't9', pid: 'p2', type: 'epic',    title: 'UI Design System',    status: 'todo',        priority: 'medium',   assignee: 'Dana', sprintId: null, sp: 13, due: '2025-07-31', pert: { O:8, M:12, P:20 } },
  ],
  comments: [
    { id: 'c1', taskId: 't1', author: 'Anna', text: 'Начинаем с JWT — Bob, возьмёшь refresh token?',         time: new Date(Date.now() - 7200000) },
    { id: 'c2', taskId: 't1', author: 'Bob',  text: '@Anna да, уже в работе. Жди PR сегодня вечером.',        time: new Date(Date.now() - 3600000) },
    { id: 'c3', taskId: 't3', author: 'Carl', text: 'Нашёл issue с Google OAuth — нужен HTTPS. @Anna посмотри конфиг.', time: new Date(Date.now() - 1800000) },
  ],
  sprints: [
    { id: 's1', pid: 'p1', name: 'Sprint 1', goal: 'Auth + SEMATIC prototype', startDate: '2025-02-01', endDate: '2025-02-28', status: 'active'  },
    { id: 's2', pid: 'p1', name: 'Sprint 2', goal: 'Core task management',     startDate: '2025-03-01', endDate: '2025-03-28', status: 'planned' },
    { id: 's3', pid: 'p1', name: 'Sprint 3', goal: 'Analytics & reports',      startDate: '2025-04-01', endDate: '2025-04-28', status: 'planned' },
  ],
  sematic: { Safety: 78, Engagement: 65, Meaning: 82, Autonomy: 71, Trust: 88, Information: 59, Clarity: 74 },
  notifications: [],
  notifPrefs: { assigned: true, deadline: true, overdue: true, mention: true, comment: false, sprint: false, digest: 'daily' },
  plan: 'pro',
}
