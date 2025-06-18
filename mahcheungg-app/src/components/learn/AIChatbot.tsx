import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ChatbotService from '../../services/ChatbotService';
import SpeechService from '../../services/SpeechService';
import CantoneseCharacter from './CantoneseCharacter';

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { style } = useTheme();
  const { t, language } = useLanguage();
  const isDeepSite = style === 'deepsite';

  // Initialize services
  useEffect(() => {
    const chatbotService = ChatbotService.getInstance();
    const speechService = SpeechService.getInstance();

    // Set initial messages
    setMessages(chatbotService.getMessages());

    // Check if speech is supported
    setSpeechSupported(speechService.isSupported());

    // Set language for speech service
    let speechLang = 'en-US';
    if (language === 'zh-HK') speechLang = 'zh-HK';
    if (language === 'zh-CN') speechLang = 'zh-CN';
    if (language === 'ja') speechLang = 'ja-JP';
    speechService.setLanguage(speechLang);

    // Set up callbacks
    chatbotService.setOnMessageCallback((message) => {
      setMessages(prev => [...prev, message]);

      // If it's an assistant message, speak it
      if (message.role === 'assistant') {
        speechService.speak(message.content);
        setIsSpeaking(true);
      }
    });

    speechService.setOnResultCallback((text) => {
      setInputText(text);
      handleSendMessage(text, true);
    });

    speechService.setOnStartListeningCallback(() => {
      setIsListening(true);
    });

    speechService.setOnStopListeningCallback(() => {
      setIsListening(false);
    });

    // Add welcome message if no messages
    if (chatbotService.getMessages().length === 0) {
      chatbotService.sendMessage("Hello! I'm your Mahjong learning assistant. How can I help you today?");
    }
  }, [language]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async (text: string = inputText, isAudio: boolean = false) => {
    if (!text.trim()) return;

    const chatbotService = ChatbotService.getInstance();
    await chatbotService.sendMessage(text, isAudio);

    // Clear input text if not from speech
    if (!isAudio) {
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    const speechService = SpeechService.getInstance();

    if (isListening) {
      speechService.stopListening();
    } else {
      speechService.startListening();
    }
  };

  // Process message content to add CantoneseCharacter components
  const processMessageContent = (content: string) => {
    // Regular expression to match Chinese characters with optional English in parentheses
    // e.g., "碰 (Pung)" or just "碰"
    const regex = /([一-龥]+)(?:\s*\(([^)]+)\))?/g;

    let lastIndex = 0;
    const parts = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      // Add the CantoneseCharacter component
      const character = match[1];
      const romanization = match[2] || undefined;

      parts.push(
        <CantoneseCharacter
          key={`${character}-${match.index}`}
          character={character}
          romanization={romanization}
          showMeaning={false}
        />
      );

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-4 right-4 w-96 h-[500px] rounded-lg shadow-xl flex flex-col z-50"
      style={{
        backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
        border: isDeepSite ? '2px solid #334155' : '1px solid #e5e7eb',
        boxShadow: isDeepSite ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 16px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header */}
      <div
        className="p-3 flex justify-between items-center border-b"
        style={{
          backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
          borderColor: isDeepSite ? '#475569' : '#e5e7eb'
        }}
      >
        <div className="flex items-center">
          <span
            className="text-xl mr-2"
            style={{ color: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)' }}
          >
            🤖
          </span>
          <h3
            className="font-bold"
            style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}
          >
            Mahjong AI Tutor
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-xl"
          style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-grow p-4 overflow-y-auto"
        style={{
          backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 max-w-[80%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
          >
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: message.role === 'user'
                  ? (isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)')
                  : (isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)'),
                color: message.role === 'user'
                  ? (isDeepSite ? '#ffc107' : '#ffffff')
                  : (isDeepSite ? '#cbd5e1' : 'var(--text-color, #1f2937)'),
                boxShadow: isDeepSite ? '0 2px 4px rgba(0, 0, 0, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {message.isAudio && <span className="mr-2">🎤</span>}
              {typeof message.content === 'string'
                ? processMessageContent(message.content)
                : message.content}
            </div>
            <div
              className="text-xs mt-1 px-2"
              style={{ color: isDeepSite ? '#64748b' : 'var(--text-secondary, #6b7280)' }}
            >
              {message.role === 'user' ? 'You' : 'AI Tutor'} • {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="p-3 border-t"
        style={{
          backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
          borderColor: isDeepSite ? '#475569' : '#e5e7eb'
        }}
      >
        <div className="flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Mahjong..."
            className="flex-grow px-3 py-2 rounded-l-lg focus:outline-none"
            style={{
              backgroundColor: isDeepSite ? '#1e293b' : '#ffffff',
              color: isDeepSite ? '#ffffff' : 'var(--text-color, #1f2937)',
              borderColor: isDeepSite ? '#475569' : '#e5e7eb'
            }}
          />

          {speechSupported && (
            <button
              onClick={toggleListening}
              className="px-3 py-2"
              style={{
                backgroundColor: isListening
                  ? (isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)')
                  : (isDeepSite ? '#1e293b' : '#ffffff'),
                color: isListening
                  ? (isDeepSite ? '#ffc107' : '#ffffff')
                  : (isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)')
              }}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          )}

          <button
            onClick={() => handleSendMessage()}
            className="px-4 py-2 rounded-r-lg"
            style={{
              backgroundColor: isDeepSite ? '#4a2545' : 'var(--primary-button, #3b82f6)',
              color: isDeepSite ? '#ffc107' : '#ffffff'
            }}
          >
            Send
          </button>
        </div>

        {isListening && (
          <div
            className="text-center mt-2 text-sm"
            style={{ color: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)' }}
          >
            Listening... Speak now
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatbot;
