import LiveStats from './LiveStats'
import { usePositionDrill, type PosComplete } from '../features/typing/usePositionDrill'

/**
 * 자리연습: 자모를 가로 큐로 보여준다(현재 크게, 다음은 흐리게).
 * 키보드 그림 없이 키를 누르면 진행. 입력칸도 없음.
 */
export default function PositionPractice({
  seq,
  onComplete,
}: {
  seq: string[]
  onComplete: (r: PosComplete) => void
}) {
  const drill = usePositionDrill(seq, onComplete)
  const progress = drill.total === 0 ? 0 : Math.round((drill.pos / drill.total) * 100)

  return (
    <>
      <LiveStats cpm={drill.cpm} accuracy={drill.accuracy} progress={progress} />

      <div className="stage-main">
        <div className="jamo-queue">
          <div className={`jamo-current${drill.wrong ? ' wrong' : ''}`}>
            <div className="jamo-big">{drill.current}</div>
          </div>
          <div className="jamo-upcoming">
            {drill.upcoming.map((j, i) => (
              <span key={i} className="jamo-next" style={{ opacity: 1 - i * 0.16 }}>
                {j}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="hint-bar">
        <span>
          키를 누르세요 · {Math.min(drill.pos + 1, drill.total)}/{drill.total}
        </span>
        <span className="hint-keys">틀린 키는 빨갛게 · 맞아야 다음으로</span>
      </div>
    </>
  )
}
