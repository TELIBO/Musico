import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const BASE = 'http://localhost:4000';

const Dashboard = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('songs');

    const fetchMine = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };
            const [songRes, albumRes] = await Promise.all([
                fetch(`${BASE}/api/song/mine`, { headers }),
                fetch(`${BASE}/api/album/mine`, { headers }),
            ]);
            const songData = await songRes.json();
            const albumData = await albumRes.json();
            if (songData.success) setSongs(songData.songs);
            if (albumData.success) setAlbums(albumData.albums);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMine(); }, []);

    const deleteItem = async (type, id) => {
        if (!confirm(`Delete this ${type}?`)) return;
        const token = await getToken();
        const res = await fetch(`${BASE}/api/${type}/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (data.success) fetchMine();
        else alert('Delete failed');
    };

    return (
        <div className='w-full h-full overflow-auto'>
            <Navbar />

            {/* Profile Banner */}
            <div className='bg-gradient-to-r from-green-900/40 to-purple-900/40 rounded-2xl p-6 mb-6 border border-[#282828] flex items-center gap-4'>
                {user?.imageUrl
                    ? <img src={user.imageUrl} className='w-16 h-16 rounded-full ring-2 ring-green-500' alt='' />
                    : <div className='w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-2xl text-black font-bold'>{user?.firstName?.[0] || '?'}</div>
                }
                <div>
                    <p className='text-xs text-green-400 font-semibold uppercase tracking-widest mb-1'>My Studio</p>
                    <h1 className='text-2xl font-bold'>{user?.fullName || user?.primaryEmailAddress?.emailAddress}</h1>
                    <p className='text-gray-400 text-sm mt-0.5'>{songs.length} songs · {albums.length} albums published</p>
                </div>
            </div>

            {/* Tabs */}
            <div className='flex gap-2 mb-6'>
                {['songs', 'albums'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-full font-semibold text-sm capitalize transition-all
                            ${tab === t ? 'bg-green-500 text-black' : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className='flex justify-center items-center h-32'>
                    <div className='w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin'></div>
                </div>
            ) : tab === 'songs' ? (
                <div className='flex flex-col gap-2'>
                    {songs.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-12 gap-3'>
                            <div className='text-5xl'>🎵</div>
                            <p className='font-semibold text-gray-300'>No songs yet</p>
                            <p className='text-gray-500 text-sm'>Upload your first song and share it with the world!</p>
                            <button onClick={() => navigate('/admin')} className='mt-2 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-2 rounded-full text-sm transition-colors'>Upload a Song</button>
                        </div>
                    ) : songs.map(s => (
                        <div key={s._id} className='flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3 border border-[#282828] hover:border-[#3a3a3a] transition-colors group'>
                            <img src={s.image} className='w-12 h-12 rounded-lg object-cover flex-shrink-0' alt='' />
                            <div className='flex-1 overflow-hidden'>
                                <p className='font-semibold text-sm truncate'>{s.name}</p>
                                <p className='text-xs text-gray-400 truncate'>{s.desc} · {s.duration} {s.mood !== 'any' ? `· ${s.mood}` : ''}</p>
                            </div>
                            <button onClick={() => deleteItem('song', s._id)}
                                className='opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 text-lg transition-all px-2'>
                                🗑
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='flex flex-col gap-2'>
                    {albums.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-12 gap-3'>
                            <div className='text-5xl'>💿</div>
                            <p className='font-semibold text-gray-300'>No albums yet</p>
                            <p className='text-gray-500 text-sm'>Create an album to group your songs.</p>
                            <button onClick={() => navigate('/admin')} className='mt-2 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-2 rounded-full text-sm transition-colors'>Create an Album</button>
                        </div>
                    ) : albums.map(a => (
                        <div key={a._id} className='flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3 border border-[#282828] hover:border-[#3a3a3a] transition-colors group'>
                            <img src={a.image} className='w-12 h-12 rounded-lg object-cover flex-shrink-0' alt='' />
                            <div className='flex-1 overflow-hidden'>
                                <p className='font-semibold text-sm truncate'>{a.name}</p>
                                <p className='text-xs text-gray-400 truncate'>{a.desc}</p>
                            </div>
                            <button onClick={() => deleteItem('album', a._id)}
                                className='opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 text-lg transition-all px-2'>
                                🗑
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
