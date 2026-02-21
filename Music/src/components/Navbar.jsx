import React, { useContext } from 'react'
import { assets } from '../assets/frontend-assets/assets'
import { useNavigate } from 'react-router-dom'
import { PlayerContext } from '../../context/PlayerContext'
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react'

const Navbar = () => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useContext(PlayerContext);
  return (
    <div className='w-full flex justify-between items-center font-semibold mb-4'>
      <div className='flex items-center gap-2'>
        <img src={assets.arrow_left} alt="" className='w-8 bg-black p-2 rounded-full cursor-pointer' onClick={() => navigate(-1)} />
        <img src={assets.arrow_right} alt="" className='w-8 bg-black p-2 rounded-full cursor-pointer' onClick={() => navigate(1)} />
      </div>
      <div className='flex items-center bg-[#2a2a2a] rounded-full px-4 py-2 gap-2 w-[40%]'>
        <img src={assets.search_icon} className='w-4 opacity-70' alt="" />
        <input
          type='text'
          placeholder='Search songs, albums...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='bg-transparent outline-none text-white text-sm w-full placeholder-gray-400'
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className='text-gray-400 hover:text-white text-xs'>✕</button>
        )}
      </div>
      <div className='flex items-center gap-3'>
        <SignedIn>
          <UserButton afterSignOutUrl='/' />
        </SignedIn>
        <SignedOut>
          <SignInButton mode='modal'>
            <button className='bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors'>Sign In</button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  )
}

export default Navbar