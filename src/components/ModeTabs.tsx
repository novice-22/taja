import { memo } from 'react'
import { MODES, type Mode } from '../types'

interface ModeTabsProps {
  value: Mode
  onChange: (mode: Mode) => void
}

function ModeTabs({ value, onChange }: ModeTabsProps) {
  return (
    <div className="mode-tabs">
      {MODES.map((mode) => (
        <button
          key={mode}
          className={`mode-tab${mode === value ? ' active' : ''}`}
          onClick={() => onChange(mode)}
          type="button"
        >
          {mode}
        </button>
      ))}
    </div>
  )
}

export default memo(ModeTabs)
