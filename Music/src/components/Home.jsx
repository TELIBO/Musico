import React, { useContext, useState } from 'react'
import Navbar from './Navbar'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'
import { PlayerContext } from '../../context/PlayerContext'

const MOODS = [
  { key: 'all', label: 'All', emoji: '🎶' },
  { key: 'chill', label: 'Chill', emoji: '😌' },
  { key: 'hype', label: 'Hype', emoji: '🔥' },
  { key: 'sad', label: 'Sad', emoji: '😢' },
  { key: 'focus', label: 'Focus', emoji: '🎯' },
  { key: 'party', label: 'Party', emoji: '🎉' },
];

const Home = () => {
  const { songsData, albumsData, loading, searchQuery, recentlyPlayed, playwithid, track } = useContext(PlayerContext);
  const [selectedMood, setSelectedMood] = useState('all');

  const filteredSongs = songsData.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(s => selectedMood === 'all' || s.mood === selectedMood || (!s.mood && selectedMood === 'all'));
  const filteredAlbums = albumsData.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className='flex flex-col items-center justify-center h-[60vh] gap-4'>
          <div className='w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin'></div>
          <p className='text-gray-400 text-lg'>Loading your music...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <h1 className='font-bold text-3xl mb-1'>Discover Music 🌍</h1>
      <p className='text-gray-400 text-sm mb-5'>Songs uploaded by creators on the platform</p>

      {/* Mood Filter Bar */}
      {!searchQuery && (
        <div className='flex gap-2 mb-6 flex-wrap'>
          {MOODS.map(m => (
            <button key={m.key} onClick={() => setSelectedMood(m.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedMood === m.key
                  ? 'bg-green-500 text-black scale-105'
                  : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
              }`}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      )}

      {searchQuery ? (
        <>
          <div className='mb-6'>
            <h2 className='my-4 font-bold text-xl text-gray-300'>Albums ({filteredAlbums.length})</h2>
            {filteredAlbums.length > 0 ? (
              <div className='flex overflow-auto gap-2 pb-2'>
                {filteredAlbums.map(item => <AlbumItem key={item._id} name={item.name} desc={item.desc} id={item._id} image={item.image} />)}
              </div>
            ) : <p className='text-gray-500 text-sm'>No albums found</p>}
          </div>
          <div className='mb-6'>
            <h2 className='my-4 font-bold text-xl text-gray-300'>Songs ({filteredSongs.length})</h2>
            {filteredSongs.length > 0 ? (
              <div className='flex overflow-auto gap-2 pb-2'>
                {filteredSongs.map(item => <SongItem key={item._id} name={item.name} desc={item.desc} id={item._id} image={item.image} creator={item.creatorName} showCreator />)}
              </div>
            ) : <p className='text-gray-500 text-sm'>No songs found</p>}
          </div>
        </>
      ) : (
        <>
          {/* Recently Played */}
          {recentlyPlayed.length > 0 && (
            <div className='mb-6'>
              <h2 className='my-4 font-bold text-xl'>Recently Played</h2>
              <div className='flex overflow-auto gap-2 pb-2'>
                {recentlyPlayed.map(item => (
                  <SongItem key={item._id} name={item.name} desc={item.desc} id={item._id} image={item.image} />
                ))}
              </div>
            </div>
          )}

          {/* Albums */}
          <div className='mb-6'>
            <h2 className='my-4 font-bold text-xl'>Featured Albums</h2>
            {albumsData.length > 0 ? (
              <div className='flex overflow-auto gap-2 pb-2'>
                {albumsData.map(item => <AlbumItem key={item._id} name={item.name} desc={item.desc} id={item._id} image={item.image} />)}
              </div>
            ) : <p className='text-gray-500 text-sm'>No albums yet. Create one in the Admin Panel!</p>}
          </div>

          {/* All Songs */}
          <div className='mb-6'>
            <div className='flex items-center justify-between my-4'>
              <h2 className='font-bold text-xl'>
                {selectedMood === 'all' ? '🌍 Community Uploads' : `${MOODS.find(m => m.key === selectedMood)?.emoji} ${MOODS.find(m => m.key === selectedMood)?.label} Vibes`}
              </h2>
              <span className='text-xs text-gray-500 bg-[#1a1a1a] px-3 py-1 rounded-full'>{filteredSongs.length} songs</span>
            </div>
            {filteredSongs.length > 0 ? (
              <div className='flex overflow-auto gap-2 pb-2'>
                {filteredSongs.map(item => <SongItem key={item._id} name={item.name} desc={item.desc} id={item._id} image={item.image} creator={item.creatorName} showCreator />)}
              </div>
            ) : <p className='text-gray-500 text-sm'>{selectedMood !== 'all' ? `No ${selectedMood} songs yet.` : 'No songs yet. Upload some!'}</p>}
          </div>
        </>
      )}
    </>
  );
};

export default Home;
