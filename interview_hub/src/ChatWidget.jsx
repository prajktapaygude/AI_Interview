// ChatWidget.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useTheme } from './ThemeContext'; // Adjust path as needed

const API_URL = 'http://localhost:5000/api/chat';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hi! I\'m your AI Mentor. Ask me anything about our platform, features, pricing, or how to prepare for interviews!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useTheme(); // Get dark mode state from context

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post(API_URL, { message: input });
      const reply = res.data.answer || res.data.reply || 'Sorry, I could not process that.';
      const botMsg = { role: 'assistant', content: reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err.response?.data || err.message);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Sorry, I\'m having trouble connecting. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-2xl hover:scale-110 transition-all duration-300 group ${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
              : 'bg-gradient-to-r from-primary to-secondary'
          }`}
        >
          <i className="fas fa-comment-dots text-2xl text-white group-hover:rotate-12 transition-transform"></i>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 w-96 rounded-2xl shadow-2xl border animate-[fadeInUp_0.3s_ease] ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`p-4 border-b rounded-t-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-gray-700' 
              : 'bg-gradient-to-r from-primary to-secondary border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <i className="fas fa-robot text-white text-xl"></i>
                <h3 className="font-bold text-white text-lg">AI Mentor Chat</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:scale-110 transition-transform"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <p className="text-white/80 text-xs mt-1">Online • Ready to help</p>
          </div>

          {/* Messages */}
          <div className={`h-96 overflow-y-auto p-4 space-y-3 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? `rounded-br-none text-white ${
                          isDarkMode 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                            : 'bg-gradient-to-r from-primary to-secondary'
                        }`
                      : `rounded-bl-none ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-200' 
                            : 'bg-gray-100 text-gray-800'
                        }`
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`p-3 rounded-2xl rounded-bl-none ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${
                      isDarkMode ? 'bg-gray-400' : 'bg-gray-400'
                    }`}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${
                      isDarkMode ? 'bg-gray-400' : 'bg-gray-400'
                    }`} style={{ animationDelay: '0.1s' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${
                      isDarkMode ? 'bg-gray-400' : 'bg-gray-400'
                    }`} style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className={`p-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..."
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-primary'
                }`}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'bg-gradient-to-r from-primary to-secondary text-white'
                }`}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;