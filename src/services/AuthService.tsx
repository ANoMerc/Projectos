import { useState } from 'react'
import { C } from '@/constants/theme'
import { Btn, Input } from '@/components/ui'
import type { User } from '@/store/types'

function PasswordStrength({ p }: { p: string }) {
  if (!p) return null
  let s = 0
  if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++
  const lbl = ['Слабый', 'Средний', 'Хороший', 'Отличный']
  const col = [C.red, C.amber, C.amber, C.green]
  return (
    <div style={{ marginTop: 5 }}>
      <div style={{ display: 'flex', gap: 3, marginBottom: 2 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < s ? col[s-1] : C.border }} />)}
      </div>
      <span style={{ fontSize: 11, color: col[s-1] ?? C.textDim }}>{s > 0 ? lbl[s-1] : 'Введите пароль'}</span>
    </div>
  )
}

function AuthShell({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 420, padding: 40, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, marginBottom: 6 }}>
            <span style={{ color: C.accent }}>Project</span><span style={{ color: C.text }}>OS</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>{title}</div>
          {sub && <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>{sub}</div>}
        </div>
        {children}
      </div>
    </div>
  )
}

function OAuthRow({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      {[['G', '#DB4437', 'Google'], ['⌥', '#24292e', 'GitHub']].map(([icon, col, name]) => (
        <button key={name} onClick={onLogin} style={{ flex: 1, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 0', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', color: C.text, fontSize: 13, fontWeight: 600 }}>
          <span style={{ color: col, fontWeight: 900, fontSize: 14 }}>{icon}</span>{name}
        </button>
      ))}
    </div>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ fontSize: 11, color: C.textDim }}>или email</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  )
}

interface Props { onSuccess: (user: User) => void }

export default function AuthService({ onSuccess }: Props) {
  const [screen, setScreen] = useState<'login' | 'register' | 'forgot' | 'mfa' | 'verify'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', agree: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mfaCode, setMfaCode] = useState('')
  const [mfaErr, setMfaErr] = useState('')
  const [sent, setSent] = useState(false)
  const f = (k: string) => (v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  const handleLogin = () => {
    const e: Record<string, string> = {}
    if (!form.email) e.email = 'Введите email'
    if (!form.password) e.password = 'Введите пароль'
    if (Object.keys(e).length) { setErrors(e); return }
    if (form.email === 'demo@projectos.io') { setScreen('mfa'); return }
    onSuccess({ name: 'Anna Koroleva', email: form.email, role: 'admin' })
  }

  const handleRegister = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Введите имя'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Некорректный email'
    if (form.password.length < 8) e.password = 'Минимум 8 символов'
    if (!form.agree) e.agree = 'Примите условия'
    if (Object.keys(e).length) { setErrors(e); return }
    setScreen('verify')
  }

  if (screen === 'mfa') return (
    <AuthShell title="Двухфакторная аутентификация" sub="Введите 6-значный код из приложения">
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 48 }}>🔐</div>
        <input value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000" maxLength={6}
          style={{ background: C.elevated, border: `1px solid ${mfaErr ? C.red : C.border}`, borderRadius: 8,
            padding: '12px 20px', color: C.text, fontSize: 24, fontFamily: 'monospace',
            outline: 'none', textAlign: 'center', letterSpacing: 10, width: 200 }} />
        {mfaErr && <div style={{ fontSize: 11, color: C.red }}>{mfaErr}</div>}
        <Btn variant="primary" onClick={() => { if (mfaCode.length === 6) onSuccess({ name: 'Anna Koroleva', email: form.email, role: 'admin' }); else setMfaErr('Введите 6 цифр') }}>Подтвердить</Btn>
        <span style={{ fontSize: 12, color: C.accent, cursor: 'pointer' }} onClick={() => setScreen('login')}>← Назад</span>
      </div>
    </AuthShell>
  )

  if (screen === 'verify') return (
    <AuthShell title="Проверьте email" sub={`Ссылка отправлена на ${form.email}`}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✉️</div>
        <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, marginBottom: 20 }}>Перейдите по ссылке в письме. Ссылка действует 24 часа.</div>
        <Btn variant="primary" full onClick={() => onSuccess({ name: form.name || 'New User', email: form.email, role: 'member' })}>Симулировать подтверждение →</Btn>
      </div>
    </AuthShell>
  )

  if (screen === 'forgot') return (
    <AuthShell title="Сброс пароля" sub="Отправим ссылку на email">
      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📨</div>
          <div style={{ fontSize: 13, color: C.textDim, marginBottom: 20, lineHeight: 1.6 }}>Ссылка отправлена на <strong style={{ color: C.text }}>{form.email}</strong>. Действует 1 час.</div>
          <Btn full onClick={() => setScreen('login')}>← Вернуться к входу</Btn>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input value={form.email} onChange={v => f('email')(v)} placeholder="Email" type="email" />
          <Btn variant="primary" full onClick={() => { if (form.email) setSent(true) }}>Отправить ссылку</Btn>
          <div style={{ textAlign: 'center' }}><span style={{ fontSize: 12, color: C.accent, cursor: 'pointer' }} onClick={() => setScreen('login')}>← Назад</span></div>
        </div>
      )}
    </AuthShell>
  )

  if (screen === 'register') return (
    <AuthShell title="Создать аккаунт" sub="Бесплатно · Без карты">
      <OAuthRow onLogin={() => onSuccess({ name: 'OAuth User', email: 'oauth@example.com', role: 'member' })} />
      <Divider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input value={form.name} onChange={v => f('name')(v)} placeholder="Имя и фамилия" error={errors.name} />
        <Input value={form.email} onChange={v => f('email')(v)} placeholder="Email" type="email" error={errors.email} />
        <div>
          <Input value={form.password} onChange={v => f('password')(v)} placeholder="Пароль" type="password" error={errors.password} />
          <PasswordStrength p={form.password} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div onClick={() => f('agree')(!form.agree)} style={{ width: 16, height: 16, borderRadius: 4, marginTop: 1, border: `2px solid ${errors.agree ? C.red : form.agree ? C.accent : C.border}`, background: form.agree ? C.accent : 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {form.agree && <span style={{ color: '#fff', fontSize: 10, fontWeight: 900 }}>✓</span>}
          </div>
          <span style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>Принимаю <span style={{ color: C.accent, cursor: 'pointer' }}>Условия</span> и <span style={{ color: C.accent, cursor: 'pointer' }}>Политику</span>{errors.agree && <div style={{ color: C.red, fontSize: 11 }}>{errors.agree}</div>}</span>
        </div>
        <Btn variant="primary" full onClick={handleRegister}>Создать аккаунт</Btn>
      </div>
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.textDim }}>
        Уже есть аккаунт?{' '}<span style={{ color: C.accent, cursor: 'pointer', fontWeight: 600 }} onClick={() => setScreen('login')}>Войти</span>
      </div>
    </AuthShell>
  )

  return (
    <AuthShell title="Добро пожаловать" sub="Войдите в свой аккаунт">
      <OAuthRow onLogin={() => onSuccess({ name: 'Anna Koroleva', email: 'anna@acme.io', role: 'admin' })} />
      <Divider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input value={form.email} onChange={v => f('email')(v)} placeholder="Email" type="email" error={errors.email} />
        <Input value={form.password} onChange={v => f('password')(v)} placeholder="Пароль" type="password" error={errors.password} />
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 12, color: C.accent, cursor: 'pointer' }} onClick={() => setScreen('forgot')}>Забыли пароль?</span>
        </div>
        <Btn variant="primary" full onClick={handleLogin}>Войти</Btn>
        <div style={{ fontSize: 11, color: C.textDim, textAlign: 'center' }}>Подсказка: demo@projectos.io — покажет MFA</div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.textDim }}>
        Нет аккаунта?{' '}<span style={{ color: C.accent, cursor: 'pointer', fontWeight: 600 }} onClick={() => setScreen('register')}>Регистрация</span>
      </div>
    </AuthShell>
  )
}
