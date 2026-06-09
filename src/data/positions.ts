import type { Lang } from '../settings'

/** 자리연습 카테고리(언어별). 사용자가 선택할 수 있게 한다. */
export const POS_CATEGORIES: Record<Lang, string[]> = {
  ko: [
    '기본자리',
    '왼손윗자리',
    '왼손아랫자리',
    '가운데자리',
    '오른손윗자리',
    '오른손아랫자리',
    '전체자리',
    '숫자기호',
  ],
  en: ['기본자리', '윗자리', '아랫자리', '전체자리', '숫자기호'],
}

export function posCategories(lang: Lang): string[] {
  return POS_CATEGORIES[lang]
}

const CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const VOWELS = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅔ']

// 숫자 + 자주 쓰는 특수문자 (한/영 공통)
const NUM_SYMBOLS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
  '!', '@', '#', '$', '%', '&', '*', '(', ')',
  '-', '_', '=', '+', ',', '.', '?', '/', ':', ';', "'", '"',
]

// 두벌식 자판의 손/줄 기준 자모 집합
const SETS_KO: Record<string, string[]> = {
  기본자리: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅏ', 'ㅓ', 'ㅗ', 'ㅣ'],
  왼손윗자리: ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ'],
  왼손아랫자리: ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ'],
  가운데자리: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  오른손윗자리: ['ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  오른손아랫자리: ['ㅠ', 'ㅜ', 'ㅡ'],
  전체자리: [...CONSONANTS, ...VOWELS],
  숫자기호: NUM_SYMBOLS,
}

// 쿼티 자판의 줄 기준 영문 키 집합
const SETS_EN: Record<string, string[]> = {
  기본자리: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'], // home row
  윗자리: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  아랫자리: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  전체자리: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  숫자기호: NUM_SYMBOLS,
}

const SEQ_LEN = 24

/**
 * 카테고리의 키를 섞어 연습 시퀀스를 만든다.
 * Math.random 없이 인덱스 기반으로 변형(*7 step)해 재현 가능.
 */
export function makeKeySeq(lang: Lang, cat: string, index: number): string[] {
  const sets = lang === 'ko' ? SETS_KO : SETS_EN
  const s = sets[cat] ?? sets[posCategories(lang)[0]]
  const out: string[] = []
  for (let i = 0; i < SEQ_LEN; i++) {
    out.push(s[(i * 7 + index * 3) % s.length])
  }
  return out
}
