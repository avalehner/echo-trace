import { exec } from 'child_process'; //built in node module that lets you spawn subprocesses (running shell commands within node app). exec is a mthod it provides.
//exec runs a comman in the shell and hands it back  to your callback. it gives:
// error: an error object, stdout: everything the command wrote to standard output (string), stderr: everything written to standard error (string)
import { promisify } from 'util'; // a utility from nodes built in util module that converst callback style function into one that returns a promise so async await can be used
import fs from 'fs'; //for creating and checking files/folders
import os from 'os'; //built in node module that igve information about the operating system
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import 'dotenv/config';
import ffmpegStatic from 'ffmpeg-static';

//create R2 client
const r2Client = new S3Client({
  region: 'auto', //lets CloudFlare handle the region
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, //R2's S3 API endpoint
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

//gets absolute path to service folder
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// import.meta.url built into ESM, gives url of the current file
//fileURLToPath converts url to filepath
//path.dirname: strips filename and just gives path

//finds audio folder relative to services folder
export const audioDir = path.resolve(__dirname, '../audio');
//path.resolve() takes a starting point and a relative path and joins them into an absolute path. says go up from services into audio folder

const execAsync = promisify(exec); //function when called returns a promise that resolves to { stdout, stderr }

export const downloadWavYtDlp = async (song: string, artist: string, memoryId: string) => {
  //check if audio file exists before running, good to do because i am gitignoring the audio file so this is a safety check in case someone clones my repo
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);

  const outputPath = path.resolve(audioDir, `${memoryId}.wav`);
  const ytdlpCommand = `yt-dlp "ytsearch1:${song} ${artist}" --extract-audio --audio-format wav -o "${outputPath}"`;

  try {
    await execAsync(ytdlpCommand);

    //checks if the wave file exists, if not throws error
    if (!fs.existsSync(outputPath)) throw new Error('WAV file was not created');

    return outputPath;
  } catch (error) {
    //catches anything that threw, could be manual error i threw(like in try block) or an error that came from execAsync itself
    console.error('yt-dlp failed:', error);
    throw error; //rethrow error so that the route that called download wav knows something went wrong and can handle it, by rethrowing the error block in my route can catch it and alert me tha theres an error
  }
};

//Upload file, returns public URL
export const uploadToR2 = async (filepath: string, key: string): Promise<string> => {
  const fileContent = fs.readFileSync(filepath); //reads file into memory as raw bites so it can be sent to R2

  await r2Client.send(
    new PutObjectCommand({
      //initial file upload instructions
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key, //filename/path inside the bucket
      Body: fileContent, //content of file as buffer (ray bites)
      ContentType: 'audio/wav', //tells R2 what kind of file so browsers can stream it correctly
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`; //returns public url so the frontend can play the file directly from R2
};

//download song files from R2
export const downloadFromR2 = async (key: string, destPath: string): Promise<void> => {
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  const response = await fetch(publicUrl); //fetches file from R2's public URL
  if (!response.ok) throw new Error(`Failed to download from R2: ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer()); //converts response body into a Node.js buffer

  fs.writeFileSync(destPath, buffer); //writes file to distination path so Flask service can read it for decoding
};

export const downloadAndConvertPreview = async (song: string, artist: string, memoryId: string) => {
  // os.tmpdir() returns the system temp folder (/var/folders/ on Mac)
  // path.join builds the full path: e.g. /tmp/abc123.mp3
  //these files dont exist yet, we are declaring them to use later
  const mp3Path = path.join(os.tmpdir(), `${memoryId}.mp3`);
  const wavPath = path.join(os.tmpdir(), `${memoryId}.wav`);

  try {
    const query = encodeURIComponent(`artist:"${artist}" track:"${song}"`);
    const deezerResponse = await fetch(`https://api.deezer.com/search?q=${query}`);

    if (!deezerResponse.ok) throw new Error(`Deezer error: ${deezerResponse.status}`);

    const previewData = await deezerResponse.json();
    const previewMp3Url = previewData.data[0]?.preview;
    if (!previewMp3Url) throw new Error(`No deezer results/preview is null for ${query}`);

    // makes an HTTP GET request to the Deezer CDN URL
    // the response body is the raw MP3 audio bytes (not JSON this time)
    const mp3Response = await fetch(previewMp3Url);

    if (!mp3Response.ok) throw new Error(`Failed to download preview: ${mp3Response.status} `);

    // .arrayBuffer() reads the entire response body as raw bytes
    // Buffer.from() wraps those bytes into a Node.js Buffer (which fs can write to disk)
    //when we fetch the mp3 file from the internet, the result comes back as a stream of raw bytes
    //and array buffer is a low level javascript object that holds raw binary data
    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    // writes the buffer (the MP3 file's bytes) to disk at /tmp/abc123.mp3
    // now ffmpeg can read it as a real file
    fs.writeFileSync(mp3Path, buffer);

    if (!ffmpegStatic) throw new Error('ffmpeg binary not found — ffmpeg-static returned null');

    //ffmpeg converts mp3 to wav
    const ffmpegCommand = `"${ffmpegStatic}" -y -i "${mp3Path}" -ar 48000 "${wavPath}"`;
    await execAsync(ffmpegCommand);

    //delete mp3 temp file once ffmpeg is done with it
    fs.unlinkSync(mp3Path);
    return wavPath;
  } catch (error) {
    //clean up any partial temp files before re-throwing
    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
    if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
    console.error('[downloadAndConvertPreview error:', error);
    throw error; //rethrows error so the memories.ts route catch block still handles it
  }
};
