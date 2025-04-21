import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Room from "./pages/Room";
import GameLobby from "./pages/GameLobby";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameLobby />} />
        <Route path="/room/:gameId/:roomId" element={<Room />} />
      </Routes>
    </Router>
  );
}

export default App;
