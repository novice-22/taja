import { useSettings, type FontChoice } from '../settings'
import type { Theme } from '../theme'

const FONTS: { key: FontChoice; label: string }[] = [
  { key: 'mono', label: '고정폭' },
  { key: 'sans', label: '고딕' },
  { key: 'serif', label: '명조' },
]

export default function SettingsModal({
  open,
  onClose,
  theme,
  onToggleTheme,
}: {
  open: boolean
  onClose: () => void
  theme: Theme
  onToggleTheme: () => void
}) {
  const s = useSettings()
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2>⚙ 설정</h2>

        {/* 언어(한글/영어) — 모든 연습에 적용 */}
        <div className="set-row">
          <label>언어 (한/영)</label>
          <div className="seg">
            <button
              type="button"
              className={`seg-btn${s.lang === 'ko' ? ' active' : ''}`}
              onClick={() => s.set('lang', 'ko')}
            >
              한글
            </button>
            <button
              type="button"
              className={`seg-btn${s.lang === 'en' ? ' active' : ''}`}
              onClick={() => s.set('lang', 'en')}
            >
              English
            </button>
          </div>
        </div>

        {/* 테마 */}
        <div className="set-row">
          <label>테마</label>
          <button className="btn" type="button" onClick={onToggleTheme}>
            {theme === 'dark' ? '☾ 다크' : '☀ 라이트'}
          </button>
        </div>

        {/* 글자 크기 */}
        <div className="set-row">
          <label>글자 크기</label>
          <div className="set-control">
            <input
              type="range"
              min={0.8}
              max={1.5}
              step={0.05}
              value={s.fontScale}
              onChange={(e) => s.set('fontScale', Number(e.target.value))}
            />
            <span className="set-val">{Math.round(s.fontScale * 100)}%</span>
          </div>
        </div>

        {/* 글꼴 */}
        <div className="set-row">
          <label>글꼴</label>
          <div className="seg">
            {FONTS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`seg-btn${s.font === f.key ? ' active' : ''}`}
                onClick={() => s.set('font', f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 배경음악 음량 */}
        <div className="set-row">
          <label>음악 음량</label>
          <div className="set-control">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={s.musicVolume}
              onChange={(e) => s.set('musicVolume', Number(e.target.value))}
            />
            <span className="set-val">{s.musicVolume}</span>
          </div>
        </div>

        <div className="btn-row" style={{ justifyContent: 'center', marginTop: 16 }}>
          <button className="btn primary" type="button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
