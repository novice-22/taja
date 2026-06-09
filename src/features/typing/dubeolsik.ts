/**
 * 두벌식 자판: 물리 키(KeyboardEvent.code) → 자모.
 * 자리연습은 "어떤 키를 눌렀나"가 핵심이라, 조합(IME) 대신 물리 키로 판정한다.
 * code 는 OS 입력기/레이아웃과 무관하게 항상 같은 값(KeyG 등)이라 한글 IME 가 켜져 있어도 정확하다.
 *
 * 각 값은 [평타, Shift] 순.
 */
const DUBEOLSIK: Record<string, [string, string]> = {
  KeyQ: ['ㅂ', 'ㅃ'],
  KeyW: ['ㅈ', 'ㅉ'],
  KeyE: ['ㄷ', 'ㄸ'],
  KeyR: ['ㄱ', 'ㄲ'],
  KeyT: ['ㅅ', 'ㅆ'],
  KeyY: ['ㅛ', 'ㅛ'],
  KeyU: ['ㅕ', 'ㅕ'],
  KeyI: ['ㅑ', 'ㅑ'],
  KeyO: ['ㅐ', 'ㅒ'],
  KeyP: ['ㅔ', 'ㅖ'],
  KeyA: ['ㅁ', 'ㅁ'],
  KeyS: ['ㄴ', 'ㄴ'],
  KeyD: ['ㅇ', 'ㅇ'],
  KeyF: ['ㄹ', 'ㄹ'],
  KeyG: ['ㅎ', 'ㅎ'],
  KeyH: ['ㅗ', 'ㅗ'],
  KeyJ: ['ㅓ', 'ㅓ'],
  KeyK: ['ㅏ', 'ㅏ'],
  KeyL: ['ㅣ', 'ㅣ'],
  KeyZ: ['ㅋ', 'ㅋ'],
  KeyX: ['ㅌ', 'ㅌ'],
  KeyC: ['ㅊ', 'ㅊ'],
  KeyV: ['ㅍ', 'ㅍ'],
  KeyB: ['ㅠ', 'ㅠ'],
  KeyN: ['ㅜ', 'ㅜ'],
  KeyM: ['ㅡ', 'ㅡ'],
}

// 숫자·기호자리: e.key 가 Shift 를 반영한 실제 문자('1' 또는 '!')를 준다.
const SYMBOL_CODES = new Set([
  'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5',
  'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0',
  'Minus', 'Equal', 'Comma', 'Period', 'Slash', 'Semicolon', 'Quote',
])

/** 눌린 키 이벤트에서 두벌식 자모(또는 숫자/기호)를 얻는다. 매핑 없으면 null. */
export function jamoFromEvent(e: KeyboardEvent): string | null {
  // 숫자·기호: 실제 입력 문자 그대로(Shift 반영). 한 글자(IME 비조합)만 인정.
  if (SYMBOL_CODES.has(e.code) && e.key.length === 1) return e.key
  const m = DUBEOLSIK[e.code]
  if (!m) return null
  return e.shiftKey ? m[1] : m[0]
}

/**
 * 영문 자리연습용: 물리 키(e.code)에서 영문 글자/숫자/기호를 얻는다.
 * e.code 기반이라 한글 IME 가 켜져 있어도 정확하다. 글자는 소문자로 통일.
 */
export function keyFromEvent(e: KeyboardEvent): string | null {
  if (/^Key[A-Z]$/.test(e.code)) return e.code.slice(3).toLowerCase()
  if (SYMBOL_CODES.has(e.code) && e.key.length === 1) return e.key
  return null
}
