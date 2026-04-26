# Multiplayer Frontend

## Stack
React 18 + Vite + Socket.IO Client + TailwindCSS + React Router

## Key Files
- `src/main.tsx` — App entry, wraps in SocketProvider
- `src/App.tsx` — Router: `/` → GameLobby, `/room/:gameId/:roomId` → Room
- `src/config/firebase.ts` — Firebase client SDK init, Google sign-in helpers
- `src/context/SocketContext.tsx` — Socket.IO client singleton with retry config and auth handshake
- `src/socket.ts` — Legacy socket singleton (prefer SocketContext)
- `src/pages/GameLobby.tsx` — Room creation/joining, Google sign-in / guest mode
- `src/pages/Room.tsx` — 3-column layout: players, game, chat
- `src/hooks/useRoomSocket.ts` — Room join, player list, reconnect re-join logic
- `src/hooks/usePigGameSocket.ts` — Pig game state and actions
- `src/hooks/useChatSocket.ts` — Chat messages
- `src/constants/index.ts` — Mirrored GameId enum + SOCKET_EVENTS

## Auth Flow
- **Google**: Firebase `signInWithPopup` → get ID token → pass in `socket.handshake.auth.token`
- **Guest**: Auto-generated UUID + player name stored in localStorage → pass as `socket.handshake.auth.guestId`
- Auth state determines what gets passed to socket connection

## Socket Reconnection
- Socket.IO client configured: `reconnection: true`, up to 10 attempts, 1s-5s delay
- `useRoomSocket` listens for `connect` event and re-emits `JOIN_ROOM` + `REGISTER_GAME_HANDLER`
- UI shows reconnecting state

## Environment Variables
```
VITE_BACKEND_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

## Local Run
Make sure Redis and the backend are running, then start Vite:

```bash
cd multiplayer-frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Public Hosting
- Deploy the built static app to Vercel, Netlify, Cloudflare Pages, Firebase Hosting, or another static host
- Set `VITE_BACKEND_URL` to the public backend URL
- Keep Firebase web config in deployment environment variables
- Add the deployed frontend domain to Firebase Authentication > Settings > Authorized domains
