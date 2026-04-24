import type { SearchResult } from "../types"

export const searchSongs = async (query: string):Promise<SearchResult[]> => { //dont need GET because fetch automatically defaults to GET
  const response = await fetch(`http//localhost:3000/api/search?q=${query}`)

  if (!response.ok) throw new Error(`Server error: ${response.status}`)

  const songData: SearchResult[] = await response.json()
  return songData
  
}