import { useParams, useLocation } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import './ChatRoom.scss';

const ChatRoom = () => {
  const { roomName } = useParams();
  const { state } = useLocation();
  const username = state?.username || 'Anonymous';

  const {
    messages,
    message,
    setMessage,
    isLoading,
    error,
    sendChatMessage,
    messagesEndRef,
  } = useChat(roomName, username);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendChatMessage();
  };

  return (
    <div className="chat-room-container">
      <div className="chat-header">
        <h2>Room: {roomName}</h2>
        <p>Welcome, {username}!</p>
      </div>

      <div className="messages-container">
        {isLoading ? (
          <div className="loading">Loading messages...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.username === username ? 'sent' : 'received'
              }`}
            >
              <div className="message-content">
                {msg.username !== username && (
                  <span className="message-sender">{msg.username.toUpperCase()}</span>
                )}
                <p>{msg.content}</p>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatRoom;