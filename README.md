# Multiplayer Frontend

React + Vite frontend for the multiplayer game platform. It handles Google sign-in, guest mode, room creation/joining, chat, reconnect behavior, and game UI.

## Run Locally

Make sure Redis and the backend are running first. From the project root:

```bash
docker compose up redis -d
cd multiplayer-backend
npm install
npm run dev
```

Then start the frontend:

```bash
cd multiplayer-frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Environment Variables

Create `multiplayer-frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_DEFAULT_THEME=aurora
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
```

Get these values from Firebase Console > Project settings > General > Your apps > Web app.

## Commands

```bash
npm run dev        # Vite development server
npm run build      # lint, type-check, and production build
npm run preview    # preview production build locally
npm run lint
npm run type-check
```

## Public Hosting

Host the built frontend on Vercel, Netlify, Cloudflare Pages, Firebase Hosting, or any static host.

Production env example:

```env
VITE_BACKEND_URL=https://your-backend-domain.com
VITE_DEFAULT_THEME=aurora
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
```

After deployment, add the public frontend domain in Firebase Authentication > Settings > Authorized domains.

## Key Files

- `src/main.tsx`: app entry and provider setup
- `src/App.tsx`: routes for lobby and room pages
- `src/config/firebase.ts`: Firebase client initialization
- `src/context/SocketContext.tsx`: Socket.IO client, auth handshake, reconnect settings
- `src/pages/GameLobby.tsx`: login, guest mode, create room, join room
- `src/pages/Room.tsx`: room layout and game selection rendering
- `src/hooks/useRoomSocket.ts`: join room and reconnect rejoin behavior
- `src/hooks/useChatSocket.ts`: chat state
- `src/hooks/usePigGameSocket.ts`: Pig game socket state/actions
- `src/components/games/pig/PigGameRoom.tsx`: Pig game UI
- `src/constants/index.ts`: frontend game IDs and socket event names

## Auth Flow

- Google login uses Firebase `signInWithPopup`, then sends the ID token in the Socket.IO auth payload.
- Guest mode stores `playerId`, `playerName`, and `authType` in localStorage.
- The socket reconnects automatically and refreshes the auth payload before reconnect attempts.

## Adding Another Game UI

1. Add the game ID and socket events in `src/constants/index.ts`.
2. Create a hook in `src/hooks/` for game-specific socket events.
3. Create a component under `src/components/games/`.
4. Render the component from `src/pages/Room.tsx`.
