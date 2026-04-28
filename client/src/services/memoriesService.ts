import type { MemoryTypes, NewMemoryTypes, MemoryFiltersTypes } from "../types"

export const getMemories = async (filters?: MemoryFiltersTypes): Promise<MemoryTypes[]> => {
  const params = new URLSearchParams() //built in browser API specifically designed for building query strings. handles all the formatting and encoding (adding ? = & etc) and encodes special characters 

  if (filters?.emotion) params.append('emotion', filters.emotion)
  if (filters?.season) params.append('season', filters.season)
  if (filters?.year) params.append('year', String(filters.year)) //convert number to string bc url search params onlu accepts strings 

  const response = await fetch (`http://localhost:3000/api/memories?${params.toString()}`) //when .toString() is called it returns a formatted query string 

  if(!response.ok) throw new Error(`Server error: ${response.status}`)
  
  const memoriesData = await response.json()
  return memoriesData
}

export const getMemoryById = async(id: string): Promise<MemoryTypes> => {
  const response = await fetch(`http://localhost:3000/api/memories/${id}`)

  if(!response.ok) throw new Error(`Server error: ${response.status}`)

  const memoryData = await response.json()
  return memoryData
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

export const deleteMemory = async (id: string): Promise<MemoryTypes> => {
  const response = await fetch(`http://localhost:3000/api/memories/${id}`, {
    method: 'DELETE', 
  })

  if(!response.ok) throw new Error(`Server error: ${response.status}`)
  
  const deletedMemoryData = await response.json()
  return deletedMemoryData
}

export const generateEncodedSong = async (id: string): Promise<string> => {
  const response = await fetch(`http://localhost:3000/api/memories/${id}/download`)
  if (!response.ok) throw new Error (`Server error: ${response.status}`)
  
  const blob = await response.blob() //blob = binary large object - raw chunk of binary data (WAV file is in binary)
  const url = URL.createObjectURL(blob) //creates a temporary URL That points to the blob in memory

  return url 
}
