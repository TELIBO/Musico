import React, { useContext } from 'react';
import Navbar from './Navbar';
import { PlayerContext } from '../../context/PlayerContext';

const LikedSongs = () => {
    const { songsData, likedSongs, toggleLike, playwithid, track, playStatus, addToQueue } = useContext(PlayerContext);
    const liked = songsData.filter(s => likedSongs.includes(s._id));

    return (
        <div className='w-full h-full overflow-auto'>
            <Navbar />

            {/* Header */}
            <div className='flex flex-col md:flex-row md:items-end gap-6 mb-8'>
                <div className='w-48 h-48 bg-gradient-to-br from-purple-700 to-blue-900 rounded-lg shadow-2xl flex items-center justify-center flex-shrink-0'>
                    <span className='text-6xl'>❤️</span>
                </div>
                <div>
                    <span className='text-xs font-semibold text-gray-400 uppercase tracking-widest'>Playlist</span>
                    <h1 className='text-4xl md:text-6xl font-bold mt-2 mb-3'>Liked Songs</h1>
                    <p className='text-gray-400 text-sm'>{liked.length} song{liked.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {liked.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-48 gap-3 text-center'>
                    <span className='text-5xl'>🎵</span>
                    <p className='text-gray-300 font-semibold'>Songs you like will appear here</p>
                    <p className='text-gray-500 text-sm'>Hit the ❤️ on any song to save it</p>
                </div>
            ) : (
                <div>
                    <div className='grid grid-cols-[auto_1fr_auto_auto] gap-x-4 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 border-b border-[#282828] pb-2'>
                        <span>#</span>
                        <span>Title</span>
                        <span className='hidden sm:block'>Duration</span>
                        <span></span>
                    </div>
                    {liked.map((song, idx) => {
                        const isPlaying = track?._id === song._id;
                        return (
                            <div key={song._id}
                                className={`grid grid-cols-[auto_1fr_auto_auto] gap-x-4 px-4 py-3 rounded-lg items-center cursor-pointer hover:bg-[#ffffff15] group transition-colors
                                    ${isPlaying ? 'bg-[#ffffff10]' : ''}`}>
                                <span className={`w-6 text-sm text-center ${isPlaying ? 'text-green-400' : 'text-gray-400'}`}>
                                    {isPlaying && playStatus ? '▶' : idx + 1}
                                </span>
                                <div className='flex items-center gap-3 overflow-hidden' onClick={() => playwithid(song._id)}>
                                    <img src={song.image} className='w-10 h-10 rounded object-cover flex-shrink-0' alt='' />
                                    <div className='overflow-hidden'>
                                        <p className={`font-medium text-sm truncate ${isPlaying ? 'text-green-400' : 'text-white'}`}>{song.name}</p>
                                        <p className='text-xs text-gray-400 truncate'>{song.desc}</p>
                                    </div>
                                </div>
                                <span className='text-xs text-gray-400 hidden sm:block'>{song.duration}</span>
                                <div className='flex items-center gap-2'>
                                    <button onClick={() => addToQueue(song)}
                                        className='opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all text-xs' title='Add to queue'>
                                        +Queue
                                    </button>
                                    <button onClick={() => toggleLike(song._id)}
                                        className='text-red-500 hover:text-red-400 transition-colors text-lg' title='Unlike'>
                                        ❤️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LikedSongs;
