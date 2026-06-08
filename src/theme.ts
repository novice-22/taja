// UI 테마(다크/라이트) 토글. 기록(record)이 아닌 화면 환경설정이라 여기서 간단히 다룬다.
export type Theme = 'dark' | 'light'

const KEY = 'theme'

export function getInitialTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY)
    if (t === 'dark' || t === 'light') return t
  } catch {
    // 접근 불가(프라이빗 모드 등) → 기본값
  }
  return 'dark' // 해커 느낌이 기본
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // 저장 실패는 무시 (테마는 새로고침 시 기본값으로 돌아갈 뿐)
  }
}
