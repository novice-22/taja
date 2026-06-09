import { useEffect, useRef, useState } from 'react'
import { TRACKS } from '../data/music'
import { useSettings } from '../settings'

/**
 * 배경음악 플레이어. 헤더에 항상 떠 있어 페이지를 바꿔도 끊기지 않는다.
 * 음량은 설정(톱니바퀴)에서 조절하며 여기 audio 에 반영된다.
 * (브라우저 정책상 자동재생 불가 → 사용자가 ▶ 를 눌러야 시작)
 */
export default function MusicPlayer() {
  const { musicVolume, musicOn, set } = useSettings()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [track, setTrack] = useState(0)

  const hasTracks = TRACKS.length > 0
  const current = hasTracks ? TRACKS[track % TRACKS.length] : null

  // 음량 반영
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = musicVolume / 100
  }, [musicVolume])

  // 재생/정지 반영
  useEffect(() => {
    const a = audioRef.current
    if (!a || !current) return
    if (musicOn) a.play().catch(() => set('musicOn', false))
    else a.pause()
  }, [musicOn, track, current, set])

  function toggle() {
    if (!hasTracks) return
    set('musicOn', !musicOn)
  }
  function next() {
    if (!hasTracks) return
    setTrack((t) => (t + 1) % TRACKS.length)
  }

  return (
    <div className="music-player" title={hasTracks ? current?.name : '음악 파일을 추가하세요'}>
      <button className="music-btn" type="button" onClick={toggle} disabled={!hasTracks} aria-label="재생/정지">
        {musicOn ? '⏸' : '▶'}
      </button>
      <span className="music-name">{hasTracks ? current?.name : '음악 없음'}</span>
      {hasTracks && (
        <button className="music-btn" type="button" onClick={next} aria-label="다음 곡">
          ⏭
        </button>
      )}
      {current && (
        <audio
          ref={audioRef}
          src={current.src}
          loop={TRACKS.length <= 1}
          preload="none"
          onEnded={next}
        />
      )}
    </div>
  )
}
