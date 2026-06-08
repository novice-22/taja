import { disassemble } from 'es-hangul'

/**
 * 한글 타자 측정의 핵심: "타수(打數)"는 글자(음절) 단위가 아니라 자모 단위로 센다.
 *
 *   '대한민국' → ㄷㅐㅎㅏㄴㅁㅣㄴㄱㅜㄱ → 11타  (4글자가 아님)
 *
 * es-hangul 의 disassemble 은 음절을 기본 자모로 분해한다.
 * 겹받침(ㄳ→ㄱㅅ)·겹모음(ㅘ→ㅗㅏ)도 두벌식 입력 키 수에 맞게 분해된다.
 */

/** 문자열의 총 타수(자모 수). 한글이 아닌 문자(영문/숫자/공백/기호)는 1타로 친다. */
export function countKeystrokes(text: string): number {
  let count = 0
  for (const ch of text) {
    if (isHangulSyllable(ch) || isHangulJamo(ch)) {
      // disassemble 은 한글만 분해하고 나머지는 그대로 반환하므로 한글에만 적용
      count += disassemble(ch).length
    } else {
      count += 1 // 영문/숫자/공백/문장부호 등은 글자당 1타
    }
  }
  return count
}

/** 완성형 한글 음절(가~힣) 여부 */
export function isHangulSyllable(ch: string): boolean {
  const code = ch.codePointAt(0)
  return code !== undefined && code >= 0xac00 && code <= 0xd7a3
}

/** 한글 자모(ㄱ, ㅏ 등) 여부 — 조합 중인 단일 자모 처리용 */
export function isHangulJamo(ch: string): boolean {
  const code = ch.codePointAt(0)
  if (code === undefined) return false
  // 호환 자모(ㄱ~ㅣ) + 한글 자모(초성/중성/종성) 영역
  return (code >= 0x3130 && code <= 0x318f) || (code >= 0x1100 && code <= 0x11ff)
}

/**
 * 문자열을 "표시용 글자 단위"로 자른다.
 * 이모지·결합문자까지 고려해 코드포인트가 아니라 grapheme 에 가깝게 끊기 위해
 * 스프레드(Array.from)를 사용한다. (한글 음절은 이미 1코드포인트라 안전)
 */
export function toChars(text: string): string[] {
  return Array.from(text)
}
