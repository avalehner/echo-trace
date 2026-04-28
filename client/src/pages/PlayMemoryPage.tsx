import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import type { MemoryTypes } from '../types'
import { getMemoryById } from '../services/memoriesService'
import MemoryLog from '../components/MemoryLog'
import { generateEncodedSong } from '../services/memoriesService'

const PlayMemoryPage = () => {
  const [memory, setMemory] = useState<MemoryTypes | null>(null)
  const [encodedSongUrl, setEncodedSongUrl] = useState<string | null>(null)

  const { id } = useParams()

  useEffect(() => {
    if (!id) return  
    getMemoryById(id)
      .then(data => setMemory(data))
  }, [id])

  if (!memory) return null 

  const handleEncodedSong = async (memoryId: string) => {
    const url = await generateEncodedSong(memoryId)
    setEncodedSongUrl(url)
  }

  return (
    <div>
      <MemoryLog 
        memory={memory}
      />
      <button onClick={()=> handleEncodedSong(memory.id)}>encode your memory</button>
      {encodedSongUrl && (
        <div>
          <audio controls src={encodedSongUrl} />
          <a href={encodedSongUrl}>download encoded song</a>
        </div>
      )}
    </div> 
  )
}

export default PlayMemoryPage