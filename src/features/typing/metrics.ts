import { countKeystrokes, toChars } from './hangul'

/**
 * 측정 보조 순수 함수 모음. (상태 없음 → 테스트/재사용 쉬움)
 */

/** 글자별 비교 결과 */
export type CharState = 'correct' | 'incorrect' | 'pending' | 'current'

/**
 * 목표 문장과 현재 입력을 비교해 글자별 상태 배열을 만든다.
 * - 입력된 위치까지: 같으면 correct, 다르면 incorrect
 * - 현재 커서 위치(다음에 칠 글자): current
 * - 그 뒤: pending
 */
export function compareChars(target: string, typed: string): CharState[] {
  const t = toChars(target)
  const u = toChars(typed)
  return t.map((ch, i) => {
    if (i < u.length) return u[i] === ch ? 'correct' : 'incorrect'
    if (i === u.length) return 'current'
    return 'pending'
  })
}

/**
 * 입력 중(IME 조합) 상태를 고려한 글자별 상태.
 *
 * 규칙(글자 단위로 완성된 뒤에만 색칠 + 캐럿은 항상 1개):
 * - 조합 중인 마지막 글자(아직 만드는 중)는 정/오타 색을 넣지 않고 'current'(캐럿 위치)로만 둔다.
 *   → 'ㅂ'→'바' 만드는 동안 색이 깜빡이지 않고, 캐럿도 내가 치는 그 자리에 정확히 있다.
 * - 이미 완성된(확정된) 글자만 correct/incorrect 로 칠한다.
 * - 조합이 아닐 때는 다음 칠 자리에 캐럿('current')을 둔다.
 */
export function compareCharsLive(target: string, typed: string, composing: boolean): CharState[] {
  const t = toChars(target)
  const u = toChars(typed)
  return t.map((ch, i) => {
    // 조합 중인 마지막 글자: 이미 목표와 똑같으면 즉시 정타(초록), 아직 만드는 중이면 중립(빨강 X).
    // → '바나나' 다 치면 끝 글자도 바로 초록, 'ㄴ'처럼 미완성일 땐 색 안 들어옴.
    if (composing && i === u.length - 1) return u[i] === ch ? 'correct' : 'current'
    if (i < u.length) return u[i] === ch ? 'correct' : 'incorrect'
    // 조합이 아닐 때만 다음 자리에 캐럿
    if (i === u.length && !composing) return 'current'
    return 'pending'
  })
}

/**
 * 정확도(%) — 지금까지 친 글자 중 맞은 비율.
 * 입력이 없으면 100 으로 둔다.
 */
export function calcAccuracy(target: string, typed: string): number {
  const t = toChars(target)
  const u = toChars(typed)
  if (u.length === 0) return 100
  let correct = 0
  for (let i = 0; i < u.length; i++) {
    if (i < t.length && u[i] === t[i]) correct++
  }
  return Math.round((correct / u.length) * 100)
}

/**
 * 분당 타수(CPM, 타/분). 자모 단위 타수를 경과 시간으로 나눈다.
 * elapsedMs 가 0 이하이면 0 을 반환(0으로 나누기 방지).
 */
export function calcCPM(typed: string, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  const strokes = countKeystrokes(typed)
  const minutes = elapsedMs / 60000
  return Math.round(strokes / minutes)
}

/** 진행률(0~100). target 의 글자 수 기준. */
export function calcProgress(target: string, typed: string): number {
  const total = toChars(target).length
  if (total === 0) return 0
  const done = Math.min(toChars(typed).length, total)
  return Math.round((done / total) * 100)
}
