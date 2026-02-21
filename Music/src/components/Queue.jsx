import React, { useContext } from 'react';
import { PlayerContext } from '../../context/PlayerContext';

const Queue = () => {
    const { queue, removeFromQueue, clearQueue, playwithid, track, showQueue, toggleQueue } = useContext(PlayerContext);

    if (!showQueue) return null;

    return (
        <div className='fixed right-0 top-0 h-full w-[320px] bg-[#121212] border-l border-[#282828] z-40 flex flex-col shadow-2xl'>
            {/* Header */}
            <div className='flex items-center justify-between px-5 py-4 border-b border-[#282828]'>
                <div>
                    <h2 className='font-bold text-white text-lg'>Up Next</h2>
                    <p className='text-xs text-gray-400'>{queue.length} song{queue.length !== 1 ? 's' : ''} in queue</p>
                </div>
                <div className='flex items-center gap-3'>
                    {queue.length > 0 && (
                        <button onClick={clearQueue}
                            className='text-xs text-gray-400 hover:text-white border border-[#444] hover:border-gray-300 px-3 py-1 rounded-full transition-colors'>
                            Clear
                        </button>
                    )}
                    <button onClick={toggleQueue}
                        className='text-gray-400 hover:text-white text-xl transition-colors'>
                        ✕
                    </button>
                </div>
            </div>

            {/* Now Playing */}
            {track && (
                <div className='px-5 py-3 border-b border-[#282828]'>
                    <p className='text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2'>Now Playing</p>
                    <div className='flex items-center gap-3'>
                        <img src={track.image} className='w-10 h-10 rounded object-cover' alt='' />
                        <div className='overflow-hidden'>
                            <p className='text-sm font-semibold text-green-400 truncate'>{track.name}</p>
                            <p className='text-xs text-gray-400 truncate'>{track.desc}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Queue List */}
            <div className='flex-1 overflow-auto px-3 py-2'>
                {queue.length === 0 ? (
                    <div className='flex flex-col items-center justify-center h-full gap-3 text-center px-5'>
                        <span className='text-4xl'>🎵</span>
                        <p className='text-gray-300 font-semibold text-sm'>Queue is empty</p>
                        <p className='text-gray-500 text-xs'>Right-click a song or hit "+ Queue" to add songs here</p>
                    </div>
                ) : (
                    <>
                        <p className='text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2 px-2'>Next Up</p>
                        {queue.map((song, idx) => (
                            <div key={`${song._id}-${idx}`}
                                className='flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#ffffff10] group cursor-pointer transition-colors'>
                                <span className='text-xs text-gray-500 w-4 text-center'>{idx + 1}</span>
                                <img src={song.image} className='w-9 h-9 rounded object-cover flex-shrink-0' alt='' onClick={() => playwithid(song._id)} />
                                <div className='flex-1 overflow-hidden' onClick={() => playwithid(song._id)}>
                                    <p className='text-sm font-medium text-white truncate'>{song.name}</p>
                                    <p className='text-xs text-gray-400 truncate'>{song.desc}</p>
                                </div>
                                <button onClick={() => removeFromQueue(idx)}
                                    className='opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-lg leading-none'>
                                    ✕
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default Queue;
