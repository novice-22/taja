import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { compareCharsLive, type CharState } from './metrics'
import { countKeystrokes, toChars } from './hangul'

/**
 * 단위(단어/문장) 입력 훅. 입력칸(textarea)에 치며, 현재 단위는 글자별로 색이 칠해진다.
 *
 * - kind='token'(낱말): 스페이스/엔터로 단어 제출 → 다음 단어
 * - kind='line'(짧은글/긴글): 문장을 끝까지 치면 자동으로 다음 문장(엔터로도 넘김)
 */
export interface UnitComplete {
  speed: number
  accuracy: number
  elapsedMs: number
  errors: number
}

export interface UseUnitDrillResult {
  pos: number
  total: number
  current: string
  upcoming: string[]
  input: string
  charStates: CharState[]
  cpm: number
  accuracy: number
  progress: number
  started: boolean
  finished: boolean
  inputProps: {
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
    onCompositionStart: () => void
    onCompositionEnd: (e: React.CompositionEvent<HTMLTextAreaElement>) => void
    readOnly: boolean
  }
  reset: () => void
}

export function useUnitDrill(
  units: string[],
  kind: 'token' | 'line',
  onComplete?: (r: UnitComplete) => void,
): UseUnitDrillResult {
  const [pos, setPos] = useState(0)
  const [input, setInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [composing, setComposing] = useState(false)
  const [tick, setTick] = useState(0)

  const keystrokesRef = useRef(0)
  const correctRef = useRef(0)
  const totalCharsRef = useRef(0)
  const errorRef = useRef(0)
  const startRef = useRef<number | null>(null)
  const endRef = useRef<number | null>(null)
  const finishedRef = useRef(false)
  const composingRef = useRef(false)
  const submitOnEndRef = useRef(false)
  const posRef = useRef(0)
  const inputRef = useRef('')
  const unitsRef = useRef(units)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])
  useEffect(() => {
    unitsRef.current = units
  }, [units])

  const total = units.length
  const current = units[pos] ?? ''
  const upcoming = units.slice(pos + 1, pos + (kind === 'token' ? 6 : 4))
  const charStates = useMemo(
    () => compareCharsLive(current, input, composing),
    [current, input, composing],
  )

  const cpm = useMemo(() => {
    if (startTime === null) return 0
    const end = finished ? (endRef.current ?? Date.now()) : Date.now()
    const ms = end - startTime
    if (ms <= 0) return 0
    return Math.round((keystrokesRef.current + countKeystrokes(input)) / (ms / 60000))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, startTime, finished, tick])

  const accuracy = useMemo(() => {
    const t = toChars(current)
    const u = toChars(input)
    let cur = 0
    for (let i = 0; i < u.length; i++) if (u[i] === t[i]) cur++
    const totalChars = totalCharsRef.current + u.length
    if (totalChars === 0) return 100
    return Math.round(((correctRef.current + cur) / totalChars) * 100)
  }, [current, input])

  const progress = total === 0 ? 0 : Math.round((pos / total) * 100)

  useEffect(() => {
    if (startTime === null || finished) return
    const id = window.setInterval(() => setTick((x) => x + 1), 500)
    return () => window.clearInterval(id)
  }, [startTime, finished])

  const finish = useCallback(() => {
    finishedRef.current = true
    const end = Date.now()
    endRef.current = end
    setFinished(true)
    const ms = end - (startRef.current ?? end)
    const denom = totalCharsRef.current || 1
    onCompleteRef.current?.({
      speed: ms > 0 ? Math.round(keystrokesRef.current / (ms / 60000)) : 0,
      accuracy: Math.round((correctRef.current / denom) * 100),
      elapsedMs: ms,
      errors: errorRef.current,
    })
  }, [])

  const advance = useCallback(
    (value: string) => {
      const target = unitsRef.current[posRef.current] ?? ''
      const t = toChars(target)
      const u = toChars(value)
      const len = Math.max(t.length, u.length)
      for (let i = 0; i < len; i++) {
        if (u[i] === t[i]) correctRef.current++
        else errorRef.current++
      }
      totalCharsRef.current += t.length
      keystrokesRef.current += countKeystrokes(value.slice(0, t.length)) + (kind === 'token' ? 1 : 0)
      const np = posRef.current + 1
      posRef.current = np
      inputRef.current = ''
      setInput('')
      setPos(np)
      if (np >= unitsRef.current.length) finish()
    },
    [finish, kind],
  )

  // line: 길이를 다 채우면 자동 진행
  const maybeAutoAdvance = useCallback(
    (value: string) => {
      if (kind !== 'line') return false
      if (composingRef.current) return false
      const target = unitsRef.current[posRef.current] ?? ''
      if (toChars(target).length === 0) return false
      if (toChars(value).length < toChars(target).length) return false
      advance(value)
      return true
    },
    [advance, kind],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (finishedRef.current) return
      const value = e.target.value
      if (startRef.current === null && value.trim().length > 0) {
        startRef.current = Date.now()
        setStartTime(startRef.current)
      }
      if (kind === 'token') {
        const spaceIdx = value.indexOf(' ')
        if (spaceIdx >= 0) {
          const part = value.slice(0, spaceIdx)
          if (part.length > 0) advance(part)
          else {
            inputRef.current = ''
            setInput('')
          }
          return
        }
      }
      inputRef.current = value
      setInput(value)
      maybeAutoAdvance(value)
    },
    [advance, maybeAutoAdvance, kind],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== 'Enter') return
      e.preventDefault()
      if (finishedRef.current) return
      if (e.nativeEvent.isComposing || composingRef.current) {
        submitOnEndRef.current = true
        return
      }
      if (kind === 'token') {
        if (inputRef.current.length > 0) advance(inputRef.current)
      } else {
        // line: 엔터로 현재 문장 넘김(부분 입력도 허용)
        if (inputRef.current.length > 0) advance(inputRef.current)
      }
    },
    [advance, kind],
  )

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true
    setComposing(true)
  }, [])

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      composingRef.current = false
      setComposing(false)
      const value = e.currentTarget.value
      inputRef.current = value
      if (submitOnEndRef.current) {
        submitOnEndRef.current = false
        if (value.length > 0) advance(value)
        return
      }
      maybeAutoAdvance(value)
    },
    [advance, maybeAutoAdvance],
  )

  const reset = useCallback(() => {
    setPos(0)
    setInput('')
    setStartTime(null)
    setFinished(false)
    setComposing(false)
    setTick(0)
    keystrokesRef.current = 0
    correctRef.current = 0
    totalCharsRef.current = 0
    errorRef.current = 0
    startRef.current = null
    endRef.current = null
    finishedRef.current = false
    composingRef.current = false
    submitOnEndRef.current = false
    posRef.current = 0
    inputRef.current = ''
  }, [])

  return {
    pos,
    total,
    current,
    upcoming,
    input,
    charStates,
    cpm,
    accuracy,
    progress,
    started: startTime !== null,
    finished,
    inputProps: {
      value: input,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
      readOnly: finished,
    },
    reset,
  }
}
