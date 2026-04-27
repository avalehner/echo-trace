import { exec } from 'child_process' //built in node module that lets you spawn subprocesses (running shell commands within node app). exec is a mthod it provides. 
//exec runs a comman in the shell and hands it back  to your callback. it gives:
// error: an error object, stdout: everything the command wrote to standard output (string), stderr: everything written to standard error (string)
import { promisify } from 'util' // a utility from nodes built in util module that converst callback style function into one that returns a promise so async await can be used
import fs from 'fs' //for creating and checking files/folders 
import path from 'path'
import { fileURLToPath } from 'url'

//gets absolute path to service folder
const __dirname = path.dirname(fileURLToPath(import.meta.url))
// import.meta.url built into ESM, gives url of the current file 
//fileURLToPath converts url to filepath 
//path.dirname: strips filename and just gives path 

//finds audio folder relative to services folder 
const audioDir = path.resolve(__dirname, '../audio')
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
