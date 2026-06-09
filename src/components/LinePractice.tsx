import { useEffect, useRef } from 'react'
import LiveStats from './LiveStats'
import Colored from './Colored'
import { useUnitDrill, type UnitComplete } from '../features/typing/useUnitDrill'

/**
 * 짧은글/긴글: 위에 현재 문장(글자별 색) → 바로 아래 입력칸(값 들어가는 것 확인)
 * → 그 아래 다음 문장 미리보기. 문장을 끝까지 치면 자동으로 다음 문장.
 */
export default function LinePractice({
  lines,
  title,
  onComplete,
}: {
  lines: string[]
  title: string
  onComplete: (r: UnitComplete) => void
}) {
  const drill = useUnitDrill(lines, 'line', onComplete)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <>
      <LiveStats cpm={drill.cpm} accuracy={drill.accuracy} progress={drill.progress} />

      <div className="line-practice">
        <div className="line-title">{title}</div>

        {/* 현재 문장: 글자별 색 */}
        <div className="line-current">
          <Colored text={drill.current} charStates={drill.charStates} />
        </div>

        {/* 입력칸: 실제 친 값이 보임 */}
        <textarea
          ref={inputRef}
          className="typing-input line-input"
          rows={1}
          placeholder=""
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          {...drill.inputProps}
        />

        {/* 다음 문장 미리보기 */}
        <div className="line-preview">
          {drill.upcoming.map((l, i) => (
            <div key={i} className="line-next" style={{ opacity: 0.7 - i * 0.18 }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      <div className="hint-bar">
        <span>
          <b>{title}</b> · {Math.min(drill.pos + 1, drill.total)}/{drill.total}문장
        </span>
        <span className="hint-keys">
          <kbd>Enter</kbd> 다음 줄 · <kbd>Esc</kbd> 다시
        </span>
      </div>
    </>
  )
}
