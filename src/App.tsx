import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameList from "./pages/GameList";
import JoinRoom from "./components/JoinRoom";
import Room from "./pages/Room";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameList />} />
        <Route path="/room/:gameId/:roomId" element={<Room />} />
        <Route path="/join" element={<JoinRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
