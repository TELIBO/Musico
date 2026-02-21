# 🎵 Musicly

A full-stack multi-creator music streaming platform. Upload your songs, discover music from other creators, listen together in real-time rooms, and build your personal library.

## Features

- 🎤 **Creator Platform** — Sign up, upload your own songs & albums, manage them from your personal dashboard
- 🌍 **Discover Music** — Browse all songs uploaded by creators on the platform
- 😌 **Mood Filtering** — Filter songs by vibe: Chill, Hype, Sad, Focus, Party
- 🎧 **Listening Rooms** — Create a real-time room, share the link, and listen to the same song with friends while chatting live
- ❤️ **Liked Songs** — Like songs and access them all in one place
- 🕓 **Recently Played** — Your listening history, automatically tracked
- ➕ **Queue** — Add songs to a queue and manage what plays next
- 🔐 **Secure Auth** — Each creator can only delete their own uploads

## Tech Stack

**Frontend:** React 18, Vite, TailwindCSS, React Router v6, Socket.io-client, Clerk  
**Backend:** Node.js, Express, MongoDB (Mongoose), Cloudinary, Socket.io, Clerk  

## Project Structure

```
├── Music/          # React frontend (deploy to Vercel)
└── Server/         # Express backend (deploy to Render)
```

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/musicly.git
cd musicly
```

### 2. Setup Backend

```bash
cd Server
npm install
cp .env.example .env   # Fill in your credentials
node index.js
```

### 3. Setup Frontend

```bash
cd Music
npm install
cp .env.example .env   # Fill in your Clerk publishable key
npm run dev
```

### Required Accounts (all free tier)

| Service | Purpose | Link |
|---------|---------|------|
| MongoDB Atlas | Database | [mongodb.com](https://mongodb.com) |
| Cloudinary | Audio & image storage | [cloudinary.com](https://cloudinary.com) |
| Clerk | Authentication | [clerk.com](https://clerk.com) |

## Deployment

- **Frontend** → [Vercel](https://vercel.com) (set root dir to `Music`, add `VITE_CLERK_PUBLISHABLE_KEY`)
- **Backend** → [Render](https://render.com) (set root dir to `Server`, add all env vars from `.env.example`)

After deploying backend, update `const BASE` in all frontend components from `localhost:4000` to your Render URL.

## Screenshots

> Add screenshots here after deployment

## License

MIT
