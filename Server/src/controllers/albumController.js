import { v2 as cloudinary } from 'cloudinary';
import albumModel from '../models/albumModel.js';

const addAlbum = async (req, res) => {
    try {
        const { name, desc, bgColour } = req.body;
        const imageFile = req.files?.image?.[0];

        if (!name || !desc || !bgColour) {
            return res.status(400).json({ success: false, message: "Missing required fields: name, desc, bgColour" });
        }
        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Album image is required" });
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image",
        });

        const album = new albumModel({
            name,
            desc,
            bgColour,
            image: imageUpload.secure_url,
            creatorId: req.userId || '',
            creatorName: req.userEmail || 'Anonymous',
        });

        await album.save();
        return res.status(201).json({ success: true, message: "Album added successfully" });
    } catch (error) {
        console.error("Error adding album:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const listAlbum = async (req, res) => {
    try {
        const allAlbums = await albumModel.find({});
        return res.status(200).json({ success: true, albums: allAlbums });
    } catch (error) {
        console.error("Error listing albums:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteAlbum = async (req, res) => {
    try {
        const { id } = req.body;
        const album = await albumModel.findById(id);
        if (!album) return res.status(404).json({ success: false, message: "Album not found" });
        if (album.creatorId && album.creatorId !== req.userId) {
            return res.status(403).json({ success: false, message: "You can only delete your own albums" });
        }
        await albumModel.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Album deleted successfully" });
    } catch (error) {
        console.error("Error deleting album:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { addAlbum, listAlbum, deleteAlbum };
