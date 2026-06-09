import { useEffect, useRef, useState } from 'react'
import { TRACKS } from '../data/music'
import { useSettings } from '../settings'

/**
 * 배경음악 플레이어. 헤더에 항상 떠 있어 페이지를 바꿔도 끊기지 않는다.
 * - 페이지 로드/다음(⏭) 시 무작위 곡 선택, 곡이 끝나면 다음 곡도 무작위
 * - 🔂 버튼으로 "현재 곡만 반복" 토글
 * - 음량은 설정(톱니바퀴)에서 조절
 * (브라우저 정책상 자동재생 불가 → 사용자가 ▶ 를 눌러야 시작)
 */
function randomIndex(exclude = -1): number {
  if (TRACKS.length <= 1) return 0
  let n = exclude
  while (n === exclude) n = Math.floor(Math.random() * TRACKS.length)
  return n
}

export default function MusicPlayer() {
  const { musicVolume, musicOn, set } = useSettings()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [track, setTrack] = useState(() => randomIndex()) // 시작 곡 무작위
  const [repeatOne, setRepeatOne] = useState(false)
  const historyRef = useRef<number[]>([]) // 재생 기록(이전 곡으로 돌아가기용)

  const hasTracks = TRACKS.length > 0
  const current = hasTracks ? TRACKS[track % TRACKS.length] : null

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = musicVolume / 100
  }, [musicVolume])

  useEffect(() => {
    const a = audioRef.current
    if (!a || !current) return
    if (musicOn) a.play().catch(() => set('musicOn', false))
    else a.pause()
  }, [musicOn, track, current, set])

  function toggle() {
    if (hasTracks) set('musicOn', !musicOn)
  }
  function next() {
    if (!hasTracks) return
    setTrack((prev) => {
      historyRef.current.push(prev) // 현재 곡을 기록에 남기고
      return randomIndex(prev) // 무작위 다음 곡
    })
  }
  function prev() {
    if (!hasTracks) return
    setTrack((cur) => {
      const h = historyRef.current
      return h.length > 0 ? (h.pop() as number) : randomIndex(cur) // 직전 곡(없으면 랜덤)
    })
  }
  function handleEnded() {
    if (!repeatOne) next() // 반복 모드가 아니면 무작위 다음 곡 (반복이면 loop 속성이 처리)
  }

  return (
    <div className="music-player" title={hasTracks ? current?.name : '음악 파일을 추가하세요'}>
      <button className="music-btn" type="button" onClick={toggle} disabled={!hasTracks} aria-label="재생/정지">
        {musicOn ? '⏸' : '▶'}
      </button>
      <span className="music-name">{hasTracks ? current?.name : '음악 없음'}</span>
      {hasTracks && (
        <>
          <button className="music-btn" type="button" onClick={prev} aria-label="이전 곡" title="이전 곡">
            ⏮
          </button>
          <button className="music-btn" type="button" onClick={next} aria-label="랜덤 다음 곡" title="랜덤 다음 곡">
            ⏭
          </button>
          <button
            className={`music-btn${repeatOne ? ' on' : ''}`}
            type="button"
            onClick={() => setRepeatOne((v) => !v)}
            aria-label="한 곡 반복"
            title={repeatOne ? '한 곡 반복 켜짐' : '한 곡 반복'}
          >
            🔂
          </button>
        </>
      )}
      {current && (
        <audio
          ref={audioRef}
          src={current.src}
          loop={repeatOne || TRACKS.length <= 1}
          preload="none"
          onEnded={handleEnded}
        />
      )}
    </div>
  )
}
