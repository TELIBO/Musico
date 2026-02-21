import React, { useContext } from 'react'
import { assets } from '../assets/frontend-assets/assets'
import { PlayerContext } from '../../context/PlayerContext'

const Player = () => {
    const { track, seekBar, seekBg, playStatus, play, pause, prev, next, time, seeksong,
        volume, changeVolume, isShuffle, toggleShuffle, isLoop, toggleLoop,
        isLiked, toggleLike, queue, toggleQueue, showQueue } = useContext(PlayerContext);

    if (!track) return null;

    return (
        <div className='h-[10%] bg-[#0a0a0a] border-t border-[#282828] flex items-center text-white px-4 gap-2'>
            {/* Track info */}
            <div className='hidden lg:flex items-center gap-3 w-[25%]'>
                <img src={track.image} className='w-12 h-12 rounded object-cover flex-shrink-0' alt='' />
                <div className='overflow-hidden flex-1'>
                    <p className='text-sm font-semibold truncate'>{track.name}</p>
                    <p className='text-xs text-gray-400 truncate'>{track.desc}</p>
                </div>
                <button
                    onClick={() => toggleLike(track._id)}
                    className={`text-lg transition-transform hover:scale-125 flex-shrink-0 ${isLiked(track._id) ? 'text-red-500' : 'text-gray-600 hover:text-red-400'}`}
                    title='Like'>
                    {isLiked(track._id) ? '❤️' : '🤍'}
                </button>
            </div>

            {/* Controls */}
            <div className='flex flex-col items-center gap-1 flex-1'>
                <div className='flex gap-5 items-center'>
                    <img src={assets.shuffle_icon} alt="shuffle" onClick={toggleShuffle}
                        className={`w-4 cursor-pointer transition-all ${isShuffle ? 'opacity-100 brightness-200' : 'opacity-40 hover:opacity-70'}`} />
                    <img onClick={prev} src={assets.prev_icon} alt="prev" className='w-4 cursor-pointer opacity-80 hover:opacity-100' />
                    {playStatus
                        ? <img onClick={pause} src={assets.pause_icon} alt="Pause" className='w-8 cursor-pointer' />
                        : <img onClick={play} src={assets.play_icon} alt="Play" className='w-8 cursor-pointer' />
                    }
                    <img onClick={next} src={assets.next_icon} alt="next" className='w-4 cursor-pointer opacity-80 hover:opacity-100' />
                    <img src={assets.loop_icon} alt="loop" onClick={toggleLoop}
                        className={`w-4 cursor-pointer transition-all ${isLoop ? 'opacity-100 brightness-200' : 'opacity-40 hover:opacity-70'}`} />
                </div>
                <div className='flex items-center gap-3 w-full max-w-[500px]'>
                    <p className='text-xs text-gray-400 w-8 text-right'>
                        {time.currentTime.minute}:{String(time.currentTime.second).padStart(2, '0')}
                    </p>
                    <div ref={seekBg} onClick={seeksong} className='flex-1 bg-[#5e5e5e] rounded-full cursor-pointer h-1 relative group'>
                        <div ref={seekBar} className='h-1 border-none w-0 bg-green-400 rounded-full group-hover:bg-green-300 transition-colors'></div>
                    </div>
                    <p className='text-xs text-gray-400 w-8'>
                        {time.totalTime.minute}:{String(time.totalTime.second).padStart(2, '0')}
                    </p>
                </div>
            </div>

            {/* Right controls: Volume + Queue */}
            <div className='hidden lg:flex items-center gap-3 w-[25%] justify-end'>
                <button onClick={toggleQueue}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        showQueue ? 'border-green-500 text-green-400' : 'border-[#444] text-gray-400 hover:border-gray-300 hover:text-white'
                    }`}>
                    Queue {queue.length > 0 && <span className='bg-green-500 text-black rounded-full px-1 ml-1 text-[10px] font-bold'>{queue.length}</span>}
                </button>
                <img className="w-4 opacity-70" src={assets.volume_icon} alt='volume' />
                <input type='range' min='0' max='1' step='0.01' value={volume} onChange={changeVolume}
                    className='w-20 accent-green-400 cursor-pointer' />
            </div>
        </div>
    )
}

export default Player
