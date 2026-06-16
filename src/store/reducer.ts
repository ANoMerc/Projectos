import type { AppState, AppAction } from './types'

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':         return { ...state, currentUser: action.user }
    case 'LOGOUT':        return { ...state, currentUser: null }
    case 'SET_PROJECT':   return { ...state, activeProjectId: action.id }
    case 'ADD_PROJECT':   return { ...state, projects: [...state.projects, action.project] }
    case 'UPDATE_PROJECT':return { ...state, projects: state.projects.map(p => p.id === action.id ? { ...p, ...action.patch } : p) }
    case 'ADD_TASK':      return { ...state, tasks: [...state.tasks, action.task] }
    case 'UPDATE_TASK':   return { ...state, tasks: state.tasks.map(t => t.id === action.id ? { ...t, ...action.patch } : t) }
    case 'DELETE_TASK':   return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) }
    case 'ADD_COMMENT':   return { ...state, comments: [...state.comments, action.comment] }
    case 'ADD_SPRINT':    return { ...state, sprints: [...state.sprints, action.sprint] }
    case 'UPDATE_SPRINT': return { ...state, sprints: state.sprints.map(s => s.id === action.id ? { ...s, ...action.patch } : s) }
    case 'UPDATE_SEMATIC':return { ...state, sematic: { ...state.sematic, ...action.patch } }
    case 'ADD_MEMBER':    return { ...state, members: [...state.members, action.member] }
    case 'UPDATE_MEMBER': return {
      ...state,
      members: state.members.map(m => m.id === action.id ? { ...m, ...action.patch } : m),
      roleLog: [...state.roleLog, action.logEntry],
    }
    case 'REMOVE_MEMBER':      return { ...state, members: state.members.filter(m => m.id !== action.id) }
    case 'SET_PLAN':           return { ...state, plan: action.plan }
    case 'ADD_NOTIF':          return { ...state, notifications: [action.notif, ...state.notifications] }
    case 'MARK_READ':          return { ...state, notifications: state.notifications.map(n => n.id === action.id ? { ...n, read: true } : n) }
    case 'MARK_ALL_READ':      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) }
    case 'UPDATE_NOTIF_PREFS': return { ...state, notifPrefs: { ...state.notifPrefs, ...action.patch } }
    default: return state
  }
}
