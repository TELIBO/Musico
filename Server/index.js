import express from "express"
import cors from "cors"
import "dotenv/config"
import { createServer } from "http"
import { Server } from "socket.io"
import songRouter from "./src/routes/songRoute.js";
import albumRouter from "./src/routes/albumRoute.js";
import connectDB from "./src/config/mongodb.js";
import connectCloudinary from "./src/config/cloudinary.js";

//app config
const app=express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const port=process.env.PORT || 4000;
connectDB();
connectCloudinary();

//middlewares
app.use(express.json());
app.use(cors());

//initializing routes
app.use("/api/song", songRouter);
app.use("/api/album", albumRouter);
app.get('/',(req,res)=>res.send("api working"));

// In-memory rooms: { roomId: { hostId, song, currentTime, isPlaying, messages[] } }
const rooms = {};

io.on("connection", (socket) => {
    // Create a room with a song
    socket.on("createRoom", ({ roomId, song, username }) => {
        rooms[roomId] = { hostId: socket.id, song, currentTime: 0, isPlaying: false, messages: [] };
        socket.join(roomId);
        socket.emit("roomCreated", { roomId, room: rooms[roomId] });
        console.log(`Room ${roomId} created by ${username}`);
    });

    // Join an existing room
    socket.on("joinRoom", ({ roomId, username }) => {
        if (!rooms[roomId]) { socket.emit("error", { msg: "Room not found" }); return; }
        socket.join(roomId);
        const room = rooms[roomId];
        socket.emit("roomJoined", { room });
        io.to(roomId).emit("userJoined", { username, listeners: io.sockets.adapter.rooms.get(roomId)?.size || 1 });
    });

    // Host syncs playback state to all listeners
    socket.on("syncPlayback", ({ roomId, currentTime, isPlaying, song }) => {
        if (!rooms[roomId]) return;
        rooms[roomId] = { ...rooms[roomId], currentTime, isPlaying, song };
        socket.to(roomId).emit("playbackSync", { currentTime, isPlaying, song });
    });

    // Chat message
    socket.on("chatMessage", ({ roomId, username, message }) => {
        if (!rooms[roomId]) return;
        const msg = { username, message, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
        rooms[roomId].messages.push(msg);
        io.to(roomId).emit("newMessage", msg);
    });

    socket.on("disconnect", () => {
        // Clean up empty rooms
        for (const [roomId, room] of Object.entries(rooms)) {
            if (room.hostId === socket.id) delete rooms[roomId];
        }
    });
});

httpServer.listen(port,()=>console.log(`server started on ${port}`));