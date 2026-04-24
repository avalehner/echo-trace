export interface MemoryTypes {
  id: string, 
  song_id: string, 
  song_name: string, 
  artist: string, 
  emotion: string, 
  season: string, 
  year: number, 
  memory_fragment: string, 
  wav_path: string, 
  created_at: string, 
}

export type NewMemoryTypes = Omit<MemoryTypes, 'id' | 'created_at'>