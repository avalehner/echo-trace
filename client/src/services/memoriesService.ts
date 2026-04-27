import type { MemoryTypes, NewMemoryTypes } from "../types"

interface MemoryFilters {
  emotion?: string
  season?: string
  year?: number
}

export const getMemories = async (filters?: MemoryFilters): Promise<MemoryTypes[]> => {
  const params = new URLSearchParams() //built in browaser API specifically designed for building query strings. handles all the formatting and encoding (adding ? = & etc) and encodes special characters 

  if (filters?.emotion) params.append('emotion', filters.emotion)
  if (filters?.season) params.append('season', filters.season)
  if (filters?.year) params.append('year', String(filters.year)) //convert number to string bc url search params onlu accepts strings 

  const response = await fetch (`http://localhost:3000/api/memories?${params.toString()}`) //when .toString() is called it returns a formatted query string 

  if(!response.ok) throw new Error(`Server error: ${response.status}`)
  
  const memoriesData = await response.json()
  return memoriesData
}



export const createMemory = async (data: NewMemoryTypes): Promise<MemoryTypes> => {
  const response = await fetch(`http://localhost:3000/api/memories/`, {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify(data), 
  })

  if(!response.ok) throw new Error(`Server error: ${response.status}`)
  
  const newMemoryData = await response.json()
  return newMemoryData
}