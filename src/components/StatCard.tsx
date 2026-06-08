import { memo } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
}

function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
    </div>
  )
}

export default memo(StatCard)
