export interface User {
  name: string
  email: string
  role: string
}

export interface Member {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'invited'
  joined: string
}

export interface RoleLogEntry {
  id: string
  changedBy: string
  target: string
  from: string | null
  to: string
  at: string
}

export interface Project {
  id: string
  name: string
  status: 'active' | 'planning' | 'paused' | 'archived'
  startDate: string
  endDate: string
  progress: number
  type: string
}

export interface PertEstimate {
  O: number
  M: number
  P: number
}

export interface Task {
  id: string
  pid: string
  type: 'epic' | 'story' | 'subtask'
  title: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'critical' | 'high' | 'medium' | 'low'
  assignee: string | null
  sprintId: string | null
  sp: number | null
  due: string | null
  pert: PertEstimate | null
}

export interface Comment {
  id: string
  taskId: string
  author: string
  text: string
  time: Date
}

export interface Sprint {
  id: string
  pid: string
  name: string
  goal: string
  startDate: string
  endDate: string
  status: 'active' | 'planned' | 'closed'
}

export interface Notification {
  id: string
  type: string
  title: string
  time: Date
  read: boolean
}

export interface AppState {
  currentUser: User | null
  workspace: { id: string; name: string; slug: string; plan: string }
  members: Member[]
  roleLog: RoleLogEntry[]
  projects: Project[]
  activeProjectId: string
  tasks: Task[]
  comments: Comment[]
  sprints: Sprint[]
  sematic: Record<string, number>
  notifications: Notification[]
  notifPrefs: Record<string, boolean | string>
  plan: string
}

export type AppAction =
  | { type: 'LOGIN';            user: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_PROJECT';      id: string }
  | { type: 'ADD_PROJECT';      project: Project }
  | { type: 'UPDATE_PROJECT';   id: string; patch: Partial<Project> }
  | { type: 'ADD_TASK';         task: Task }
  | { type: 'UPDATE_TASK';      id: string; patch: Partial<Task> }
  | { type: 'DELETE_TASK';      id: string }
  | { type: 'ADD_COMMENT';      comment: Comment }
  | { type: 'ADD_SPRINT';       sprint: Sprint }
  | { type: 'UPDATE_SPRINT';    id: string; patch: Partial<Sprint> }
  | { type: 'UPDATE_SEMATIC';   patch: Partial<Record<string, number>> }
  | { type: 'ADD_MEMBER';       member: Member }
  | { type: 'UPDATE_MEMBER';    id: string; patch: Partial<Member>; logEntry: RoleLogEntry }
  | { type: 'REMOVE_MEMBER';    id: string }
  | { type: 'SET_PLAN';         plan: string }
  | { type: 'ADD_NOTIF';        notif: Notification }
  | { type: 'MARK_READ';        id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'UPDATE_NOTIF_PREFS'; patch: Record<string, boolean | string> }
