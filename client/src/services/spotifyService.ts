import type { SearchResult } from "../types"

export const searchSongs = async (query: string):Promise<SearchResult> => {
  const response = await fetch(`http//localhost:3000/api/search?q=${query}`, {
    method: 'GET', 
    headers: { 'Content-Type': 'application/json'},
  })

  if (!response.ok) throw new Error(`Server error: ${response.status}`)
  const songData = await response.json()
  return songData
  
}