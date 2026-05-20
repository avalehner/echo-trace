import { useState } from 'react';
import { useNavigate } from 'react-router';
import EmotionMenu from '../components/EmotionMenu';
import SeasonMenu from '../components/SeasonMenu';
import YearMenu from '../components/YearMenu';
import Song from '../components/Song';
import styles from './css/WritePage.module.css';
import { searchSongs } from '../services/spotifyService';
import { createMemory } from '../services/memoriesService';
import type { SongSearchResult, MemoryTypes } from '../types';

const WritePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SongSearchResult[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongSearchResult | null>(null);
  const [emotion, setEmotion] = useState<string>('');
  const [season, setSeason] = useState<string>('');
  const [memoryFragment, setMemoryFragement] = useState<string>('');
  const [year, setYear] = useState<number | null>(null);
  const [searching, setSearching] = useState<boolean>(false);
  // const [searchingMessage, setSearchingMessage] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittingMessage, setSubmittingMessage] = useState<string>('');
  const [submittedMemory, setSubmittedMemory] = useState<MemoryTypes | null>(null);

  const getSongs = async () => {
    setSearching(true);
    try {
      const songs = await searchSongs(searchQuery);
      setSearchResults(songs);
      console.log('found songs :)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(message);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectedSong = (song: SongSearchResult) => {
    setSelectedSong(song);
    setSearchResults([]);
  };

  const renderSongs = (searchResult: SongSearchResult[]) => {
    return searchResult.map((songResult) => (
      <div key={songResult.song_id} onClick={() => handleSelectedSong(songResult)}>
        <Song song={songResult} className={'song-result'} />
      </div>
    ));
  };

  const submitMemory = async () => {
    if (!selectedSong) {
      setSubmittingMessage('please select a song before submitting :)');
      return;
    }

    if (!year) {
      setSubmittingMessage('please select a year before submitting :)');
      return;
    }

    if (!emotion) {
      setSubmittingMessage('please select a feeling before submitting :)');
      return;
    }

    if (!memoryFragment) {
      setSubmittingMessage('please enter a memory before submitting :)');
      return;
    }

    const memoryRequestObj = {
      song_id: selectedSong.song_id,
      song_name: selectedSong.song_name,
      album_name: selectedSong.album_name,
      artist: selectedSong.artist,
      emotion: emotion,
      season: season,
      year: year,
      memory_fragment: memoryFragment,
    };

    try {
      const newMemory = await createMemory(memoryRequestObj);
      setSubmittedMemory(newMemory);
      setSubmittingMessage('memory saved :)');
      handleRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error submitting memory';
      setSubmittingMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedSong(null);
    setEmotion('');
    setSeason('');
    setYear(null);
    setMemoryFragement('');
    // setSearchingMessage('')
    setSubmittingMessage('');
  };

  console.log(selectedSong);

  return (
    <>
      <div className={styles['write-page-container']}>
        <h1 className={styles['title']}>echo-trace</h1>
        {!submittedMemory ? (
          <div className={styles['data-input-container']}>
            <div className={styles['search-container']}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  getSongs();
                }}
              >
                <input
                  className={styles['text-input']}
                  type="text"
                  placeholder="enter title or artist"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className={styles['write-page-btn']} onClick={getSongs}>
                  {searching ? 'searching' : 'SEARCH'}
                </button>
              </form>
            </div>
            {searchResults.length > 0 && (
              <div className={styles['refresh-btn-container']}>
                <button className={styles['write-page-btn']} onClick={() => handleRefresh()}>
                  REFRESH
                </button>
              </div>
            )}
            {/* {searchingMessage && <p>{searchingMessage}</p>} */}
            <div
              className={
                selectedSong ? styles['selected-song-container'] : styles['song-results-container']
              }
            >
              {selectedSong ? (
                <Song className={'selected-song-result'} song={selectedSong} />
              ) : (
                renderSongs(searchResults)
              )}
            </div>
            <div className={styles['emotion-menu-container']}>
              <p>listening to this song made me feel</p>
              <EmotionMenu emotion={emotion} setEmotion={setEmotion} />
            </div>
            <div className={styles['season-menu-container']}>
              <p>this song reminds me of</p>
              <SeasonMenu season={season} setSeason={setSeason} />
              <YearMenu year={year} setYear={setYear} />
            </div>
            <div className={styles['memory-input-container']}>
              <input
                className={styles['text-input']}
                type="text"
                placeholder="enter a memory"
                value={memoryFragment}
                onChange={(e) => setMemoryFragement(e.target.value)}
              />
            </div>
            <div className={styles['submit-btn-container']}>
              <button className={styles['write-page-btn']} onClick={submitMemory}>
                {submitting ? 'submitting' : 'SUBMIT'}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles['after-submit-btns-container']}>
            <p className={styles['submitted-text']}>memory submitted!</p>
            <button
              className={styles['write-page-btn']}
              onClick={() => navigate(`/listen/${submittedMemory.id}`)}
            >
              listen to your memory
            </button>
            <button
              className={styles['write-page-btn']}
              onClick={() => {
                setSubmittedMemory(null);
                handleRefresh();
              }}
            >
              submit another memory
            </button>
          </div>
        )}
        {submittingMessage && <p className={styles['submitting-message']}>{submittingMessage}</p>}
      </div>
    </>
  );
};

export default WritePage;
