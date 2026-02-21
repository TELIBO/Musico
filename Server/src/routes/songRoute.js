
import { addSong, listSong, deleteSong } from "../controllers/songController.js";
import express from "express";
import upload from "../middleware/multer.js";
import requireAuth from "../middleware/auth.js";

const songRouter = express.Router();
songRouter.post("/add", requireAuth, upload.fields([{ name: "image", maxCount: 1 }, { name: "audio", maxCount: 1 }]), addSong);
songRouter.get("/list", listSong);
songRouter.post("/delete", requireAuth, deleteSong);
songRouter.get("/mine", requireAuth, async (req, res) => {
    const { default: songModel } = await import('../models/songModel.js');
    const songs = await songModel.find({ creatorId: req.userId });
    res.json({ success: true, songs });
});

export default songRouter;