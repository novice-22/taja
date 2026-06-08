// 연습 모드
export type Mode = '자리연습' | '낱말' | '짧은글' | '긴글'

export const MODES: Mode[] = ['자리연습', '낱말', '짧은글', '긴글']

// 한 번의 연습 결과 (recordStore 에 저장되는 단위)
export interface TypingRecord {
  date: string // ISO 8601
  speed: number // 타/분 (CPM)
  accuracy: number // 0~100
  mode: Mode
}

// 저장 전 결과 (date 는 저장 시점에 채워짐)
export type TypingResult = Omit<TypingRecord, 'date'>
