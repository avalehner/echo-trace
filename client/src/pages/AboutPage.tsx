import styles from './css/AboutPage.module.css';

const AboutPage = () => {
  return (
    <div className={styles['about-page-container']}>
      <h1 className={styles['title']}>HOW TO USE</h1>
      <p>
        EchoTrace is an audio steganography app that allows users to encode their memories into .wav
        files of their favorite songs.
      </p>
      <div className={styles['instructions-container']}>
        <p>
          {'>'} Search for a <span className={styles['pink']}>song title or artist</span> that
          evokes a specific <span className={styles['pink']}>memory or emotion</span> for you.
        </p>{' '}
        <p>
          {'>'} Select your song and input a{' '}
          <span className={styles['pink']}>
            feeling, time period (season/year), and short memory.
          </span>
        </p>
        <p>{'>'} Submit your memory.</p>
        <p>
          {'>'} Select <span className={styles['pink']}>listen to your memory</span>
        </p>
        <p>
          {'>'} Use the toggle to select how you would like your memory encoded into the song file.
        </p>
        <p>
          {'>'} Select <span className={styles['pink']}>encode your memory</span> and press play!
        </p>
      </div>
      <h1 className={styles['title']}>ABOUT ECHOTRACE</h1>
      <div className={styles['about-container']}>
        <p>
          This project was born from the idea that music can serve as a database for your memories.
          Music has the power to poignantly encapsulate memories and emotions in a way that not many
          other mediums can.{' '}
        </p>
        <p>
          When I'm listening to a song I'm often mentally transported back to the time/or memory
          that I most heavily associate with that song, even if that memory or emotion was not
          readily accessible to me prior to listening to the song. I wanted to create a tool that
          captures this essential part of the human experience, and allows users to actually embed
          their memories into their favorite songs to simulate the effect that listening to music
          has on the human brain.
        </p>
      </div>
      <h1 className={styles['title']}>WHAT IS STEGANOGRAPHY?</h1>
      <div className={styles['steganography-container']}>
        <p>
          Steganography is the art of hiding data in visible files (audio, text, images) making the
          data invisible to the person interfacing with the with the file. One of the most common
          forms of steganography is the Least Significant Bit (LSB) technique where data is recorded
          in the lowest bit of a byte.Echotrace uses a form of 'broken' steganography to accomplish
          its goal of encoding memory data into .wav files.
        </p>
        <p>
          As mentioned above, the purpose of steganography is to completely conceal the message so
          that it is invisible to the user. When I first implemented the encoding logic for
          EchoTrace I encoded the users memory data into the least significant bit of every byte of
          the .wav file (or however many bytes necessary to completely encode the memory string).
          This completely concealed the message to the user, so when listening to their 'encoded'
          .wav file, there was no audible difference between the original .wav file--the song
          sounded exactly the same.{' '}
        </p>
        <p>
          Even though the encoding was working, it was an unsatisfying user experience because there
          was no way to verify that the app had actually been encoded in the .wav file. So, I
          decided to 'break' the steganography and started encoding the users data into the most
          significant bit in every byte (the first bit). This produces distortion to the encoded
          portions of audio that results in a buzzing sound, giving the user some indication that
          their songs .wav file had actually been manipulated to include their memory data.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
