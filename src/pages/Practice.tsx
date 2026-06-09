import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ModeTabs from '../components/ModeTabs'
import ResultModal from '../components/ResultModal'
import PositionPractice from '../components/PositionPractice'
import TokenPractice from '../components/TokenPractice'
import LinePractice from '../components/LinePractice'
import { saveRecord } from '../features/records/recordStore'
import { makeKeySeq, posCategories } from '../data/positions'
import {
  longTopicNames,
  makeLong,
  makeShort,
  makeWords,
  shortTopicNames,
  wordThemeNames,
} from '../data/sentences'
import { useSettings } from '../settings'
import type { Mode } from '../types'

interface Completion {
  speed: number
  accuracy: number
  elapsedMs: number
  errors: number
}

export default function Practice() {
  const { lang } = useSettings()

  const [mode, setMode] = useState<Mode>('낱말')
  const [index, setIndex] = useState(0)
  const [attempt, setAttempt] = useState(0) // 다시하기용 리마운트 키
  const [category, setCategory] = useState<string>(() => posCategories(lang)[0])
  const [theme, setTheme] = useState<string>(() => wordThemeNames(lang)[0])
  const [shortTopic, setShortTopic] = useState<string>(() => shortTopicNames(lang)[0])
  const [longTopic, setLongTopic] = useState<string>(() => longTopicNames(lang)[0])
  const [reroll, setReroll] = useState(0)
  const [result, setResult] = useState<Completion | null>(null)
  const resultAtRef = useRef(0)

  // 언어(한/영)가 바뀌면 그 언어 기본값으로 초기화
  useEffect(() => {
    setCategory(posCategories(lang)[0])
    setTheme(wordThemeNames(lang)[0])
    setShortTopic(shortTopicNames(lang)[0])
    setLongTopic(longTopicNames(lang)[0])
    setIndex(0)
    setAttempt(0)
    setReroll((r) => r + 1)
    setResult(null)
  }, [lang])

  const seq = useMemo(() => makeKeySeq(lang, category, index), [lang, category, index])
  const words = useMemo(() => makeWords(lang, theme, index), [lang, theme, index, reroll])
  const shortLines = useMemo(() => makeShort(lang, shortTopic, index), [lang, shortTopic, index, reroll])
  const longText = useMemo(() => makeLong(lang, longTopic, index), [lang, longTopic, index, reroll])

  const handleComplete = useCallback(
    (info: Completion) => {
      resultAtRef.current = Date.now()
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

  const pickSub = useCallback((fn: () => void) => {
    fn()
    setAttempt(0)
    setIndex(0)
    setReroll((r) => r + 1)
    setResult(null)
  }, [])

  // Esc=다시 / 완료 후 Enter=다음 (완료 직후 350ms 내 Enter는 무시 → 마지막 글자 제출 Enter 보호)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleRetry()
      } else if (e.key === 'Enter' && result) {
        if (Date.now() - resultAtRef.current < 350) return
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleRetry, handleNext, result])

  const childKey = `${lang}-${mode}-${category}-${theme}-${shortTopic}-${longTopic}-${index}-${attempt}-${reroll}`
  let child: React.ReactNode
  let subTabs: { items: readonly string[]; value: string; onPick: (v: string) => void } | null = null

  if (mode === '자리연습') {
    child = <PositionPractice key={childKey} seq={seq} onComplete={handleComplete} />
    subTabs = { items: posCategories(lang), value: category, onPick: (v) => pickSub(() => setCategory(v)) }
  } else if (mode === '낱말') {
    child = <TokenPractice key={childKey} words={words} onComplete={handleComplete} />
    subTabs = { items: wordThemeNames(lang), value: theme, onPick: (v) => pickSub(() => setTheme(v)) }
  } else if (mode === '짧은글') {
    child = <LinePractice key={childKey} lines={shortLines} title="짧은글" onComplete={handleComplete} />
    subTabs = { items: shortTopicNames(lang), value: shortTopic, onPick: (v) => pickSub(() => setShortTopic(v)) }
  } else {
    child = (
      <LinePractice
        key={childKey}
        lines={longText.lines}
        title={`긴글 · ${longText.title}`}
        onComplete={handleComplete}
      />
    )
    subTabs = { items: longTopicNames(lang), value: longTopic, onPick: (v) => pickSub(() => setLongTopic(v)) }
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
