/**
 * Service barrel — каждый сервис в своём блоке.
 * При необходимости каждый можно вынести в отдельный файл.
 */
import { useState, useRef, useEffect } from 'react'
import { C, KANBAN_COLS, NOTIF_TYPES, SEMATIC_WEIGHTS, SEMATIC_RECS, PLANS, ROLES, PERMS, canDo } from '@/constants/theme'
import { Avatar, Badge, Btn, Card, Input, Select, SectionTitle, SEMATICRadar, StatusDot, Toggle, TypeIcon } from '@/components/ui'
import { useApp } from '@/store/AppContext'
import { uid, pertMu, pertSig, sematicScore, timeAgo } from '@/store/helpers'

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 7: ANALYTICS / DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function BurndownMini({ tasks, sprint }: { tasks: any[]; sprint: any }) {
  const sp = tasks.filter((t: any) => t.sprintId === sprint?.id)
  const total = sp.reduce((s: number, t: any) => s + (t.sp || 0), 0)
  const done  = sp.filter((t: any) => t.status === 'done').reduce((s: number, t: any) => s + (t.sp || 0), 0)
  const days = 14
  const ideal  = Array.from({ length: days + 1 }, (_, i) => total - (total / days) * i)
  const actual = [total,total-2,total-2,total-5,total-5,total-8,total-10,total-10,total-13,total-14,total-17,total-18,total-18,total-done,total-done]
  const w = 280, h = 90, pl = 28, pt = 8, pb = 20, cw = w - pl - 10, ch = h - pt - pb
  const tx = (i: number) => pl + (i / days) * cw
  const ty = (v: number) => pt + ch - (v / (total || 1)) * ch
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {[0, .5, 1].map(r => <line key={r} x1={pl} y1={pt + ch * (1 - r)} x2={w - 10} y2={pt + ch * (1 - r)} stroke={C.border} strokeWidth={1} />)}
      <text x={pl - 4} y={pt + 4} textAnchor="end" fontSize={8} fill={C.textDim} fontFamily="Inter,sans-serif">{total}</text>
      <path d={ideal.map((v, i) => `${i === 0 ? 'M' : 'L'}${tx(i)},${ty(v)}`).join(' ')} fill="none" stroke={C.border} strokeWidth={1.5} strokeDasharray="4,3" />
      <path d={actual.map((v, i) => `${i === 0 ? 'M' : 'L'}${tx(i)},${ty(Math.max(0, v))}`).join(' ')} fill="none" stroke={C.accent} strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

export function AnalyticsService() {
  const { state } = useApp()
  const { tasks, projects, sprints, sematic, activeProjectId } = state
  const pid = activeProjectId
  const ptasks = tasks.filter((t: any) => t.pid === pid)
  const as = sprints.find((s: any) => s.pid === pid && s.status === 'active')
  const stasks = as ? tasks.filter((t: any) => t.sprintId === as.id) : []
  const totalSP = stasks.reduce((s: number, t: any) => s + (t.sp || 0), 0)
  const doneSP  = stasks.filter((t: any) => t.status === 'done').reduce((s: number, t: any) => s + (t.sp || 0), 0)
  const overdue = ptasks.filter((t: any) => t.due && new Date(t.due) < new Date() && t.status !== 'done')
  const score = sematicScore(sematic)
  const hc = score >= 70 ? C.green : score >= 50 ? C.amber : C.red
  const velData = [18, 22, 15, 25, 20, 28, 23], maxV = Math.max(...velData)

  const kpis = [
    { l: 'Активных проектов', v: projects.filter((p: any) => p.status === 'active').length, c: C.accent },
    { l: 'Sprint прогресс',   v: `${doneSP}/${totalSP} SP`, c: C.green },
    { l: 'Просроченных',      v: overdue.length, c: overdue.length ? C.red : C.green },
    { l: 'SEMATIC Score',     v: score, c: hc },
    { l: 'Задач открыто',     v: ptasks.filter((t: any) => t.status !== 'done').length, c: C.text },
    { l: 'Завершено',         v: ptasks.filter((t: any) => t.status === 'done').length, c: C.green },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
      {kpis.map(k => (
        <Card key={k.l}>
          <div style={{ fontSize: 11, color: C.textDim, marginBottom: 5 }}>{k.l}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: k.c }}>{k.v}</div>
        </Card>
      ))}
      <div style={{ gridColumn: '1/3' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: C.textDim }}>АКТИВНЫЙ СПРИНТ</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{as?.name ?? 'Нет'}</div>
              <div style={{ fontSize: 12, color: C.textDim }}>{as?.goal}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: C.textDim }}>
              <div>{as?.startDate}</div><div>→ {as?.endDate}</div>
            </div>
          </div>
          <div style={{ background: C.surface, borderRadius: 4, height: 6, marginBottom: 8 }}>
            <div style={{ background: C.accent, borderRadius: 4, height: '100%', width: `${doneSP / (totalSP || 1) * 100}%` }} />
          </div>
          <BurndownMini tasks={tasks} sprint={as} />
        </Card>
      </div>
      <Card><div style={{ fontSize: 11, color: C.textDim, marginBottom: 6 }}>SEMATIC</div><SEMATICRadar data={sematic} size={200} /></Card>
      <Card style={{ gridColumn: '1/3' }}>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 10 }}>СКОРОСТЬ (SP)</div>
        <svg width="100%" viewBox="0 0 360 80">
          {velData.map((v, i) => { const bw = 40, x = i * 50 + 10, bh = (v / maxV) * 60; return <g key={i}><rect x={x} y={70 - bh} width={bw} height={bh} rx={3} fill={C.accent + '77'} stroke={C.accent} strokeWidth={1} /><text x={x + 20} y={75} textAnchor="middle" fontSize={9} fill={C.textDim} fontFamily="Inter,sans-serif">S{i + 1}</text><text x={x + 20} y={65 - bh} textAnchor="middle" fontSize={9} fill={C.accent} fontFamily="Inter,sans-serif" fontWeight={700}>{v}</text></g> })}
          {(() => { const avg = velData.reduce((a, b) => a + b, 0) / velData.length, y = 70 - (avg / maxV) * 60; return <line x1={0} y1={y} x2={360} y2={y} stroke={C.amber} strokeWidth={1} strokeDasharray="4,3" /> })()}
        </svg>
      </Card>
      <Card>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 10 }}>СТАТУСЫ</div>
        {KANBAN_COLS.map(c => {
          const cnt = ptasks.filter((t: any) => t.status === c.id).length
          const cols: Record<string, string> = { todo: C.muted, in_progress: C.accent, review: C.amber, done: C.green }
          return <div key={c.id} style={{ marginBottom: 8 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ fontSize: 12, color: C.text }}>{c.label}</span><span style={{ fontSize: 12, fontWeight: 700, color: cols[c.id] }}>{cnt}</span></div><div style={{ background: C.surface, borderRadius: 3, height: 5 }}><div style={{ background: cols[c.id], borderRadius: 3, height: '100%', width: `${cnt / (ptasks.length || 1) * 100}%` }} /></div></div>
        })}
      </Card>
      <Card style={{ gridColumn: '1/4' }}>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 10 }}>ПОСЛЕДНИЕ ЗАДАЧИ</div>
        {ptasks.slice(0, 6).map((t: any) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: `1px solid ${C.border}22` }}>
            <TypeIcon type={t.type} /><StatusDot status={t.status} />
            <span style={{ flex: 1, fontSize: 13, color: C.text }}>{t.title}</span>
            <Badge label={t.priority} />
            {t.assignee && <Avatar name={t.assignee} size={20} />}
            {t.due && <span style={{ fontSize: 11, color: new Date(t.due) < new Date() && t.status !== 'done' ? C.red : C.textDim }}>{t.due}</span>}
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 3: PROJECTS
// ─────────────────────────────────────────────────────────────────────────────
export function ProjectService() {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({ name: '', status: 'planning', startDate: '', endDate: '' })
  const [show, setShow] = useState(false)
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }))
  const sc: Record<string, string> = { active: C.green, planning: C.accent, paused: C.amber, archived: C.muted }
  const create = () => {
    if (!form.name) return
    dispatch({ type: 'ADD_PROJECT', project: { id: uid(), progress: 0, type: 'startup', ...form } as any })
    setForm({ name: '', status: 'planning', startDate: '', endDate: '' }); setShow(false)
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <Btn variant="primary" onClick={() => setShow(s => !s)}>+ Проект</Btn>
      </div>
      {show && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <Input value={form.name} onChange={f('name')} placeholder="Название проекта" />
            <Select value={form.status} onChange={f('status')} options={[{ v: 'planning', l: 'Planning' }, { v: 'active', l: 'Active' }, { v: 'paused', l: 'Paused' }]} />
            <Input value={form.startDate} onChange={f('startDate')} placeholder="Дата начала" />
            <Input value={form.endDate} onChange={f('endDate')} placeholder="Дата окончания" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}><Btn variant="primary" onClick={create}>Создать</Btn><Btn onClick={() => setShow(false)}>Отмена</Btn></div>
        </Card>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {state.projects.map((p: any) => (
          <Card key={p.id} style={{ borderLeft: `3px solid ${sc[p.status] ?? C.muted}`, cursor: 'pointer', borderRadius: '0 10px 10px 0' }} onClick={() => dispatch({ type: 'SET_PROJECT', id: p.id })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: p.id === state.activeProjectId ? C.accent : C.text }}>{p.name}</div>
                {p.id === state.activeProjectId && <span style={{ fontSize: 10, color: C.accent, fontWeight: 700 }}>● ACTIVE</span>}
              </div>
              <Badge label={p.status} />
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>{p.startDate} → {p.endDate}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, background: C.surface, borderRadius: 3, height: 5 }}><div style={{ background: sc[p.status] ?? C.accent, borderRadius: 3, height: '100%', width: `${p.progress}%` }} /></div>
              <span style={{ fontSize: 12, fontWeight: 700, color: sc[p.status] ?? C.accent }}>{p.progress}%</span>
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 6 }}>{state.tasks.filter((t: any) => t.pid === p.id).length} задач</div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 4a: KANBAN
// ─────────────────────────────────────────────────────────────────────────────
export function KanbanService() {
  const { state, dispatch } = useApp()
  const [drag, setDrag] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const ptasks = state.tasks.filter((t: any) => t.pid === state.activeProjectId)
  const drop = (col: string) => { if (drag) dispatch({ type: 'UPDATE_TASK', id: drag, patch: { status: col as any } }); setDrag(null); setOver(null) }
  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
      {KANBAN_COLS.map(col => {
        const ct = ptasks.filter((t: any) => t.status === col.id)
        const exc = col.wip && ct.length > col.wip
        const colors: Record<string, string> = { todo: C.muted, in_progress: C.accent, review: C.amber, done: C.green }
        return (
          <div key={col.id} onDragOver={e => { e.preventDefault(); setOver(col.id) }} onDrop={() => drop(col.id)} onDragLeave={() => setOver(null)}
            style={{ minWidth: 230, flex: '0 0 230px', background: over === col.id ? C.accentDim + '33' : C.elevated, border: `1px solid ${over === col.id ? C.accent : C.border}`, borderRadius: 10, padding: 12, transition: 'all .15s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <StatusDot status={col.id} /><span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{col.label}</span>
                <span style={{ fontSize: 11, color: C.textDim, background: C.surface, borderRadius: 10, padding: '1px 6px' }}>{ct.length}</span>
              </div>
              {col.wip && <span style={{ fontSize: 10, color: exc ? C.red : C.textDim, border: `1px solid ${exc ? C.red : C.border}`, borderRadius: 4, padding: '1px 5px' }}>WIP {ct.length}/{col.wip}{exc ? ' ⚠' : ''}</span>}
            </div>
            {ct.map((t: any) => (
              <div key={t.id} draggable onDragStart={() => setDrag(t.id)}
                style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, cursor: 'grab', marginBottom: 8, opacity: drag === t.id ? 0.5 : 1 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}><TypeIcon type={t.type} /><span style={{ fontSize: 12, color: C.text, flex: 1, lineHeight: 1.3 }}>{t.title}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge label={t.priority} />
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {t.sp && <span style={{ fontSize: 10, color: C.accent, background: C.accentDim + '44', borderRadius: 4, padding: '1px 5px' }}>{t.sp}SP</span>}
                    {t.assignee && <Avatar name={t.assignee} size={18} />}
                  </div>
                </div>
                {t.due && <div style={{ fontSize: 10, marginTop: 5, color: new Date(t.due) < new Date() && t.status !== 'done' ? C.red : C.textDim }}>📅 {t.due}</div>}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 4b: BACKLOG
// ─────────────────────────────────────────────────────────────────────────────
export function BacklogService() {
  const { state, dispatch } = useApp()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('story')
  const [prio, setPrio] = useState('medium')
  const [filter, setFilter] = useState('all')
  const pid = state.activeProjectId
  const ptasks = state.tasks.filter((t: any) => t.pid === pid)
  const shown = filter === 'all' ? ptasks : filter === 'backlog' ? ptasks.filter((t: any) => !t.sprintId) : ptasks.filter((t: any) => t.sprintId === filter)
  const add = () => {
    if (!title.trim()) return
    dispatch({ type: 'ADD_TASK', task: { id: uid(), pid, type: type as any, title, status: 'todo', priority: prio as any, assignee: null, sprintId: null, sp: null, due: null, pert: null } })
    setTitle('')
  }
  return (
    <div>
      <Card style={{ marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
        <TypeIcon type={type} />
        <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Название задачи…" style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '7px 10px', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
        <Select value={type} onChange={setType} options={[{ v: 'epic', l: 'Epic' }, { v: 'story', l: 'Story' }, { v: 'subtask', l: 'Subtask' }]} style={{ width: 95 }} />
        <Select value={prio} onChange={setPrio} options={[{ v: 'critical', l: 'Critical' }, { v: 'high', l: 'High' }, { v: 'medium', l: 'Medium' }, { v: 'low', l: 'Low' }]} style={{ width: 95 }} />
        <Btn variant="primary" small onClick={add}>+ Добавить</Btn>
      </Card>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {[['all', 'Все'], ['backlog', 'Бэклог'], ...state.sprints.filter((s: any) => s.pid === pid).map((s: any) => [s.id, s.name])].map(([v, l]) => (
          <Btn key={v} small variant={filter === v ? 'primary' : 'default'} onClick={() => setFilter(v)}>{l}</Btn>
        ))}
      </div>
      {shown.map((t: any) => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 4, borderLeft: t.type === 'epic' ? `3px solid ${C.accent}` : t.type === 'story' ? `3px solid ${C.amber}` : 'none' }}>
          <TypeIcon type={t.type} /><StatusDot status={t.status} /><span style={{ flex: 1, fontSize: 13, color: C.text }}>{t.title}</span>
          <Badge label={t.priority} />{t.sp && <span style={{ fontSize: 11, color: C.accent }}>{t.sp}SP</span>}
          {t.assignee && <Avatar name={t.assignee} size={20} />}
          <Select value={t.sprintId ?? 'backlog'} onChange={v => dispatch({ type: 'UPDATE_TASK', id: t.id, patch: { sprintId: v === 'backlog' ? null : v } })}
            options={[{ v: 'backlog', l: 'Бэклог' }, ...state.sprints.filter((s: any) => s.pid === pid).map((s: any) => ({ v: s.id, l: s.name }))]} style={{ width: 100, fontSize: 11, padding: '3px 6px' }} />
          <Btn variant="ghost" small onClick={() => dispatch({ type: 'DELETE_TASK', id: t.id })} style={{ color: C.red, padding: '2px 6px' }}>✕</Btn>
        </div>
      ))}
      {shown.length === 0 && <div style={{ textAlign: 'center', color: C.textDim, padding: 32 }}>Задач нет</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 4c: COMMENTS
// ─────────────────────────────────────────────────────────────────────────────
export function CommentsService() {
  const { state, dispatch } = useApp()
  const [sel, setSel] = useState(state.tasks[0]?.id ?? '')
  const [text, setText] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth' }) }, [state.comments, sel])
  const ptasks = state.tasks.filter((t: any) => t.pid === state.activeProjectId)
  const tc = state.comments.filter((c: any) => c.taskId === sel)
  const task = state.tasks.find((t: any) => t.id === sel)
  const add = () => {
    if (!text.trim()) return
    dispatch({ type: 'ADD_COMMENT', comment: { id: uid(), taskId: sel, author: state.currentUser?.name?.split(' ')[0] ?? 'Anna', text, time: new Date() } })
    setText('')
  }
  const render = (t: string) => t.split(/(@\w+)/g).map((p, i) => p.startsWith('@') ? <span key={i} style={{ color: C.accent, fontWeight: 600 }}>{p}</span> : p)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, height: 'calc(100vh - 160px)', maxHeight: 650 }}>
      <div style={{ overflowY: 'auto' }}>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8, fontWeight: 700 }}>ЗАДАЧИ</div>
        {ptasks.map((t: any) => { const cnt = state.comments.filter((c: any) => c.taskId === t.id).length; return (
          <div key={t.id} onClick={() => setSel(t.id)} style={{ padding: '8px 10px', borderRadius: 7, cursor: 'pointer', marginBottom: 3, background: sel === t.id ? C.accentDim + '55' : C.elevated, border: `1px solid ${sel === t.id ? C.accent + '55' : C.border}` }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 2 }}><TypeIcon type={t.type} /><span style={{ fontSize: 12, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><StatusDot status={t.status} />{cnt > 0 && <span style={{ fontSize: 10, color: C.accent, background: C.accentDim + '44', borderRadius: 8, padding: '1px 5px' }}>{cnt}</span>}</div>
          </div>
        ) })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
          {task && <TypeIcon type={task.type} />}<span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{task?.title}</span>{task && <StatusDot status={task.status} />}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tc.length === 0 && <div style={{ textAlign: 'center', color: C.textDim, padding: 30, fontSize: 13 }}>Комментариев пока нет</div>}
          {tc.map((c: any) => (
            <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Avatar name={c.author} size={28} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 3 }}><span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{c.author}</span><span style={{ fontSize: 10, color: C.muted }}>{timeAgo(c.time)}</span></div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '4px 10px 10px 10px', padding: '8px 12px', fontSize: 13, color: C.text, lineHeight: 1.5 }}>{render(c.text)}</div>
              </div>
            </div>
          ))}
          <div ref={ref} />
        </div>
        <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8 }}>
          <Avatar name={state.currentUser?.name?.split(' ')[0] ?? 'A'} size={28} />
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && add()} placeholder="Комментарий, @упоминание…"
            style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
          <Btn variant="primary" small onClick={add} disabled={!text.trim()}>↑</Btn>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 5: SPRINTS
// ─────────────────────────────────────────────────────────────────────────────
export function SprintService() {
  const { state, dispatch } = useApp()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', goal: '', startDate: '', endDate: '' })
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }))
  const pid = state.activeProjectId
  const sprints = state.sprints.filter((s: any) => s.pid === pid)
  const create = () => {
    if (!form.name) return
    dispatch({ type: 'ADD_SPRINT', sprint: { id: uid(), pid, status: 'planned', ...form } as any })
    setForm({ name: '', goal: '', startDate: '', endDate: '' }); setShow(false)
  }
  const sc: Record<string, string> = { active: C.green, planned: C.accent, closed: C.muted }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}><Btn variant="primary" onClick={() => setShow(s => !s)}>+ Спринт</Btn></div>
      {show && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <Input value={form.name} onChange={f('name')} placeholder="Название" />
            <Input value={form.goal} onChange={f('goal')} placeholder="Цель" />
            <Input value={form.startDate} onChange={f('startDate')} placeholder="Дата начала" />
            <Input value={form.endDate} onChange={f('endDate')} placeholder="Дата окончания" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}><Btn variant="primary" onClick={create}>Создать</Btn><Btn onClick={() => setShow(false)}>Отмена</Btn></div>
        </Card>
      )}
      {sprints.map((s: any) => {
        const st = state.tasks.filter((t: any) => t.sprintId === s.id)
        const total = st.reduce((a: number, t: any) => a + (t.sp || 0), 0)
        const done  = st.filter((t: any) => t.status === 'done').reduce((a: number, t: any) => a + (t.sp || 0), 0)
        return (
          <Card key={s.id} style={{ marginBottom: 12, borderLeft: `3px solid ${sc[s.status] ?? C.muted}`, borderRadius: '0 10px 10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{s.name}</span>
                  <span style={{ background: (sc[s.status] ?? C.muted) + '22', color: sc[s.status] ?? C.muted, border: `1px solid ${(sc[s.status] ?? C.muted)}44`, borderRadius: 4, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>{s.status.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 12, color: C.textDim }}>{s.goal}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{s.startDate} → {s.endDate}</div>
              </div>
              {s.status === 'active'  && <Btn variant="danger"  small onClick={() => dispatch({ type: 'UPDATE_SPRINT', id: s.id, patch: { status: 'closed'  as any } })}>Закрыть</Btn>}
              {s.status === 'planned' && <Btn variant="success" small onClick={() => dispatch({ type: 'UPDATE_SPRINT', id: s.id, patch: { status: 'active'  as any } })}>Запустить</Btn>}
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: C.textDim }}>{st.length} задач · {done}/{total} SP</span>
              <div style={{ flex: 1, background: C.surface, borderRadius: 3, height: 5 }}><div style={{ background: C.accent, borderRadius: 3, height: '100%', width: `${done / (total || 1) * 100}%` }} /></div>
              <span style={{ fontSize: 12, color: C.accent, fontWeight: 700 }}>{Math.round(done / (total || 1) * 100)}%</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {st.map((t: any) => <div key={t.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, display: 'flex', gap: 4, alignItems: 'center' }}><StatusDot status={t.status} /><span style={{ color: C.text }}>{t.title}</span></div>)}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 6: SEMATIC + PERT
// ─────────────────────────────────────────────────────────────────────────────
export function SematicService() {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState<'overview'|'survey'|'pert'>('overview')
  const [survey, setSurvey] = useState<Record<string, number>>({})
  const { sematic } = state
  const score = sematicScore(sematic)
  const hc = score >= 70 ? C.green : score >= 50 ? C.amber : C.red
  const QS: Record<string, string[]> = {
    Safety:      ['Я могу высказаться без страха','Ошибки — это рост','Готов рисковать с идеями'],
    Engagement:  ['Я вовлечён и заряжен','Задачи меня мотивируют','Смотрю вперёд с энтузиазмом'],
    Meaning:     ['Понимаю влияние работы','Продукт имеет ценность','Горжусь тем, что делаем'],
    Autonomy:    ['Достаточно свободы в решениях','Выбираю способ выполнения','Не перегружен указаниями'],
    Trust:       ['Доверяю коллегам','Руководство честно','Обещания выполняются'],
    Information: ['Получаю нужную инфо вовремя','Изменения коммуницируются','Есть доступ к контексту решений'],
    Clarity:     ['Роль и ответственность чёткие','Цели спринта понятны','Критерии приёмки ясны'],
  }
  const submitSurvey = () => {
    const ns: Record<string, number> = {}
    Object.keys(QS).forEach(factor => {
      const ans = QS[factor].map((_, qi) => survey[`${factor}_${qi}`] ?? 5)
      ns[factor] = Math.round(ans.reduce((a, b) => a + b, 0) / ans.length * 10)
    })
    dispatch({ type: 'UPDATE_SEMATIC', patch: ns })
    setTab('overview')
  }
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['overview','survey','pert'] as const).map(t => <Btn key={t} small variant={tab === t ? 'primary' : 'default'} onClick={() => setTab(t)}>{t === 'overview' ? 'Обзор' : t === 'survey' ? 'Опрос' : 'PERT'}</Btn>)}
      </div>
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
          <div>
            <Card style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 6 }}>SEMATIC SCORE</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: hc }}>{score}</div>
              <div style={{ fontSize: 12, color: hc, marginBottom: 8 }}>{score >= 70 ? 'Здоровая' : score >= 50 ? 'Зона внимания' : 'Риск'}</div>
              <div style={{ background: C.surface, borderRadius: 100, height: 7 }}><div style={{ background: hc, borderRadius: 100, height: '100%', width: `${score}%` }} /></div>
            </Card>
            <SEMATICRadar data={sematic} size={240} />
          </div>
          <div>
            {Object.entries(sematic).map(([k, v]) => (
              <Card key={k} style={{ marginBottom: 8, border: `1px solid ${v < 70 ? C.amber : C.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{k}</span>
                    {v < 70 && <span style={{ fontSize: 10, color: C.amber, background: C.amber + '22', padding: '1px 6px', borderRadius: 4, border: `1px solid ${C.amber}44` }}>ВНИМАНИЕ</span>}
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: v >= 70 ? C.green : v >= 50 ? C.amber : C.red }}>{v}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ flex: 1, background: C.surface, borderRadius: 3, height: 5 }}><div style={{ background: v >= 70 ? C.green : v >= 50 ? C.amber : C.red, borderRadius: 3, height: '100%', width: `${v}%` }} /></div>
                  <input type="range" min={0} max={100} value={v} onChange={e => dispatch({ type: 'UPDATE_SEMATIC', patch: { [k]: +e.target.value } })} style={{ width: 80, accentColor: C.accent }} />
                </div>
                {v < 70 && <div style={{ paddingTop: 6, borderTop: `1px solid ${C.border}22` }}><div style={{ fontSize: 10, color: C.textDim, marginBottom: 3, fontWeight: 600 }}>РЕКОМЕНДАЦИИ:</div>{SEMATIC_RECS[k]?.map((r, i) => <div key={i} style={{ fontSize: 11, color: C.text }}>• {r}</div>)}</div>}
              </Card>
            ))}
          </div>
        </div>
      )}
      {tab === 'survey' && (
        <div style={{ maxWidth: 620 }}>
          <div style={{ fontSize: 13, color: C.textDim, marginBottom: 14 }}>Ответьте по шкале 1–10 (анонимно). Результаты обновят SEMATIC Score.</div>
          {Object.entries(QS).map(([factor, qs]) => (
            <Card key={factor} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>{factor}</div>
              {qs.map((q, qi) => (
                <div key={qi} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: C.textDim, marginBottom: 4 }}>{q}</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                      <button key={n} onClick={() => setSurvey(p => ({ ...p, [`${factor}_${qi}`]: n }))}
                        style={{ width: 26, height: 26, borderRadius: 4, border: `1px solid ${C.border}`, background: survey[`${factor}_${qi}`] === n ? C.accent : C.surface, color: survey[`${factor}_${qi}`] === n ? '#fff' : C.textDim, fontFamily: 'inherit', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>{n}</button>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          ))}
          <Btn variant="primary" onClick={submitSurvey}>Отправить → обновить Score</Btn>
        </div>
      )}
      {tab === 'pert' && <PERTPanel />}
    </div>
  )
}

function PERTPanel() {
  const { state, dispatch } = useApp()
  const [btype, setBtype] = useState('startup')
  const [cbuf, setCbuf] = useState(40)
  const pid = state.activeProjectId
  const ptasks = state.tasks.filter((t: any) => t.pid === pid)
  const buf = btype === 'custom' ? cbuf : ({ startup: 40, enterprise: 20, ai: 50, operational: 10 } as Record<string, number>)[btype] ?? 20
  const pertTasks = ptasks.filter((t: any) => t.pert)
  const E   = pertTasks.reduce((s: number, t: any) => s + pertMu(t.pert), 0)
  const sig = Math.sqrt(pertTasks.reduce((s: number, t: any) => s + Math.pow(pertSig(t.pert), 2), 0))
  const upd = (tid: string, k: string, v: string) => {
    const t = ptasks.find((x: any) => x.id === tid)
    if (!t) return
    dispatch({ type: 'UPDATE_TASK', id: tid, patch: { pert: { ...(t.pert ?? { O: 1, M: 3, P: 5 }), [k]: parseFloat(v) || 0 } } })
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
      <Card>
        <SectionTitle>PERT оценки задач</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 65px 55px', fontSize: 11, color: C.textDim, fontWeight: 700, padding: '0 4px 8px', borderBottom: `1px solid ${C.border}`, gap: 8 }}>
          <span>Задача</span><span>O</span><span>M</span><span>P</span><span>μ (дн)</span><span>σ</span>
        </div>
        {ptasks.map((t: any) => (
          <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 65px 55px', padding: '7px 4px', borderBottom: `1px solid ${C.border}22`, gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', overflow: 'hidden' }}><TypeIcon type={t.type} /><span style={{ fontSize: 12, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span></div>
            {t.pert ? (
              <>{(['O','M','P'] as const).map(k => <input key={k} type="number" value={(t.pert as any)[k]} min={0} onChange={e => upd(t.id, k, e.target.value)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 5px', color: C.text, fontSize: 12, fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }} />)}
                <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{pertMu(t.pert).toFixed(1)}</span>
                <span style={{ fontSize: 12, color: C.amber }}>{pertSig(t.pert).toFixed(1)}</span>
              </>
            ) : (
              <div style={{ gridColumn: '2/-1' }}>
                <Btn small variant="ghost" onClick={() => dispatch({ type: 'UPDATE_TASK', id: t.id, patch: { pert: { O: 1, M: 3, P: 5 } } })} style={{ fontSize: 11, color: C.textDim }}>+ Оценить</Btn>
              </div>
            )}
          </div>
        ))}
      </Card>
      <div>
        <Card style={{ marginBottom: 12 }}>
          <SectionTitle>Тип проекта</SectionTitle>
          <Select value={btype} onChange={setBtype} options={[{ v: 'startup', l: 'Startup (+40%)' }, { v: 'enterprise', l: 'Enterprise (+20%)' }, { v: 'ai', l: 'AI/ML (+50%)' }, { v: 'operational', l: 'Operational (+10%)' }, { v: 'custom', l: 'Свой буфер' }]} style={{ width: '100%', marginBottom: 8 }} />
          {btype === 'custom' && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Input value={String(cbuf)} onChange={v => setCbuf(+v)} type="number" style={{ width: 80 }} /><span style={{ fontSize: 12, color: C.textDim }}>%</span></div>}
        </Card>
        <Card>
          <SectionTitle>Итого</SectionTitle>
          {[['Задач с оценкой', pertTasks.length, C.text], ['Ожидаемое Σμ', `${E.toFixed(1)} дн`, C.accent], ['Σσ (риск)', `${sig.toFixed(1)} дн`, C.amber], ['T₉₅', `${(E + 1.645 * sig).toFixed(1)} дн`, C.purple], [`С буфером ${buf}%`, `${(E * (1 + buf / 100)).toFixed(1)} дн`, C.green]].map(([l, v, c]) => (
            <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}22` }}>
              <span style={{ fontSize: 12, color: C.textDim }}>{l}</span><span style={{ fontSize: 13, fontWeight: 700, color: String(c) }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 8: NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export function NotifyService() {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState<'feed'|'settings'>('feed')
  const [filter, setFilter] = useState('all')
  const notifs = state.notifications
  const unread = notifs.filter((n: any) => !n.read).length
  const shown = filter === 'all' ? notifs : filter === 'unread' ? notifs.filter((n: any) => !n.read) : notifs.filter((n: any) => n.type === filter)
  const addDemo = () => dispatch({ type: 'ADD_NOTIF', notif: { id: uid(), type: Object.keys(NOTIF_TYPES)[Math.floor(Math.random() * 7)], title: 'Демо уведомление — задача #' + uid(), time: new Date(), read: false } })
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>{(['feed','settings'] as const).map(t => <Btn key={t} small variant={tab === t ? 'primary' : 'default'} onClick={() => setTab(t)}>{t === 'feed' ? 'Лента' : 'Настройки'}</Btn>)}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn small onClick={addDemo}>+ Демо</Btn>
            {tab === 'feed' && unread > 0 && <Btn small variant="ghost" onClick={() => dispatch({ type: 'MARK_ALL_READ' })} style={{ color: C.accent }}>Все прочитаны ({unread})</Btn>}
          </div>
        </div>
        {tab === 'feed' && (
          <>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {[['all','Все'],['unread','Непрочитанные'],...Object.entries(NOTIF_TYPES).map(([k,v]) => [k, v.label])].map(([v,l]) => <Btn key={v} small variant={filter === v ? 'primary' : 'default'} onClick={() => setFilter(v)}>{l}</Btn>)}
            </div>
            {shown.length === 0 && <div style={{ textAlign: 'center', color: C.textDim, padding: 40 }}>Нет уведомлений. Нажмите «+ Демо» для теста.</div>}
            {shown.map((n: any) => { const cfg = (NOTIF_TYPES as any)[n.type] ?? {}; return (
              <div key={n.id} onClick={() => dispatch({ type: 'MARK_READ', id: n.id })}
                style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', background: n.read ? C.elevated : C.accentDim + '33', border: `1px solid ${n.read ? C.border : C.accent + '44'}`, borderRadius: 8, cursor: 'pointer', marginBottom: 2, borderLeft: `3px solid ${cfg.color ?? C.muted}` }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: (cfg.color ?? C.muted) + '22', border: `1px solid ${(cfg.color ?? C.muted)}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: cfg.color, flexShrink: 0 }}>{cfg.icon}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: C.text, fontWeight: n.read ? 400 : 600 }}>{n.title}</div><div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{cfg.label}</div></div>
                <div style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{timeAgo(n.time)}</div>
                {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.accent, flexShrink: 0, marginTop: 4 }} />}
              </div>
            ) })}
          </>
        )}
        {tab === 'settings' && (
          <Card>
            <SectionTitle>Каналы уведомлений</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', fontSize: 11, color: C.textDim, fontWeight: 700, padding: '0 4px 8px', borderBottom: `1px solid ${C.border}`, gap: 8 }}><span>Событие</span><span style={{ textAlign: 'center' }}>Включено</span></div>
            {Object.entries(NOTIF_TYPES).map(([key, cfg]) => (
              <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', padding: '10px 4px', borderBottom: `1px solid ${C.border}22`, gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}><span style={{ color: cfg.color }}>{cfg.icon}</span><span style={{ fontSize: 13, color: C.text }}>{cfg.label}</span></div>
                <div style={{ textAlign: 'center' }}><Toggle value={Boolean(state.notifPrefs[key] ?? true)} onChange={v => dispatch({ type: 'UPDATE_NOTIF_PREFS', patch: { [key]: v } })} /></div>
              </div>
            ))}
          </Card>
        )}
      </div>
      <div>
        <Card style={{ marginBottom: 12 }}>
          <SectionTitle>Сводка</SectionTitle>
          {[['Всего', notifs.length, C.text], ['Непрочитанных', unread, unread ? C.red : C.green], ['Сегодня', notifs.filter((n: any) => new Date(n.time).toDateString() === new Date().toDateString()).length, C.accent]].map(([l, v, c]) => (
            <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}22` }}><span style={{ fontSize: 12, color: C.textDim }}>{l}</span><span style={{ fontSize: 13, fontWeight: 700, color: String(c) }}>{v}</span></div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 9: REPORT
// ─────────────────────────────────────────────────────────────────────────────
export function ReportService() {
  const { state } = useApp()
  const { tasks, projects, sprints, sematic, activeProjectId, plan } = state
  const project = projects.find((p: any) => p.id === activeProjectId)
  const ptasks = tasks.filter((t: any) => t.pid === activeProjectId)
  const as = sprints.find((s: any) => s.pid === activeProjectId && s.status === 'active')
  const stasks = as ? tasks.filter((t: any) => t.sprintId === as.id) : []
  const doneSP = stasks.filter((t: any) => t.status === 'done').reduce((s: number, t: any) => s + (t.sp || 0), 0)
  const totalSP = stasks.reduce((s: number, t: any) => s + (t.sp || 0), 0)
  const overdue = ptasks.filter((t: any) => t.due && new Date(t.due) < new Date() && t.status !== 'done')
  const score = sematicScore(sematic)
  const hc = score >= 70 ? C.green : score >= 50 ? C.amber : C.red
  const pertTasks = ptasks.filter((t: any) => t.pert)
  const E   = pertTasks.reduce((s: number, t: any) => s + pertMu(t.pert), 0)
  const sig = Math.sqrt(pertTasks.reduce((s: number, t: any) => s + Math.pow(pertSig(t.pert), 2), 0))
  const rdate = new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
  const [printed, setPrinted] = useState(false)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16 }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 28, color: '#1a1a2e', fontFamily: 'Georgia,serif', border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 14, borderBottom: '2px solid #e5e7eb' }}>
          <div><div style={{ fontSize: 20, fontWeight: 900, color: '#1a1a2e' }}><span style={{ color: '#5B6EF5' }}>Project</span>OS</div><div style={{ fontSize: 10, color: '#6b7280' }}>Отчёт для стейкхолдеров</div></div>
          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{project?.name}</div><div style={{ fontSize: 11, color: '#6b7280' }}>{rdate}</div></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
          {[{ l: 'Прогресс', v: `${project?.progress}%`, c: '#5B6EF5' }, { l: 'Sprint', v: `${Math.round(doneSP / (totalSP || 1) * 100)}%`, c: '#22C55E' }, { l: 'SEMATIC', v: `${score}/100`, c: hc }, { l: 'Просрочено', v: overdue.length, c: overdue.length ? '#EF4444' : '#22C55E' }].map(k => (
            <div key={k.l} style={{ background: '#f8f9fa', borderRadius: 8, padding: 12, textAlign: 'center', border: '1px solid #e5e7eb' }}><div style={{ fontSize: 9, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.l}</div><div style={{ fontSize: 22, fontWeight: 900, color: k.c }}>{k.v}</div></div>
          ))}
        </div>
        {as && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid #e5e7eb' }}>АКТИВНЫЙ СПРИНТ</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><div><div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{as.name}</div><div style={{ fontSize: 11, color: '#6b7280' }}>{as.goal}</div></div><div style={{ fontSize: 11, color: '#6b7280', textAlign: 'right' }}>{as.startDate} — {as.endDate}</div></div>
            <div style={{ background: '#e5e7eb', borderRadius: 4, height: 7, marginBottom: 4 }}><div style={{ background: '#5B6EF5', borderRadius: 4, height: '100%', width: `${doneSP / (totalSP || 1) * 100}%` }} /></div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{doneSP} из {totalSP} SP</div>
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid #e5e7eb' }}>ЗДОРОВЬЕ КОМАНДЫ (SEMATIC)</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}><div style={{ fontSize: 32, fontWeight: 900, color: hc }}>{score}</div><div><div style={{ fontSize: 13, fontWeight: 700, color: hc }}>{score >= 70 ? 'Здоровая' : score >= 50 ? 'Внимание' : 'Риск'}</div><div style={{ fontSize: 11, color: '#6b7280' }}>Взвешенный Score</div></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>{Object.entries(sematic).map(([k, v]) => <div key={k} style={{ display: 'flex', gap: 6, alignItems: 'center' }}><div style={{ flex: 1, background: '#e5e7eb', borderRadius: 3, height: 5 }}><div style={{ background: v >= 70 ? '#22C55E' : v >= 50 ? '#F59E0B' : '#EF4444', height: '100%', width: `${v}%`, borderRadius: 3 }} /></div><span style={{ fontSize: 10, color: '#6b7280', width: 65 }}>{k}: <strong>{v}</strong></span></div>)}</div>
        </div>
        {overdue.length > 0 && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 10, marginBottom: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>⚠ Просрочено: {overdue.length}</div>{overdue.slice(0, 3).map((t: any) => <div key={t.id} style={{ fontSize: 11, color: '#7f1d1d' }}>• {t.title} — до {t.due}</div>)}</div>}
        <div style={{ marginTop: 20, paddingTop: 10, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af' }}><span>ProjectOS · {rdate}</span><span>Конфиденциально</span></div>
      </div>
      <div>
        <Card style={{ marginBottom: 12 }}>
          <SectionTitle>Параметры</SectionTitle>
          <Btn variant="primary" full onClick={() => { window.print(); setPrinted(true) }} style={{ padding: 10, marginBottom: 8 }}>⬇ PDF / Печать</Btn>
          {printed && <div style={{ fontSize: 11, color: C.green, textAlign: 'center' }}>Отправлено на печать</div>}
        </Card>
        <Card>
          <SectionTitle>Резюме</SectionTitle>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>Проект <strong>{project?.name}</strong> выполнен на <strong style={{ color: C.accent }}>{project?.progress}%</strong>. SEMATIC: <strong style={{ color: hc }}>{score}/100</strong>.{as && ` Спринт: ${Math.round(doneSP / (totalSP || 1) * 100)}%.`}{overdue.length > 0 && <span style={{ color: C.red }}> ⚠ {overdue.length} просрочено.</span>}</div>
        </Card>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 2: WORKSPACE + RBAC
// ─────────────────────────────────────────────────────────────────────────────
export function WorkspaceService() {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState('members')
  const [inv, setInv] = useState('')
  const [invRole, setInvRole] = useState('member')
  const [search, setSearch] = useState('')
  const [invSent, setInvSent] = useState<string|null>(null)
  const curRole = state.members.find((m: any) => m.name === state.currentUser?.name)?.role ?? 'viewer'
  const filtered = state.members.filter((m: any) => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()))
  const sendInv = () => {
    if (!inv.includes('@')) return
    const name = inv.split('@')[0]
    dispatch({ type: 'ADD_MEMBER', member: { id: uid(), name, email: inv, role: invRole, status: 'invited', joined: new Date().toISOString().slice(0, 10) } })
    dispatch({ type: 'ADD_NOTIF', notif: { id: uid(), type: 'assigned', title: `Приглашение отправлено: ${inv}`, time: new Date(), read: false } })
    setInvSent(inv); setInv(''); setTimeout(() => setInvSent(null), 3000)
  }
  const changeRole = (id: string, r: string) => {
    const m = state.members.find((x: any) => x.id === id)
    if (!m || !canDo(curRole, 'manage_roles')) return
    dispatch({ type: 'UPDATE_MEMBER', id, patch: { role: r }, logEntry: { id: uid(), changedBy: state.currentUser?.name ?? '', target: m.name, from: m.role, to: r, at: new Date().toISOString() } })
  }
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['members','invite','rbac','log'].map(t => <Btn key={t} small variant={tab === t ? 'primary' : 'default'} onClick={() => setTab(t)}>{{ members: 'Участники', invite: 'Пригласить', rbac: 'Права', log: 'Журнал' }[t]}</Btn>)}
      </div>
      {tab === 'members' && (
        <>
          <div style={{ marginBottom: 12 }}><Input value={search} onChange={setSearch} placeholder="Поиск…" /></div>
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 110px 90px 40px', fontSize: 11, color: C.textDim, fontWeight: 700, padding: '0 4px 8px', borderBottom: `1px solid ${C.border}`, gap: 10 }}><span>УЧАСТНИК</span><span>EMAIL</span><span>РОЛЬ</span><span>СТАТУС</span><span /></div>
            {filtered.map((m: any) => (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 110px 90px 40px', padding: '10px 4px', borderBottom: `1px solid ${C.border}22`, gap: 10, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Avatar name={m.name} size={30} /><div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.name}</div><div style={{ fontSize: 11, color: C.textDim }}>{m.joined}</div></div></div>
                <span style={{ fontSize: 11, color: C.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</span>
                <div>{canDo(curRole, 'manage_roles') && m.name !== state.currentUser?.name ? <Select value={m.role} onChange={v => changeRole(m.id, v)} options={Object.entries(ROLES).map(([k, r]) => ({ v: k, l: r.label }))} style={{ fontSize: 11, padding: '3px 6px' }} /> : <Badge label={m.role} />}</div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: m.status === 'active' ? C.green + '22' : C.amber + '22', color: m.status === 'active' ? C.green : C.amber, border: `1px solid ${m.status === 'active' ? C.green : C.amber}44` }}>{m.status === 'active' ? 'Активен' : 'Приглашён'}</span>
                <div>{canDo(curRole, 'manage_roles') && m.name !== state.currentUser?.name && <Btn variant="ghost" small onClick={() => dispatch({ type: 'REMOVE_MEMBER', id: m.id })} style={{ color: C.red, padding: '2px 6px' }}>✕</Btn>}</div>
              </div>
            ))}
          </Card>
        </>
      )}
      {tab === 'invite' && (
        <div style={{ maxWidth: 480 }}>
          {invSent && <div style={{ background: C.green + '22', border: `1px solid ${C.green}44`, borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: C.green }}>✓ Приглашение отправлено на {invSent}</div>}
          {!canDo(curRole, 'invite_members') && <div style={{ background: C.amber + '22', border: `1px solid ${C.amber}44`, borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: C.amber }}>⚠ Только Manager+ может приглашать</div>}
          <Card><SectionTitle>Пригласить по email</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input value={inv} onChange={setInv} placeholder="colleague@company.io" type="email" />
              <Select value={invRole} onChange={setInvRole} options={[{ v: 'viewer', l: 'Viewer — только чтение' }, { v: 'member', l: 'Member — задачи' }, { v: 'manager', l: 'Manager — проекты' }]} style={{ width: '100%' }} />
              <Btn variant="primary" onClick={sendInv} disabled={!canDo(curRole, 'invite_members') || !inv.includes('@')}>Отправить приглашение</Btn>
              <div style={{ fontSize: 11, color: C.textDim }}>Ссылка действует 48 часов</div>
            </div>
          </Card>
        </div>
      )}
      {tab === 'rbac' && (
        <Card><SectionTitle>Матрица прав</SectionTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr><th style={{ padding: '8px 12px', textAlign: 'left', color: C.textDim, fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>Разрешение</th>{Object.entries(ROLES).map(([k]) => <th key={k} style={{ padding: '8px 12px', textAlign: 'center', borderBottom: `1px solid ${C.border}` }}><Badge label={k} /></th>)}</tr></thead>
            <tbody>{Object.keys(PERMS).map(perm => <tr key={perm} style={{ borderBottom: `1px solid ${C.border}22` }}><td style={{ padding: '8px 12px', color: C.text, fontFamily: 'monospace', fontSize: 11 }}>{perm}</td>{Object.keys(ROLES).map(k => <td key={k} style={{ padding: '8px 12px', textAlign: 'center' }}>{canDo(k, perm as any) ? <span style={{ color: C.green }}>✓</span> : <span style={{ color: C.border }}>–</span>}</td>)}</tr>)}</tbody>
          </table>
        </Card>
      )}
      {tab === 'log' && (
        <Card><SectionTitle>Журнал изменений ролей</SectionTitle>
          {state.roleLog.length === 0 && <div style={{ fontSize: 13, color: C.textDim }}>Изменений нет</div>}
          {[...state.roleLog].reverse().map((e: any) => (
            <div key={e.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.border}22`, alignItems: 'flex-start' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{e.from ? '↻' : '＋'}</div>
              <div style={{ flex: 1, fontSize: 13, color: C.text }}>
                <strong>{e.changedBy}</strong>{' '}
                {e.from ? <span style={{ color: C.textDim }}>→ роль <strong style={{ color: C.text }}>{e.target}</strong>: <Badge label={e.from} /> → <Badge label={e.to} /></span> : <span style={{ color: C.textDim }}>пригласил <strong style={{ color: C.text }}>{e.target}</strong> как <Badge label={e.to} /></span>}
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{new Date(e.at).toLocaleString('ru-RU')}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE: GANTT
// ─────────────────────────────────────────────────────────────────────────────
export function GanttService() {
  const { state } = useApp()
  const { tasks, projects, sprints, activeProjectId } = state
  const [scale, setScale] = useState<'day'|'week'|'month'>('week')
  const project = projects.find((p: any) => p.id === activeProjectId)
  const ptasks  = tasks.filter((t: any) => t.pid === activeProjectId && t.due)
  const start   = new Date(project?.startDate ?? '2025-02-01')
  const end     = new Date(project?.endDate   ?? '2025-09-30')
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000)
  const cw   = scale === 'day' ? 28 : scale === 'week' ? 80 : 180
  const cols = scale === 'day' ? totalDays : scale === 'week' ? Math.ceil(totalDays / 7) : Math.ceil(totalDays / 30)
  const toPct = (d: string) => { const dt = new Date(d); return Math.max(0, Math.min(1, (dt.getTime() - start.getTime()) / (end.getTime() - start.getTime()))) }
  const colLabel = (i: number) => { const d = new Date(start); if (scale === 'day') { d.setDate(d.getDate() + i); return `${d.getDate()}/${d.getMonth()+1}` } if (scale === 'week') { d.setDate(d.getDate() + i * 7); return `W${Math.ceil((d.getTime() - new Date(d.getFullYear(),0,1).getTime())/604800000)}` } d.setMonth(d.getMonth() + i); return d.toLocaleString('en', { month: 'short' }) }
  const today = new Date(), todayPct = toPct(today.toISOString().slice(0,10))
  const tc: Record<string, string> = { epic: C.accent, story: C.amber, subtask: C.teal }
  const rowH = 34, headerH = 28, labelW = 180, chartW = cols * cw, chartH = ptasks.length * rowH + headerH
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: C.textDim }}>Масштаб:</span>
        {(['day','week','month'] as const).map(s => <Btn key={s} small variant={scale === s ? 'primary' : 'default'} onClick={() => setScale(s)}>{s}</Btn>)}
      </div>
      <div style={{ overflow: 'auto', border: `1px solid ${C.border}`, borderRadius: 8 }}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: labelW, flexShrink: 0, borderRight: `1px solid ${C.border}` }}>
            <div style={{ height: headerH, background: C.elevated, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 11, color: C.textDim, fontWeight: 700 }}>ЗАДАЧА</div>
            {ptasks.map((t: any, i: number) => <div key={t.id} style={{ height: rowH, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', borderBottom: `1px solid ${C.border}22`, background: i % 2 === 0 ? C.surface : C.bg }}><TypeIcon type={t.type} /><span style={{ fontSize: 11, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span></div>)}
          </div>
          <div style={{ position: 'relative', overflowX: 'auto', flex: 1 }}>
            <svg width={chartW} height={chartH} style={{ display: 'block' }}>
              {Array.from({ length: cols }, (_, i) => <g key={i}><rect x={i*cw} y={0} width={cw} height={chartH} fill={i%2===0?'transparent':C.surface+'44'}/><line x1={i*cw} y1={0} x2={i*cw} y2={chartH} stroke={C.border} strokeWidth={0.5}/><text x={i*cw+cw/2} y={headerH/2+4} textAnchor="middle" fontSize={8} fill={C.textDim} fontFamily="Inter,sans-serif">{colLabel(i)}</text></g>)}
              <line x1={0} y1={headerH} x2={chartW} y2={headerH} stroke={C.border} strokeWidth={1}/>
              {sprints.filter((s: any) => s.pid === activeProjectId).map((s: any) => { const sx = toPct(s.startDate)*chartW, ex = toPct(s.endDate)*chartW; return <g key={s.id}><rect x={sx} y={0} width={ex-sx} height={headerH-1} fill={s.status==='active'?C.accent+'22':C.border+'44'}/><text x={sx+4} y={11} fontSize={8} fill={s.status==='active'?C.accent:C.muted} fontFamily="Inter,sans-serif">{s.name}</text></g> })}
              {ptasks.map((t: any, i: number) => { const y=headerH+i*rowH, sp=sprints.find((s: any)=>s.id===t.sprintId), x1=toPct(sp?.startDate??project?.startDate)*chartW, x2=toPct(t.due)*chartW, bw=Math.max(x2-x1,4), col=tc[t.type]??C.muted, done=t.status==='done'; return <g key={t.id}><rect x={x1} y={y+6} width={bw} height={rowH-12} rx={3} fill={done?C.green+'55':col+'33'} stroke={done?C.green:col} strokeWidth={1}/>{bw>50&&<text x={x1+5} y={y+rowH/2+4} fontSize={8} fill={done?C.green:col} fontFamily="Inter,sans-serif">{t.title.slice(0,Math.floor(bw/7))}</text>}</g> })}
              {todayPct>0&&todayPct<1&&<g><line x1={todayPct*chartW} y1={0} x2={todayPct*chartW} y2={chartH} stroke={C.red} strokeWidth={1.5} strokeDasharray="4,3"/><text x={todayPct*chartW+3} y={headerH-4} fontSize={8} fill={C.red} fontFamily="Inter,sans-serif">Today</text></g>}
            </svg>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
        {[['Epic',C.accent],['Story',C.amber],['Subtask',C.teal],['Done',C.green],['Today',C.red]].map(([l,c])=><div key={l} style={{display:'flex',gap:5,alignItems:'center'}}><div style={{width:12,height:5,background:c+'88',border:`1px solid ${c}`,borderRadius:2}}/><span style={{fontSize:11,color:C.textDim}}>{l}</span></div>)}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE: CHATBOT (rule-based)
// ─────────────────────────────────────────────────────────────────────────────
export function ChatbotService() {
  const { state } = useApp()
  const [msgs, setMsgs] = useState([{ role: 'assistant', content: '👋 Привет! Я ассистент ProjectOS. Анализирую данные вашего проекта в реальном времени.\n\nСпросите о SEMATIC, спринте, задачах или команде. Напишите «помощь» для списка команд.' }])
  const [input, setInput] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])
  const { tasks, projects, sprints, sematic, activeProjectId } = state
  const ptasks = tasks.filter((t: any) => t.pid === activeProjectId)
  const as = sprints.find((s: any) => s.pid === activeProjectId && s.status === 'active')
  const stasks = as ? tasks.filter((t: any) => t.sprintId === as.id) : []
  const doneSP = stasks.filter((t: any) => t.status === 'done').reduce((s: number, t: any) => s + (t.sp||0), 0)
  const totalSP = stasks.reduce((s: number, t: any) => s + (t.sp||0), 0)
  const overdue = ptasks.filter((t: any) => t.due && new Date(t.due)<new Date() && t.status !== 'done')
  const score = sematicScore(sematic)
  const lf = Object.entries(sematic).sort((a,b)=>a[1]-b[1])[0]
  const bot = (q: string): string => {
    const ql = q.toLowerCase()
    if (/sematic|здоровь|команд|фактор|score/i.test(ql)) { const z=score>=70?'🟢 Норма':score>=50?'🟡 Риск':'🔴 Критично'; const srt=Object.entries(sematic).sort((a,b)=>a[1]-b[1]); return `📊 SEMATIC Score: ${score}/100 — ${z}\n\n🔻 Слабые:\n${srt.slice(0,2).map(([k,v])=>`• ${k}: ${v} — ${SEMATIC_RECS[k]?.[0]??''}`).join('\n')}\n\n✅ Сильные:\n${srt.slice(-2).reverse().map(([k,v])=>`• ${k}: ${v}`).join('\n')}` }
    for (const f of Object.keys(SEMATIC_RECS)) if (ql.includes(f.toLowerCase())) return `🎯 ${f}: ${sematic[f]}/100\n\n${sematic[f]<70?'⚠️ Требует внимания.':'✅ В норме.'} Рекомендации:\n${SEMATIC_RECS[f].map((r,i)=>`${i+1}. ${r}`).join('\n')}`
    if (/спринт|прогресс|velocity/i.test(ql)) { const pct=Math.round(doneSP/(totalSP||1)*100),dL=as?Math.ceil((new Date(as.endDate).getTime()-Date.now())/86400000):0; return `🏃 ${as?.name??'Нет активного спринта'}\nПрогресс: ${doneSP}/${totalSP} SP (${pct}%)\nОсталось: ${dL>0?`${dL} дн`:'завершён'}${pct<50&&dL<7?'\n\n⚠️ Риск не завершить спринт!':''}` }
    if (/просрочен|overdue|риск/i.test(ql)) return overdue.length===0?'✅ Просроченных задач нет!':`⚠️ Просрочено: ${overdue.length}\n\n${overdue.slice(0,4).map((t: any)=>`• [${t.priority.toUpperCase()}] ${t.title} — ${t.due}${t.assignee?` (${t.assignee})`:''}`).join('\n')}`
    if (/помощ|help/i.test(ql)) return `🤖 Команды:\n📊 «SEMATIC здоровье»\n🏃 «Как идёт спринт?»\n⚠️ «Просроченные задачи»\n🎯 «Как улучшить Safety / Trust…»`
    const tips = ['Попробуй: «Как идёт спринт?»','Напиши «помощь» для команд.','Спроси: «SEMATIC здоровье»']
    return `🤔 Не распознал. ${tips[Math.floor(Math.random()*3)]}`
  }
  const send = () => { if (!input.trim()) return; const u = { role: 'user', content: input }, r = { role: 'assistant', content: bot(input) }; setMsgs(p => [...p,u,r]); setInput('') }
  const quick = ['SEMATIC здоровье', 'Как идёт спринт?', 'Просроченные задачи', `Как улучшить ${lf?.[0]}?`]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', maxHeight: 680 }}>
      <Card style={{ marginBottom: 10, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[['SEMATIC',score,score>=70?C.green:score>=50?C.amber:C.red],['Sprint',`${Math.round(doneSP/(totalSP||1)*100)}%`,C.accent],['Просрочено',overdue.length,overdue.length?C.red:C.green],[`Слабый: ${lf?.[0]}`,lf?.[1],C.amber]].map(([l,v,c])=><div key={String(l)}><div style={{fontSize:10,color:C.textDim}}>{l}</div><div style={{fontSize:14,fontWeight:700,color:String(c)}}>{v}</div></div>)}
      </Card>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {quick.map(p => <button key={p} onClick={() => setInput(p)} style={{ background: C.accentDim+'55', border: `1px solid ${C.accent}44`, color: C.accent, borderRadius: 14, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{p}</button>)}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0', marginBottom: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            {m.role === 'assistant' ? <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>◈</div> : <Avatar name={state.currentUser?.name?.split(' ')[0] ?? 'U'} size={28} />}
            <div style={{ maxWidth: '76%', background: m.role === 'user' ? C.accentDim : C.elevated, border: `1px solid ${m.role === 'user' ? C.accent+'55' : C.border}`, borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px', padding: '9px 14px', fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.content}</div>
          </div>
        ))}
        <div ref={ref} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder="Задайте вопрос…" style={{ flex: 1, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
        <Btn variant="primary" onClick={send} disabled={!input.trim()}>Отправить ↑</Btn>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE: SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
export function SettingsService() {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ name: state.currentUser?.name ?? '', email: state.currentUser?.email ?? '', tz: 'Europe/Moscow', lang: 'ru' })
  const [mfa, setMfa] = useState(false)
  const [saved, setSaved] = useState(false)
  const fp = (k: string) => (v: string) => setProfile(p => ({ ...p, [k]: v }))
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 20 }}>
      <div>{[['profile','Профиль'],['security','Безопасность'],['workspace','Workspace'],['billing','Тарифы']].map(([id,l])=><div key={id} onClick={()=>setTab(id)} style={{padding:'8px 12px',borderRadius:7,cursor:'pointer',marginBottom:2,fontSize:13,background:tab===id?C.accentDim+'55':'transparent',color:tab===id?C.text:C.textDim,fontWeight:tab===id?600:400,borderLeft:tab===id?`2px solid ${C.accent}`:'2px solid transparent'}}>{l}</div>)}</div>
      <div>
        {tab === 'profile' && (
          <Card>
            {saved && <div style={{ background: C.green+'22', border: `1px solid ${C.green}44`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: C.green }}>✓ Сохранено</div>}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}><Avatar name={profile.name} size={56} /><Btn small>Фото</Btn></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div><div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Имя</div><Input value={profile.name} onChange={fp('name')} placeholder="Имя" /></div>
              <div><div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Email</div><Input value={profile.email} onChange={fp('email')} placeholder="Email" /></div>
              <div><div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Часовой пояс</div><Select value={profile.tz} onChange={fp('tz')} options={[{v:'Europe/Moscow',l:'Москва (UTC+3)'},{v:'UTC',l:'UTC+0'},{v:'America/New_York',l:'Нью-Йорк'}]} style={{ width: '100%' }} /></div>
              <div><div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Язык</div><Select value={profile.lang} onChange={fp('lang')} options={[{v:'ru',l:'Русский'},{v:'en',l:'English'}]} style={{ width: '100%' }} /></div>
            </div>
            <Btn variant="primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}>Сохранить</Btn>
          </Card>
        )}
        {tab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Card><SectionTitle>Смена пароля</SectionTitle><div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}><Input value="" onChange={() => {}} type="password" placeholder="Текущий пароль" /><Input value="" onChange={() => {}} type="password" placeholder="Новый пароль" /><Btn variant="primary" small>Изменить</Btn></div></Card>
            <Card><SectionTitle>MFA (AUTH-08)</SectionTitle>
              {!mfa ? <><div style={{ fontSize: 13, color: C.textDim, marginBottom: 12, lineHeight: 1.6 }}>Включите TOTP для дополнительного уровня защиты (Google Authenticator).</div><Btn variant="primary" onClick={() => setMfa(true)}>Включить MFA</Btn></> : <div style={{ background: C.green+'22', border: `1px solid ${C.green}44`, borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}><span style={{ fontSize: 18 }}>🔐</span><div><div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>MFA включена</div><div style={{ fontSize: 11, color: C.textDim }}>TOTP · Google Authenticator</div></div><Btn variant="danger" small onClick={() => setMfa(false)} style={{ marginLeft: 'auto' }}>Выключить</Btn></div>}
            </Card>
          </div>
        )}
        {tab === 'workspace' && (
          <Card><SectionTitle>Настройки Workspace</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Название</div><Input value={state.workspace?.name ?? ''} onChange={() => {}} placeholder="Название" /></div>
              <div><div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Slug</div><div style={{ display: 'flex', alignItems: 'center' }}><span style={{ background: C.surface, border: `1px solid ${C.border}`, borderRight: 'none', borderRadius: '7px 0 0 7px', padding: '8px 10px', fontSize: 12, color: C.textDim }}>app.projectos.io/</span><input value={state.workspace?.slug ?? ''} onChange={() => {}} style={{ flex: 1, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: '0 7px 7px 0', padding: '8px 12px', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /></div></div>
              <Btn variant="primary">Сохранить</Btn>
            </div>
          </Card>
        )}
        {tab === 'billing' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {Object.entries(PLANS).map(([k, p]) => (
                <div key={k} onClick={() => dispatch({ type: 'SET_PLAN', plan: k })} style={{ background: state.plan === k ? p.color+'22' : C.elevated, border: `2px solid ${state.plan === k ? p.color : C.border}`, borderRadius: 12, padding: 18, cursor: 'pointer' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: p.color }}>{p.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginTop: 4, marginBottom: 12 }}>{p.price === 0 ? 'Бесплатно' : `$${p.price}`}{p.price > 0 && <span style={{ fontSize: 11, color: C.textDim, fontWeight: 400 }}>/мес</span>}</div>
                  {state.plan === k ? <div style={{ fontSize: 12, fontWeight: 700, color: p.color }}>✓ Текущий план</div> : <Btn small variant="primary" style={{ width: '100%' }}>{k === 'free' ? 'Понизить' : 'Выбрать'}</Btn>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE 10: DOCS
// ─────────────────────────────────────────────────────────────────────────────
export function DocsService() {
  const [tab, setTab] = useState('stack')
  const [checks, setChecks] = useState<Record<string,boolean>>({})
  const STACK = [
    { layer: 'Frontend', color: C.accent, items: ['Next.js 14 + App Router','TypeScript 5.x','Tailwind CSS + shadcn/ui','Zustand','TanStack Query v5','dnd-kit (Kanban DnD)','Recharts + D3.js'] },
    { layer: 'Backend',  color: C.teal,   items: ['Node.js 22 LTS + Fastify 4','Prisma 5','Auth.js v5 (JWT + OAuth)','BullMQ (queues)','Zod (validation)'] },
    { layer: 'Data',     color: C.amber,  items: ['PostgreSQL 16 + pgvector','Redis 7 (cache + pub/sub)','AWS S3 / MinIO','Prometheus + Grafana'] },
    { layer: 'AI',       color: C.purple, items: ['Anthropic Claude API (claude-sonnet-4)','pgvector SEMATIC embeddings','Webhooks → Slack / Jira (v2)'] },
  ]
  const CICD = [{ s:'Lint',t:'ESLint+tsc',c:C.teal },{ s:'Unit',t:'Vitest',c:C.green },{ s:'Integration',t:'Vitest+Docker',c:C.accent },{ s:'Build',t:'Next.js',c:C.amber },{ s:'E2E',t:'Playwright',c:C.purple },{ s:'Staging',t:'Railway',c:C.orange },{ s:'Prod',t:'Vercel+Railway',c:C.red }]
  const NFR = [['API p95','<300ms','187ms',true],['LCP','<2.5s','1.8s',true],['AI token','<2s','1.4s',true],['DB p95','<100ms','61ms',true],['Uptime','99.5%','99.8%',true],['JWT TTL','15min','15min',true]] as const
  const ONBOARD = [{id:'o1',t:'git clone + cd projectos'},{id:'o2',t:'cp .env.example .env'},{id:'o3',t:'docker compose up -d'},{id:'o4',t:'pnpm install'},{id:'o5',t:'pnpm db:migrate && pnpm db:seed'},{id:'o6',t:'pnpm dev → localhost:3000'},{id:'o7',t:'open localhost:1080 (MailDev)'},{id:'o8',t:'pnpm test'}]
  const done = Object.values(checks).filter(Boolean).length
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['stack','cicd','nfr','onboarding'].map(t => <Btn key={t} small variant={tab===t?'primary':'default'} onClick={()=>setTab(t)}>{{ stack:'Tech Stack', cicd:'CI/CD', nfr:'NFR', onboarding:'Onboarding' }[t]}</Btn>)}
      </div>
      {tab === 'stack' && <div>{STACK.map(layer => <div key={layer.layer} style={{ marginBottom: 18 }}><div style={{ fontSize: 13, fontWeight: 800, color: layer.color, marginBottom: 8 }}>{layer.layer}</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{layer.items.map(i => <span key={i} style={{ background: layer.color+'15', color: layer.color, border: `1px solid ${layer.color}33`, borderRadius: 6, padding: '4px 10px', fontSize: 12 }}>{i}</span>)}</div></div>)}</div>}
      {tab === 'cicd' && (
        <div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
            {CICD.map((s, i) => <div key={s.s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}><div style={{ background: C.elevated, border: `1px solid ${s.c}`, borderRadius: 8, padding: '10px 14px', minWidth: 100, textAlign: 'center' }}><div style={{ fontSize: 13, fontWeight: 700, color: s.c }}>{s.s}</div><div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{s.t}</div></div>{i<CICD.length-1&&<div style={{ width: 20, textAlign: 'center', color: C.muted }}>→</div>}</div>)}
          </div>
          <Card><SectionTitle>Переменные окружения</SectionTitle><pre style={{ margin: 0, fontSize: 11, color: C.text, fontFamily: 'monospace', lineHeight: 1.7 }}>{`DATABASE_URL="postgresql://..."\nREDIS_URL="redis://localhost:6379"\nNEXTAUTH_SECRET="<32-byte-random>"\nANTHROPIC_API_KEY="sk-ant-..."\nRESEND_API_KEY="re_..."\nSENTRY_DSN="..."`}</pre></Card>
        </div>
      )}
      {tab === 'nfr' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{NFR.map(([l,target,actual,ok])=><div key={l} style={{background:C.elevated,border:`1px solid ${C.border}`,borderLeft:`3px solid ${ok?C.green:C.red}`,borderRadius:'0 8px 8px 0',padding:'10px 14px',display:'grid',gridTemplateColumns:'1fr auto',gap:6,alignItems:'center'}}><div><div style={{fontSize:12,fontWeight:700,color:C.text}}>{l}</div><div style={{fontSize:11,color:C.textDim}}>Цель: <span style={{color:C.amber}}>{target}</span> · Факт: <span style={{color:ok?C.green:C.red}}>{actual}</span></div></div><span style={{fontSize:16}}>{ok?'✅':'❌'}</span></div>)}</div>}
      {tab === 'onboarding' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><span style={{ fontSize: 13, color: C.textDim }}>Developer setup</span><span style={{ fontSize: 14, fontWeight: 700, color: done===ONBOARD.length?C.green:C.accent }}>{done}/{ONBOARD.length}</span></div>
          <div style={{ background: C.surface, borderRadius: 6, height: 6, marginBottom: 16 }}><div style={{ background: done===ONBOARD.length?C.green:C.accent, borderRadius: 6, height: '100%', width: `${done/ONBOARD.length*100}%`, transition: 'width .3s' }} /></div>
          {done===ONBOARD.length&&<div style={{textAlign:'center',fontSize:14,color:C.green,fontWeight:700,marginBottom:16}}>🎉 Готово! Добро пожаловать в ProjectOS.</div>}
          {ONBOARD.map((s,i)=><div key={s.id} onClick={()=>setChecks(p=>({...p,[s.id]:!p[s.id]}))} style={{display:'flex',gap:10,alignItems:'center',padding:'10px 14px',borderRadius:8,cursor:'pointer',marginBottom:6,background:checks[s.id]?C.green+'11':C.elevated,border:`1px solid ${checks[s.id]?C.green+'44':C.border}`}}>
            <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${checks[s.id]?C.green:C.border}`,background:checks[s.id]?C.green:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{checks[s.id]&&<span style={{color:'#fff',fontSize:11,fontWeight:900}}>✓</span>}</div>
            <span style={{fontSize:13,color:checks[s.id]?C.textDim:C.text,textDecoration:checks[s.id]?'line-through':'none'}}>{i+1}. {s.t}</span>
          </div>)}
        </div>
      )}
    </div>
  )
}
