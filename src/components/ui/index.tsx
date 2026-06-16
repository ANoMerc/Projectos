import { C } from '@/constants/theme'
import type { CSSProperties, ReactNode } from 'react'

// ── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const hue = name ? (name.charCodeAt(0) * 37) % 360 : 200
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,42%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {(name || '?').slice(0, 2).toUpperCase()}
    </div>
  )
}

// ── StatusDot ───────────────────────────────────────────────────────────────
export function StatusDot({ status }: { status: string }) {
  const m: Record<string, string> = { todo: C.muted, in_progress: C.accent, review: C.amber, done: C.green }
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: m[status] ?? C.muted, display: 'inline-block', flexShrink: 0 }} />
}

// ── TypeIcon ─────────────────────────────────────────────────────────────────
export function TypeIcon({ type }: { type: string }) {
  const m: Record<string, [string, string]> = { epic: ['⬡', C.accent], story: ['◆', C.amber], subtask: ['▸', C.muted] }
  const [icon, color] = m[type] ?? ['●', C.muted]
  return <span style={{ color, fontSize: type === 'epic' ? 13 : 11, flexShrink: 0 }}>{icon}</span>
}

// ── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label }: { label: string }) {
  const m: Record<string, string> = { critical: '#C026D3', high: C.red, medium: C.amber, low: '#3B82F6', manager: C.accent, member: C.teal, viewer: C.muted, admin: C.purple, active: C.green, planning: C.accent, paused: C.amber }
  const bg = m[label] ?? C.muted
  return (
    <span style={{ background: bg + '25', color: bg, border: `1px solid ${bg}55`,
      borderRadius: 4, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{label}</span>
  )
}

// ── Btn ──────────────────────────────────────────────────────────────────────
type BtnVariant = 'default' | 'primary' | 'ghost' | 'danger' | 'success'
interface BtnProps {
  children: ReactNode; onClick?: () => void; variant?: BtnVariant
  small?: boolean; full?: boolean; disabled?: boolean; style?: CSSProperties
}
export function Btn({ children, onClick, variant = 'default', small, full, disabled, style: s }: BtnProps) {
  const vs: Record<BtnVariant, CSSProperties> = {
    default: { background: C.elevated, color: C.text, border: `1px solid ${C.border}` },
    primary: { background: C.accent, color: '#fff', border: 'none' },
    ghost:   { background: 'transparent', color: C.textDim, border: 'none' },
    danger:  { background: C.red + '22', color: C.red, border: `1px solid ${C.red}44` },
    success: { background: C.green + '22', color: C.green, border: `1px solid ${C.green}44` },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
      borderRadius: 7, fontWeight: 600, transition: 'all .15s',
      padding: small ? '5px 12px' : '8px 16px', fontSize: small ? 12 : 13,
      opacity: disabled ? 0.5 : 1, width: full ? '100%' : undefined, ...vs[variant], ...s,
    }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.opacity = '0.82' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}>
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps {
  value: string; onChange: (v: string) => void; placeholder?: string
  type?: string; style?: CSSProperties; error?: string
}
export function Input({ value, onChange, placeholder, type = 'text', style: s, error }: InputProps) {
  return (
    <>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ background: C.elevated, border: `1px solid ${error ? C.red : C.border}`, borderRadius: 7,
          padding: '8px 12px', color: C.text, fontSize: 13, fontFamily: 'inherit',
          outline: 'none', width: '100%', boxSizing: 'border-box', ...s }} />
      {error && <div style={{ fontSize: 11, color: C.red, marginTop: 2 }}>{error}</div>}
    </>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps {
  value: string; onChange: (v: string) => void
  options: { v: string; l: string }[]; style?: CSSProperties
}
export function Select({ value, onChange, options, style: s }: SelectProps) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 7,
        padding: '7px 10px', color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', ...s }}>
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style: s }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, ...s }}>{children}</div>
}

// ── SectionTitle ──────────────────────────────────────────────────────────────
export function SectionTitle({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 800, color: C.textDim, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 12 }}>{children}</div>
}

// ── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 38, height: 21, borderRadius: 11,
      background: value ? C.accent : C.border, position: 'relative', cursor: 'pointer',
      transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2.5, left: value ? 19 : 2.5, width: 16, height: 16,
        borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
    </div>
  )
}

// ── SEMATICRadar ──────────────────────────────────────────────────────────────
export function SEMATICRadar({ data, size = 220 }: { data: Record<string, number>; size?: number }) {
  const keys = Object.keys(data), n = keys.length, cx = size / 2, cy = size / 2, R = size * 0.38
  const pts = keys.map((k, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2, v = data[k] / 100
    return { vx: cx + R * v * Math.cos(a), vy: cy + R * v * Math.sin(a), ax: cx + R * Math.cos(a), ay: cy + R * Math.sin(a), lx: cx + (R + 18) * Math.cos(a), ly: cy + (R + 18) * Math.sin(a), k, val: data[k] }
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[.25, .5, .75, 1].map(r => <polygon key={r} points={keys.map((_, i) => { const a = (i / n) * 2 * Math.PI - Math.PI / 2; return `${cx + R * r * Math.cos(a)},${cy + R * r * Math.sin(a)}` }).join(' ')} fill="none" stroke={C.border} strokeWidth={1} />)}
      {pts.map(p => <line key={p.k} x1={cx} y1={cy} x2={p.ax} y2={p.ay} stroke={C.border} strokeWidth={1} />)}
      <polygon points={pts.map(p => `${p.vx},${p.vy}`).join(' ')} fill={C.accent + '30'} stroke={C.accent} strokeWidth={2} />
      {pts.map(p => <g key={p.k}><circle cx={p.vx} cy={p.vy} r={3.5} fill={C.accent} /><text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" fontSize={8.5} fill={C.textDim} fontFamily="Inter,sans-serif">{p.k}</text><text x={p.lx} y={p.ly + 10} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill={C.accent} fontFamily="Inter,sans-serif" fontWeight={700}>{p.val}</text></g>)}
    </svg>
  )
}
