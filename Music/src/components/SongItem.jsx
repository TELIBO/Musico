import React, { useContext } from 'react'
import { PlayerContext } from '../../context/PlayerContext'

const SongItem = ({ name, image, desc, id, creator, showCreator = false }) => {
    const { playwithid, track, playStatus, isLiked, toggleLike, addToQueue, songsData } = useContext(PlayerContext);
    const isPlaying = track?._id === id;
    const liked = isLiked(id);

    const handleQueue = (e) => {
        e.stopPropagation();
        const song = songsData.find(s => s._id === id);
        if (song) addToQueue(song);
    };

    return (
        <div
            className={`min-w-[160px] max-w-[160px] p-3 rounded-lg cursor-pointer transition-all hover:bg-[#ffffff1a] relative group
                ${isPlaying ? 'bg-[#ffffff1a] ring-1 ring-green-500' : ''}`}
        >
            <div className='relative' onClick={() => playwithid(id)}>
                <img src={image} className='rounded-md w-full aspect-square object-cover' alt='' />
                {isPlaying && playStatus && (
                    <div className='absolute bottom-2 right-2 bg-green-500 rounded-full p-1'>
                        <div className='flex gap-[2px] items-end h-3'>
                            <span className='w-[3px] bg-black rounded-full animate-bounce' style={{ height: '60%', animationDelay: '0ms' }}></span>
                            <span className='w-[3px] bg-black rounded-full animate-bounce' style={{ height: '100%', animationDelay: '150ms' }}></span>
                            <span className='w-[3px] bg-black rounded-full animate-bounce' style={{ height: '40%', animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                {/* Queue button on hover */}
                <button
                    onClick={handleQueue}
                    className='absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full transition-all hover:bg-black'
                    title='Add to queue'
                >
                    + Queue
                </button>
            </div>
            <div className='flex items-start justify-between mt-2 mb-1'>
                <p className={`font-semibold text-sm truncate flex-1 ${isPlaying ? 'text-green-400' : ''}`} onClick={() => playwithid(id)}>{name}</p>
                <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(id); }}
                    className={`text-base ml-1 flex-shrink-0 transition-transform hover:scale-125 ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
                    title={liked ? 'Unlike' : 'Like'}
                >
                    {liked ? '❤️' : '🤍'}
                </button>
            </div>
            <p className='text-gray-400 text-xs truncate' onClick={() => playwithid(id)}>{desc}</p>
            {showCreator && creator && (
                <p className='text-[10px] text-green-500/70 truncate mt-0.5'>🎤 {creator}</p>
            )}
        </div>
    )
}

export default SongItem