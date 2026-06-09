/**
 * 배경음악 목록.
 * src/assets/music/ 폴더에 mp3/ogg/m4a 파일을 넣으면 자동으로 목록에 잡힌다.
 * (파일을 넣고 저장하면 끝 — 코드 수정 불필요)
 */
const files = import.meta.glob('../assets/music/*.{mp3,ogg,m4a,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export interface Track {
  name: string
  src: string
}

export const TRACKS: Track[] = Object.entries(files)
  .map(([path, src]) => ({
    name: (path.split('/').pop() ?? 'track').replace(/\.[^.]+$/, ''),
    src: src as string,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))
