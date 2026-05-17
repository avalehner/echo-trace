import wave 
import json
import asyncio
import edge_tts
import os 
import subprocess #runs CLI commands, similar to execAsync() in js 
 
def encode_voice (wav_path, json_string): 
  memory = json.loads(json_string)
  memory_fragment = memory["memory_fragment"]

  tmp_mp3_filepath = f'/tmp/voice_encode_{os.urandom(8).hex()}.mp3'
  voice_wav_path = wav_path.replace('.wav', '_voice.wav')
  mixed_wav_path = wav_path.replace('.wav', '_mixed.wav')

  #convert memory to voice 
  async def convert_voice(): 
    communicate = edge_tts.Communicate(memory_fragment, "en-US-AriaNeural")
    await communicate.save(tmp_mp3_filepath)
  
  asyncio.run(convert_voice())

  voiceResult = subprocess.run(
    ["ffmpeg", "-y", "-i", tmp_mp3_filepath, "-ar", "48000", "-ac", "2", f"{voice_wav_path}"], 
    capture_output=True, 
    text=True, 
    check=True, 
  )

  mixResult = subprocess.run(
    ["ffmpeg", "-y", "-i", wav_path, "-i",  voice_wav_path, "-filter_complex", "[0:a]volume=0.5[s];[1:a]volume=3.5[v];[s][v]amix=inputs=2:duration=first[out]", "-map", "[out]", f"{mixed_wav_path}"], 
    capture_output=True, 
    text=True, 
    check=True, 
  )

  return mixed_wav_path


# if __name__ == "__main__": 
#   print(encode_voice('../audio/9e051be7-fcda-4c6a-bdc3-68f88120f0e1.wav', '{"emotion": "sad", "memory_fragment": "test"}'))