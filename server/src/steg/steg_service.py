#flask microservice: exposes my encoder and decoder as http encpoints for my Express backend to call 
import urllib.request
import os 
import base64
from flask import Flask, request, jsonify 
from encoder import encode 
from decoder import decode 
import ssl 

#same as const app: Express = express()
steg_service = Flask(__name__) #__name__ is a built in python variable that holds the name of the current module. when the file is imported by another file __name__ is set to that filename

#encoder route
@steg_service.route('/encode', methods=['POST'])
def encode_route(): 
  try: 
    json_string = request.json.get('json_string') #memory data to hide in the audio
    wav_path = request.json.get('wav_path') #dev: shared filesystem path 
    wav_base64 = request.json.get('wav_base64') # prod: base64-encoded WAV bytes 

    if wav_base64: 
      #production path: decode base64, write temp WAV, encode, return encoded as base 64 
      tmp_path = f'/tmp/encode_input_{os.urandom(8).hex()}.wav' # generate a unique temp file path on Flask's container
      #os.random(8).hex() gives a random 16-char hex string to avoid collisions 
      
      #with is python equivalent of fs.openSync(path, 'w') in js 
      with open(tmp_path, 'wb') as f: #'wb' = write binary - writes those bytes as a WAV file to flask
        f.write(base64.b64decode(wav_base64)) #converst the base64 string back to raw bytes 

      output_filename = encode(tmp_path, json_string) #call the existing enode function, saves encoded wav to tmp

      #delete the original temp WAV 
      os.remove(tmp_path)

      with open(output_filename, 'rb') as f: #read encoded wav bytes back from disk 
        encoded_base64 = base64.b64encode(f.read()).decode('utf-8') #converts bytes to base64 bytes, .decode('uts-8')
      
      #delete encoded temp WAV, we've read it to memory no longer need it on disk 
      os.remove(output_filename)

      return jsonify({ 'encoded_base64': encoded_base64}) #return encoded wave as base64 
    else: 
      # local dev: flask and express share the same filesystem, path works directly 
      output_filename = encode(wav_path, json_string)
      return jsonify({ 'output_path': output_filename }) #python dictionary being converted to JSON
  except Exception as e: #equivalent of catch(error)
    return jsonify({ 'error': str(e) }), 500 # str(e) converts the error to a string like error.message; sets status code to 500

#decoder route
@steg_service.route('/decode', methods=['POST'])
def decode_route(): 
  try: 
    wav_url = request.json.get('wav_url')
    print(f'decode called with wav_url: {wav_url}')
    tmp_path = f'/tmp/decode_{os.urandom(8).hex()}.wav' # unique temp path 
    
    # This spoofs a browser User-Agent, which Cloudflare accepts. `urllib.request.urlopen` and `Request` are both built-in Python, no new imports needed.
    req = urllib.request.Request(wav_url, headers={'User-Agent': 'Mozilla/5.0'})
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    response = urllib.request.urlopen(req, context=ssl_context)
    with open(tmp_path, 'wb') as f:
        f.write(response.read())
    response.close()
    
    #calll decode function 
    decoded_message = decode(tmp_path)
    os.remove(tmp_path)
    return jsonify({ 'decoded_message': decoded_message })
  except Exception as e: 
    return jsonify({ 'error': str(e) }), 500

#only start the flask server if this file is being run directly not if it's being imported 
if __name__ == '__main__': #meand that the file is being run directly and not being imported
  steg_service.run(port=5001)

