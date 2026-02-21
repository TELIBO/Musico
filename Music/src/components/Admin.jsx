import React, { useState, useContext, useEffect } from 'react';
import Navbar from './Navbar';
import { PlayerContext } from '../../context/PlayerContext';
import { useAuth, SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react';

const BASE = "http://localhost:4000";

const Toast = ({ msg, type, onClose }) => (
    <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg font-semibold text-sm transition-all
        ${type === 'success' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
        {msg}
        <button onClick={onClose} className='ml-4 opacity-70 hover:opacity-100'>✕</button>
    </div>
);

const Admin = () => {
    const { fetchData } = useContext(PlayerContext);
    const { getToken, isSignedIn } = useAuth();
    const { user } = useUser();
    const [tab, setTab] = useState('songs');
    const [toast, setToast] = useState(null);
    const [mySongs, setMySongs] = useState([]);
    const [myAlbums, setMyAlbums] = useState([]);

    const fetchMine = async () => {
        try {
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };
            const [sRes, aRes] = await Promise.all([
                fetch(`${BASE}/api/song/mine`, { headers }),
                fetch(`${BASE}/api/album/mine`, { headers }),
            ]);
            const sData = await sRes.json();
            const aData = await aRes.json();
            if (sData.success) setMySongs(sData.songs);
            if (aData.success) setMyAlbums(aData.albums);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { if (isSignedIn) fetchMine(); }, [isSignedIn]);

    // Song form state
    const [songForm, setSongForm] = useState({ name: '', desc: '', album: '', mood: 'any' });
    const [audioFile, setAudioFile] = useState(null);
    const [songImage, setSongImage] = useState(null);
    const [songLoading, setSongLoading] = useState(false);

    // Album form state
    const [albumForm, setAlbumForm] = useState({ name: '', desc: '', bgColour: '#1a1a2e' });
    const [albumImage, setAlbumImage] = useState(null);
    const [albumLoading, setAlbumLoading] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddSong = async (e) => {
        e.preventDefault();
        if (!audioFile || !songImage) { showToast('Select audio and image files', 'error'); return; }
        setSongLoading(true);
        const fd = new FormData();
        fd.append('name', songForm.name);
        fd.append('desc', songForm.desc);
        fd.append('album', songForm.album);
        fd.append('mood', songForm.mood);
        fd.append('creatorName', user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Anonymous');
        fd.append('audio', audioFile);
        fd.append('image', songImage);
        try {
            const token = await getToken();
            const res = await fetch(`${BASE}/api/song/add`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
            const data = await res.json();
            if (data.success) {
                showToast('Song uploaded successfully! 🎵');
                setSongForm({ name: '', desc: '', album: '', mood: 'any' });
                setAudioFile(null); setSongImage(null);
                e.target.reset();
                fetchData();
                fetchMine();
            } else { showToast(data.message || 'Upload failed', 'error'); }
        } catch { showToast('Server error', 'error'); }
        setSongLoading(false);
    };

    const handleAddAlbum = async (e) => {
        e.preventDefault();
        if (!albumImage) { showToast('Select an album image', 'error'); return; }
        setAlbumLoading(true);
        const fd = new FormData();
        fd.append('name', albumForm.name);
        fd.append('desc', albumForm.desc);
        fd.append('bgColour', albumForm.bgColour);
        fd.append('image', albumImage);
        try {
            const token = await getToken();
            const res = await fetch(`${BASE}/api/album/add`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
            const data = await res.json();
            if (data.success) {
                showToast('Album created! 🎨');
                setAlbumForm({ name: '', desc: '', bgColour: '#1a1a2e' });
                setAlbumImage(null); e.target.reset();
                fetchData();
                fetchMine();
            } else { showToast(data.message || 'Failed', 'error'); }
        } catch { showToast('Server error', 'error'); }
        setAlbumLoading(false);
    };

    const deleteSong = async (id) => {
        if (!confirm('Delete this song?')) return;
        const token = await getToken();
        const res = await fetch(`${BASE}/api/song/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) });
        const data = await res.json();
        if (data.success) { showToast('Song deleted'); fetchData(); fetchMine(); }
        else showToast('Delete failed', 'error');
    };

    const deleteAlbum = async (id) => {
        if (!confirm('Delete this album?')) return;
        const token = await getToken();
        const res = await fetch(`${BASE}/api/album/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) });
        const data = await res.json();
        if (data.success) { showToast('Album deleted'); fetchData(); fetchMine(); }
        else showToast('Delete failed', 'error');
    };

    const inputClass = "w-full bg-[#2a2a2a] border border-[#444] rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-green-500 transition-colors";
    const labelClass = "block text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1";

    return (
        <div className='w-full h-full overflow-auto'>
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            <Navbar />

            <SignedOut>
                <div className='flex flex-col items-center justify-center h-[70vh] gap-5'>
                    <div className='text-6xl'>🎵</div>
                    <h2 className='text-2xl font-bold'>Sign in to Upload Music</h2>
                    <p className='text-gray-400 text-center max-w-xs'>Create an account to upload your songs and albums to Musicly.</p>
                    <SignInButton mode='modal'>
                        <button className='bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-full text-sm transition-colors'>
                            Sign In / Create Account
                        </button>
                    </SignInButton>
                </div>
            </SignedOut>

            <SignedIn>
            {/* <div className='flex items-center gap-3 mb-6'>
                <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm'>A</div>
                <h1 className='text-2xl font-bold'>Upload Music</h1>
            </div> */}

            {/* Stats */}
            <div className='grid grid-cols-2 gap-3 mb-6'>
                <div className='bg-[#1a1a1a] rounded-xl p-4 border border-[#282828]'>
                    <p className='text-gray-400 text-xs uppercase tracking-widest'>My Songs</p>
                    <p className='text-3xl font-bold text-green-400 mt-1'>{mySongs.length}</p>
                </div>
                <div className='bg-[#1a1a1a] rounded-xl p-4 border border-[#282828]'>
                    <p className='text-gray-400 text-xs uppercase tracking-widest'>My Albums</p>
                    <p className='text-3xl font-bold text-purple-400 mt-1'>{myAlbums.length}</p>
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

            {tab === 'songs' && (
                <div className='grid lg:grid-cols-2 gap-6'>
                    {/* Add Song Form */}
                    <div className='bg-[#1a1a1a] rounded-xl p-5 border border-[#282828]'>
                        <h2 className='font-bold text-lg mb-4'>Add New Song</h2>
                        <form onSubmit={handleAddSong} className='flex flex-col gap-4'>
                            <div>
                                <label className={labelClass}>Song Name</label>
                                <input className={inputClass} value={songForm.name} onChange={e => setSongForm(p => ({ ...p, name: e.target.value }))} required placeholder='e.g. Blinding Lights' />
                            </div>
                            <div>
                                <label className={labelClass}>Description / Artist</label>
                                <input className={inputClass} value={songForm.desc} onChange={e => setSongForm(p => ({ ...p, desc: e.target.value }))} required placeholder='e.g. The Weeknd' />
                            </div>
                            <div>
                                <label className={labelClass}>Album Name</label>
                                <input className={inputClass} value={songForm.album} onChange={e => setSongForm(p => ({ ...p, album: e.target.value }))} required placeholder='Must match an existing album name' list='albumList' />
                                <datalist id='albumList'>
                                    {myAlbums.map(a => <option key={a._id} value={a.name} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className={labelClass}>Mood / Vibe</label>
                                <select className={inputClass} value={songForm.mood} onChange={e => setSongForm(p => ({ ...p, mood: e.target.value }))}>
                                    <option value='any'>🎵 Any / General</option>
                                    <option value='chill'>😌 Chill</option>
                                    <option value='hype'>🔥 Hype</option>
                                    <option value='sad'>😢 Sad</option>
                                    <option value='focus'>🎯 Focus</option>
                                    <option value='party'>🎉 Party</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Audio File (MP3)</label>
                                <input type='file' accept='audio/*' onChange={e => setAudioFile(e.target.files[0])} required className='text-sm text-gray-400 file:mr-3 file:px-4 file:py-1 file:rounded-full file:border-0 file:bg-[#2a2a2a] file:text-white file:cursor-pointer' />
                            </div>
                            <div>
                                <label className={labelClass}>Cover Image</label>
                                <input type='file' accept='image/*' onChange={e => setSongImage(e.target.files[0])} required className='text-sm text-gray-400 file:mr-3 file:px-4 file:py-1 file:rounded-full file:border-0 file:bg-[#2a2a2a] file:text-white file:cursor-pointer' />
                            </div>
                            <button type='submit' disabled={songLoading}
                                className='bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-2 rounded-full transition-colors'>
                                {songLoading ? 'Uploading...' : 'Upload Song'}
                            </button>
                        </form>
                    </div>

                    {/* Songs List */}
                    <div className='bg-[#1a1a1a] rounded-xl p-5 border border-[#282828]'>
                        <h2 className='font-bold text-lg mb-4'>My Songs ({mySongs.length})</h2>
                        <div className='flex flex-col gap-2 max-h-[500px] overflow-auto pr-1'>
                            {mySongs.length === 0 ? (
                                <p className='text-gray-500 text-sm'>No songs yet</p>
                            ) : mySongs.map(s => (
                                <div key={s._id} className='flex items-center gap-3 bg-[#242424] rounded-lg p-3 hover:bg-[#2e2e2e] transition-colors group'>
                                    <img src={s.image} className='w-10 h-10 rounded object-cover flex-shrink-0' alt='' />
                                    <div className='flex-1 overflow-hidden'>
                                        <p className='font-medium text-sm truncate'>{s.name}</p>
                                        <p className='text-xs text-gray-400 truncate'>{s.desc} · {s.duration} {s.mood && s.mood !== 'any' ? `· ${s.mood}` : ''}</p>
                                    </div>
                                    <button onClick={() => deleteSong(s._id)}
                                        className='opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs px-3 py-1 rounded-full border border-red-800 hover:border-red-600 transition-all'>
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'albums' && (
                <div className='grid lg:grid-cols-2 gap-6'>
                    {/* Add Album Form */}
                    <div className='bg-[#1a1a1a] rounded-xl p-5 border border-[#282828]'>
                        <h2 className='font-bold text-lg mb-4'>Create New Album</h2>
                        <form onSubmit={handleAddAlbum} className='flex flex-col gap-4'>
                            <div>
                                <label className={labelClass}>Album Name</label>
                                <input className={inputClass} value={albumForm.name} onChange={e => setAlbumForm(p => ({ ...p, name: e.target.value }))} required placeholder='e.g. After Hours' />
                            </div>
                            <div>
                                <label className={labelClass}>Description</label>
                                <input className={inputClass} value={albumForm.desc} onChange={e => setAlbumForm(p => ({ ...p, desc: e.target.value }))} required placeholder='e.g. The Weeknd · 2020' />
                            </div>
                            <div>
                                <label className={labelClass}>Background Colour</label>
                                <div className='flex gap-3 items-center'>
                                    <input type='color' value={albumForm.bgColour} onChange={e => setAlbumForm(p => ({ ...p, bgColour: e.target.value }))}
                                        className='w-12 h-10 rounded cursor-pointer bg-transparent border-0' />
                                    <span className='text-sm text-gray-400'>{albumForm.bgColour}</span>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Cover Image</label>
                                <input type='file' accept='image/*' onChange={e => setAlbumImage(e.target.files[0])} required className='text-sm text-gray-400 file:mr-3 file:px-4 file:py-1 file:rounded-full file:border-0 file:bg-[#2a2a2a] file:text-white file:cursor-pointer' />
                            </div>
                            <button type='submit' disabled={albumLoading}
                                className='bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-bold py-2 rounded-full transition-colors'>
                                {albumLoading ? 'Creating...' : 'Create Album'}
                            </button>
                        </form>
                    </div>

                    {/* Albums List */}
                    <div className='bg-[#1a1a1a] rounded-xl p-5 border border-[#282828]'>
                        <h2 className='font-bold text-lg mb-4'>My Albums ({myAlbums.length})</h2>
                        <div className='flex flex-col gap-2 max-h-[500px] overflow-auto pr-1'>
                            {myAlbums.length === 0 ? (
                                <p className='text-gray-500 text-sm'>No albums yet</p>
                            ) : myAlbums.map(a => (
                                <div key={a._id} className='flex items-center gap-3 bg-[#242424] rounded-lg p-3 hover:bg-[#2e2e2e] transition-colors group'>
                                    <img src={a.image} className='w-10 h-10 rounded object-cover flex-shrink-0' alt='' />
                                    <div style={{ borderLeft: `4px solid ${a.bgColour}` }} className='flex-1 overflow-hidden pl-2'>
                                        <p className='font-medium text-sm truncate'>{a.name}</p>
                                        <p className='text-xs text-gray-400 truncate'>{a.desc}</p>
                                    </div>
                                    <button onClick={() => deleteAlbum(a._id)}
                                        className='opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs px-3 py-1 rounded-full border border-red-800 hover:border-red-600 transition-all'>
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            </SignedIn>
        </div>
    );
};

export default Admin;
