import { lazy, Suspense, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import Practice from './pages/Practice'
import { applyTheme, getInitialTheme, type Theme } from './theme'

// 기록 페이지(차트 라이브러리 Recharts 포함)는 방문할 때만 불러온다.
const Records = lazy(() => import('./pages/Records'))

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }

  return (
    <div className="app">
      <header className="header">
        <NavLink to="/" className="logo">
          한타<span className="blink">_</span>
        </NavLink>
        <nav className="nav">
          <NavLink to="/" end>
            연습
          </NavLink>
          <NavLink to="/records">기록</NavLink>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            type="button"
            aria-label="테마 전환"
            title={theme === 'dark' ? '라이트 모드로' : '다크 모드로'}
          >
            {theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}
          </button>
        </nav>
      </header>

      <Suspense fallback={<div className="card empty">로딩 중…</div>}>
        <Routes>
          <Route path="/" element={<Practice />} />
          <Route path="/records" element={<Records />} />
        </Routes>
      </Suspense>
    </div>
  )
}
