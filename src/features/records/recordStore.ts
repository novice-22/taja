import { MODES, type Mode, type TypingRecord, type TypingResult } from '../../types'

/**
 * 기록 저장소.
 *
 * ⚠️ 규칙: localStorage 직접 호출은 오직 이 파일에서만 한다.
 * 다른 곳은 반드시 saveRecord / loadRecords 를 통해 접근한다.
 * 나중에 서버를 붙일 때 이 파일의 함수 "안쪽"만 fetch 로 바꾸면 되도록 격리한다.
 *
 * 모든 함수는 처음부터 async 로 작성한다. (지금 localStorage 는 동기지만
 * 서버 호출은 비동기이므로, 호출부의 await 가 바뀌지 않게 미리 맞춰둔다.)
 */

const STORAGE_KEY = 'records'

/**
 * 보안: localStorage 데이터는 사용자가 직접 조작하거나 깨질 수 있다.
 * (또한 JSON 백업 파일을 불러오는 경로로 악의적 데이터가 들어올 수 있다.)
 * 따라서 불러온 값이 우리가 기대하는 형식인지 반드시 검증한 뒤에만 사용한다.
 */
function isValidRecord(value: unknown): value is TypingRecord {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Record<string, unknown>
  return (
    typeof r.date === 'string' &&
    !Number.isNaN(Date.parse(r.date)) &&
    typeof r.speed === 'number' &&
    Number.isFinite(r.speed) &&
    r.speed >= 0 &&
    typeof r.accuracy === 'number' &&
    Number.isFinite(r.accuracy) &&
    r.accuracy >= 0 &&
    r.accuracy <= 100 &&
    typeof r.mode === 'string' &&
    (MODES as string[]).includes(r.mode)
  )
}

/** 신뢰할 수 없는 입력(배열이 아닐 수도, 원소가 깨졌을 수도)을 안전한 기록 배열로 정제 */
export function sanitizeRecords(raw: unknown): TypingRecord[] {
  if (!Array.isArray(raw)) return []
  // 검증 통과한 항목만 남기고, 필요한 필드만 추려 담는다(불필요/위험 필드 제거).
  return raw.filter(isValidRecord).map((r) => ({
    date: r.date,
    speed: r.speed,
    accuracy: r.accuracy,
    mode: r.mode as Mode,
  }))
}

function readRaw(): TypingRecord[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (!json) return []
    return sanitizeRecords(JSON.parse(json))
  } catch {
    // 파싱 실패/스토리지 접근 불가(프라이빗 모드 등) → 빈 배열로 안전하게 시작
    return []
  }
}

function writeRaw(records: TypingRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // 용량 초과/접근 불가 시 조용히 무시 (앱이 멈추지 않게)
  }
}

/** 연습 결과 1건 저장. date 는 저장 시점에 채운다. */
export async function saveRecord(result: TypingResult): Promise<void> {
  const records = readRaw()
  records.push({ ...result, date: new Date().toISOString() })
  writeRaw(records)
  // 나중에: await fetch('/api/records', { method: 'POST', body: JSON.stringify(result) })
}

/** 전체 기록을 최신순으로 반환. */
export async function loadRecords(): Promise<TypingRecord[]> {
  const records = readRaw()
  return records.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  // 나중에: const res = await fetch('/api/records'); return sanitizeRecords(await res.json())
}

/** 전체 기록 삭제. */
export async function clearRecords(): Promise<void> {
  writeRaw([])
}

/** 기록을 JSON 파일로 내보내기 (서버 없이 백업). */
export function exportRecords(): void {
  const data = JSON.stringify(readRaw(), null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'typing_records.json'
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * JSON 파일에서 기록 불러오기 (백업 복원).
 * 보안: 외부 파일은 신뢰할 수 없으므로 sanitizeRecords 로 반드시 검증한 뒤 병합한다.
 * 기존 기록과 합치고 date 중복은 제거한다.
 */
export async function importRecords(file: File): Promise<number> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('올바른 JSON 파일이 아닙니다.')
  }
  const incoming = sanitizeRecords(parsed)
  const existing = readRaw()
  const seen = new Set(existing.map((r) => r.date))
  const merged = [...existing]
  for (const r of incoming) {
    if (!seen.has(r.date)) {
      merged.push(r)
      seen.add(r.date)
    }
  }
  writeRaw(merged)
  return incoming.length
}
