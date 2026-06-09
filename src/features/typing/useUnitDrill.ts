import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { compareCharsLive, type CharState } from './metrics'
import { countKeystrokes, toChars } from './hangul'

/**
 * 단위(단어/문장) 입력 훅. 입력칸(textarea)에 치며, 현재 단위는 글자별로 색이 칠해진다.
 * 모든 모드 공통: 다 친 뒤 Enter 로만 다음(단어/문장)으로 진행한다.
 *
 * 색칠 규칙(정확):
 *  - 조합(IME) 중인 마지막 글자는 색을 넣지 않는다(완성 전엔 불 안 들어옴).
 *  - 완성·확정된 글자만 정/오타 색. 지우면 즉시 색이 사라진다.
 *  → 이를 위해 색 계산은 비동기 state 대신 동기 ref(composingRef)로 즉시 수행한다.
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
    onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
    onDrop: (e: React.DragEvent<HTMLTextAreaElement>) => void
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
  const [charStates, setCharStates] = useState<CharState[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
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
  const lockRef = useRef(0) // 이미 초록 확정된 앞 글자 수(조합 흔들림에도 유지 → 깜빡임 방지)
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

  // 현재 입력값을 동기 조합상태(composingRef)로 즉시 색칠 → 상태 지연으로 인한 오작동 없음
  const recolor = useCallback((value: string) => {
    const target = unitsRef.current[posRef.current] ?? ''
    const u = toChars(value)
    const states = compareCharsLive(target, value, composingRef.current)
    // 받침 이동(사→삭→사고) 같은 조합 흔들림에도 이미 확정된 앞 글자는 초록 유지 → 깜빡임 방지
    for (let i = 0; i < lockRef.current && i < states.length; i++) {
      if (u.length > i) states[i] = 'correct'
    }
    let lc = 0
    while (lc < states.length && states[lc] === 'correct') lc++
    lockRef.current = Math.min(lc, u.length) // 삭제하면 그만큼 잠금 해제
    setCharStates(states)
  }, [])

  // 단어/문장(pos)이 바뀌면(또는 첫 렌더) 빈 입력 기준으로 색 초기화
  useEffect(() => {
    recolor(inputRef.current)
  }, [pos, recolor])

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
      recolor('')
      setPos(np)
      if (np >= unitsRef.current.length) finish()
    },
    [finish, kind, recolor],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (finishedRef.current) return
      const value = e.target.value
      if (startRef.current === null && value.trim().length > 0) {
        startRef.current = Date.now()
        setStartTime(startRef.current)
      }
      inputRef.current = value
      setInput(value)
      recolor(value)
    },
    [recolor],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // 키 꾹 누름(OS 자동반복) 차단 → 타수 뻥튀기 방지
      if (e.repeat) {
        e.preventDefault()
        return
      }
      // 낱말엔 공백이 없으므로 스페이스 입력 무시(엔터로만 제출). 짧은글/긴글은 공백도 글자.
      if (kind === 'token' && e.key === ' ') {
        e.preventDefault()
        return
      }
      if (e.key !== 'Enter') return
      e.preventDefault()
      if (finishedRef.current) return
      // 조합 중 엔터면 조합 확정 후 제출되도록 예약
      if (e.nativeEvent.isComposing || composingRef.current) {
        submitOnEndRef.current = true
        return
      }
      if (inputRef.current.length > 0) advance(inputRef.current)
    },
    [advance, kind],
  )

  // 붙여넣기/드롭 차단 → 한 번에 긴 텍스트 넣어 타수 뻥튀기 방지
  const blockInsert = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement> | React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault()
    },
    [],
  )

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true
    recolor(inputRef.current)
  }, [recolor])

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      composingRef.current = false
      const value = e.currentTarget.value
      inputRef.current = value
      setInput(value)
      recolor(value)
      // 조합 중 누른 엔터가 예약돼 있으면 지금 제출
      if (submitOnEndRef.current) {
        submitOnEndRef.current = false
        if (value.length > 0) advance(value)
      }
    },
    [advance, recolor],
  )

  const reset = useCallback(() => {
    setPos(0)
    setInput('')
    setCharStates([])
    setStartTime(null)
    setFinished(false)
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
    lockRef.current = 0
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
      onPaste: blockInsert,
      onDrop: blockInsert,
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
      readOnly: finished,
    },
    reset,
  }
}
