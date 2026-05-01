import wave #built into Python, lets me read and write WAV files
import numpy as np #manipulate audio samples as an array of numbers 

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

def encode (wav_path, json_string): 
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

  #encoding logic 
  message = json_string + '\0' #\0 null terminator, tells decoder to stop reading here

  message_bits = ''

  for character in message: 
    ascii_number = ord(character) #get ASCII number, 8 bit numerical codes that represent text, characters and control symbols in computers
    binary = format(ascii_number, '08b') #convert number to an 8 bit binary string
    message_bits += binary #store in message_bits string  

  print(message_bits)

  interval = 1600 #fixed interval, makes decoding easier 

  #gives me the bit and the index of the bit 
  for i, bit in enumerate(message_bits): #enumerate gets both index and value while looping 
    sample_index = i * interval #calculates which sample to write the current bit into to spread across 30 seconds 
    #for each bit in message go to the correct sample, force the last bit to match the message bit
    MSB = np.int16(-32768) #bitmask for first bit in sample (most significant bit)
    if int(bit) == 1: 
      audio_data[sample_index] = audio_data[sample_index] | MSB #forces first bit to 1
    else: 
      audio_data[sample_index] = audio_data[sample_index] & ~MSB #forces first bit to 0

  #converts the modified array back to raw bytes, mathcing the original sample width 
  if sample_width == 2: 
      raw_data_modified = audio_data.astype('<i2').tobytes() # convertsback to bytes
  else:                                                                           
      raise ValueError("Wrong format")#throws error 
  
  output_filename = wav_path.replace('.wav', '_encoded.wav')


  #write output file 
  with wave.open(output_filename, 'wb') as output_wav:
    output_wav.setnchannels(num_channels)
    output_wav.setsampwidth(sample_width)
    output_wav.setframerate(frame_rate)
    output_wav.writeframes(raw_data_modified)
  
  return output_filename

# if __name__ == '__main__': 
#    encode('../audio/ab81e378-8f01-4052-bc45-9b2fec13e547.wav', '{"test": "data"}' )

 
                                                                                  