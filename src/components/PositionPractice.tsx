import { useMemo } from 'react'
import LiveStats from './LiveStats'
import { usePositionDrill, type PosComplete } from '../features/typing/usePositionDrill'
import { toChars } from '../features/typing/hangul'
import { useSettings } from '../settings'

/**
 * 자리연습: 자모/키를 가로 큐로 보여준다(현재 크게, 다음은 흐리게).
 * - PC: 물리 키(keydown)로 판정 (입력칸 없음)
 * - 모바일(터치): 입력칸으로 받아 판정 (소프트 키보드는 물리 키 정보를 안 주기 때문)
 */
export default function PositionPractice({
  seq,
  onComplete,
}: {
  seq: string[]
  onComplete: (r: PosComplete) => void
}) {
  const { lang } = useSettings()
  const drill = usePositionDrill(seq, lang, onComplete)
  const progress = drill.total === 0 ? 0 : Math.round((drill.pos / drill.total) * 100)

  // 터치 기기 여부(소프트 키보드) — 한 번만 판정
  const isTouch = useMemo(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches,
    [],
  )

  return (
    <>
      <LiveStats cpm={drill.cpm} accuracy={drill.accuracy} progress={progress} />

      <div className="stage-main">
        <div className="jamo-queue">
          <div className={`jamo-current${drill.wrong ? ' wrong' : ''}`}>
            <div className="jamo-big">{drill.current}</div>
          </div>
          <div className="jamo-upcoming">
            {drill.upcoming.map((j, i) => (
              <span key={i} className="jamo-next" style={{ opacity: 1 - i * 0.16 }}>
                {j}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 모바일: 입력칸으로 키 입력을 받는다 (한 글자 입력 → 판정 → 비움) */}
      {isTouch && (
        <input
          className="typing-input"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="여기를 눌러 위 글자를 입력하세요"
          onInput={(e) => {
            const chars = toChars(e.currentTarget.value)
            const last = chars[chars.length - 1]
            if (last && last.trim()) drill.press(lang === 'en' ? last.toLowerCase() : last)
            e.currentTarget.value = ''
          }}
        />
      )}

      <div className="hint-bar">
        <span>
          {isTouch ? '위 글자를 입력' : '키를 누르세요'} ·{' '}
          {Math.min(drill.pos + 1, drill.total)}/{drill.total}
        </span>
        <span className="hint-keys">틀린 키는 빨갛게 · 맞아야 다음으로</span>
      </div>
    </>
  )
}
