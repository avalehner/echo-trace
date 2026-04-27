import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import type { MemoryTypes } from '../types'
import { getMemoryById } from '../services/memoriesService'
import MemoryLog from '../components/MemoryLog'
import { downloadWav } from '../services/memoriesService'

const PlayMemoryPage = () => {
  const [memory, setMemory] = useState<MemoryTypes | null>(null)

  const { id } = useParams()

  useEffect(() => {
    if (!id) return  
    getMemoryById(id)
      .then(data => setMemory(data))
  }, [id])

  if (!memory) return null 

  return (
    <div>
      <MemoryLog 
        memory={memory}
      />
      <button onClick={()=> downloadWav(memory.id)}>generate your memory</button>
    </div>
  )
}

export default PlayMemoryPage