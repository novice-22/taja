import { memo } from 'react'
import type { CharState } from '../features/typing/metrics'
import { toChars } from '../features/typing/hangul'

/** 문자열을 글자별 상태(정/오타/현재/대기)에 따라 색칠해 렌더. */
function Colored({ text, charStates }: { text: string; charStates: CharState[] }) {
  const chars = toChars(text)
  return (
    <>
      {chars.map((ch, i) => {
        const isSpace = ch === ' '
        return (
          <span key={i} className={`pchar ${charStates[i] ?? 'pending'}${isSpace ? ' space' : ''}`}>
            {ch}
          </span>
        )
      })}
    </>
  )
}

export default memo(Colored)
