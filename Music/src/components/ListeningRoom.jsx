import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { PlayerContext } from '../../context/PlayerContext';
import Navbar from './Navbar';

const SERVER = 'https://musico-y8f2.onrender.com';

const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const ListeningRoom = () => {
    const { roomId: urlRoomId } = useParams();
    const navigate = useNavigate();
    const { songsData, audioRef } = useContext(PlayerContext);

    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [room, setRoom] = useState(null);
    const [roomId, setRoomId] = useState(urlRoomId || '');
    const [username, setUsername] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const [selectedSong, setSelectedSong] = useState(null);
    const [listeners, setListeners] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [step, setStep] = useState(urlRoomId ? 'join-name' : 'home'); // home | join-name | room
    const [copied, setCopied] = useState(false);
    const chatEndRef = useRef(null);
    const syncInterval = useRef(null);

    useEffect(() => {
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            if (syncInterval.current) clearInterval(syncInterval.current);
        };
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const connectSocket = () => {
        const socket = io(SERVER, { transports: ['websocket'] });
        socketRef.current = socket;
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socket.on('roomCreated', ({ room }) => {
            setRoom(room);
            setStep('room');
        });

        socket.on('roomJoined', ({ room }) => {
            setRoom(room);
            setStep('room');
            setMessages(room.messages || []);
        });

        socket.on('userJoined', ({ username: u, listeners: l }) => {
            setListeners(l);
            setMessages(prev => [...prev, { system: true, message: `${u} joined the room 👋` }]);
        });

        socket.on('playbackSync', ({ currentTime, isPlaying: playing, song }) => {
            if (!isHost) {
                setIsPlaying(playing);
                setRoom(prev => ({ ...prev, song, isPlaying: playing, currentTime }));
                if (audioRef.current) {
                    const audio = audioRef.current;
                    if (Math.abs(audio.currentTime - currentTime) > 1.5) audio.currentTime = currentTime;
                    if (playing && audio.paused) audio.play().catch(() => {});
                    else if (!playing && !audio.paused) audio.pause();
                }
            }
        });

        socket.on('newMessage', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('error', ({ msg }) => alert(msg));

        return socket;
    };

    const handleCreateRoom = () => {
        if (!usernameInput.trim() || !selectedSong) return;
        const name = usernameInput.trim();
        setUsername(name);
        const id = generateRoomId();
        setRoomId(id);
        const socket = connectSocket();
        socket.on('connect', () => {
            socket.emit('createRoom', { roomId: id, song: selectedSong, username: name });
        });
        setIsHost(true);
    };

    const handleJoinRoom = () => {
        if (!usernameInput.trim()) return;
        const name = usernameInput.trim();
        setUsername(name);
        const socket = connectSocket();
        socket.on('connect', () => {
            socket.emit('joinRoom', { roomId: roomId, username: name });
        });
        setIsHost(false);
    };

    // Host sync interval — broadcasts every 2s
    useEffect(() => {
        if (!isHost || !connected || step !== 'room') return;
        syncInterval.current = setInterval(() => {
            if (audioRef.current && socketRef.current) {
                socketRef.current.emit('syncPlayback', {
                    roomId,
                    currentTime: audioRef.current.currentTime,
                    isPlaying: !audioRef.current.paused,
                    song: room?.song,
                });
            }
        }, 2000);
        return () => clearInterval(syncInterval.current);
    }, [isHost, connected, step, room?.song]);

    const togglePlay = () => {
        if (!isHost || !audioRef.current || !room?.song) return;
        const audio = audioRef.current;
        if (audio.src !== room.song.file) audio.src = room.song.file;
        if (audio.paused) { audio.play(); setIsPlaying(true); }
        else { audio.pause(); setIsPlaying(false); }
        socketRef.current?.emit('syncPlayback', {
            roomId, currentTime: audio.currentTime, isPlaying: audio.paused === false, song: room.song,
        });
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !socketRef.current) return;
        socketRef.current.emit('chatMessage', { roomId, username, message: chatInput.trim() });
        setChatInput('');
    };

    const copyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── HOME SCREEN ──
    if (step === 'home') return (
        <div className='w-full h-full overflow-auto'>
            <Navbar />
            <div className='max-w-lg mx-auto mt-10 px-4'>
                <h1 className='text-3xl font-bold mb-2'>🎧 Listening Rooms</h1>
                <p className='text-gray-400 mb-8'>Listen to music in sync with friends. Real-time. No lag.</p>

                <div className='grid gap-4'>
                    {/* Create */}
                    <div className='bg-[#1a1a1a] border border-[#282828] rounded-2xl p-6'>
                        <h2 className='font-bold text-lg mb-1'>Create a Room</h2>
                        <p className='text-gray-400 text-sm mb-4'>Pick a song, invite friends, listen together.</p>
                        <input
                            className='w-full bg-[#2a2a2a] border border-[#444] rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-green-500 mb-3'
                            placeholder='Your name' value={usernameInput} onChange={e => setUsernameInput(e.target.value)}
                        />
                        <select
                            className='w-full bg-[#2a2a2a] border border-[#444] rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-green-500 mb-4'
                            value={selectedSong?._id || ''} onChange={e => setSelectedSong(songsData.find(s => s._id === e.target.value))}>
                            <option value=''>-- Select a song --</option>
                            {songsData.map(s => <option key={s._id} value={s._id}>{s.name} — {s.desc}</option>)}
                        </select>
                        <button onClick={handleCreateRoom} disabled={!usernameInput.trim() || !selectedSong}
                            className='w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-bold py-2 rounded-full transition-colors'>
                            Create Room 🚀
                        </button>
                    </div>

                    {/* Join */}
                    <div className='bg-[#1a1a1a] border border-[#282828] rounded-2xl p-6'>
                        <h2 className='font-bold text-lg mb-1'>Join a Room</h2>
                        <p className='text-gray-400 text-sm mb-4'>Got a room code? Enter it here.</p>
                        <input
                            className='w-full bg-[#2a2a2a] border border-[#444] rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-green-500 mb-3'
                            placeholder='Room code (e.g. A3B9XZ)' value={roomId} onChange={e => setRoomId(e.target.value.toUpperCase())}
                            maxLength={6}
                        />
                        <input
                            className='w-full bg-[#2a2a2a] border border-[#444] rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-green-500 mb-4'
                            placeholder='Your name' value={usernameInput} onChange={e => setUsernameInput(e.target.value)}
                        />
                        <button onClick={handleJoinRoom} disabled={!usernameInput.trim() || roomId.length < 4}
                            className='w-full border border-green-500 hover:bg-green-500 hover:text-black disabled:opacity-40 text-green-400 font-bold py-2 rounded-full transition-colors'>
                            Join Room 🎵
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── JOIN BY URL ──
    if (step === 'join-name') return (
        <div className='w-full h-full overflow-auto'>
            <Navbar />
            <div className='max-w-sm mx-auto mt-20 px-4 text-center'>
                <div className='text-5xl mb-4'>🎧</div>
                <h2 className='text-2xl font-bold mb-2'>Joining Room</h2>
                <p className='text-gray-400 mb-2'>Room: <span className='text-green-400 font-bold'>{urlRoomId}</span></p>
                <p className='text-gray-400 text-sm mb-6'>Enter your name to join</p>
                <input
                    className='w-full bg-[#2a2a2a] border border-[#444] rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-green-500 mb-4'
                    placeholder='Your name' value={usernameInput} onChange={e => setUsernameInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                />
                <button onClick={handleJoinRoom} disabled={!usernameInput.trim()}
                    className='w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-bold py-2 rounded-full transition-colors'>
                    Enter Room
                </button>
            </div>
        </div>
    );

    // ── ROOM SCREEN ──
    const song = room?.song;
    return (
        <div className='w-full h-full overflow-auto'>
            <Navbar />
            <div className='max-w-4xl mx-auto px-4 pb-10'>
                {/* Header */}
                <div className='flex items-center justify-between mb-6 flex-wrap gap-3'>
                    <div>
                        <h1 className='text-2xl font-bold'>Room: <span className='text-green-400'>{roomId}</span></h1>
                        <p className='text-gray-400 text-sm'>{listeners} listener{listeners !== 1 ? 's' : ''} · {isHost ? '👑 You are the host' : '🎧 Listening'}</p>
                    </div>
                    <button onClick={copyLink}
                        className='flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full text-sm font-medium transition-colors'>
                        {copied ? '✅ Copied!' : '🔗 Share Link'}
                    </button>
                </div>

                <div className='grid lg:grid-cols-2 gap-6'>
                    {/* Song + Controls */}
                    <div className='bg-[#1a1a1a] border border-[#282828] rounded-2xl p-6 flex flex-col items-center'>
                        {song ? (
                            <>
                                <img src={song.image} className='w-48 h-48 rounded-2xl shadow-2xl object-cover mb-4' alt='' />
                                <p className='font-bold text-xl text-center'>{song.name}</p>
                                <p className='text-gray-400 text-sm mb-6'>{song.desc}</p>
                                {isHost ? (
                                    <button onClick={togglePlay}
                                        className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-black text-2xl transition-colors'>
                                        {isPlaying ? '⏸' : '▶'}
                                    </button>
                                ) : (
                                    <div className='flex flex-col items-center gap-2'>
                                        <div className={`w-14 h-14 rounded-full bg-[#282828] flex items-center justify-center text-2xl ${isPlaying ? 'animate-pulse' : ''}`}>
                                            {isPlaying ? '🎵' : '⏸'}
                                        </div>
                                        <p className='text-gray-500 text-xs'>Synced to host</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className='text-gray-500'>No song selected</p>
                        )}
                    </div>

                    {/* Chat */}
                    <div className='bg-[#1a1a1a] border border-[#282828] rounded-2xl p-4 flex flex-col h-[420px]'>
                        <p className='font-bold text-sm text-gray-400 uppercase tracking-widest mb-3'>Live Chat</p>
                        <div className='flex-1 overflow-auto flex flex-col gap-2 pr-1'>
                            {messages.length === 0 && (
                                <p className='text-gray-600 text-sm text-center mt-4'>No messages yet. Say hi! 👋</p>
                            )}
                            {messages.map((m, i) => (
                                m.system ? (
                                    <p key={i} className='text-center text-xs text-gray-600 italic'>{m.message}</p>
                                ) : (
                                    <div key={i} className={`flex flex-col ${m.username === username ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.username === username ? 'bg-green-500 text-black' : 'bg-[#2a2a2a] text-white'}`}>
                                            {m.username !== username && <p className='text-xs font-bold mb-0.5 opacity-70'>{m.username}</p>}
                                            {m.message}
                                        </div>
                                        <p className='text-xs text-gray-600 mt-0.5 px-1'>{m.time}</p>
                                    </div>
                                )
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={sendMessage} className='flex gap-2 mt-3'>
                            <input
                                className='flex-1 bg-[#2a2a2a] border border-[#444] rounded-full px-4 py-2 text-white text-sm outline-none focus:border-green-500'
                                placeholder='Type a message...' value={chatInput} onChange={e => setChatInput(e.target.value)}
                            />
                            <button type='submit' className='bg-green-500 hover:bg-green-400 text-black font-bold px-4 rounded-full text-sm transition-colors'>
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListeningRoom;
