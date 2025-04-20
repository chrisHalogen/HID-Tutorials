import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinRoom.scss';

const JoinRoom = () => {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && room) {
      navigate(`/chat/${room.toLowerCase()}`, { state: { username } });
    }
  };

  return (
    <div className="join-room-container">
      <div className="join-room-card">
        <h1>Join Chat Room</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="room">Room Name</label>
            <input
              type="text"
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter room name"
              required
            />
          </div>
          <button type="submit" className="join-button">Join Room</button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoom;