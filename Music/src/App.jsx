import React, { useContext } from 'react';
import Sidebar from './components/sidebar';
import Player from './components/player';
import Display from './components/display';
import Queue from './components/Queue';
import { PlayerContext } from '../context/PlayerContext';

const App = () => {
  const { audioRef, track, showQueue } = useContext(PlayerContext);
  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      <div className='h-[90%] flex relative'>
        <Sidebar />
        <Display />
        {showQueue && <Queue />}
      </div>
      <Player />
      <audio
        ref={audioRef}
        src={track?.file || ''}
        preload='auto'
      />
    </div>
  );
};

export default App;