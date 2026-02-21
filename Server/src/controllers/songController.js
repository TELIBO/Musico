import { v2 as cloudinary } from 'cloudinary';
import songModel from '../models/songModel.js';

const addSong = async (req, res) => {
    try {
        const { name, desc, album, mood, creatorName } = req.body;
        const creatorId = req.userId || '';

        // Files come from req.files (set by multer upload.fields)
        const audioFile = req.files?.audio?.[0];
        const imageFile = req.files?.image?.[0];

        // Validate fields
        if (!name || !desc || !album) {
            return res.status(400).json({ success: false, message: "Missing required fields: name, desc, album" });
        }
        if (!audioFile || !imageFile) {
            return res.status(400).json({ success: false, message: "Audio and image files are required" });
        }

        // Upload files to Cloudinary
        const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
            resource_type: "video",
        });
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image",
        });

        // Format duration from Cloudinary response (seconds -> mm:ss)
        const totalSec = Math.floor(audioUpload.duration || 0);
        const duration = `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, '0')}`;

        // Save song to database
        const songData = {
            name,
            desc,
            album,
            image: imageUpload.secure_url,
            file: audioUpload.secure_url,
            duration,
            mood: mood || 'any',
            creatorId,
            creatorName: creatorName || 'Anonymous',
        };

        const song = new songModel(songData);
        await song.save();

        return res.status(201).json({ success: true, message: "Song added successfully" });
    } catch (error) {
        console.error("Error adding song:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const listSong = async (req, res) => {
    try {
        const allSongs = await songModel.find({});
        return res.status(200).json({ success: true, songs: allSongs });
    } catch (error) {
        console.error("Error listing songs:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteSong = async (req, res) => {
    try {
        const { id } = req.body;
        const song = await songModel.findById(id);
        if (!song) return res.status(404).json({ success: false, message: "Song not found" });
        if (song.creatorId && song.creatorId !== req.userId) {
            return res.status(403).json({ success: false, message: "You can only delete your own songs" });
        }
        await songModel.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Song deleted successfully" });
    } catch (error) {
        console.error("Error deleting song:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { addSong, listSong, deleteSong };