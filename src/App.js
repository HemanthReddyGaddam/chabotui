import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

function App() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'incoming', content: 'Hello 👋 \nHow can I assist you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatboxRef = useRef(null);
  const textareaRef = useRef(null);

  const generateResponse = async (userMessage) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { 
              role: "system", 
              content: "You are a helpful assistant." 
            },
            { 
              role: "user", 
              content: userMessage 
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        }),
      });
      
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      return "Oops! Something went wrong. Please try again.";
    }
  };

  const handleChat = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'outgoing', content: inputMessage.trim() }]);
    setInputMessage('');

    // Add "Typing..." message
    setMessages(prev => [...prev, { type: 'incoming', content: 'Typing...' }]);

    // Generate response
    const response = await generateResponse(inputMessage.trim());
    
    // Replace "Typing..." with actual response
    setMessages(prev => [
      ...prev.slice(0, -1),
      { type: 'incoming', content: response }
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 800) {
      e.preventDefault();
      handleChat();
    }
  };

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="container">
      <div className="welcome">
        <h1>Chatbot</h1>
        <p>Click on the chat icon to start a conversation</p>
      </div>

      <button className="chatbot-toggler" onClick={() => setShowChatbot(!showChatbot)}>
        <span className="material-symbols-rounded">
          {showChatbot ? 'close' : 'mode_comment'}
        </span>
      </button>

      <div className={`chatbot-container ${showChatbot ? 'show' : ''}`}>
        <header className="header">
          <h2>Chatbot</h2>
          <button className="close-button" onClick={() => setShowChatbot(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="chatbox" ref={chatboxRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.type}`}>
              {msg.type === 'incoming' && (
                <span className="material-symbols-outlined">smart_toy</span>
              )}
              <p className={`message-content ${msg.type}`}>{msg.content}</p>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
          />
          <button 
            className={`send-button ${inputMessage.trim().length > 0 ? 'visible' : ''}`}
            onClick={handleChat}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;