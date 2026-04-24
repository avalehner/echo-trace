import type { MemoryTypes, NewMemoryTypes } from "../types"

export const getAllMemories = async (): Promise<MemoryTypes> => {
  const response = await fetch (`http://localhost:3000/api/memories`, {
    method: 'GET', 
    headers: { 'Content-Type': 'appliction/json'}, 
  })

  if(!response.ok) throw new Error(`Server error: ${response.status}`)
  
  const memoriesData = await response.json()
  return memoriesData
}

export const getMemoryByEmotion = async (emotion: string): Promise<MemoryTypes> => {
  const response = await fetch(`http://localhost:3000/api/memories/${emotion}`, {
    method: 'GET', 
    headers: { 'Content-Type': 'application/json' }, 
  })

  if(!response.ok) throw new Error(`Server error: ${response.status}`)
    
  const memoriesData = await response.json()
  return memoriesData
}

export const createMemory = async (data: NewMemoryTypes): Promise<MemoryTypes> => {
  const response = await fetch(`http://localhost:3000/api/memories/`, {
    method: 'POST', 
    headers: {'Content-type': 'application/json'}, 
    body: JSON.stringify(data), 
  })

  if(!response.ok) throw new Error(`Server error: ${response.status}`)
  
  const newMemoryData = response.json()
  return newMemoryData
}