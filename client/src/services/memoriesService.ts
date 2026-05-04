import type { MemoryTypes, NewMemoryTypes, MemoryFiltersTypes, DecodedMemoryTypes } from "../types"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const getMemories = async (filters?: MemoryFiltersTypes): Promise<MemoryTypes[]> => {
  const params = new URLSearchParams() //built in browser API specifically designed for building query strings. handles all the formatting and encoding (adding ? = & etc) and encodes special characters 

  if (filters?.emotion) params.append('emotion', filters.emotion)
  if (filters?.season) params.append('season', filters.season)
  if (filters?.year) params.append('year', String(filters.year)) //convert number to string bc url search params onlu accepts strings 

  const response = await fetch (`${API_URL}/api/memories?${params.toString()}`) //when .toString() is called it returns a formatted query string 

  if(!response.ok) throw new Error(`Server error: ${response.status}`)
  
  const memoriesData = await response.json()
  return memoriesData
}

export const getMemoryById = async(id: string): Promise<MemoryTypes> => {
  const response = await fetch(`${API_URL}/api/memories/${id}`)

  if(!response.ok) throw new Error(`Server error: ${response.status}`)

  const memoryData = await response.json()
  return memoryData
}

export const createMemory = async (data: NewMemoryTypes): Promise<MemoryTypes> => {
  const response = await fetch(`${API_URL}/api/memories/`, {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify(data), 
  })

  if(!response.ok) throw new Error(`Server error: ${response.status}`)
  
  const newMemoryData = await response.json()
  return newMemoryData
}

export const deleteMemory = async (id: string): Promise<MemoryTypes> => {
  const response = await fetch(`${API_URL}/api/memories/${id}`, {
    method: 'DELETE', 
  })

  if(!response.ok) throw new Error(`Server error: ${response.status}`)
  
  const deletedMemoryData = await response.json()
  return deletedMemoryData
}

export const generateEncodedSong = async (id: string): Promise<string> => {
  const response = await fetch(`${API_URL}/api/memories/${id}/download`)
  if (!response.ok) throw new Error (`Server error: ${response.status}`)
  const data = await response.json()
  console.log('encode response data:', data) 
  return data.url //R2 public URL 
}

export const decodeSong = async(id: string): Promise<DecodedMemoryTypes> => {
  const response = await fetch(`${API_URL}/api/memories/${id}/decode`)
  if(!response.ok) throw new Error (`Server error: ${response.status}`)

  const decodedMemoryData = await response.json()
  return decodedMemoryData.decoded_message
}
