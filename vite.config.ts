import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// 보안 헤더(CSP) — 빌드 결과물에만 주입한다.
// GitHub Pages는 HTTP 응답 헤더를 설정할 수 없으므로 <meta>로 박아넣는다.
// 프로덕션 번들은 인라인 스크립트가 없으므로 script-src 'self' 로 엄격하게 막을 수 있다.
// (개발 서버는 react-refresh 인라인 스크립트/HMR을 쓰므로 이 플러그인을 build 에만 적용)
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // React/Recharts 인라인 style 속성 허용 (XSS 위험 낮음)
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ')

function cspPlugin(): Plugin {
  return {
    name: 'inject-csp',
    apply: 'build',
    transformIndexHtml(html) {
      const tag = `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`
      return html.replace('</title>', `</title>\n    ${tag}`)
    },
  }
}

// 커스텀 도메인(taja.novice-22.com)에서 사이트는 루트(/)로 제공되므로 base 는 '/'.
// (저장소 경로 novice-22.github.io/taja/ 로 쓸 땐 '/taja/' 로 되돌린다.)
export default defineConfig({
  base: '/',
  plugins: [react(), cspPlugin()],
})
