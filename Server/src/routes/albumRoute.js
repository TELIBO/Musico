import express from "express";
import { addAlbum, listAlbum, deleteAlbum } from "../controllers/albumController.js";
import upload from "../middleware/multer.js";
import requireAuth from "../middleware/auth.js";
import albumModel from "../models/albumModel.js";

const albumRouter = express.Router();

albumRouter.post("/add", requireAuth, upload.fields([{ name: "image", maxCount: 1 }]), addAlbum);
albumRouter.get("/list", listAlbum);
albumRouter.post("/delete", requireAuth, deleteAlbum);
albumRouter.get("/mine", requireAuth, async (req, res) => {
    const albums = await albumModel.find({ creatorId: req.userId });
    res.json({ success: true, albums });
});

export default albumRouter;
