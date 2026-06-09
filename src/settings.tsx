import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

/**
 * 전역 환경설정(톱니바퀴). localStorage 에 저장된다.
 * - fontScale: 글자 크기 배율 (0.8~1.5)
 * - font: 글꼴
 * - musicVolume: 배경음악 음량 (0~100)
 * - musicOn: 배경음악 재생 여부
 * (테마(다크/라이트)는 theme.ts 에서 따로 관리)
 */
export type FontChoice = 'mono' | 'sans' | 'serif'
export type Lang = 'ko' | 'en'

export interface Settings {
  lang: Lang
  fontScale: number
  font: FontChoice
  musicVolume: number
  musicOn: boolean
}

const DEFAULTS: Settings = { lang: 'ko', fontScale: 1, font: 'mono', musicVolume: 40, musicOn: false }
const KEY = 'settings'

const FONT_STACK: Record<FontChoice, string> = {
  mono: "'JetBrains Mono','Fira Code','D2Coding','Consolas','Malgun Gothic',monospace",
  sans: "'Pretendard','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif",
  serif: "'Nanum Myeongjo','Batang','Georgia',serif",
}

interface SettingsCtx extends Settings {
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

const Ctx = createContext<SettingsCtx | null>(null)

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    // ignore
  }
  return DEFAULTS
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>(load)

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setS((prev) => {
      const next = { ...prev, [key]: value }
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  // 글자 크기·글꼴을 CSS 변수로 적용
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--font-scale', String(s.fontScale))
    root.style.setProperty('--font-active', FONT_STACK[s.font])
  }, [s.fontScale, s.font])

  return <Ctx.Provider value={{ ...s, set }}>{children}</Ctx.Provider>
}

export function useSettings(): SettingsCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useSettings must be used within SettingsProvider')
  return c
}
