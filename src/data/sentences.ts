/**
 * 연습 콘텐츠. 한국어/영어 모두 지원. 한컴 타자연습 등 일반적인 구성을 참고했다.
 */
import type { Lang } from '../settings'

// ===== 낱말: 주제별 단어 (한국어) =====
const WORD_THEMES_KO: Record<string, string[]> = {
  과일: ['사과', '바나나', '포도', '수박', '딸기', '참외', '복숭아', '자두', '오렌지', '키위', '토마토', '멜론', '망고', '체리', '블루베리', '레몬', '귤', '배', '감', '살구', '앵두', '무화과', '석류', '파인애플', '라임', '자몽', '두리안', '코코넛', '대추', '모과', '산딸기', '청포도', '천도복숭아', '홍시', '곶감', '단감', '머루', '으름', '오디', '대봉'],
  동물: ['강아지', '고양이', '토끼', '사자', '호랑이', '코끼리', '기린', '펭귄', '다람쥐', '거북이', '사슴', '여우', '늑대', '곰', '판다', '원숭이', '악어', '하마', '코뿔소', '너구리', '얼룩말', '캥거루', '코알라', '침팬지', '고릴라', '표범', '치타', '들소', '물소', '염소', '돼지', '말', '오리', '거위', '두더지', '햄스터', '고슴도치', '수달', '족제비', '낙타'],
  음식: ['김치', '불고기', '비빔밥', '떡볶이', '김밥', '라면', '만두', '잡채', '된장', '삼겹살', '갈비', '냉면', '칼국수', '순두부', '제육', '보쌈', '파전', '닭갈비', '김치찌개', '비빔국수', '갈비탕', '설렁탕', '육개장', '부대찌개', '순대', '족발', '곱창', '감자탕', '미역국', '떡국', '수제비', '우동', '짜장면', '짬뽕', '탕수육', '볶음밥', '김치전', '호떡', '김치볶음밥', '제육볶음'],
  사물: ['컴퓨터', '키보드', '마우스', '모니터', '프린터', '노트북', '연필', '지우개', '가방', '시계', '의자', '책상', '우산', '안경', '거울', '가위', '필통', '자석', '전화기', '달력', '공책', '볼펜', '형광펜', '스탠드', '수건', '칫솔', '베개', '이불', '옷걸이', '신발', '양말', '모자', '장갑', '지갑', '열쇠', '충전기', '이어폰', '리모컨', '청소기', '냉장고'],
  장소: ['학교', '도서관', '운동장', '교실', '서울', '부산', '제주', '공원', '시장', '병원', '은행', '우체국', '영화관', '미용실', '카페', '식당', '백화점', '박물관', '정류장', '공항', '약국', '편의점', '마트', '서점', '수영장', '체육관', '놀이터', '동물원', '식물원', '미술관', '극장', '호텔', '항구', '기차역', '주차장', '주유소', '빵집', '문구점', '운동장', '도청'],
  감정: ['사랑', '행복', '용기', '희망', '평화', '자유', '기쁨', '설렘', '고마움', '뿌듯함', '슬픔', '분노', '두려움', '외로움', '그리움', '즐거움', '편안함', '놀라움', '안도감', '자신감', '만족', '감동', '후회', '부끄러움', '질투', '미움', '서운함', '답답함', '초조함', '긴장', '신남', '벅참', '따뜻함', '든든함', '홀가분함', '아쉬움', '억울함', '통쾌함', '흐뭇함', '평온'],
  직업: ['의사', '간호사', '교사', '경찰', '소방관', '요리사', '가수', '배우', '화가', '작가', '변호사', '판사', '기자', '농부', '어부', '목수', '미용사', '운전사', '약사', '프로그래머', '군인', '회계사', '건축가', '디자이너', '사진작가', '통역사', '번역가', '과학자', '연구원', '엔지니어', '조종사', '승무원', '코치', '사육사', '수의사', '치과의사', '제빵사', '바리스타', '정비사', '경비원'],
  나라: ['한국', '일본', '중국', '미국', '영국', '프랑스', '독일', '캐나다', '호주', '브라질', '이탈리아', '스페인', '러시아', '인도', '멕시코', '태국', '베트남', '이집트', '스위스', '그리스', '네덜란드', '벨기에', '스웨덴', '노르웨이', '핀란드', '덴마크', '폴란드', '터키', '아일랜드', '포르투갈', '오스트리아', '체코', '헝가리', '아르헨티나', '칠레', '페루', '케냐', '모로코', '싱가포르', '필리핀'],
  과목: ['국어', '영어', '수학', '과학', '사회', '음악', '미술', '체육', '도덕', '역사', '지리', '물리', '화학', '생물', '지구과학', '윤리', '한문', '정보', '기술', '가정', '세계사', '경제', '정치', '법학', '철학', '심리학', '통계', '미적분', '기하', '대수', '작문', '독서', '회화', '조소', '서예', '무용', '연극', '코딩', '천문', '환경'],
  스포츠: ['축구', '야구', '농구', '배구', '수영', '탁구', '테니스', '골프', '마라톤', '스키', '권투', '유도', '태권도', '배드민턴', '볼링', '양궁', '사이클', '스케이트', '등산', '요가', '펜싱', '레슬링', '역도', '체조', '다이빙', '카누', '조정', '승마', '사격', '핸드볼', '럭비', '하키', '스노보드', '컬링', '클라이밍', '서핑', '스쿼시', '당구', '줄넘기', '달리기'],
  색깔: ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라', '검정', '하양', '분홍', '회색', '갈색', '하늘색', '연두', '청록', '자주', '베이지', '살구색', '금색', '은색', '진노랑', '연분홍', '진분홍', '카키', '곤색', '와인색', '민트', '라벤더', '코랄', '청보라', '적갈색', '황토색', '상아색', '진회색', '연회색', '풀색', '바다색', '노을색', '먹색', '옥색'],
  가족: ['아버지', '어머니', '할머니', '할아버지', '누나', '오빠', '언니', '동생', '이모', '삼촌', '고모', '외삼촌', '사촌', '조카', '며느리', '사위', '손자', '손녀', '큰아버지', '작은아버지', '외할머니', '외할아버지', '외숙모', '이모부', '고모부', '처남', '처제', '형부', '제부', '올케', '동서', '시누이', '시동생', '막내', '맏이', '외동', '부모', '자녀', '친척', '가장'],
  날씨: ['맑음', '흐림', '소나기', '함박눈', '바람', '안개', '천둥', '번개', '무지개', '서리', '폭염', '한파', '장마', '태풍', '가랑비', '이슬비', '진눈깨비', '황사', '미세먼지', '우박', '폭우', '폭설', '돌풍', '회오리', '가뭄', '홍수', '무더위', '추위', '쌀쌀함', '포근함', '건조', '습기', '노을', '봄비', '가을바람', '겨울바람', '봄볕', '햇볕', '북풍', '열대야'],
  IT용어: ['프로그램', '데이터', '서버', '네트워크', '알고리즘', '코드', '버그', '함수', '변수', '클라우드', '데이터베이스', '브라우저', '운영체제', '인공지능', '보안', '해킹', '백업', '압축', '픽셀', '라이브러리', '프레임워크', '컴파일러', '디버깅', '배포', '저장소', '패키지', '모듈', '인터페이스', '객체', '배열', '반복문', '조건문', '포인터', '메모리', '캐시', '쿠키', '도메인', '프로토콜', '암호화', '서버리스'],
  받침연습: ['닭갈비', '꽃잎', '값어치', '넋두리', '옷장', '밝다', '읽다', '앉다', '굶다', '핥다', '흙길', '꽃밭', '부엌', '갉다', '읊다', '몫', '삶', '값', '넋', '닭', '흙', '칡', '늪', '옆', '짚', '빚', '빛', '끝', '밭', '솥', '팥', '닭장', '흙손', '꽃병', '잎새', '넓다', '짧다', '맑다', '밟다', '훑다'],
  자주틀림: ['웬일', '왠지', '며칠', '사귀다', '설레다', '깨끗이', '일부러', '오랜만', '어떡해', '금세', '됐다', '희한하다', '곰곰이', '일일이', '굳이', '닦달', '설거지', '빈털터리', '가까이', '눈곱', '구레나룻', '깍두기', '통째로', '짜깁기', '안절부절', '뒤죽박죽', '우두커니', '살코기', '헷갈리다', '베개', '으스대다', '부서지다', '가르치다', '가리키다', '치르다', '담그다', '잠그다', '들르다', '메우다', '바라다'],
  네글자: ['동해바다', '가을하늘', '봄바람결', '푸른들판', '하얀눈꽃', '맑은시내', '노을빛깔', '별빛가득', '꽃향기들', '산들바람', '새벽이슬', '가을단풍', '겨울바다', '봄꽃향기', '여름소나기', '밤하늘별', '들국화꽃', '시냇물가', '푸른바다', '황금들판', '흰눈송이', '붉은노을', '푸른하늘', '맑은공기', '따뜻한봄', '시원한물', '향긋한꽃', '부드러운', '반짝이는', '싱그러운', '고요한밤', '잔잔한물', '드넓은들', '우거진숲', '깊은계곡', '높은산봉', '넓은바다', '포근한솜', '시린겨울', '맑은아침'],
  긴단어: ['도서관', '컴퓨터공학', '프로그래밍', '대한민국', '인공지능', '자연사박물관', '우주정거장', '환경보호', '전통문화', '정보통신', '국제공항', '종합병원', '초등학교', '도시계획', '의사소통', '자기소개', '인터넷쇼핑', '스마트폰', '데이터베이스', '문화유산', '인공위성', '재활용센터', '국립도서관', '시민회관', '다국적기업', '디지털카메라', '무선인터넷', '화상회의', '원격근무', '전자상거래', '빅데이터', '머신러닝', '자율주행', '신재생에너지', '기후변화', '생물다양성', '우주탐사', '국제기구', '공공기관', '연구개발'],
}

// ===== 낱말: 주제별 단어 (영어) =====
// 탭(주제) 라벨은 한글로 유지하고, 내용(단어)만 영어로 바꾼다.
const WORD_THEMES_EN: Record<string, string[]> = {
  동물: ['cat', 'dog', 'rabbit', 'lion', 'tiger', 'elephant', 'giraffe', 'penguin', 'squirrel', 'turtle', 'deer', 'fox', 'wolf', 'bear', 'panda', 'monkey', 'crocodile', 'hippo', 'rhino', 'raccoon', 'zebra', 'kangaroo', 'koala', 'gorilla', 'leopard', 'cheetah', 'bison', 'goat', 'pig', 'horse', 'duck', 'goose', 'mole', 'hamster', 'otter'],
  과일: ['apple', 'banana', 'grape', 'watermelon', 'strawberry', 'melon', 'mango', 'cherry', 'blueberry', 'lemon', 'orange', 'pear', 'peach', 'plum', 'kiwi', 'lime', 'grapefruit', 'pineapple', 'coconut', 'apricot', 'fig', 'pomegranate', 'raspberry', 'blackberry', 'papaya', 'guava', 'lychee', 'date', 'persimmon', 'mandarin', 'avocado', 'tomato', 'cranberry', 'currant', 'olive'],
  음식: ['pizza', 'burger', 'pasta', 'salad', 'soup', 'rice', 'noodle', 'bread', 'cheese', 'steak', 'chicken', 'bacon', 'sausage', 'sandwich', 'taco', 'sushi', 'curry', 'stew', 'dumpling', 'pancake', 'waffle', 'omelet', 'toast', 'cereal', 'yogurt', 'cookie', 'cake', 'pie', 'donut', 'muffin', 'candy', 'chocolate', 'popcorn', 'fries', 'ketchup'],
  직업: ['doctor', 'nurse', 'teacher', 'police', 'chef', 'singer', 'actor', 'painter', 'writer', 'lawyer', 'judge', 'farmer', 'fisher', 'carpenter', 'driver', 'pilot', 'engineer', 'scientist', 'artist', 'baker', 'barista', 'dentist', 'designer', 'reporter', 'pharmacist', 'soldier', 'coach', 'vet', 'plumber', 'waiter', 'cashier', 'tailor', 'mechanic', 'guard', 'banker'],
  스포츠: ['soccer', 'baseball', 'basketball', 'volleyball', 'swimming', 'tennis', 'golf', 'boxing', 'judo', 'bowling', 'archery', 'cycling', 'skating', 'hiking', 'yoga', 'fencing', 'wrestling', 'diving', 'rowing', 'riding', 'hockey', 'rugby', 'surfing', 'climbing', 'skiing', 'running', 'marathon', 'karate', 'squash', 'billiards', 'curling', 'sailing', 'dancing', 'gymnastics', 'jumping'],
  색깔: ['red', 'orange', 'yellow', 'green', 'blue', 'navy', 'purple', 'black', 'white', 'pink', 'gray', 'brown', 'sky', 'lime', 'teal', 'violet', 'beige', 'coral', 'gold', 'silver', 'crimson', 'magenta', 'cyan', 'maroon', 'olive', 'turquoise', 'lavender', 'indigo', 'peach', 'mint', 'ivory', 'amber', 'scarlet', 'khaki', 'ruby'],
  나라: ['korea', 'japan', 'china', 'america', 'england', 'france', 'germany', 'canada', 'australia', 'brazil', 'italy', 'spain', 'russia', 'india', 'mexico', 'thailand', 'vietnam', 'egypt', 'swiss', 'greece', 'netherlands', 'belgium', 'sweden', 'norway', 'finland', 'denmark', 'poland', 'turkey', 'ireland', 'portugal', 'austria', 'chile', 'peru', 'kenya', 'singapore'],
  IT용어: ['program', 'data', 'server', 'network', 'code', 'function', 'variable', 'cloud', 'database', 'browser', 'system', 'security', 'backup', 'pixel', 'library', 'framework', 'module', 'memory', 'cache', 'cookie', 'domain', 'protocol', 'pointer', 'array', 'object', 'method', 'string', 'integer', 'boolean', 'python', 'java', 'kotlin', 'react', 'compiler', 'debug'],
}

const WORD_THEMES: Record<Lang, Record<string, string[]>> = {
  ko: WORD_THEMES_KO,
  en: WORD_THEMES_EN,
}

/** 언어별 낱말 주제 이름 목록 */
export function wordThemeNames(lang: Lang): string[] {
  return Object.keys(WORD_THEMES[lang])
}

/** 한 판에 출제할 단어 수(주제 풀에서 무작위로 뽑음). */
export const WORD_ROUND = 30

/** 낱말 한 판: 주제 풀에서 무작위로 섞어 WORD_ROUND개를 뽑는다. (호출 때마다 랜덤) */
export function makeWords(lang: Lang, theme: string, _seed: number): string[] {
  const themes = WORD_THEMES[lang]
  const base = themes[theme] ?? themes[wordThemeNames(lang)[0]]
  const shuffled = [...base].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(WORD_ROUND, shuffled.length))
}

// ===== 짧은글(단문): 주제별 한 문장 (한국어) =====
const SHORT_THEMES_KO: Record<string, string[]> = {
  속담: [
    '천 리 길도 한 걸음부터 시작된다.',
    '낮말은 새가 듣고 밤말은 쥐가 듣는다.',
    '가는 말이 고와야 오는 말이 곱다.',
    '티끌 모아 태산이라는 말을 기억하자.',
    '말 한마디로 천 냥 빚을 갚는다고 했다.',
    '백 번 듣는 것이 한 번 보는 것만 못하다.',
    '우물을 파도 한 우물을 파라고 했다.',
    '돌다리도 두들겨 보고 건너야 한다.',
  ],
  명언: [
    '아는 것이 힘이고 배움에는 끝이 없다.',
    '실패는 성공으로 가는 디딤돌일 뿐이다.',
    '오늘 걷지 않으면 내일은 뛰어야 한다.',
    '시작이 반이니 일단 가볍게 시작하자.',
    '꾸준한 연습이 결국 실력을 만든다.',
    '포기하지 않는 사람은 결코 지지 않는다.',
    '어제보다 나은 오늘이면 그것으로 충분하다.',
    '작은 습관이 모여 큰 변화를 만든다.',
  ],
  일상: [
    '오늘도 좋은 하루 보내시길 바랍니다.',
    '바른 자세가 빠르고 정확한 타자의 시작이다.',
    '따뜻한 차 한 잔에 마음이 차분해진다.',
    '창밖에는 노을이 붉게 물들고 있었다.',
    '주말에는 가까운 공원을 산책할 생각이다.',
    '천천히 호흡하며 키보드에 손을 올려 본다.',
    '맛있는 점심을 먹고 다시 힘을 내 본다.',
    '오랜만에 친구를 만나 즐거운 시간을 보냈다.',
  ],
}
// ===== 짧은글(단문): 주제별 한 문장 (영어) =====
const SHORT_THEMES_EN: Record<string, string[]> = {
  속담: [
    'Practice makes perfect.',
    'Better late than never.',
    'Actions speak louder than words.',
    'The early bird catches the worm.',
    'Look before you leap.',
    'Easy come, easy go.',
    'No pain, no gain.',
    'Honesty is the best policy.',
  ],
  명언: [
    'Knowledge is power.',
    'Dream big and work hard.',
    'Every day is a new chance.',
    'Small steps lead to big changes.',
    'Believe you can and you will.',
    'Stay hungry, stay foolish.',
    'Make today count.',
    'Never stop learning.',
  ],
  일상: [
    'Have a wonderful day today.',
    'The quick brown fox jumps over the lazy dog.',
    'A cup of warm tea calms the mind.',
    'I will meet my friend this weekend.',
    'Place your hands on the home row.',
    'The sun set slowly behind the hills.',
    'Reading a good book is a quiet joy.',
    'Take a deep breath and start typing.',
  ],
}

const SHORT_THEMES: Record<Lang, Record<string, string[]>> = {
  ko: SHORT_THEMES_KO,
  en: SHORT_THEMES_EN,
}

/** 언어별 짧은글 주제 목록(랜덤 포함) */
export function shortTopicNames(lang: Lang): string[] {
  return ['랜덤', ...Object.keys(SHORT_THEMES[lang])]
}

/** 짧은글 한 판(문장 3개). topic='랜덤'이면 무작위. */
export function makeShort(lang: Lang, topic: string, index: number): string[] {
  const themes = SHORT_THEMES[lang]
  const N = 3
  if (topic === '랜덤') {
    const all = Object.values(themes).flat()
    return Array.from({ length: N }, () => all[Math.floor(Math.random() * all.length)])
  }
  const pool = themes[topic] ?? Object.values(themes).flat()
  return Array.from({ length: N }, (_, i) => pool[(index + i) % pool.length])
}

// ===== 긴글(장문): 하나의 긴 글을 줄 단위로 =====
export interface LongText {
  title: string
  lines: string[]
}
const LONG_KO: LongText[] = [
  {
    title: '애국가 1절',
    lines: [
      '동해물과 백두산이 마르고 닳도록',
      '하느님이 보우하사 우리나라 만세',
      '무궁화 삼천리 화려강산',
      '대한 사람 대한으로 길이 보전하세',
    ],
  },
  {
    title: '애국가 2절',
    lines: [
      '남산 위에 저 소나무 철갑을 두른 듯',
      '바람 서리 불변함은 우리 기상일세',
      '무궁화 삼천리 화려강산',
      '대한 사람 대한으로 길이 보전하세',
    ],
  },
  {
    title: '서시 — 윤동주',
    lines: [
      '죽는 날까지 하늘을 우러러',
      '한 점 부끄럼이 없기를',
      '잎새에 이는 바람에도',
      '나는 괴로워했다',
      '별을 노래하는 마음으로',
      '모든 죽어 가는 것을 사랑해야지',
      '그리고 나한테 주어진 길을',
      '걸어가야겠다',
    ],
  },
  {
    title: '진달래꽃 — 김소월',
    lines: [
      '나 보기가 역겨워',
      '가실 때에는',
      '말없이 고이 보내 드리오리다',
      '영변에 약산 진달래꽃',
      '아름 따다 가실 길에 뿌리오리다',
      '가시는 걸음걸음 놓인 그 꽃을',
      '사뿐히 즈려밟고 가시옵소서',
    ],
  },
  {
    title: '컴퓨터 이야기',
    lines: [
      '컴퓨터는 우리 생활을 크게 바꾸어 놓았다.',
      '정보를 빠르게 주고받으며 세상은 점점 가까워진다.',
      '누구나 손쉽게 지식을 나누고 새로운 것을 배운다.',
      '작은 화면 속에 온 세상이 담겨 있는 셈이다.',
    ],
  },
]
const LONG_EN: LongText[] = [
  {
    title: '팬그램',
    lines: [
      'The quick brown fox jumps over the lazy dog.',
      'Pack my box with five dozen liquor jugs.',
      'How vexingly quick daft zebras jump.',
      'The five boxing wizards jump quickly.',
    ],
  },
  {
    title: '작은 별',
    lines: [
      'Twinkle, twinkle, little star,',
      'How I wonder what you are.',
      'Up above the world so high,',
      'Like a diamond in the sky.',
    ],
  },
  {
    title: '타자 팁',
    lines: [
      'Good posture is the start of fast typing.',
      'Keep your eyes on the screen, not the keys.',
      'Speed comes after accuracy, not before it.',
      'A little practice every day goes a long way.',
    ],
  },
  {
    title: '고요한 아침',
    lines: [
      'The morning light spread across the quiet town.',
      'Birds sang softly in the tall green trees.',
      'People walked slowly along the narrow streets.',
      'And the whole world seemed calm and bright.',
    ],
  },
]

const LONG: Record<Lang, LongText[]> = { ko: LONG_KO, en: LONG_EN }

/** 언어별 긴글 작품 목록(랜덤 포함) */
export function longTopicNames(lang: Lang): string[] {
  return ['랜덤', ...LONG[lang].map((l) => l.title)]
}

/** 긴글 한 판(제목+여러 줄). topic='랜덤'이면 무작위 작품. */
export function makeLong(lang: Lang, topic: string, index: number): LongText {
  const list = LONG[lang]
  if (topic === '랜덤') return list[Math.floor(Math.random() * list.length)]
  return list.find((l) => l.title === topic) ?? list[index % list.length]
}
