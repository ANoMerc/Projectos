export const C = {
  bg:        '#0F1117',
  surface:   '#171B26',
  elevated:  '#1E2333',
  border:    '#2A2F42',
  accent:    '#5B6EF5',
  accentDim: '#2D3580',
  green:     '#22C55E',
  amber:     '#F59E0B',
  red:       '#EF4444',
  purple:    '#A855F7',
  teal:      '#14B8A6',
  orange:    '#F97316',
  muted:     '#4A5068',
  text:      '#E8EAF0',
  textDim:   '#8B91A8',
} as const

export const ROLES = {
  viewer:  { label: 'Viewer',  color: C.muted,   level: 0 },
  member:  { label: 'Member',  color: C.teal,    level: 1 },
  manager: { label: 'Manager', color: C.accent,  level: 2 },
  admin:   { label: 'Admin',   color: C.purple,  level: 3 },
} as const

export const PERMS = {
  view_project:   [0,1,2,3],
  create_task:    [1,2,3],
  edit_project:   [2,3],
  run_sematic:    [2,3],
  invite_members: [2,3],
  manage_roles:   [3],
  billing:        [3],
} as const

export const canDo = (role: string, perm: keyof typeof PERMS): boolean => {
  const lvl = ROLES[role as keyof typeof ROLES]?.level ?? -1
  return (PERMS[perm] as readonly number[]).includes(lvl)
}

export const PLANS = {
  free: { label: 'Free',  price: 0,  color: C.muted   },
  pro:  { label: 'Pro',   price: 12, color: C.accent  },
  team: { label: 'Team',  price: 29, color: C.purple  },
} as const

export const KANBAN_COLS = [
  { id: 'todo',        label: 'Backlog',      wip: null },
  { id: 'in_progress', label: 'In Progress',  wip: 3   },
  { id: 'review',      label: 'Review',       wip: 2   },
  { id: 'done',        label: 'Done',         wip: null },
] as const

export const NOTIF_TYPES = {
  assigned: { icon: '→', color: C.accent, label: 'Назначена задача' },
  status:   { icon: '●', color: C.teal,   label: 'Статус изменён'  },
  deadline: { icon: '⏰', color: C.amber, label: 'Дедлайн через 24ч' },
  overdue:  { icon: '!', color: C.red,    label: 'Просрочено'      },
  mention:  { icon: '@', color: C.purple, label: '@Упоминание'     },
  comment:  { icon: '◻', color: C.green,  label: 'Комментарий'     },
  sprint:   { icon: '▶', color: C.accent, label: 'Спринт'          },
} as const

export const SEMATIC_WEIGHTS: Record<string, number> = {
  Safety: 0.20, Engagement: 0.15, Meaning: 0.15,
  Autonomy: 0.10, Trust: 0.20, Information: 0.10, Clarity: 0.10,
}

export const SEMATIC_RECS: Record<string, string[]> = {
  Safety:      ['Blameless postmortems', 'Ретроспективы без осуждения', 'Поощряй открытые вопросы'],
  Engagement:  ['Автономия в задачах', 'Innovation sprint', 'Контекст влияния работы'],
  Meaning:     ['Связь с бизнес-метриками', 'Реальный фидбек пользователей', 'Истории о пользе продукта'],
  Autonomy:    ['Меньше микроменеджмента', 'Команда выбирает технологии', 'Сократи согласования'],
  Trust:       ['Выполняй дедлайны', 'Decision log публично', 'Признавай ошибки открыто'],
  Information: ['Еженедельный апдейт', 'Общий changelog', 'Демо в конце спринта'],
  Clarity:     ['Definition of Done письменно', 'Критерии приёмки на planning', 'Роли в README'],
}
