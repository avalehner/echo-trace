import { exec } from 'child_process' //built in node module that lets you spawn subprocesses (running shell commands within node app). exec is a mthod it provides. 
//exec runs a comman in the shell and hands it back  to your callback. it gives:
// error: an error object, stdout: everything the command wrote to standard output (string), stderr: everything written to standard error (string)
import { promisify } from 'util' // a utility from nodes built in util module that converst callback style function into one that returns a promise so async await can be used
import fs from 'fs' //for creating and checking files/folders 
import path from 'path'
import { fileURLToPath } from 'url'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3' 
import 'dotenv/config'


console.log('R2_ACCOUNT_ID:', process.env.R2_ACCOUNT_ID)
console.log('R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID)

//create R2 client 
const r2Client = new S3Client({
  region: "auto", //lets CloudFlare handle the region 
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, //R2's S3 API endpoint 
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!, 
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!, 
  },
})

//gets absolute path to service folder
const __dirname = path.dirname(fileURLToPath(import.meta.url))
// import.meta.url built into ESM, gives url of the current file 
//fileURLToPath converts url to filepath 
//path.dirname: strips filename and just gives path 

//finds audio folder relative to services folder 
export const audioDir = path.resolve(__dirname, '../audio')
//path.resolve() takes a starting point and a relative path and joins them into an absolute path. says go up from services into audio folder 

const execAsync = promisify(exec) //function when called returns a promise that resolves to { stdout, stderr }

export const downloadWav = async (song: string, artist: string, memoryId: string) => {
  //check if audio file exists before running, good to do because i am gitignoring the audio file so this is a safety check in case someone clones my repo 
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir)
  
  const outputPath = path.resolve(audioDir, `${memoryId}.wav`)
  const ytdlpCommand = `yt-dlp "ytsearch1:${song} ${artist}" --extract-audio --audio-format wav -o "${outputPath}"`

  try {
    await execAsync(ytdlpCommand) 

    //checks if the wave file exists, if not throws error 
    if (!fs.existsSync(outputPath)) throw new Error ('WAV file was not created')

    return outputPath
  } catch (error) { //catches anything that threw, could be manual error i threw(like in try block) or an error that came from execAsync itself
    console.error('yt-dlp failed:', error)
    throw error //rethrow error so that the route that called download wav knows something went wrong and can handle it, by rethrowing the error block in my route can catch it and alert me tha theres an error 
  }
}

//Upload file, returns public URL 
export const uploadToR2 = async (filepath: string, key: string): Promise<string> => { 
  const fileContent = fs.readFileSync(filepath) //reads file into memory as raw bites so it can be sent to R2 

  await r2Client.send(new PutObjectCommand({ //initial file upload instructions 
    Bucket: process.env.R2_BUCKET_NAME!, 
    Key: key, //filename/path inside the bucket 
    Body: fileContent, //content of file as buffer (ray bites)
    ContentType: 'audio/wav'  //tells R2 what kind of file so browsers can stream it correctly
  }))

  return `${process.env.R2_PUBLIC_URL}/${key}` //returns public url so the frontend can play the file directly from R2
}

//download song files from R2 
export const downloadFromR2 = async (key: string, destPath: string): Promise<void> => {
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`
  
  const response = await fetch(publicUrl) //fetches file from R2's public URL 
  if (!response.ok) throw new Error (`Failed to download from R2: ${response.status}`)

  const buffer = Buffer.from(await response.arrayBuffer()) //converts response body into a Node.js buffer 

  fs.writeFileSync(destPath, buffer) //writes file to distination path so Flask service can read it for decoding
} 
