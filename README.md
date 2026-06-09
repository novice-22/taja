# 타자연습 (taja)

서버 없이 브라우저만으로 동작하는 한글 타자연습 웹앱. GitHub Pages에 정적 배포한다.
사이트: https://taja.novice-22.com

## 기술 스택

- **React + Vite + TypeScript** — 글자별 부분 렌더링(memo)로 빠르게, 빌드 시 타입 오류 차단
- **es-hangul** — 한글 자모 분해(타수 측정용)
- **react-router (HashRouter)** — 새로고침 404 없는 페이지 전환
- **Recharts** — 통계 그래프 (기록 페이지에서만 지연 로딩)
- **localStorage** — 서버 없이 기록 저장

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:5173/hantype/ 에서 미리보기
npm run build    # 타입체크 + 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과물을 로컬에서 확인
```

## 구조 (핵심 규칙)

- `src/features/typing/` — 타자 측정 엔진. **모든 측정은 100% 브라우저에서.**
  - `hangul.ts` 자모 분해/타수 계산 · `metrics.ts` 정확도/CPM · `useTyping.ts` IME(조합) 이벤트 처리
- `src/features/records/recordStore.ts` — **기록 저장은 오직 여기서만.**
  `localStorage` 직접 호출 금지, `saveRecord()/loadRecords()` 만 사용.
  모든 함수가 `async` 라 나중에 함수 안쪽만 `fetch` 로 바꾸면 서버 전환 끝.

## 보안 (시큐어 코딩)

서버가 없어 실질 위협은 XSS 하나. 적용한 방어:

- React 기본 이스케이프 + `dangerouslySetInnerHTML` **미사용**
- 프로덕션 빌드에 **Content-Security-Policy** 메타 주입 (`vite.config.ts`)
- localStorage / JSON 백업 불러오기 데이터 **형식 검증**(`sanitizeRecords`) 후에만 사용
- `referrer: no-referrer`

## 배포 (GitHub Pages)

1. `vite.config.ts` 의 `base` 를 저장소 이름에 맞춘다.
   - 프로젝트 페이지: `base: '/저장소이름/'`
   - 사용자 페이지(`username.github.io`)·커스텀 도메인: `base: '/'`
2. GitHub 저장소 → Settings → Pages → Source 를 **GitHub Actions** 로 설정.
3. `main` 브랜치에 push → `.github/workflows/deploy.yml` 가 자동 빌드·배포.

## 저작권 / 라이선스

© 2026 novice-22. All rights reserved. (모든 권리 보유)

본 저장소의 소스 코드·디자인은 **독점 라이선스**이며, 저작권자의 사전 서면 허가 없이
복제·수정·배포·사용을 **금지**합니다. 자세한 내용은 [LICENSE](LICENSE) 참조.
(애국가·서시·진달래꽃 등 일부 텍스트는 저작권 만료된 공용 콘텐츠입니다.)
