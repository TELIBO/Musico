import React, { useRef, useEffect, useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './Home';
import DisplayAlbum from './DisplayAlbum';
import LikedSongs from './LikedSongs';
import Admin from './Admin';
import ListeningRoom from './ListeningRoom';
import Dashboard from './Dashboard';
import { PlayerContext } from '../../context/PlayerContext';

const Display = () => {
  const display = useRef();
  const location = useLocation();
  const { albumsData } = useContext(PlayerContext);

  const isAlbum = location.pathname.includes("album");
  const albumId = isAlbum ? location.pathname.split('/').pop() : "";
  const album = albumId ? albumsData.find(a => a._id === albumId) : null;
  const bgcolor = album?.bgColour || "";

  useEffect(() => {
    if (isAlbum && bgcolor) {
      display.current.style.background = `linear-gradient(${bgcolor}, #121212)`;
    } else {
      display.current.style.background = "#121212";
    }
  }, [isAlbum, bgcolor]);

  return (
    <div ref={display} className='w-[100%] m-2 px-6 pt-4 rounded bg-[#121212] text-white overflow-auto lg:w-[75%] lg:ml-0'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/album/:id' element={<DisplayAlbum />} />
        <Route path='/liked' element={<LikedSongs />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/room' element={<ListeningRoom />} />
        <Route path='/room/:roomId' element={<ListeningRoom />} />
      </Routes>
    </div>
  );
};

export default Display;