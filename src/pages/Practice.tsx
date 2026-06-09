import { useCallback, useEffect, useMemo, useState } from 'react'
import ModeTabs from '../components/ModeTabs'
import ResultModal from '../components/ResultModal'
import PositionPractice from '../components/PositionPractice'
import TokenPractice from '../components/TokenPractice'
import LinePractice from '../components/LinePractice'
import { saveRecord } from '../features/records/recordStore'
import { makeJamoSeq, POS_CATEGORIES, type PosCategory } from '../data/positions'
import {
  LONG_TOPIC_NAMES,
  makeLong,
  makeShort,
  makeWords,
  SHORT_TOPIC_NAMES,
  WORD_THEME_NAMES,
} from '../data/sentences'
import type { Mode } from '../types'

interface Completion {
  speed: number
  accuracy: number
  elapsedMs: number
  errors: number
}

export default function Practice() {
  const [mode, setMode] = useState<Mode>('낱말')
  const [index, setIndex] = useState(0)
  const [attempt, setAttempt] = useState(0) // 다시하기용 리마운트 키
  const [category, setCategory] = useState<PosCategory>('기본자리')
  const [theme, setTheme] = useState<string>(WORD_THEME_NAMES[0])
  const [shortTopic, setShortTopic] = useState<string>(SHORT_TOPIC_NAMES[0])
  const [longTopic, setLongTopic] = useState<string>(LONG_TOPIC_NAMES[0])
  const [result, setResult] = useState<Completion | null>(null)

  const seq = useMemo(() => makeJamoSeq(category, index), [category, index])
  const words = useMemo(() => makeWords(theme, index), [theme, index])
  const shortLines = useMemo(() => makeShort(shortTopic, index), [shortTopic, index])
  const longText = useMemo(() => makeLong(longTopic, index), [longTopic, index])

  const handleComplete = useCallback(
    (info: Completion) => {
      setResult(info)
      void saveRecord({ speed: info.speed, accuracy: info.accuracy, mode })
    },
    [mode],
  )

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m)
    setIndex(0)
    setAttempt(0)
    setResult(null)
  }, [])

  const handleRetry = useCallback(() => {
    setResult(null)
    setAttempt((a) => a + 1)
  }, [])

  const handleNext = useCallback(() => {
    setResult(null)
    setIndex((i) => i + 1)
  }, [])

  // 서브탭(주제/자리) 변경 공통 처리
  const pickSub = useCallback((fn: () => void) => {
    fn()
    setAttempt(0)
    setIndex(0)
    setResult(null)
  }, [])

  // Esc=다시 / 완료 후 Enter=다음
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleRetry()
      } else if (e.key === 'Enter' && result) {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleRetry, handleNext, result])

  // 모드별 자식 (key 가 바뀌면 리마운트 = 초기화)
  const childKey = `${mode}-${category}-${theme}-${shortTopic}-${longTopic}-${index}-${attempt}`
  let child: React.ReactNode
  let subTabs: { items: readonly string[]; value: string; onPick: (v: string) => void } | null = null

  if (mode === '자리연습') {
    child = <PositionPractice key={childKey} seq={seq} onComplete={handleComplete} />
    subTabs = { items: POS_CATEGORIES, value: category, onPick: (v) => pickSub(() => setCategory(v as PosCategory)) }
  } else if (mode === '낱말') {
    child = <TokenPractice key={childKey} words={words} onComplete={handleComplete} />
    subTabs = { items: WORD_THEME_NAMES, value: theme, onPick: (v) => pickSub(() => setTheme(v)) }
  } else if (mode === '짧은글') {
    child = <LinePractice key={childKey} lines={shortLines} title="짧은글" onComplete={handleComplete} />
    subTabs = { items: SHORT_TOPIC_NAMES, value: shortTopic, onPick: (v) => pickSub(() => setShortTopic(v)) }
  } else {
    child = (
      <LinePractice
        key={childKey}
        lines={longText.lines}
        title={`긴글 · ${longText.title}`}
        onComplete={handleComplete}
      />
    )
    subTabs = { items: LONG_TOPIC_NAMES, value: longTopic, onPick: (v) => pickSub(() => setLongTopic(v)) }
  }

  return (
    <div className="card practice-stage">
      <ModeTabs value={mode} onChange={handleModeChange} />

      {subTabs && (
        <div className="sub-tabs">
          {subTabs.items.map((c) => (
            <button
              key={c}
              type="button"
              className={`sub-tab${c === subTabs!.value ? ' active' : ''}`}
              onClick={() => subTabs!.onPick(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {child}

      {result && (
        <ResultModal
          speed={result.speed}
          accuracy={result.accuracy}
          errors={result.errors}
          elapsedSec={result.elapsedMs / 1000}
          onRetry={handleRetry}
          onNext={handleNext}
        />
      )}
    </div>
  )
}
