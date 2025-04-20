import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JoinRoom from './components/JoinRoom/JoinRoom';
import ChatRoom from './components/ChatRoom/ChatRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/chat/:roomName" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}

export default App;