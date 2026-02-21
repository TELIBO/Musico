import React, { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { PlayerContext } from '../../context/PlayerContext';
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { track, albumsData, likedSongs } = useContext(PlayerContext);

    const navItem = (path, icon, label, badge) => {
        const active = location.pathname === path;
        return (
            <div onClick={() => navigate(path)}
                className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-colors
                    ${active ? 'bg-[#282828] text-white' : 'text-gray-400 hover:text-white'}`}>
                <span className='text-base'>{icon}</span>
                <span className='font-medium text-sm'>{label}</span>
                {badge > 0 && <span className='ml-auto text-xs bg-green-500 text-black rounded-full px-2 py-0.5 font-bold'>{badge}</span>}
            </div>
        );
    };

    return (
        <div className='w-[25%] h-full p-2 flex-col gap-2 text-white hidden lg:flex'>
            {/* Nav */}
            <div className='bg-[#121212] rounded-xl p-3 flex flex-col gap-1'>
                {navItem('/', '🏠', 'Home')}
                {navItem('/liked', '❤️', 'Liked Songs')}
                                <SignedIn>
                {navItem('/room', '🎧', 'Listening Rooms')}
                    {navItem('/dashboard', '🎵', 'My Uploads')}
                </SignedIn>
                {navItem('/admin', '⚙️', 'Upload Music')}

                {/* Auth */}
                <div className='mt-2 pt-2 border-t border-[#282828]'>
                    <SignedOut>
                        <SignInButton mode='modal'>
                            <button className='w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#282828] transition-colors text-sm font-medium'>
                                <span>👤</span> Sign In / Sign Up
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <div className='flex items-center gap-3 px-3 py-2'>
                            <UserButton afterSignOutUrl='/' />
                            <span className='text-sm text-gray-400'>Account</span>
                        </div>
                    </SignedIn>
                </div>
            </div>

            {/* Library */}
            {track && (
                <div className='bg-[#121212] flex-1 rounded-xl p-4 overflow-auto flex flex-col gap-3'>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Now Playing</p>
                    <img src={track.image} className='w-full rounded-lg shadow-lg object-cover aspect-square' alt='' />
                    <div>
                        <p className='font-bold text-base truncate'>{track.name}</p>
                        <p className='text-gray-400 text-xs truncate'>{track.desc}</p>
                    </div>

                    {albumsData.length > 0 && (
                        <>
                            <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mt-2'>Your Library</p>
                            {albumsData.map(album => (
                                <div key={album._id} onClick={() => navigate(`/album/${album._id}`)}
                                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-[#ffffff15] cursor-pointer transition-colors
                                        ${location.pathname === `/album/${album._id}` ? 'bg-[#ffffff15]' : ''}`}>
                                    <img src={album.image} className='w-9 h-9 rounded object-cover' alt='' />
                                    <div className='overflow-hidden'>
                                        <p className='text-sm font-medium truncate'>{album.name}</p>
                                        <p className='text-xs text-gray-500 truncate'>{album.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Sidebar;
