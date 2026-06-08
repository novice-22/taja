import { memo } from 'react'

/** 작은 한 줄 통계 (타수 · 정확도 · 진행) */
function LiveStats({ cpm, accuracy, progress }: { cpm: number; accuracy: number; progress: number }) {
  return (
    <div className="live-stats">
      <span>
        <b>{cpm}</b> 타/분
      </span>
      <span className="dot">·</span>
      <span>
        정확도 <b>{accuracy}</b>%
      </span>
      <span className="dot">·</span>
      <span>{progress}%</span>
    </div>
  )
}

export default memo(LiveStats)
