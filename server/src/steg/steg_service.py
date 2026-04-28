#flask microservice: exposes my encoder and decoder as http encpoints for my Express backend to call 

from flask import Flask, request, jsonify 
from encoder import encode 
from decoder import decode 

#same as const app: Express = express()
steg_service = Flask(__name__) #__name__ is a built in python variable that holds the name of the current module. when the file is imported by another file __name__ is set to that filename

#encoder route
@steg_service.route('/encode', methods=['POST'])
def encode_route(): 
  try: 
    wav_path = request.json.get('wav_path')
    json_string = request.json.get('json_string')
    output_filename = encode(wav_path, json_string)
    return jsonify({ 'output_path' : output_filename }) #python dictionary being converted to JSON
  except Exception as e: #equivalent of catch(error)
    return jsonify({ 'error': str(e) }), 500 # str(e) converts the error to a string like error.message; sets status code to 500

#decoder route
@steg_service.route('/decode', methods=['POST'])
def decode_route(): 
  try: 
    wav_path = request.json.get('wav_path')
    decoded_message = decode(wav_path)
    return jsonify({ 'decoded_message': decoded_message })
  except Exception as e: 
    return jsonify({ 'error': str(e) }), 500

#only start the flask server if this file is being run directly not if it's being imported 
if __name__ == '__main__': #meand that the file is being run directly and not being imported
  steg_service.run(port=5001)

