import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { applyTheme, getInitialTheme } from './theme'
import { SettingsProvider } from './settings'

// 첫 페인트 전에 테마를 적용해 깜빡임 방지
applyTheme(getInitialTheme())

// GitHub Pages 에서 새로고침 시 404 가 나지 않도록 HashRouter 사용 (#/records 형태)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </SettingsProvider>
  </StrictMode>,
)
