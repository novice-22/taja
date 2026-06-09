import { useEffect, useRef } from 'react'
import LiveStats from './LiveStats'
import Colored from './Colored'
import { useUnitDrill, type UnitComplete } from '../features/typing/useUnitDrill'

/**
 * 낱말연습: 현재 단어를 크게(글자별 색) + 다음 단어들 흐리게, 아래 입력칸.
 * 단어 치고 스페이스/엔터로 다음.
 */
export default function TokenPractice({
  words,
  onComplete,
}: {
  words: string[]
  onComplete: (r: UnitComplete) => void
}) {
  const drill = useUnitDrill(words, 'token', onComplete)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <>
      <LiveStats cpm={drill.cpm} accuracy={drill.accuracy} progress={drill.progress} />

      <div className="stage-main">
        <div className="word-queue">
          <div className="word-current">
            <div className="word-big">
              <Colored text={drill.current} charStates={drill.charStates} />
            </div>
          </div>
          <div className="word-upcoming">
            {drill.upcoming.map((w, i) => (
              <span key={i} className="word-next" style={{ opacity: 1 - i * 0.15 }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      <textarea
        ref={inputRef}
        className="typing-input flow-input"
        rows={1}
        placeholder="> 단어 입력 후 Space/Enter"
        autoFocus
        spellCheck={false}
        autoComplete="off"
        {...drill.inputProps}
      />

      <div className="hint-bar">
        <span>
          <b>낱말</b> · {Math.min(drill.pos + 1, drill.total)}/{drill.total}
        </span>
        <span className="hint-keys">
          <kbd>Enter</kbd> 다음 단어 &nbsp; <kbd>Esc</kbd> 다시
        </span>
      </div>
    </>
  )
}
