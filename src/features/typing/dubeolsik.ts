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

/** 눌린 키 이벤트에서 두벌식 자모(또는 숫자)를 얻는다. 매핑 없으면 null. */
export function jamoFromEvent(e: KeyboardEvent): string | null {
  // 숫자자리용: Digit0~9 → '0'~'9' (Shift 무시, IME 영향 없음)
  if (/^Digit[0-9]$/.test(e.code)) return e.code.slice(5)
  const m = DUBEOLSIK[e.code]
  if (!m) return null
  return e.shiftKey ? m[1] : m[0]
}
