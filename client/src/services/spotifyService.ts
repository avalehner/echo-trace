import type { SearchResult } from "../types"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const searchSongs = async (query: string):Promise<SearchResult[]> => { //dont need GET because fetch automatically defaults to GET
  const response = await fetch(`${API_URL}/api/search?q=${query}`)

  if (!response.ok) throw new Error(`Server error: ${response.status}`)

  const songData: SearchResult[] = await response.json()
  return songData
  
}