import wave #built into Python, lets me read and write WAV files
import numpy as np #manipulate audio samples as an array of numbers 
import json #built into python, lets me parse and stringify JSON 

# To summarize the full encoding process in plain English:

# Take your JSON string, convert every character to 8 bits — now you have a long string of 1s and 0s
# Calculate how far apart to space the bits so they spread across 30 seconds
# For each bit in your message, jump to the correct sample using i * interval
# Look at that sample's 16-bit value, flip only the very last bit to match your message bit
# Move to the next bit, jump to the next sample, repeat

# The decoder does the exact reverse:

# Jump to the same samples using the same interval
# Read the last bit of each sample
# Reassemble the bits into characters
# Stop at \0
# Parse as JSON

# The audio sounds identical because you changed one bit out of 16 in specific samples — a maximum change of 1 out of 32,767 in sample value. Completely inaudible.


# flow: 
# open and read metadata + raw bytes
# convert raw bytes to array of integers
# manipulate specific integers to hide message bits
# convert integers back to raw bytes
# write new WAV file with same metadata but modified audio data

def decode (wav_path): 
  #opens wave file in binary, rb stands for read binary, wave.open takes the path string and opens the actual file
  wav_file = wave.open(wav_path, 'rb')

  # sounds is air pressure change over time, a sample is the measure of airpressue at a given moment. 

  #get audio meta data 
  num_channels = wav_file.getnchannels()  #gets number of audio channels: how many separate streams of audio exist in the file (built in wave function)                    
  sample_width = wav_file.getsampwidth()  #gets bytes per sample - 2 means 16 bit audio, this is what yt-dlp gives us(built in wave function)                                    
  frame_rate = wav_file.getframerate()  #gets sample rate, how many samples were taken per second - usually 44100 samples per second (built in wave function)                                   
  num_frames = wav_file.getnframes() #gets total number of frames (samples) in the file, how long the song is in sample units (built in wave function)                                            

  #printing audio metadata                                                                    
  print(f"channels: {num_channels}")                                              
  print(f"sample width: {sample_width} bytes")                                    
  print(f"num frames: {num_frames}")  

  #reads all the audio frames as raw binary bytes  
  raw_data = wav_file.readframes(num_frames)                                     
  wav_file.close() #closes the file                                                              

  #converts raw bytes into an array of numbers depending on sample width (only need sample width of 2 for yt-dlp outputs)                                                                              
  #cant do math on bytes, we need to convert them to integers 
  if sample_width == 2:                                                         
      audio_data = np.frombuffer(raw_data, dtype='<i2') #each sample is a 2 byte integer 
  else:                                                                           
      raise ValueError("Wrong format")   #throws error 
  
  #copy audio data, numpy arrays are passed by reference like objects in javascript 
  audio_data = audio_data.copy()

  #decoding logic 
  interval = 800 #fixed interval between samples
  extracted_bits = ''
  message = ''

  for i in range(0, len(audio_data), interval): 
    bit = audio_data[i] & 1 #extracts the last bit in the sample 
    extracted_bits += str(bit) #appends to extracted bit string 

    if len(extracted_bits) == 8: 
      character = chr(int(extracted_bits, 2)) #converts 8 bits to a character
      if character == '\0': #checks for null terminator 
        break 
      message += character #appends result to message 
      extracted_bits = '' #reset for next 8 bits 
  
  return(json.loads(message))

  

