import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import StatCard from '../components/StatCard'
import {
  loadRecords,
  exportRecords,
  importRecords,
  clearRecords,
} from '../features/records/recordStore'
import type { TypingRecord } from '../types'

export default function Records() {
  const [records, setRecords] = useState<TypingRecord[]>([])
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function refresh() {
    setRecords(await loadRecords())
  }

  useEffect(() => {
    void refresh()
  }, [])

  const summary = useMemo(() => {
    if (records.length === 0) return { best: 0, avg: 0, count: 0 }
    const speeds = records.map((r) => r.speed)
    const best = Math.max(...speeds)
    const avg = Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length)
    return { best, avg, count: records.length }
  }, [records])

  // 차트용: 오래된 순으로, 날짜+시간 라벨
  const chartData = useMemo(
    () =>
      [...records]
        .reverse()
        .map((r) => ({
          label: formatDate(r.date, true),
          타수: r.speed,
        })),
    [records],
  )

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const n = await importRecords(file)
      await refresh()
      setMsg(`${n}개 기록을 불러왔습니다.`)
    } catch (err) {
      setMsg(err instanceof Error ? err.message : '불러오기에 실패했습니다.')
    } finally {
      // 같은 파일 다시 선택할 수 있도록 초기화
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleClear() {
    if (!window.confirm('모든 기록을 삭제할까요? 되돌릴 수 없습니다.')) return
    await clearRecords()
    await refresh()
    setMsg('기록을 모두 삭제했습니다.')
  }

  return (
    <div className="card">
      <div className="stat-row">
        <StatCard label="최고 타수" value={summary.best} unit="타/분" />
        <StatCard label="평균 타수" value={summary.avg} unit="타/분" />
        <StatCard label="총 연습" value={summary.count} unit="회" />
      </div>

      <div className="section-title">날짜별 타수 추이</div>
      {chartData.length > 0 ? (
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2fa" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7b8aa3' }} />
              <YAxis tick={{ fontSize: 11, fill: '#7b8aa3' }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="타수"
                stroke="#5b8def"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="empty">아직 기록이 없어요. 연습을 시작해 보세요!</div>
      )}

      <div className="section-title">기록 목록</div>
      {records.length > 0 ? (
        <table className="record-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>타수</th>
              <th>정확도</th>
              <th>모드</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={`${r.date}-${i}`}>
                <td>{formatDate(r.date)}</td>
                <td>{r.speed} 타/분</td>
                <td>{r.accuracy}%</td>
                <td>{r.mode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty">기록이 없습니다.</div>
      )}

      <div className="section-title">백업</div>
      <div className="btn-row">
        <button className="btn" onClick={() => exportRecords()} type="button">
          기록 내보내기 (JSON)
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()} type="button">
          불러오기
        </button>
        <button className="btn" onClick={handleClear} type="button">
          전체 삭제
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>
      {msg && <div className="progress-text" style={{ textAlign: 'left', marginTop: 12 }}>{msg}</div>}
    </div>
  )
}

function formatDate(iso: string, short = false): string {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return short ? `${mm}-${dd} ${hh}:${mi}` : `${d.getFullYear()}-${mm}-${dd} ${hh}:${mi}`
}
