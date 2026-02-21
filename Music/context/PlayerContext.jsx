import { createContext, useEffect, useRef, useState, useCallback } from "react";

export const PlayerContext = createContext();

const MAX_RECENT = 10;

const PlayerContextProvider = (props) => {
    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    const [songsData, setSongsData] = useState([]);
    const [albumsData, setAlbumsData] = useState([]);
    const [track, setTrack] = useState(null);
    const [playStatus, setPlayStatus] = useState(false);
    const [volume, setVolumeState] = useState(1);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isLoop, setIsLoop] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Liked songs: array of song _ids, persisted in localStorage
    const [likedSongs, setLikedSongs] = useState(() => {
        try { return JSON.parse(localStorage.getItem("musicly_liked") || "[]"); } catch { return []; }
    });

    // Recently played: array of song objects, persisted in localStorage
    const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
        try { return JSON.parse(localStorage.getItem("musicly_recent") || "[]"); } catch { return []; }
    });

    // Queue: array of song objects
    const [queue, setQueue] = useState([]);
    const [showQueue, setShowQueue] = useState(false);

    const [time, setTime] = useState({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 },
    });

    // Persist liked songs
    useEffect(() => {
        localStorage.setItem("musicly_liked", JSON.stringify(likedSongs));
    }, [likedSongs]);

    // Persist recently played
    useEffect(() => {
        localStorage.setItem("musicly_recent", JSON.stringify(recentlyPlayed));
    }, [recentlyPlayed]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [songRes, albumRes] = await Promise.all([
                fetch("http://localhost:4000/api/song/list"),
                fetch("http://localhost:4000/api/album/list"),
            ]);
            const songData = await songRes.json();
            const albumData = await albumRes.json();
            if (songData.success) {
                setSongsData(songData.songs);
                setTrack(prev => {
                    if (!prev) return songData.songs[0] || null;
                    // if current track was deleted, fall back to first song
                    const stillExists = songData.songs.find(s => s._id === prev._id);
                    return stillExists || songData.songs[0] || null;
                });
            }
            if (albumData.success) {
                setAlbumsData(albumData.albums);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onTimeUpdate = () => {
            if (!audio.duration) return;
            const pct = (audio.currentTime / audio.duration) * 100;
            if (seekBar.current) seekBar.current.style.width = pct + "%";
            setTime({
                currentTime: { second: Math.floor(audio.currentTime % 60), minute: Math.floor(audio.currentTime / 60) },
                totalTime: { second: Math.floor(audio.duration % 60), minute: Math.floor(audio.duration / 60) },
            });
        };
        const onEnded = () => {
            if (isLoop) { audio.currentTime = 0; audio.play(); return; }
            // Play from queue first, else next
            if (queue.length > 0) {
                const [nextInQueue, ...rest] = queue;
                setQueue(rest);
                setTrack(nextInQueue);
                setTimeout(() => { audio.play(); setPlayStatus(true); }, 50);
            } else {
                next();
            }
        };
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);
        return () => { audio.removeEventListener("timeupdate", onTimeUpdate); audio.removeEventListener("ended", onEnded); };
    }, [isLoop, songsData, track, queue]);

    const addToRecent = useCallback((song) => {
        setRecentlyPlayed(prev => {
            const filtered = prev.filter(s => s._id !== song._id);
            return [song, ...filtered].slice(0, MAX_RECENT);
        });
    }, []);

    const play = () => { audioRef.current.play(); setPlayStatus(true); };
    const pause = () => { audioRef.current.pause(); setPlayStatus(false); };

    const playwithid = (id) => {
        const song = songsData.find((s) => s._id === id);
        if (!song) return;
        setTrack(song);
        addToRecent(song);
        setTimeout(() => { audioRef.current.play(); setPlayStatus(true); }, 50);
    };

    const prev = () => {
        const idx = songsData.findIndex((s) => s._id === track?._id);
        if (idx > 0) {
            const song = songsData[idx - 1];
            setTrack(song);
            addToRecent(song);
            setTimeout(() => { audioRef.current.play(); setPlayStatus(true); }, 50);
        }
    };

    const next = () => {
        const idx = songsData.findIndex((s) => s._id === track?._id);
        let nextSong;
        if (queue.length > 0) {
            const [first, ...rest] = queue;
            nextSong = first;
            setQueue(rest);
        } else if (isShuffle) {
            nextSong = songsData[Math.floor(Math.random() * songsData.length)];
        } else if (idx < songsData.length - 1) {
            nextSong = songsData[idx + 1];
        } else {
            nextSong = songsData[0];
        }
        if (nextSong) {
            setTrack(nextSong);
            addToRecent(nextSong);
            setTimeout(() => { audioRef.current.play(); setPlayStatus(true); }, 50);
        }
    };

    const seeksong = (e) => {
        if (!audioRef.current.duration) return;
        audioRef.current.currentTime = (e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration;
    };

    const changeVolume = (e) => {
        const val = parseFloat(e.target.value);
        audioRef.current.volume = val;
        setVolumeState(val);
    };

    const toggleShuffle = () => setIsShuffle((p) => !p);
    const toggleLoop = () => setIsLoop((p) => !p);

    // Liked songs helpers
    const toggleLike = (id) => {
        setLikedSongs(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };
    const isLiked = (id) => likedSongs.includes(id);

    // Queue helpers
    const addToQueue = (song) => {
        setQueue(prev => [...prev, song]);
    };
    const removeFromQueue = (idx) => {
        setQueue(prev => prev.filter((_, i) => i !== idx));
    };
    const clearQueue = () => setQueue([]);
    const toggleQueue = () => setShowQueue(p => !p);

    const contextValue = {
        audioRef, seekBar, seekBg,
        track, setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play, pause, playwithid, prev, next, seeksong,
        songsData, albumsData,
        volume, changeVolume,
        isShuffle, toggleShuffle,
        isLoop, toggleLoop,
        loading, searchQuery, setSearchQuery, fetchData,
        likedSongs, toggleLike, isLiked,
        recentlyPlayed,
        queue, addToQueue, removeFromQueue, clearQueue, showQueue, toggleQueue,
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;
