import React, { useState, useEffect, useRef } from 'react';
import MessageDisplayController, { Message } from './MessageDisplayController';
import GameStateTransport from '../../services/game/GameStateTransport';
import './ChatComponent.css';

interface ChatComponentProps {
  gameTransport: GameStateTransport;
  messageDisplay: MessageDisplayController;
}

/**
 * ChatComponent
 *
 * A React component for displaying and sending chat messages.
 */
const ChatComponent: React.FC<ChatComponentProps> = ({ gameTransport, messageDisplay }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [debugMode, setDebugMode] = useState(messageDisplay.isDebugMode());
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Set up message display
  useEffect(() => {
    if (chatContainerRef.current) {
      messageDisplay.setContainer(chatContainerRef.current.id);
    }

    // Subscribe to messages changed
    messageDisplay.onMessagesChanged((updatedMessages) => {
      setMessages(updatedMessages);
    });

    // Initial messages
    setMessages(messageDisplay.getVisibleMessages());

    return () => {
      // Cleanup if needed
    };
  }, [messageDisplay]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputText.trim()) {
      gameTransport.sendChatMessage(inputText);
      setInputText('');
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Toggle debug mode
  const toggleDebugMode = () => {
    messageDisplay.toggleDebugMode();
    setDebugMode(messageDisplay.isDebugMode());
  };

  return (
    <div className="chat-component">
      <div className="chat-header">
        <h3>Game Chat</h3>
        <div className="debug-toggle">
          <label>
            <input
              type="checkbox"
              checked={debugMode}
              onChange={toggleDebugMode}
            />
            Show Game State
          </label>
        </div>
      </div>

      <div className="chat-messages" id="chat-container" ref={chatContainerRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.isGameState ? 'game-state-message' : 'chat-message'}
          >
            {message.isGameState ? (
              <div className="game-state-content">
                <span className="debug-prefix">[GAME]</span>
                <pre>{message.content}</pre>
              </div>
            ) : (
              <div className="chat-content">
                <strong>{message.sender}:</strong> {message.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;
