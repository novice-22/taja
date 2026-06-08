import { useCallback, useEffect, useMemo, useState } from 'react'
import ModeTabs from '../components/ModeTabs'
import ResultModal from '../components/ResultModal'
import PositionPractice from '../components/PositionPractice'
import TokenPractice from '../components/TokenPractice'
import LinePractice from '../components/LinePractice'
import { saveRecord } from '../features/records/recordStore'
import { makeJamoSeq, POS_CATEGORIES, type PosCategory } from '../data/positions'
import { makeLines, makeWords, WORD_THEME_NAMES } from '../data/sentences'
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
  const [result, setResult] = useState<Completion | null>(null)

  const seq = useMemo(() => makeJamoSeq(category, index), [category, index])
  const words = useMemo(() => makeWords(theme, index), [theme, index])
  const lines = useMemo(
    () => (mode === '짧은글' || mode === '긴글' ? makeLines(mode, index) : []),
    [mode, index],
  )

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
  const childKey = `${mode}-${category}-${theme}-${index}-${attempt}`
  let child: React.ReactNode
  if (mode === '자리연습') {
    child = <PositionPractice key={childKey} seq={seq} onComplete={handleComplete} />
  } else if (mode === '낱말') {
    child = <TokenPractice key={childKey} words={words} onComplete={handleComplete} />
  } else {
    child = <LinePractice key={childKey} lines={lines} title={mode} onComplete={handleComplete} />
  }

  return (
    <div className="card practice-stage">
      <ModeTabs value={mode} onChange={handleModeChange} />

      {/* 자리연습: 자리/자음/모음 선택 */}
      {mode === '자리연습' && (
        <div className="sub-tabs">
          {POS_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`sub-tab${c === category ? ' active' : ''}`}
              onClick={() => {
                setCategory(c)
                setAttempt(0)
                setIndex(0)
                setResult(null)
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* 낱말: 범주(주제) 선택 */}
      {mode === '낱말' && (
        <div className="sub-tabs">
          {WORD_THEME_NAMES.map((t) => (
            <button
              key={t}
              type="button"
              className={`sub-tab${t === theme ? ' active' : ''}`}
              onClick={() => {
                setTheme(t)
                setAttempt(0)
                setIndex(0)
                setResult(null)
              }}
            >
              {t}
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
