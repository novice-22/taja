import { memo } from 'react'

interface ResultModalProps {
  speed: number
  accuracy: number
  errors: number
  elapsedSec: number
  onRetry: () => void
  onNext: () => void
}

function ResultModal({ speed, accuracy, errors, elapsedSec, onRetry, onNext }: ResultModalProps) {
  const mm = Math.floor(elapsedSec / 60)
  const ss = String(Math.floor(elapsedSec % 60)).padStart(2, '0')
  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true">
        <h2>&gt; 연습 완료</h2>
        <div className="modal-stats">
          <div>
            <div className="stat-label">타수</div>
            <div className="stat-value">{speed}</div>
          </div>
          <div>
            <div className="stat-label">정확도</div>
            <div className="stat-value">{accuracy}%</div>
          </div>
          <div>
            <div className="stat-label">시간</div>
            <div className="stat-value">
              {mm}:{ss}
            </div>
          </div>
        </div>
        <div className="progress-text" style={{ textAlign: 'center', marginTop: '-14px', marginBottom: 22 }}>
          오타 {errors}개
        </div>
        <div className="btn-row" style={{ justifyContent: 'center' }}>
          <button className="btn" onClick={onRetry} type="button">
            다시하기 (Esc)
          </button>
          <button className="btn primary" onClick={onNext} type="button">
            다음 문장 (Enter)
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(ResultModal)
