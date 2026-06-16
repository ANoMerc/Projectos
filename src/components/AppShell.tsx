import { useState } from 'react'
import { C, PLANS, ROLES } from '@/constants/theme'
import { Avatar, Btn } from '@/components/ui'
import { useApp } from '@/store/AppContext'

// ── Service imports ────────────────────────────────────────────────────────
import {
  AnalyticsService,
  ProjectService,
  KanbanService,
  BacklogService,
  CommentsService,
  SprintService,
  SematicService,
  NotifyService,
  ReportService,
  WorkspaceService,
  GanttService,
  ChatbotService,
  SettingsService,
  DocsService,
} from '@/services'

// ── Navigation config ──────────────────────────────────────────────────────
type ServiceId =
  | 'dashboard' | 'projects' | 'kanban' | 'backlog' | 'sprints'
  | 'comments' | 'gantt' | 'sematic' | 'analytics' | 'notify'
  | 'report' | 'workspace' | 'chatbot' | 'settings' | 'docs'

interface NavItem {
  id: ServiceId
  label: string
  icon: string
  group: 'main' | 'tasks' | 'analytics' | 'tools' | 'account'
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Дашборд',      icon: '▦', group: 'main' },
  { id: 'projects',   label: 'Проекты',       icon: '⬡', group: 'main' },
  { id: 'kanban',     label: 'Kanban',        icon: '⊟', group: 'tasks' },
  { id: 'backlog',    label: 'Бэклог',        icon: '☰', group: 'tasks' },
  { id: 'sprints',    label: 'Спринты',       icon: '◎', group: 'tasks' },
  { id: 'comments',   label: 'Комментарии',   icon: '◻', group: 'tasks' },
  { id: 'gantt',      label: 'Gantt',         icon: '▬', group: 'tasks' },
  { id: 'sematic',    label: 'SEMATIC/PERT',  icon: '◈', group: 'analytics' },
  { id: 'analytics',  label: 'Аналитика',     icon: '◇', group: 'analytics' },
  { id: 'notify',     label: 'Уведомления',   icon: '⚑', group: 'tools' },
  { id: 'report',     label: 'Отчёт',         icon: '▤', group: 'tools' },
  { id: 'workspace',  label: 'Workspace',     icon: '◉', group: 'tools' },
  { id: 'chatbot',    label: 'Ассистент',     icon: '✦', group: 'tools' },
  { id: 'settings',   label: 'Настройки',     icon: '⚙', group: 'account' },
  { id: 'docs',       label: 'Документация',  icon: '◑', group: 'account' },
]

const GROUP_LABELS: Record<string, string> = {
  main: 'Платформа',
  tasks: 'Задачи',
  analytics: 'Аналитика',
  tools: 'Инструменты',
  account: 'Аккаунт',
}

const VIEWS: Record<ServiceId, JSX.Element> = {
  dashboard:  <AnalyticsService />,
  projects:   <ProjectService />,
  kanban:     <KanbanService />,
  backlog:    <BacklogService />,
  sprints:    <SprintService />,
  comments:   <CommentsService />,
  gantt:      <GanttService />,
  sematic:    <SematicService />,
  analytics:  <AnalyticsService />,
  notify:     <NotifyService />,
  report:     <ReportService />,
  workspace:  <WorkspaceService />,
  chatbot:    <ChatbotService />,
  settings:   <SettingsService />,
  docs:       <DocsService />,
}

// ── Sidebar ────────────────────────────────────────────────────────────────
interface SidebarProps {
  view: ServiceId
  onView: (id: ServiceId) => void
  onLogout: () => void
  unreadCount: number
}

function Sidebar({ view, onView, onLogout, unreadCount }: SidebarProps) {
  const { state, dispatch } = useApp()
  const { projects, activeProjectId, currentUser, plan, members } = state
  const currentRole = members.find((m: any) => m.name === currentUser?.name)?.role ?? 'viewer'
  const planCfg = PLANS[plan as keyof typeof PLANS]
  const roleCfg = ROLES[currentRole as keyof typeof ROLES]

  const groups = ['main', 'tasks', 'analytics', 'tools', 'account'] as const

  return (
    <aside style={{
      width: 196, background: C.surface, borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh',
      position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 14px 10px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.5, marginBottom: 2 }}>
          <span style={{ color: C.accent }}>Project</span>
          <span style={{ color: C.text }}>OS</span>
        </div>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 0.5 }}>
          MICROSERVICES · v1.0
        </div>
      </div>

      {/* Project selector */}
      <div style={{ padding: '8px 10px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 9, color: C.muted, marginBottom: 5, letterSpacing: 0.5, fontWeight: 700 }}>
          WORKSPACE
        </div>
        {projects.map((p: any) => (
          <div
            key={p.id}
            onClick={() => { dispatch({ type: 'SET_PROJECT', id: p.id }); onView('dashboard') }}
            style={{
              padding: '5px 8px', borderRadius: 5, cursor: 'pointer', marginBottom: 2,
              background: p.id === activeProjectId ? C.accentDim + '55' : 'transparent',
              color: p.id === activeProjectId ? C.text : C.textDim,
              fontSize: 11, fontWeight: 500,
              border: p.id === activeProjectId ? `1px solid ${C.accent}44` : '1px solid transparent',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {p.name}
          </div>
        ))}
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, padding: '6px 6px', overflowY: 'auto' }}>
        {groups.map(group => {
          const items = NAV_ITEMS.filter(n => n.group === group)
          return (
            <div key={group} style={{ marginBottom: 4 }}>
              <div style={{
                fontSize: 9, color: C.muted, padding: '4px 10px',
                letterSpacing: 0.8, fontWeight: 700, textTransform: 'uppercase',
              }}>
                {GROUP_LABELS[group]}
              </div>
              {items.map(n => {
                const isActive = view === n.id
                return (
                  <div
                    key={n.id}
                    onClick={() => onView(n.id)}
                    style={{
                      display: 'flex', gap: 8, alignItems: 'center',
                      padding: '6px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 1,
                      background: isActive ? C.accentDim + '55' : 'transparent',
                      color: isActive ? C.text : C.textDim,
                      fontWeight: isActive ? 600 : 400, fontSize: 12,
                      borderLeft: isActive ? `2px solid ${C.accent}` : '2px solid transparent',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>{n.icon}</span>
                    {n.label}
                    {n.id === 'notify' && unreadCount > 0 && (
                      <span style={{
                        marginLeft: 'auto', fontSize: 9, background: C.red, color: '#fff',
                        borderRadius: 10, padding: '1px 5px', fontWeight: 800, lineHeight: 1,
                      }}>
                        {unreadCount}
                      </span>
                    )}
                    {n.id === 'chatbot' && (
                      <span style={{
                        marginLeft: 'auto', fontSize: 8, background: C.accent + '22',
                        color: C.accent, borderRadius: 3, padding: '1px 4px',
                      }}>
                        bot
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div style={{
        padding: 10, borderTop: `1px solid ${C.border}`,
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <Avatar name={currentUser?.name ?? '?'} size={26} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.name}
          </div>
          <div style={{ fontSize: 9, color: C.muted }}>
            {roleCfg?.label ?? 'User'} · {planCfg?.label ?? 'Free'}
          </div>
        </div>
        <Btn
          variant="ghost" small onClick={onLogout}
          style={{ color: C.red, padding: '2px 6px', fontSize: 12 }}
        >
          →|
        </Btn>
      </div>
    </aside>
  )
}

// ── Topbar ─────────────────────────────────────────────────────────────────
function Topbar({ view }: { view: ServiceId }) {
  const { state } = useApp()
  const { projects, activeProjectId, members, plan } = state
  const project = projects.find((p: any) => p.id === activeProjectId)
  const planCfg = PLANS[plan as keyof typeof PLANS]
  const navItem = NAV_ITEMS.find(n => n.id === view)

  return (
    <div style={{
      background: C.surface, borderBottom: `1px solid ${C.border}`,
      padding: '10px 22px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{navItem?.label}</div>
        <div style={{ fontSize: 10, color: C.textDim }}>
          {project?.name} · {state.workspace?.name}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {members.slice(0, 4).map((m: any) => (
          <Avatar key={m.id} name={m.name} size={24} />
        ))}
        {planCfg && (
          <span style={{
            fontSize: 11, background: planCfg.color + '22', color: planCfg.color,
            border: `1px solid ${planCfg.color}44`, borderRadius: 4,
            padding: '2px 8px', fontWeight: 700,
          }}>
            {planCfg.label}
          </span>
        )}
      </div>
    </div>
  )
}

// ── AppShell ───────────────────────────────────────────────────────────────
interface AppShellProps {
  onLogout: () => void
}

export default function AppShell({ onLogout }: AppShellProps) {
  const [view, setView] = useState<ServiceId>('dashboard')
  const { state } = useApp()
  const unreadCount = state.notifications.filter((n: any) => !n.read).length

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      background: C.bg, minHeight: '100vh', display: 'flex', color: C.text,
    }}>
      <Sidebar
        view={view}
        onView={setView}
        onLogout={onLogout}
        unreadCount={unreadCount}
      />
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Topbar view={view} />
        <div style={{ padding: 22, flex: 1 }}>
          {VIEWS[view]}
        </div>
      </main>
    </div>
  )
}
