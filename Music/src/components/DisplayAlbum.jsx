import React, { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { assets } from '../assets/frontend-assets/assets';
import Navbar from './Navbar';
import { PlayerContext } from '../../context/PlayerContext';

const DisplayAlbum = () => {
    const { id } = useParams();
    const { albumsData, songsData, playwithid, track, playStatus } = useContext(PlayerContext);

    const albumdata = albumsData.find(a => a._id === id);
    const albumSongs = songsData.filter(s => s.album === albumdata?.name);

    if (!albumdata) return (
        <>
            <Navbar />
            <div className='flex items-center justify-center h-[60vh]'>
                <p className='text-gray-400'>Album not found</p>
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                <img
                    className="w-48 h-48 object-cover rounded-lg shadow-2xl"
                    src={albumdata.image}
                    alt={albumdata.name}
                />
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Playlist</span>
                    <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-3">{albumdata.name}</h1>
                    <p className="text-gray-400 mb-3">{albumdata.desc}</p>
                    <div className="flex items-center text-sm text-gray-400 gap-2">
                        <span className="font-semibold text-white">Musicly</span>
                        <span>•</span>
                        <span>{albumSongs.length} songs</span>
                    </div>
                </div>
            </div>

            {albumSongs.length === 0 ? (
                <p className='text-gray-500 text-sm'>No songs in this album yet.</p>
            ) : (
                <div>
                    <div className="grid grid-cols-3 pl-2 text-[#a7a7a7] text-sm font-medium mb-2 border-b border-[#282828] pb-2">
                        <div><span className="mr-4">#</span>Title</div>
                        <div className="hidden sm:block">Album</div>
                        <div className="hidden sm:block flex items-center gap-1"><img src={assets.clock_icon} className="w-4 inline mr-1" alt="Duration" />Duration</div>
                    </div>
                    {albumSongs.map((item, index) => (
                        <div
                            onClick={() => playwithid(item._id)}
                            key={item._id}
                            className={`grid grid-cols-3 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff15] cursor-pointer rounded ${
                                track?._id === item._id ? 'bg-[#ffffff15] text-green-400' : ''
                            }`}
                        >
                            <div className='flex items-center gap-3'>
                                <span className='w-6 text-right text-sm'>{index + 1}</span>
                                <img className='w-10 h-10 rounded object-cover' src={item.image} alt={item.name} />
                                <span className={`truncate ${track?._id === item._id ? 'text-green-400' : 'text-white'}`}>{item.name}</span>
                            </div>
                            <p className='text-sm hidden sm:block'>{albumdata.name}</p>
                            <p className='text-sm hidden sm:block'>{item.duration}</p>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default DisplayAlbum;