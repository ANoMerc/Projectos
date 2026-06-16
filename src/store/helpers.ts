import { SEMATIC_WEIGHTS } from '@/constants/theme'

export const uid = () => Math.random().toString(36).slice(2, 8)

export const pertMu  = ({ O, M, P }: { O: number; M: number; P: number }) => (O + 4 * M + P) / 6
export const pertSig = ({ O, M, P }: { O: number; M: number; P: number }) => (P - O) / 6

export const sematicScore = (data: Record<string, number>) =>
  Math.round(Object.entries(data).reduce((s, [k, v]) => s + v * (SEMATIC_WEIGHTS[k] ?? 0.14), 0))

export const timeAgo = (d: Date | string): string => {
  const diff = (Date.now() - new Date(d).getTime()) / 1000
  if (diff < 60)    return 'только что'
  if (diff < 3600)  return `${Math.floor(diff / 60)}м назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)}ч назад`
  return `${Math.floor(diff / 86400)}д назад`
}
