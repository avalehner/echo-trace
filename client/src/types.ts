export interface MemoryTypes {
  id: string
  song_id: string
  song_name: string
  album_name: string
  artist: string
  emotion: string 
  season: string
  year: number
  memory_fragment: string
  created_at: string
}

export type NewMemoryTypes = Omit<MemoryTypes, 'id' | 'created_at'>

export interface SearchResult {
  song_id: string 
  song_name: string
  artist: string 
  album_name: string
  album_art: string 
}

export interface MemoryFiltersTypes {
  emotion?: string
  season?: string
  year?: number
}
