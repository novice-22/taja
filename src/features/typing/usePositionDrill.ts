import { useCallback, useEffect, useRef, useState } from 'react'
import { jamoFromEvent } from './dubeolsik'

/**
 * 자리연습 훅. 물리 키(두벌식)로 자모를 판정한다.
 * 올바른 키를 누르면 다음 자모로 넘어가고, 틀리면 오타로 세고 잠깐 빨갛게(같은 자리 유지).
 */
export interface PosComplete {
  speed: number
  accuracy: number
  elapsedMs: number
  errors: number
}

export interface UsePositionDrillResult {
  pos: number
  total: number
  current: string
  upcoming: string[]
  cpm: number
  accuracy: number
  wrong: boolean
  started: boolean
  finished: boolean
  reset: () => void
}

export function usePositionDrill(
  seq: string[],
  onComplete?: (r: PosComplete) => void,
): UsePositionDrillResult {
  const [pos, setPos] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [tick, setTick] = useState(0)

  const correctRef = useRef(0)
  const errorRef = useRef(0)
  const startRef = useRef<number | null>(null)
  const endRef = useRef<number | null>(null)
  const finishedRef = useRef(false)
  const posRef = useRef(0)
  const seqRef = useRef(seq)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])
  useEffect(() => {
    seqRef.current = seq
  }, [seq])

  const total = seq.length
  const current = seq[pos] ?? ''
  const upcoming = seq.slice(pos + 1, pos + 6)

  const elapsedMs = (finished ? endRef.current ?? Date.now() : Date.now()) - (startTime ?? Date.now())
  // 타수: 자모 1개 = 1타로 환산(자리연습은 자모 단위)
  const cpm = startTime !== null && elapsedMs > 0 ? Math.round(correctRef.current / (elapsedMs / 60000)) : 0
  const done = correctRef.current + errorRef.current
  const accuracy = done === 0 ? 100 : Math.round((correctRef.current / done) * 100)
  void tick // cpm 재계산 트리거용

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
    const begin = startRef.current ?? end
    const ms = end - begin
    const total2 = correctRef.current + errorRef.current
    onCompleteRef.current?.({
      speed: ms > 0 ? Math.round(correctRef.current / (ms / 60000)) : 0,
      accuracy: total2 === 0 ? 100 : Math.round((correctRef.current / total2) * 100),
      elapsedMs: ms,
      errors: errorRef.current,
    })
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (finishedRef.current) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const jamo = jamoFromEvent(e)
      if (jamo === null) return
      e.preventDefault()
      if (startRef.current === null) {
        startRef.current = Date.now()
        setStartTime(startRef.current)
      }
      const target = seqRef.current[posRef.current]
      if (jamo === target) {
        correctRef.current++
        setWrong(false)
        const np = posRef.current + 1
        posRef.current = np
        setPos(np)
        if (np >= seqRef.current.length) finish()
      } else {
        errorRef.current++
        setWrong(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finish])

  const reset = useCallback(() => {
    setPos(0)
    setStartTime(null)
    setFinished(false)
    setWrong(false)
    setTick(0)
    correctRef.current = 0
    errorRef.current = 0
    startRef.current = null
    endRef.current = null
    finishedRef.current = false
    posRef.current = 0
  }, [])

  return {
    pos,
    total,
    current,
    upcoming,
    cpm,
    accuracy,
    wrong,
    started: startTime !== null,
    finished,
    reset,
  }
}
